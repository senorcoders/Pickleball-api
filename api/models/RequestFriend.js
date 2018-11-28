const helper = require("./../../helpers")
const notification = require("../../notifications");

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
      let user = await User.findOne({ id: request.id });
      let tokens = helper.cleanTokensId(user.tokens);
      if (helper.checkTokensID(tokens) === false) {
        return proceed();
      }

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
  }

};

