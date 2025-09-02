console.log('Environment Check:');
console.log('PORT:', process.env.PORT || 'Not set (using 3000)');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'NOT SET - REQUIRED!');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'NOT SET - REQUIRED!');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set (optional)');
