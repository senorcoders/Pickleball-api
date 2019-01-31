/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  //  ╦ ╦╔═╗╔╗ ╔═╗╔═╗╔═╗╔═╗╔═╗
  //  ║║║║╣ ╠╩╗╠═╝╠═╣║ ╦║╣ ╚═╗
  //  ╚╩╝╚═╝╚═╝╩  ╩ ╩╚═╝╚═╝╚═╝
  'GET /': { action: 'view-homepage-or-redirect' },

  //  ╔═╗╔═╗╦  ╔═╗╔╗╔╔╦╗╔═╗╔═╗╦╔╗╔╔╦╗╔═╗
  //  ╠═╣╠═╝║  ║╣ ║║║ ║║╠═╝║ ║║║║║ ║ ╚═╗
  //  ╩ ╩╩  ╩  ╚═╝╝╚╝═╩╝╩  ╚═╝╩╝╚╝ ╩ ╚═╝

  /*****
   * LOGIN Y LOGOUT
   * 
   */

  'PUT   /login': { action: 'entrance/login' },
  'POST  /signup': { action: 'entrance/signup' },
  'POST /share-app': { action: 'entrance/shareapp' },
  'PUT /login-facebook': 'FacebookController.auth',

  "PUT /logout": "UserController.logout",
  "PUT /forgot-password": "UserController.forgotPassword",
  "PUT /forgot-password/validate": "UserController.changePasswordWithModel",

  /**********
   * 
   * FOR MANAGE IMAGE OF USER
   * 
   */
  'PATCH /image/user/:userId': "ImageController.saveImageUser",

  "GET /images/:type/:nameFile/:id": "ImageController.getImage",

  /***************
   * 
   * FOR MANAGE MODEL USER
   * 
   */
  "GET /users/finds/:userId": "UserController.search",


  /***********
   * 
   * FOR REQUEST FRIEND
   * 
   */
  "POST /requestfriend": "RequestFriendController.save",


  /***********
   * 
   * FOR LIVE COMUNICATION
   * 
   */
  "GET /sails-client": "LiveComunicationController.getSailsClient",

  "PUT /suscribe-room": "LiveComunicationController.subscribeToRoom",

  /***********
   * 
   * FOR TOURNAMENTS
   * 
   */

  "GET /tournaments-search": "TournamentsController.search",
  "GET /tournaments-search-date": "TournamentsController.searchForNextMonth",
  "GET /tournaments-ubication": "TournamentsController.getNearUbication",

  //  "GET /change-coordinates": "TournamentsController.addCoordinates",

  /*************
   * 
   * CHAT
   * 
   */
  "GET /list-chat/:user": "ChatController.getChatRecents",

  /*************
   * 
   * FOR SAVE COURTS
   * 
   */

  "POST /court-bulk": "CourtController.saveBulk",
  "GET /court-position": "CourtController.getCourtXPosition",


  /********************
   * 
   * FOR LOCATIONS USER
   * 
   * 
   */

  "POST /user-location-background": "UserLocationController.addFromBackground",
  "POST /user-locaion-background-fail": "UserLocationController.failFromBackgroud",

  /************
   * 
   * FOR EVENT
   * 
   */
  "POST /event-courts": "EventController.saveWithCourts",
  "PATCH /share-event": "EventController.shareEvent",
  "POST /event-images/:eventId": "ImageController.saveImageEvents"

};
