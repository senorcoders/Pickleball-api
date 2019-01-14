/**
 * ChatController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const mongoose = require("mongoose");
const getListIDUser = async function (id) {
    return new Promise(function (resolve, reject) {
        var db = Chat.getDatastore().manager;
        var chats = db.collection(Chat.tableName);
        let query = { from: new mongoose.Types.ObjectId(id), };
        chats.distinct("to", query, function (er, results) {

            query = { to: new mongoose.Types.ObjectId(id) };
            chats.distinct('from', query, function (e, reslts) {

                if (er) return reject(er);

                for (var it of results) {
                    let index = reslts.findIndex(function (elem) { return elem === it; });
                    if (index === -1)
                        reslts.push(it);
                }

                resolve(reslts);
            });
        });

    });
}

module.exports = {

    getChatRecents: catchErrors(async (req, res) => {
        let idUser = req.param("user");
        let usersIds = await getListIDUser(idUser);

        var db = User.getDatastore().manager;
        var users = db.collection(User.tableName);
        users.find({ "_id": { "$in": usersIds } }).toArray(function (e, list) {
            if (e) return res.serverError(e);
            list = list.map(it => {
                it.id = it._id.toString();
                return it;
            });
            return res.json(list);
        })
    })
};

