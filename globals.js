global.catchErrors = callback => {

    return async function (req, res) {
        try {
            await callback(req, res);
        }
        catch (e) {
            sails.log("error", e);
            console.error(e);
            res.serverError(e);
        }
    }

};

global.type = function(obj){
    return Object.prototype.toString.call(obj).split(" ")[1].slice(0, -1);
}

global.typeObject = function(obj){
    return Object.prototype.toString.call(obj).split(" ")[1].slice(0, -1).toLowerCase();
}
