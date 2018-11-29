

module.exports = {
    search: catchErrors(async (req, res) => {
        let search = [];
        if (req.query.search.email !== undefined) {
            search.push({ email: { "includes": req.query.search.email } });
        }
        if (req.query.search.name) {
            search.push({ firstName: { "includes": req.query.search.name } });
            search.push({ lastName: { "includes": req.query.search.name } });
        }
        let users = User.find({ or: search, where: { searchable: true } });

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
            if(index!==-1){
                if(user.tokens.length===0)
                    user.tokens = [];
                else
                    user.tokens.splice(index, 1);
            }
        }

        res.ok();
    })
};

