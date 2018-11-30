const helper = require("./../../helpers")
const notification = require("../../notifications");
const managerNoti = require("../controllers/NotificationsController");

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    response: {
      type: "boolean",
      required: false
    },

    dateOfResponse: {
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

  afterCreate: async (request, proceed) => {
    try {
      let user = await User.findOne({ id: request.to });

      let requestAll = await RequestFriend.findOne({ id: request.id }).populate("from");
      delete requestAll.from.tokens;

      let payload = {
        'notification': {
          'title': `Friend Request of ${user.firstName} ${user.lastName}`,
          'body': ``,
          "sound": "default",
          "delivery_receipt_requested": "true"
        },
        data: JSON.stringify(requestAll)
      }

      payload = helper.normalizePayload(payload);

      //Guardamos la notificaton en la base de datos
      await managerNoti.saveNotification(payload, "requestFriend", request.to);

      //Limpiamos y comprobamos los tokens
      let tokens = helper.cleanTokensId(user.tokens);
      if (helper.checkTokensID(tokens) === false) {
        return proceed();
      }

      await new Promise(() => {
        notification.messaging().sendToDevice(tokens, payload)
          .then(function (response) {

            for (let result of response.results) {
              sails.log("Successfully sent message new request friend:", result);
            }
            resolve();
          })
          .catch(function (error) {
            sails.log("error in send notification request friend", error);
            resolve();
          });
      })

    }
    catch (e) {
      console.error(e);
      sails.log("error in send notification request friend", request, e);
    }

    proceed();
  },

  beforeUpdate: async (valuesToSet, proceed) => {
    try {

      if (valuesToSet.response !== true) {
        return proceed();
      }

      let user = await User.findOne({ id: request.from });
      
      let requestAll = await RequestFriend.findOne({ id: request.id }).populate("to");
      delete requestAll.to.tokens;

      let payload = {
        'notification': {
          'title': `Your request has been accepted by ${user.fullName}`,
          'body': ``,
          "sound": "default",
          "delivery_receipt_requested": "true"
        },
        data: JSON.stringify(requestAll)
      }

      payload = helper.normalizePayload(payload);
      await managerNoti.saveNotification(payload, "requestFriend", request.from);

      let tokens = helper.cleanTokensId(user.tokens);
      if (helper.checkTokensID(tokens) === false) {
        return proceed();
      }

      await new Promise(() => {
        notification.messaging().sendToDevice(tokens, payload)
          .then(function (response) {

            for (let result of response.results) {
              sails.log("Successfully sent message request friend resposing:", result);
            }
            resolve();
          })
          .catch(function (error) {
            sails.log("error in send notification request friend resposing", error);
            resolve();
          });
      })

    }
    catch (e) {
      sails.log("error in sent notification request resposing", request, e);
    }

    proceed()
  }

};

