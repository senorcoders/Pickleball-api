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
  'PUT /login-facebook': 'FacebookController.auth',
  
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
  "GET /users/finds": "UserController.search",


  /***********
   * 
   * FOR REQUEST FRIEND
   * 
   */
  "POST /requestfriend": "RequestFriendController.save"
};
