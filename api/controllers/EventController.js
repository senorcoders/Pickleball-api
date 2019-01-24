/**
 * EventController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

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

        res.json({ msg: "success" });
    })
};

