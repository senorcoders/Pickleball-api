
module.exports = {
  saveNotification: async (payload, type, user)=>{
    if(typeObject(payload.data) === "string"){
        payload.data = JSON.parse(payload.data);
    }
    payload.type = type;
    payload.user = user;
    payload.view = false;
    await Notification.create(payload);
  }

};

