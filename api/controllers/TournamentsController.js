/**
 * TournamentsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

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

    getNearUbication: catchErrors(async (req, res) => {

        let lng = Number(req.param("lng")), lat = Number(req.param("lat")),
            user = req.param("user");
        let results = await getXCoordinates(ln, lat, user, 30000);
        console.log(results);
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
    results = await Promise.all(results.map(async it => {
        let saved = await SavedTournaments.findOne({ user, tournament: it.id });
        it.isSave = saved !== undefined;
        if (it.isSave === true)
            it.savedId = saved.id;
        return it;
    }));

    return results;
}

