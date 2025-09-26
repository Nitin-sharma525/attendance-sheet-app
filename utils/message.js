const twilio = require('twilio');
const accountSid  = process.env.TWILIO_SID;
const authToken = 'f5469e77c550111bd138630d98d42130';
const twilioPhone = '+19342034899'; 

const client = twilio(accountSid, authToken);

async function sendSMS(toPhoneNumber, message) {
  try {
    const msg = await client.messages.create({
      body: message,             
      from: twilioPhone,
      to: toPhoneNumber,
    });
    console.log(`SMS sent to ${toPhoneNumber} | SID: ${msg.sid}`);
  } catch (error) {
    console.error(`SMS failed to ${toPhoneNumber}: ${error.message}`);
  }
}

module.exports = { sendSMS };
