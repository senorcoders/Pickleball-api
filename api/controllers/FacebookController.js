const jwt = require('jsonwebtoken')

module.exports = {
    auth: catchErrors(async (req, res) => {
        let facebook = req.body.facebook, _user = req.body.user;
        if (facebook.userID === null || facebook.userID === null) {
            res.status(400);
            return res.send("not found");
        }
        console.log(facebook);
        let user = await User.findOne({ userID: facebook.userID });
        if (user === undefined) {
            _user.userID = facebook.userID;
            _user.email = _user.email || facebook.userID + "@pickleconnect.com";
            _user.loginFacebook = facebook;
            user = await User.create(_user).fetch();
        }
        let cargaUtil = user;
        let secret = require("../../config/local").secretJwt;
        jwt.sign(cargaUtil, secret, { expiresIn: 31536000 }, function (err, token) {
            if (err) {
                sails.log(err);
                return res.json({ message: "User not found" });
            }
            // console.log(token);
            user.token = token;

            res.json(user);
        });
    })

};

