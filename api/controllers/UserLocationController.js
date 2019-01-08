/**
 * UserLocationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
    addFromBackground: catchErrors(async (req, res)=>{
        console.log(req.body);
        if(req.headers["user"]){
            let user = req.headers["user"];
        }

        res.ok();
    })
};

