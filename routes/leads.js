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

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // IMPORTANT: Always return an array, even if empty
    // This prevents the .filter() error on the frontend
    res.json({ 
      success: true, 
      data: data || [] // Ensure data is always an array
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    // Even on error, return empty array to prevent frontend crashes
    res.status(500).json({ 
      success: false, 
      error: error.message,
      data: [] // Always include empty array on error
    });
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
      const { data: dealerships, error: dealershipError } = await supabase
        .from('dealerships')
        .select('id')
        .limit(1)
        .single();
      
      if (dealershipError) {
        console.error('Error fetching dealership:', dealershipError);
      }
      
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

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    // Calculate response time (simulated for now)
    const responseTime = Math.floor((Date.now() - startTime) / 1000);
    
    // Update with response time
    const { error: updateError } = await supabase
      .from('leads')
      .update({ 
        responded_at: new Date(),
        response_time_seconds: responseTime 
      })
      .eq('id', data.id);

    if (updateError) {
      console.error('Error updating response time:', updateError);
      // Don't fail the request if update fails
    }

    // Send SMS notification
    if (
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_PHONE_NUMBER &&
      leadData.phone
    ) {
      try {
        console.log('Attempting SMS to:', leadData.phone);
        await sendSMS(
          leadData.phone,
          `Hi ${leadData.first_name}! Thanks for your interest. We'll call you shortly about your test drive.`
        );
        console.log('SMS sent successfully');
      } catch (smsError) {
        console.error('SMS failed:', smsError.message);
        // Don't fail the whole request if SMS fails
      }
    } else {
      console.log('SMS skipped - missing config or phone number');
    }

    console.log(`Lead captured: ${data.first_name} ${data.last_name} - Response time: ${responseTime}s`);

    // Consistent response structure
    res.json({ 
      success: true, 
      message: 'Lead captured successfully',
      data: data, // Include the full lead object
      lead_id: data.id, // Keep for backward compatibility
      response_time: responseTime
    });

  } catch (error) {
    console.error('Error capturing lead:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      data: null
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

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data) {
      return res.status(404).json({ 
        success: false,
        error: 'Lead not found',
        data: null
      });
    }

    res.json({ 
      success: true, 
      data: data // Single object for single lead
    });

  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      data: null
    });
  }
});

// Update lead status (if needed in the future)
router.patch('/:id', async (req, res) => {
  try {
    const allowedFields = ['lead_status', 'notes', 'follow_up_date', 'last_contact_date'];
    const updates = {};
    
    // Only include allowed fields in update
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
        data: null
      });
    }

    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: data
    });

  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

module.exports = router;