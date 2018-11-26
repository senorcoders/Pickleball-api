
module.exports = {
    auth: catchErrors(async (req, res) => {
        let facebook = req.body.facebook, _user =  req.body.user;
        if (facebook.userID === null || facebook.userID === null) {
            res.status(400);
            return res.send("not found");
        }
        console.log(facebook);
        let user = await User.findOne({ userID: facebook.userID });
        if (user === undefined) {
            _user.userID = facebook.userID;
            _user.email = facebook.userID+"@pickleconnect.com";
            _user.loginFacebook = facebook;
            user = await User.create(_user).fetch(); 
        }

        res.json(user);
    })

};

