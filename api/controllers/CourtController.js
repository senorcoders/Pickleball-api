

const mongoose = require("mongoose");
module.exports = {

    saveBulk: catchErrors(async (req, res) => {
        let courts = req.param("courts");

        var db = Court.getDatastore().manager;
        var _court = db.collection(Court.tableName);
        let getCourts = function (coordinates, user) {
            user = new mongoose.Types.ObjectId(user);
            return new Promise((resolve, reject) => {
                _court.find({ coordinates, user })
                    .toArray(async (err, arr) => {
                        if (err) { return reject(err); }

                        resolve(arr);
                    });
            });
        }

        for (let court of courts) {
            let courstSaves = await getCourts(court.coordinates, court.user);
            if (courstSaves.length === 0) {
                await Court.create(court);
            }
        }

        res.json({ msg: "ok" });
    }),

    getCourtXPosition: catchErrors(async (req, res) => {
        let lng = Number(req.param("lng")), lat = Number(req.param("lat")),
            user = req.param("user");
        let results = await getXCoordinates(lng, lat, user);
        console.log(results);
        res.json(results);
    }),

    getXCoordinates
};


function getXCoordinates(lng, lat, user) {
    var db = Court.getDatastore().manager;
    var collection = db.collection(Court.tableName);

    return new Promise((resolve, reject) => {
        collection.find({
            coordinates: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    $maxDistance: 300,
                    $minDistance: 0
                },
            },
            user: new mongoose.Types.ObjectId(user)
        }).toArray(function (err, places) {
            if (err) { return reject(err); }
            resolve(places);
        })
    });
}
