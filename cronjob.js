var cron = require('node-cron');

cron.schedule('*/1 * * * *', function () {
  try {
    require("./tournaments");
  } catch (e) { console.log(e); }

});

cron.schedule('0 */12 * * *', function () {
  try {
    require("./tournaments/notification_on_start");
  } catch (e) { console.log(e); }

});

