

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
            user = req.param("user"),
            maxDistance = req.param("maxDistance") !== undefined ? Number(req.param("maxDistance")) : 30000;
        let results = await getXCoordinates(lng, lat, user, maxDistance);
        results = await Promise.all(results.map(async it => {
            it.users = await getUsersCourt(it);
            return it;
        }));
        console.log(results);
        res.json(results);
    }),

    getXCoordinates,

    getCourts: catchErrors(async (req, res) => {
        let query = JSON.parse(req.param("where"));
        let courts = await Court.find(query);
        courts = await Promise.all(courts.map(async it => {
            it.users = await getUsersCourt(it);
            return it;
        }));

        res.json(courts);
    })
};

function getUsersCourt(court) {
    var db = Court.getDatastore().manager;
    var collection = db.collection(Court.tableName);

    return new Promise((resolve, reject) => {
        collection.find({
            coordinates: court.coordinates
        }).toArray(async function (err, courts) {
            if (err) { return reject(err); }
            let users = [];
            for (let court of courts) {
                let user = await User.findOne({ id: court.user.toString() });
                if (user)
                    users.push(user);
            }
            resolve(users);
        })
    });
}

function getXCoordinates(lng, lat, user, maxDistance) {
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
                    $maxDistance: maxDistance,
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
