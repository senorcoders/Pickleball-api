/**
 * Event.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    name: {
      type: "string",
      required: true
    },

    description: {
      type: "string",
      required: false
    },

    date: {
      type: "number",
      required: true
    },

    time: {
      type: "number",
      required: true
    },

    partner: {
      type: "string",
      required: false
    },

    player: {
      type: "string",
      required: false
    },

    courts: {
      type: "string",
      required: false
    },

    matchTimes: {
      type: "string",
      required: false
    },

    travelInfo: {
      type: "string",
      required: false
    },

    eventStats: {
      type: "string",
      required: false
    },

    type: {
      type: "string",
      required: true
    },

    locationText: {
      type: "string",
      required: false
    },

    locationCoords: {
      type: "string",
      required: false
    },

    images: {
      type: "json",
      columnType: "string",
      required: false
    },


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    user: {
      model: "user",
      required: true
    },

    players: {
      collection: "user",
      via: "eventsPlayer",
    },

    courts: {
      collection: "courtsevent",
      via: "event",
    }
  },

};

