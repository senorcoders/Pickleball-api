const helper = require("./../../helpers")
const notification = require("../../notifications");

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
      let tokens = helper.cleanTokensId(user.tokens);
      if (helper.checkTokensID(tokens) === false) {
        return proceed();
      }

      let chatAll = await Chat.findOne({ id: chat.id }).populate("from");
      delete chatAll.from.tokens;

      let payload = {
        'notification': {
          'title': `New Message of ${user.fullName}`,
          'body': `${chat.message}`,
          "sound": "default",
          "delivery_receipt_requested": "true"
        },
        data: JSON.stringify(chatAll)
      }

      payload = helper.normalizePayload(payload);

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

