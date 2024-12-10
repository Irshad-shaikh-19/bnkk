const { NotificationModel } = require('../models/index');
module.exports = function socketEvents(io) {
  io.on('connection', (socket) => {
    console.log('sockt connected');
    socket.on('notification', async (data) => {
      let notification = await NotificationModel.findOne({ status: 1 });
      if (!data) {
        notification = null;
      }
      io.emit('get-notification', {
        data:
          notification && Object.keys(notification).length > 0 ? true : false,
      });
    });
  });
};
