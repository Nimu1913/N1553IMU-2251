const express = require('express');
const router = express.Router();
const supabase = require('../../supabase_connect');

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
    res.status(500).json({ success: false, error: error.message });
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
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      message: 'Appointment booked successfully',
      appointment: data 
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update appointment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['scheduled', 'completed', 'no_show', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status' 
      });
    }
    
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;