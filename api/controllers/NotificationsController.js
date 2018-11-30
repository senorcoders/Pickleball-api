
module.exports = {
  saveNotification: async (payload, type, user) => {
    payload = JSON.parse(JSON.stringify(payload));
    let is = payload.data.is;
    payload.data = JSON.parse(payload.data.data);
    payload.data.is = is;
    payload.title = payload.notification.title;
    payload.body = payload.notification.body;
    delete payload.notification;
    payload.type = type;
    payload.user = user;
    payload.view = false;
    await Notifications.create(payload);
  }

};

