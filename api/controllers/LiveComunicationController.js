const fs = require("fs");

module.exports = {

    getSailsClient: catchErrors(async (req, res) => {
        let script = fs.readFileSync(require("path").join(__dirname, "../../assets/dependencies/sails.io.js"), "utf-8");
        res.send(script);
    }),

    subscribeToRoom: catchErrors(function (req, res) {
        if (!req.isSocket) {
            return res.badRequest();
        }

        var roomName = req.param('roomName');
        sails.sockets.join(req, roomName, function (err) {
            if (err) {
                return res.serverError(err);
            }
            return res.json({
                message: 'Subscribed to a fun room called ' + roomName + '!'
            });
        });
    })
};

