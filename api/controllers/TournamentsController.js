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
    })

};

