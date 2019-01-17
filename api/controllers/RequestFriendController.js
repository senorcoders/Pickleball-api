module.exports = {

    save: catchErrors(async (req, res) => {
        let to = req.param("to"), from = req.param("from");
        let requests = await RequestFriend.find({ to, from, response: null });
        if (requests.length === 0) {
            let request = await RequestFriend.create({ to, from, response: null }).fetch();
            res.json(request);
        }

        res.json({});
    })
};

