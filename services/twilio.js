const twilio = require('twilio');

// Use environment variables, not hardcoded values
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

async function sendSMS(to, message) {
  try {
    const formattedPhone = to.startsWith('+') ? to : `+1${to}`;
    
    const result = await client.messages.create({
      body: message,
      from: twilioPhone,  // YOUR Twilio number
      to: formattedPhone   // Customer's number
    });
    
    console.log('SMS sent:', result.sid);
    return result;
    
  } catch (error) {
    console.error('SMS error:', error);
    throw error;
  }
}

module.exports = { sendSMS };