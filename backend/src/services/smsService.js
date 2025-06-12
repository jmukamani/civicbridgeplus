const AfricasTalking = require('africastalking');
const config = require('../config');

const africastalking = AfricasTalking({
  apiKey: config.africastalking.apiKey,
  username: config.africastalking.username,
});

const sms = africastalking.SMS;

const sendSMS = async (to, message) => {
  try {
    const options = {
      to: Array.isArray(to) ? to : [to],
      message,
      from: config.africastalking.username,
    };

    const result = await sms.send(options);
    console.log('SMS sent successfully:', result);
    return result;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};

const sendBulkSMS = async (recipients, message) => {
  try {
    const result = await sendSMS(recipients, message);
    return result;
  } catch (error) {
    console.error('Bulk SMS failed:', error);
    throw error;
  }
};

module.exports = {
  sendSMS,
  sendBulkSMS,
};