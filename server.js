const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const appointmentRoutes = require('./routes/appointments');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve widget.js
app.use('/', require('./routes/booking'));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/appointments', appointmentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Serve frontend for all non-API routes (in production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'my-app', 'dist')));
}
else {
  // 404 handler for development
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'my-app', 'dist', 'index.html'));
  });

  app.post('/api/appointments/book', async (req, res) => {
    const { name, email, phone, vehicle, date, time } = req.body;

    // Validate request data
    if (!name || !email || !phone || !vehicle || !date || !time) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        vehicle_info: vehicle,
        appointment_date: date,
        appointment_time: time,
        status: "booked",
        source: "Widget"
      }]);

    if (error) {
      console.error('Error booking appointment:', error);
      return res.status(500).json({ error: 'Failed to book appointment' });
    }

    res.status(201).json({ message: 'Appointment booked successfully', appointment: data[0] });
  });

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'my-app', 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});