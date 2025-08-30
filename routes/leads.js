const express = require('express');
const router = express.Router();
const supabase = require('../supabase_connect');
const { sendSMS } = require('../services/twilio');

// Get all leads
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Capture new lead
router.post('/capture', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // For testing, use a default dealership if not provided
    let dealership_id = req.body.dealership_id;
    
    if (!dealership_id) {
      // Get the first dealership for testing
      const { data: dealerships } = await supabase
        .from('dealerships')
        .select('id')
        .limit(1)
        .single();
      
      dealership_id = dealerships?.id;
    }

    const leadData = {
      first_name: req.body.first_name || 'Unknown',
      last_name: req.body.last_name || '',
      email: req.body.email,
      phone: req.body.phone,
      source: req.body.source || 'website',
      vehicle_interest: req.body.vehicle_interest || '',
      message: req.body.message || '',
      dealership_id: dealership_id
    };

    // Insert lead
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (error) throw error;

    // Calculate response time (simulated for now)
    const responseTime = Math.floor((Date.now() - startTime) / 1000);
    
    // Update with response time
    await supabase
      .from('leads')
      .update({ 
        responded_at: new Date(),
        response_time_seconds: responseTime 
      })
      .eq('id', data.id);

    // Send SMS notification
    if (
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_PHONE_NUMBER
    ) {
      try {
        console.log('Attempting SMS to:', leadData.phone);
        await sendSMS(
          leadData.phone,
          `Hi ${leadData.first_name}! Thanks for your interest. We'll call you shortly about your test drive.`
        );
        console.log('SMS sent successfully');
      } catch (error) {
        console.error('SMS failed:', error.message);
        // Don't fail the whole request if SMS fails
      }
    } else {
      console.log('Missing Twilio environment variables, skipping SMS');
    }

    console.log(`Lead captured: ${data.first_name} ${data.last_name} - Response time: ${responseTime}s`);

    res.json({ 
      success: true, 
      message: 'Lead captured successfully',
      lead_id: data.id,
      response_time: responseTime
    });

  } catch (error) {
    console.error('Error capturing lead:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get single lead
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Lead not found' });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;