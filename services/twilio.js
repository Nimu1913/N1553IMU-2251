//Twilio service 

const twilio = require('twilio');

const client = twilio (
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
);
async function sendSMS(to, message) {
  try {
    // Format phone number (add +1 for US)
    const formattedPhone = to.startsWith('+') ? to : `+1${to}`;
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    
    console.log('SMS sent:', result.sid);
    return result;
    
  } catch (error) {
    console.error('SMS error:', error);
    throw error;
  }
}

module.exports = { sendSMS };
