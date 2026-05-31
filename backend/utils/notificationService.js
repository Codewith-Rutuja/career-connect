const Notification = require("../models/Notification");

const sendNotification = async ({ userId, applicationId, type, title, message, data = {}, email = null, sms = null }) => {
  const notification = await Notification.create({
    user: userId,
    application: applicationId,
    type,
    title,
    message,
    data,
  });

  if (email) {
    console.log(`Email notification to ${email}: ${title} - ${message}`);
  }

  if (sms) {
    console.log(`SMS notification to ${sms}: ${title} - ${message}`);
  }

  return notification;
};

module.exports = {
  sendNotification,
};
