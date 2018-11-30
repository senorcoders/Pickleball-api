exports.checkTokensID = function (token) {
    if (Object.prototype.toString.call(token) === "[object Array]") {
        if (token.length === 0) {
            return false;
        }
    } else if (Object.prototype.toString.call(token) === "[object String]") {
        if (token === "") {
            return false;
        }
    } else {
        return false;
    }

    return true;
};

exports.cleanTokensId = function (tokens) {
    if (tokens === null || tokens === undefined) return [];

    tokens = tokens.filter(it => {
        return Object.prototype.toString.call(it) === "[object String]" && it !== "";
    });

    let tokenTemp = [];
    for (let token of tokens) {
        let index = tokenTemp.findIndex(it => {
            return it === token;
        });
        if (index === -1) {
            tokenTemp.push(token);
        }
    }

    return tokenTemp;
}

exports.normalizePayload = function (payload) {

    let standar = {
        sound: "default",
        color: "#008e76",
        //forceShow: "true"
    };

    if (!payload.hasOwnProperty("notification")) {
        payload.notification = {};
    }

    for (let p of Object.keys(standar)) {
        if (!payload.notification.hasOwnProperty(p)) {
            payload.notification[p] = standar[p];
        }
    }

    //sails.log(payload);

    return payload;
}

exports.capitalize = function (text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

exports.isDefined = function (obj) {
    return Object.prototype.toString.call(obj) !== "[object Undefined]" &&
        Object.prototype.toString.call(obj) !== "[object Null]";
};

//#region para manajer el http de pagos con stripe
// let axios = require("axios");

// exports.httpStripe = axios.create({
//     timeout: 6000,
//     headers: require("./config/local").headersStripe
// });
//#endregion

