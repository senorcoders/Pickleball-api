/**
 * CourtStateController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    getCourtXPosition: catchErrors(async (req, res) => {
        let lng = Number(req.param("lng")), lat = Number(req.param("lat")),
            user = req.param("user"),
            maxDistance = req.param("maxDistance") !== undefined ? Number(req.param("maxDistance")) : 30000;
        let results = await getXCoordinates(lng, lat, user, maxDistance);
        results = await Promise.all(results.map(async it => {
            it.users = await CourtSaved.find({ court: it.id });
            return it;
        }));
        console.log(results);
        res.json(results);
    }),

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
    var db = CourtState.getDatastore().manager;
    var collection = db.collection(CourtState.tableName);

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
            }
        }).toArray(function (err, places) {
            if (err) { return reject(err); }
            places = places.map(it => { it.id = it._id.toString(); return it; });
            resolve(places);
        })
    });
}
