
module.exports = {
    auth: catchErrors(async (req, res) => {
        let facebook = req.body;
        if (facebook.userID === null || facebook.userID === null) {
            res.status(400);
            return res.send("not found");
        }
        console.log(facebook);
        let user = await User.findOne({ userID: facebook.userID });
        if (user === undefined) {
            user = await User.create({userID: facebook.userID, email: facebook.userID+"@pickleconnect.com", loginFacebook: facebook }).fetch(); 
        }

        res.json(user);
    })

};

