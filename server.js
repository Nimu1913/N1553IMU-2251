const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Import routes
const leadRoutes = require('./my-app/routes/leads');
const appointmentRoutes = require('./my-app/routes/appointments');

// Middleware
app.use(cors());
app.use(express.json());

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
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});