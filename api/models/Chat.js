const helper = require("./../../helpers")
const notification = require("../../notifications");
const managerNoti = require("../controllers/NotificationsController");

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    message: {
      type: "string",
      required: true
    },

    type: {
      type: "string",
      required: true
    },

    dateTime: {
      type: 'string',
      columnType: 'datetime',
      required: false
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    from: {
      model: "user",
      unique: false,
      required: true
    },

    to: {
      model: "user",
      unique: false,
      required: true
    }
  },

  afterCreate: async (chat, proceed) => {
    try {
      let user = await User.findOne({ id: chat.to });
      let chatAll = await Chat.findOne({ id: chat.id }).populate("from");
      delete chatAll.from.tokens;

      let payload = {
        'notification': {
          'title': `New Message from ${chatAll.from.fullName}`,
          'body': `${chat.message}`,
          "sound": "default",
          "delivery_receipt_requested": "true"
        },
        data: { data: JSON.stringify(chatAll), is: "chat" }
      }

      payload = helper.normalizePayload(payload);
      let notiProcess = await managerNoti.saveNotification(payload, "chat", chat.to);
      sails.sockets.broadcast(chat.to, notiProcess);
      sails.sockets.broadcast(chat.to, "new-chat", chatAll);

      let tokens = helper.cleanTokensId(user.tokens);
      if (helper.checkTokensID(tokens) === false) {
        return proceed();
      }

      await new Promise((resolve) => {
        notification.messaging().sendToDevice(tokens, payload)
          .then(function (response) {

            for (let result of response.results) {
              sails.log("Successfully sent message new chat:", result);
            }
            resolve();
          })
          .catch(function (error) {
            sails.log("error in send notification chat", error);
            resolve();
          });
      })

    }
    catch (e) {
      console.error(e);
      sails.log("error in send notification chat", chat, e);
    }

    proceed();
  }

};

