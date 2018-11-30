
module.exports = {
  saveNotification: async (payload, type, user)=>{
    if(typeObject(payload.data) === "string"){
        payload.data = JSON.parse(payload.data);
    }
    payload.title = payload.notification.title;
    payload.body = payload.notification.body;
    delete payload.notification;
    payload.type = type;
    payload.user = user;
    payload.view = false;
    console.log(payload);
    await Notifications.create(payload);
    console.log("finish")
  }

};

