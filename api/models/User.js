/**
 * User.js
 *
 * A user who can log in to this application.
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    firstName: {
      type: "string",
      required: false,
      example: "Dayana"
    },

    lastName: {
      type: "string",
      required: false,
      example: "Lara"
    },

    fullName: {
      type: "string",
      required: false
    },

    gender: {
      type: "string",
      required: false
    },

    birthDay: {
      type: 'string',
      columnType: 'datetime',
      required: false
    },

    email: {
      type: 'string',
      required: false,
      unique: true,
      isEmail: true,
      maxLength: 200,
      example: 'mary.sue@example.com'
    },

    password: {
      type: 'string',
      required: false,
      description: 'Securely hashed representation of the user\'s login password.',
      protect: true,
      example: '2$28a8eabna301089103-13948134nad'
    },

    userID: {
      type: "string",
      unique: true,
      required: false,
      description: "User ID of facebook"
    },

    rank: {
      type: "number",
      required: false
    },

    searchable: {
      type: "boolean",
      required: false,
      defaultsTo: true
    },

    zipCode: {
      type: "string",
      required: false
    },

    location: {
      type: "string",
      required: false
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝
    // n/a

    loginFacebook: {
      type: "json",
      required: false
    },

    image: {
      type: "json",
      required: false
    },

    tokens: {
      type: "json",
      columnType: "array",
      required: false
    },

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    // n/a
    eventsPlayer: {
      collection: "event",
      via: "players",
    }

  },

  customToJSON: function () {
    var obj = this;
    delete obj.password;
    delete obj.tokens;
    return obj;
  },

};
