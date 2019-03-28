/**
 * CourtState.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
    updated: {
      type: "number",
      required: false
    },

    name: {
      type: "string",
      required: false
    },

    address: {
      type: "string",
      required: false
    },

    city: {
      type: "string",
      required: false
    },

    In: {
      type: "number",
      required: false
    },

    Out: {
      type: "number",
      required: false
    },

    Players: {
      type: "number",
      required: false
    },

    Comment: {
      type: "string",
      required: false
    },

    Schedule: {
      type: "string",
      required: false
    },

    Fee: {
      type: "string",
      required: false
    },

    nameContact: {
      type: "string",
      required: false
    },

    telephone: {
      type: "string",
      required: false
    },

    coordinates: {
      type: "json",
      columnType: "array",
      required: false
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

  },

};

