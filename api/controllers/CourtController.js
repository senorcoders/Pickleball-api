/**
 * CourtController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const mongoose = require("mongoose");
module.exports = {

    saveBulk: catchErrors(async (req, res) => {
        let courts = req.param("courts");

        var db = Court.getDatastore().manager;
        var _court = db.collection(Court.tableName);
        let getCourts = function(coordinates, user){
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
    })
};

