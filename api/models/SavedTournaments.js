const helper = require("./../../helpers")
const notification = require("../../notifications");
const managerNoti = require("../controllers/NotificationsController");

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝
    adittionalFields: {
      type: "json",
      required: false
    },

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    user: {
      model: "user",
      required: true
    },

    tournament: {
      model: "tournaments",
      required: true
    }
  },
  afterCreate: async (saved, proceed) => {
    try {
      let friends = await RequestFriend.find({
        or: [
          { to: saved.user, response: true },
          { from: saved.user, response: true }
        ]
      }).populate("to").populate("from");
      let tournament = await Tournaments.findOne({ id: saved.tournament });
      for (let friend of friends) {
        if (friend.to.id === saved.user)
          await sendNotificationTournamentCheckIn(friend.from, tournament);
        else
          await sendNotificationTournamentCheckIn(friend.to, tournament);
      }

    }
    catch (e) {
      console.error(e);
    }

    proceed();
  }
};

async function sendNotificationTournamentCheckIn(user, tour) {
  let body = `Your friend is registered in the tournament ${tour.title}`;
  try {
    let payload = {
      'notification': {
        'title': `Your friend is in a tournament`,
        body,
        "sound": "default",
        "delivery_receipt_requested": "true"
      },
      data: { data: JSON.stringify(tour), is: "register-tournament" }
    }

    payload = helper.normalizePayload(payload);

    //Guardamos la notificaton en la base de datos
    let notiProcess = await managerNoti.saveNotification(payload, "registerTournament", user.id);
    sails.sockets.broadcast(user.id, notiProcess);

    //Limpiamos y comprobamos los tokens
    let tokens = helper.cleanTokensId(user.tokens);
    if (helper.checkTokensID(tokens) === false) {
      return proceed();
    }
    console.log(payload);
    let is = "register-tournament";
    await new Promise((resolve) => {
      notification.messaging().sendToDevice(tokens, payload)
        .then(function (response) {

          for (let result of response.results) {
            sails.log(`Successfully sent message new ${is}`, result);
          }
          resolve();
        })
        .catch(function (error) {
          sails.log(`error in send notification ${is}`, error);
          resolve();
        });
    })

  }
  catch (e) {
    console.error(e);
  }
}