

module.exports = {
    search: catchErrors(async (req, res) => {
        let name = req.param("name"),
            userId = req.param("userId");

        var db = User.getDatastore().manager;
        var _user = db.collection(User.tableName);
        let users = await new Promise((resolve, reject) => {
            _user.find({ fullName: { '$regex': '^.*' + name + '.*$', '$options': 'i' }, searchable: true })
                .toArray(async (err, arr) => {
                    if (err) { return reject(err); }

                    resolve(arr);
                });
        });

        //Cargamos los request
        users = await Promise.all(users.map(async it => {
            let requests = await RequestFriend.find({ from: userId, to: it._id.toString() });
            it.requests = requests;
            return it;
        }));

        res.json(users);
    }),

    logout: catchErrors(async (req, res) => {
        let token = req.param("token");
        let user = await User.findOne({ id: req.param("id") });
        if (user === undefined) return res.ok();
        if (user.tokens) {
            let index = user.tokens.findIndex(it => {
                return it === token;
            });
            if (index !== -1) {
                if (user.tokens.length === 0)
                    user.tokens = [];
                else
                    user.tokens.splice(index, 1);
                await User.update({ id: user.id }, { tokens: user.tokens });
            }
        }

        res.ok();
    })
};

