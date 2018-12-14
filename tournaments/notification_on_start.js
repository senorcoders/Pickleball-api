const helper = require("../helpers"), fs = require("fs"),
    mongoose = require("mongoose"), moment = require("moment"),
    local = require("../config/local"), notifications = require("./../notifications");

var db;
let connect = function () {
    mongoose.connect(`mongodb://${local.db.mongo.username}:${local.db.mongo.password}@${local.db.mongo.host}:${local.db.mongo.port}/${local.db.mongo.dbName}`, { useNewUrlParser: true })
    db = mongoose.connection;
    return new Promise(function (resolve, reject) {
        db.on('error', function (err) {
            console.error(err);
            reject(err);
        });

        db.once('open', function () {
            console.log("connect");
            resolve();
        });
    });
}

//Se cargan los torneos que estan proximos a iniciar
let getTournaments = function () {
    let date = moment();

    return new Promise(function (resolve, reject) {
        db.collection("tournaments").find({ dates: { '$regex': '^.*' +" "+ date.format("MM/DD/YY")+ " "+ '.*$', '$options': 'i' } }, function (err, collection) {
            if (err) { return reject(err); }

            collection.toArray(function (err, arr) {
                if (err) { return reject(err); }
                console.log(arr);

                resolve(arr);
            });
        });
    });

}

//Se cargan los usuarios que guardaron ese torneo
let getUsersSavedTournaments = function (tournament) {

    return new Promise(function (resolve, reject) {
        db.collection("savedtournaments").find({ tournament }, function (err, collection) {
            if (err) { return reject(err); }

            collection.toArray(async function (err, arr) {
                if (err) { return reject(err); }
                console.log(arr);
                let users = [];
                for (let saved of arr) {
                    let user = await getUser(saved.user);
                    users.push(user);
                }
                resolve(users);
            });
        });
    });

}

let getUser = function (_id) {

    return new Promise(function (resolve, reject) {
        db.collection("user").findOne({ _id }, function (err, doc) {
            if (err) { return reject(err); }
            resolve(doc);
        });
    });

}

//Para la notification
let sendNotification = async function (tokens, payload) {
    payload = helper.normalizePayload(payload);
    return new Promise(function (resolve, reject) {
        notifications.messaging().sendToDevice(tokens, payload)
            .then(function (response) {
                // See the MessagingDevicesResponse reference documentation for
                // the contents of response.
                console.log("Successfully sent message event is closed:", response);
                resolve(response);
            })
            .catch(function (error) {
                console.log("Error sending message event is closed:", error);
                reject(error);
            });
    });
}

async function exec() {
    try {
        await connect();
        let tournaments = await getTournaments();
        for (let tour of tournaments) {
            let users = await getUsersSavedTournaments(tour._id);
            for (let user of users) {
                //comprobamos que los token del user son validos
                let tokens = helper.cleanTokensId(user.tokens);
                if (helper.checkTokensID(tokens) === false) continue;

                //Se envia la notification
                tour.id = tour._id.toString();
                let payload = {
                    'notification': {
                        'title': tour.title,
                        'body': "Pickleball Tournament is starting soon!",
                        "sound": "default"
                    },
                    data: { dataStringify: JSON.stringify({ tournament: tour }), verb: "followig", is: 'event' }
                }

                try {
                    await sendNotification(tokens, payload)
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
    }
    catch (e) {
        console.error(e);
    }
    finally{
        db.close();
    }
}

exec();