const helper = require("./../../helpers")
const notification = require("../../notifications");
const managerNoti = require("../controllers/NotificationsController");

module.exports = {

    saveWithCourts: catchErrors(async (req, res) => {
        let event = req.param("event");
        let courts = event.courts;
        delete event.courts;
        let e = await Event.create(event).fetch();
        for (let c of courts) {
            c.event = e.id;
            await CourtsEvent.create(c);
        }

        res.json(e);
    }),

    shareEvent: catchErrors(async (req, res) => {
        let tokens = [], event = req.param("event"), ids = req.param("idUsers");
        for (let id of ids) {
            let user = await User.findOne({ id });
            if (user !== undefined) {
                if (user.tokens) tokens = tokens.concat(user.tokens);
            }
        }

        //Creamos la notification y la enviamos
        let eventJson = JSON.parse( JSON.stringify(event) );
        delete eventJson.courts;
        delete eventJson.players;
        delete eventJson.user;
        let payload = {
            'notification': {
                'title': `${event.user ? event.user.fullName : ''} has shared an event`,
                'body': ``,
                "sound": "default",
                "delivery_receipt_requested": "true"
            },
            data: { data: JSON.stringify(eventJson), is: "share-event" }
        }

        payload = helper.normalizePayload(payload);
        let notiProcess = await managerNoti.saveNotification(payload, "shareEvent", event.user.id);
        for (let id of ids) {
            sails.sockets.broadcast(id, notiProcess);
        }

        tokens = helper.cleanTokensId(tokens);
        if (helper.checkTokensID(tokens) === false) {
            return proceed();
        }

        await new Promise((resolve) => {
            notification.messaging().sendToDevice(tokens, payload)
                .then(function (response) {

                    for (let result of response.results) {
                        sails.log("Successfully sent share event:", result);
                    }
                    resolve();
                })
                .catch(function (error) {
                    sails.log("error in send notification shere event:", error);
                    resolve();
                });
        })

        res.json({});

    })
};

