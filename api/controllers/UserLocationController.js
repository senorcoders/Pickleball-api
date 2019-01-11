const helper = require("./../../helpers")
const notification = require("../../notifications");
const managerNoti = require("../controllers/NotificationsController");
const getCourtsXCoordinates = require("./CourtController").getXCoordinates,
    getTournaments = require("./TournamentsController").getXCoordinates,
    moment = require("moment"),
    keyMap = require("../../config/local").google.maps.key,
    mongoose = require("mongoose"), axios = require("axios");
console.log(moment().toISOString());
module.exports = {

    addFromBackground: catchErrors(async (req, res) => {
        console.log(req.body, req.headers["user"]);
        if (req.headers["user"]) {
            let user = req.headers["user"], userObject = await User.findOne({ id: user })
            //Obtenemos los tokens y id de los amigos del usuario
            tokensAndIds = await getTokensAndIdsFriends(user);
            let courts = [],
                tournaments = [];
            //obtenemos los courts y tournaments
            //que el usuario  guardo y estan cerca de su posicion
            for (let coor of req.body) {
                //Obtenemos los courts cercanos al usuario por medio de google maps
                //tambien comprobamos que no esten guardados esos courts
                let courts_map = await getCourtsXMap(coor.latitude, coor.longitude, user)
                for (let c_ of courts_map) {
                    let coordinates = c_.coordinates;
                    let userId = new mongoose.Types.ObjectId(user);
                    let saveds = await getCourtsSearchNative({ coordinates, user: userId });
                    if (saveds.length === 0)
                        await Court.create(c_);
                }
                let courts_ = await getCourtsXCoordinates(coor.longitude, coor.latitude, user);
                courts = courts.concat(courts_);
                let tour = await getTournaments(coor.longitude, coor.latitude, user, 300);
                tournaments = tournaments.concat(tour);
            }
            //Ahora enviamos las notifications de los courts y tournaments guardados
            for (let court of courts) {
                await userNearCourtSave(userObject, court, tokensAndIds);
            }
            //Tenemos que filtrar por los torneos que estan cerca de iniciar
            //Cuando el torneo no la ha guardado el usuario, se guarda y entonces se ejecuta automaticamente
            //la funcion afterCreate en el modelo SavedTournaments, la cual
            //envia la notificacion
            tournaments = filterNearStart(tournaments)
            for (let tour of tournaments) {
                if (tour.isSave === true)
                    await userNearTournamentsSave(userObject, tour, tokensAndIds);
                else {
                    let saveds = await SavedTournaments.find({ user: userObject.id, tournament: tour.id })
                    if (saveds.length === 0)
                        await SavedTournaments.create({ user: userObject.id, tournament: tour.id });
                }

            }
        }

        res.ok();
    }),

    failFromBackgroud: catchErrors(async (req, res) => {
        console.log(req.body);
        res.ok();
    })
};

//#region para obtener courts por medio de google maps
async function getCourtsXMap(lat, lng, user) {

    let fields = ['photos', 'formatted_address', 'name', 'rating', 'opening_hours', 'geometry', 'price_level'];
    let uri = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=300&fields=${fields.join(",")}&name=pickleball courts&key=${keyMap}`;
    let results = [];
    try {
        let response = await axios.get(uri);
        results = response.data.results;
        results = results.map(result => {
            return {
                coordinates: [result.geometry.location.lng, result.geometry.location.lat],
                name: result.name,
                location: result.vicinity,
                photos: result.photos ? result.photos.map(i => { return getPhotoURl(i); }) : [],
                rating: result.rating,
                user
            };
        });
    }
    catch (e) {
        console.error(e);
    }
    console.log(results)
    return results;
}

function getPhotoURl(photo){
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${photo.photo_reference}&key=${keyMap}`;
}

async function getCourtsSearchNative(criteria) {
    var db = Court.getDatastore().manager;
    var _court = db.collection(Court.tableName);
    let result = await new Promise((resolve, reject) => {
        _court.find({ criteria })
            .toArray(async (err, arr) => {
                if (err) { return reject(err); }

                resolve(arr);
            });
    });

    return result;
}

//#endregion

//#region para obtener, guardar courts y tournaments 
async function getTokensAndIdsFriends(user) {
    let friends = await RequestFriend.find({
        or: [
            { to: user, response: true },
            { from: user, response: true }
        ]
    }).populate("to").populate("from");
    friends = friends.map(it => {
        if (it.to.id === user)
            return it.from;
        return it.to;
    });
    let tokens = [], ids = [];
    for (let f of friends) {
        if (f.tokens)
            tokens = tokens.concat(f.tokens);

        ids.push(f.id);
    }

    return { tokens, ids };
}

async function userNearCourtSave(user, court, tokensAndIds) {
    let payload = {
        'notification': {
            'title': `Friend on court`,
            'body': `${user.fullName} is close to ${court.name}`,
            "sound": "default",
            "delivery_receipt_requested": "true"
        },
        data: { data: JSON.stringify(court), is: "friendOnCourt" }
    };
    await sendNotification(payload, tokensAndIds.tokens, tokensAndIds.ids);
}

function filterNearStart(tours) {
    let start = moment(), end = moment();
    start.subtract(30, "minutes");
    end.add(30, "minutes");
    tours = tours.filter(it => {
        if (it.registrationStart) {
            let date = moment(it.registrationStart);
            return date.isBetween(start, end);
        }
        return false;
    });

    return tours;
}

async function userNearTournamentsSave(user, tour, tokensAndIds) {
    let payload = {
        'notification': {
            'title': `Friend in tournament`,
            'body': `${user.fullName} is in the tournament ${tour.title}`,
            "sound": "default",
            "delivery_receipt_requested": "true"
        },
        data: { data: JSON.stringify(tour), is: "friendOnTournament" }
    };
    await sendNotification(payload, tokensAndIds.tokens, tokensAndIds.ids);
}
//#endregion

async function sendNotification(payload, tokens, ids) {
    try {

        payload = helper.normalizePayload(payload);

        //Guardamos la notificaton en la base de datos
        for (let id of ids) {
            let notiProcess = await managerNoti.saveNotification(payload, payload.data.is, id);
            sails.sockets.broadcast(id, notiProcess);
        }

        //Limpiamos y comprobamos los tokens
        tokens = helper.cleanTokensId(tokens);
        if (helper.checkTokensID(tokens) === false) {
            return proceed();
        }
        console.log(payload);
        await new Promise((resolve) => {
            notification.messaging().sendToDevice(tokens, payload)
                .then(function (response) {

                    for (let result of response.results) {
                        sails.log(`Successfully sent message new ${payload.data.is}`, result);
                    }
                    resolve();
                })
                .catch(function (error) {
                    sails.log(`error in send notification ${payload.data.is}`, error);
                    resolve();
                });
        })

    }
    catch (e) {
        console.error(e);
    }
}

