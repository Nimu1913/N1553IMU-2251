const twilio = require('twilio');

// Use environment variables, not hardcoded values
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

async function sendSMS(to, message) {
  try {
    // Handle Swedish numbers
    let formattedPhone = to;
    if (to.startsWith('07')) {
      formattedPhone = '+46' + to.substring(1);
    } else if (to.startsWith('0')) {
      formattedPhone = '+46' + to.substring(1);
    } else if (!to.startsWith('+')) {
      formattedPhone = '+1' + to;
    } else {
      formattedPhone = to;
    }
    
    console.log('Sending SMS to formatted number:', formattedPhone);
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    
    console.log('SMS sent with SID:', result.sid);
    return result;
  } catch (error) {
    console.error('SMS error details:', error);
    throw error;
  }
}

module.exports = { sendSMS };