const express = require('express');
const router = express.Router();
const supabase = require('../supabase_connect');

// Get available time slots (simplified for MVP)
router.get('/availability', async (req, res) => {
  try {
    const { date } = req.query;
    
    // For MVP, return static time slots
    const slots = [
      { time: '09:00', available: true },
      { time: '10:00', available: true },
      { time: '11:00', available: true },
      { time: '14:00', available: true },
      { time: '15:00', available: true },
      { time: '16:00', available: true }
    ];
    
    res.json({ 
      success: true,
      date: date || new Date().toISOString().split('T')[0],
      slots 
    });
  } catch (error) {
    console.error('Error getting availability:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Book appointment
router.post('/book', async (req, res) => {
  try {
    const { 
      lead_id, 
      dealership_id, 
      appointment_date, 
      appointment_type,
      notes 
    } = req.body;
    
    // Validate required fields
    if (!lead_id || !appointment_date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    // Create appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        lead_id,
        dealership_id,
        appointment_date,
        appointment_type: appointment_type || 'test_drive',
        notes,
        status: 'scheduled'
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    res.json({ 
      success: true, 
      message: 'Appointment booked successfully',
      data: data 
    });
    
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        leads (
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .order('appointment_date', { ascending: true });

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
    console.error('Error fetching appointments:', error);
    // Even on error, return empty array to prevent frontend crashes
    res.status(500).json({ 
      success: false, 
      error: error.message,
      data: [] // Always include empty array on error
    });
  }
});

// Update appointment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['scheduled', 'completed', 'no_show', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid status',
        data: null
      });
    }
    
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    res.json({ 
      success: true, 
      data: data,
      message: 'Status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      data: null
    });
  }
});

module.exports = router;