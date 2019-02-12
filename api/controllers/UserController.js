const moment = require("moment");

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
            it.id = it._id.toString();
            let requests = await RequestFriend.find({
                or: [
                    { from: userId, to: it._id.toString() },
                    { to: userId, from: it._id.toString() }
                ]
            });
            it.requests = requests;
            it.courts = await Court.find({ user: it._id.toString() });
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
    }),

    forgotPassword: catchErrors(async (req, res) => {
        let email = req.param("email");
        let user = await User.findOne({ email });
        if (user === undefined) {
            return res.json({ msg: "not found" });
        }
        let dateTime = req.param("dateTime");
        let forgot = {
            user: user.id,
            dateTime,
            changed: false
        };
        let fort = await ForgotPassword.create(forgot).fetch();
        require("../../mailer").sendLinkforgotPassword(email, fort.id);

        res.json({ msg: "success" });
    }),

    changeLocation: catchErrors(async (req, res) => {
        let location = req.param("location"), id = req.param("idUser");
        await User.update({ id }, { location });
        res.json({ msg: "success" });
    }),

    changePasswordWithModel: catchErrors(async (req, res) => {
        let code = req.param("code");
        let forgot = await ForgotPassword.findOne({ id: code, changed: false });
        if (forgot === undefined) {
            return res.json({ msg: "code invalid" });
        }
        let dateTime = moment(forgot.dateTime);
        dateTime.add(15, "minutes");
        now = moment();
        if (now.isBefore(dateTime)) {
            let password = req.param("password");
            await User.update({ id: forgot.user }, { password: await sails.helpers.passwords.hashPassword(password) });
            await ForgotPassword.update({ id: forgot.id }, { changed: true });
            return res.json({ msg: "success" });
        }
        res.json({ msg: "expired" });
    })
};

