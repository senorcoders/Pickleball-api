var cron = require('node-cron');

cron.schedule('*/1 * * * *', function () {
  try {
    require("./tournaments");
  } catch (e) { console.log(e); }

});

