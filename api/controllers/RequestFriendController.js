module.exports = {

    save: catchErrors(async (req, res) => {
        let to = req.param("to"), from = req.param("from");
        let requests = RequestFriend.find({ to, from });
        if (requests.length > 0) {
            res.status(500);
            return res.send("request duplicated");
        }

        let request = await RequestFriend.create({ to, from }).fetch();

        res.json(request);
    })
};

