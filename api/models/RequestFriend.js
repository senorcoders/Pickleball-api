const helper = require("./../../helpers")
const notification = require("../../notifications");
const managerNoti = require("../controllers/NotificationsController");

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    response: {
      type: "json",
      columnType: "boolean",
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
          'title': `Friend Request of ${requestAll.from.fullName}`,
          'body': ``,
          "sound": "default",
          "delivery_receipt_requested": "true"
        },
        data: { data: JSON.stringify(requestAll), is: "new-Request" }
      }

      payload = helper.normalizePayload(payload);

      //Guardamos la notificaton en la base de datos
      await managerNoti.saveNotification(payload, "requestFriend", request.to);

      //Limpiamos y comprobamos los tokens
      let tokens = helper.cleanTokensId(user.tokens);
      if (helper.checkTokensID(tokens) === false) {
        return proceed();
      }
      console.log(payload);
      await new Promise((resolve) => {
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

      let requestAll = await RequestFriend.findOne({ id: valuesToSet.id }).populate("to");
      delete requestAll.to.tokens;
      let user = await User.findOne({ id: requestAll.from });

      let payload = {
        'notification': {
          'title': `Your request has been accepted by ${requestAll.to.fullName}`,
          'body': ``,
          "sound": "default",
          "delivery_receipt_requested": "true"
        },
        data: { data: JSON.stringify(requestAll), is: "updated-request" }
      }

      payload = helper.normalizePayload(payload);
      await managerNoti.saveNotification(payload, "requestFriend", requestAll.from);

      let tokens = helper.cleanTokensId(user.tokens);
      if (helper.checkTokensID(tokens) === false) {
        return proceed();
      }

      await new Promise((resolve) => {
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
      sails.log("error in sent notification request resposing", requestAll, e);
    }

    proceed()
  }

};

