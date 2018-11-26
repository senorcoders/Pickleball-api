

module.exports = {
    search: catchErrors(async (req, res) => {
        let search = [];
        if (req.query.search.email !== undefined) {
            search.push({ email : { "includes": req.query.search.email } });
        }
        if(req.query.search.name){
            search.push({ firstName : { "includes": req.query.search.name } });
            search.push({ lastName : { "includes": req.query.search.name } });
        }
        let users = User.find({ or: search });

        res.json(users);
    })

};

