/**
 * TournamentsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const moment = require("moment");

module.exports = {

    search: catchErrors(async (req, res) => {
        let name = req.param("name");

        var db = Tournaments.getDatastore().manager;
        var _tournaments = db.collection(Tournaments.tableName);
        let tournaments = await new Promise((resolve, reject) => {
            _tournaments.find({ title: { '$regex': '^.*' + name + '.*$', '$options': 'i' } })
                .toArray(async (err, arr) => {
                    if (err) { return reject(err); }

                    resolve(arr);
                });
        });

        //Cargamos los savedTournaments
        tournaments = await Promise.all(tournaments.map(async it => {
            let savedTournaments = await SavedTournaments.find({ tournament: it._id.toString() });
            it.savedTournaments = savedTournaments;
            it.id = it._id.toString();
            return it;
        }));

        res.json(tournaments);
    }),

    searchForNextMonth: catchErrors(async (req, res) => {
        let name = req.param("name"), date = req.param("date");
        let month = moment(date);
        console.log("01/", month.format("MM/YYYY"));
        let nextMoment = moment("01/" + month.format("MM/YYYY"), "DD/MM/YYYY");
        nextMoment.add(1, "month");
        console.log(nextMoment.format("DD/MM/YYYY"));

        var db = Tournaments.getDatastore().manager;
        var _tournaments = db.collection(Tournaments.tableName);
        let tournaments = await new Promise((resolve, reject) => {
            _tournaments.find({ title: { '$regex': '^.*' + name + '.*$', '$options': 'i' }, registrationStart: { $gt: nextMoment.toDate().getTime() } })
                .toArray(async (err, arr) => {
                    if (err) { return reject(err); }

                    resolve(arr);
                });
        });

        //Cargamos los savedTournaments
        tournaments = await Promise.all(tournaments.map(async it => {
            let savedTournaments = await SavedTournaments.find({ tournament: it._id.toString() });
            it.savedTournaments = savedTournaments;
            it.id = it._id.toString();
            return it;
        }));

        res.json(tournaments);
    }),

    getNearUbication: catchErrors(async (req, res) => {

        let lng = Number(req.param("lng")), lat = Number(req.param("lat")),
            user = req.param("user");
        let results = await getXCoordinates(lng, lat, user, 30000);
        let filterDate = req.param("filterDate");
        if (filterDate === "true") {
            console.log(`
                FILTER DATE FOR TOURNAMENTS
            `);
            let dateStart = Number(req.param("startDate")),
                dateEnd = Number(req.param("endDate"));
            results = results.filter(it => {
                return it.registrationStart >= dateStart && it.registrationStart <= dateEnd;
            });
        }
        res.json(results);
    }),

    addCoordinates: catchErrors(async (req, res) => {
        let tours = await Tournaments.find({ limit: 100000 });
        for (let t of tours) {
            if (t.latLng !== null && t.latLng !== undefined)
                await Tournaments.update({ id: t.id }, { coordinates: [t.latLng.lng, t.latLng.lat] })
        }

        res.ok();
    }),

    getXCoordinates

};

async function getXCoordinates(lng, lat, user, max) {
    var db = Tournaments.getDatastore().manager;
    var collection = db.collection(Tournaments.tableName);

    let results = await new Promise((resolve, reject) => {
        collection.find({
            coordinates: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    $maxDistance: max,
                    $minDistance: 0
                }
            }
        }).toArray(function (err, places) {
            if (err) { return reject(err); }
            places = places.map(it => {
                it.id = it._id.toString();
                return it;
            })
            resolve(places);
        })
    });
    var db1 = Event.getDatastore().manager;
    var collection1 = db1.collection(Event.tableName);

    let results1 = await new Promise((resolve, reject) => {
        collection1.find({
            locationCoords: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    $maxDistance: max,
                    $minDistance: 0
                }
            },
            type: "tournament"
        }).toArray(function (err, places) {
            if (err) { return reject(err); }
            places = places.map(it => {
                it.id = it._id.toString();
                return it;
            })
            resolve(places);
        })
    });

    results = results.concat(results1.map(it => {
        return {
            title: it.name,
            address: it.locationText,
            imgs: it.images,
            id: it.id,
            coordinates: it.locationCoords,
            registrationStart: it.date,
            type: "event",
            dates: it.matchTimes,
            registrationStart: it.date,
            endRegistration: it.date,
            note: it.travelInfo
        };
    }));

    results = await Promise.all(results.map(async it => {
        let saved; console.log({ user, event: it.id });
        if (it.type === "event")
            saved = await SavedTournaments.findOne({ user, tournament: it.id });
        else
            saved = await EventUser.findOne({ user, event: it.id });
        it.isSave = saved !== undefined;
        if (it.isSave === true)
            it.savedId = saved.id;
        return it;
    }));

    return results;
}

