/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */
const poli = 'logged';
module.exports.policies = {

  '*': poli,
  "view-homepage-or-redirect": true,
  "entrance/login": true,
  "entrance/signup": true,

  FacebookController: {
    auth: true
  },
  UserController: {
    "*": true,
    "search": poli,
    "changeLocation": poli
  },
  ImageController: {
    getImage: true
  },
  EventController: {
    getXCoordinates: true
  },
  TournamentsController: {
    getNearUbication: true
  },
  CourtController: {
    getCourtXPosition: true
  }
};
