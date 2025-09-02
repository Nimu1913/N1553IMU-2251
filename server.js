const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Import routes
const leadRoutes = require('./routes/leads');
const appointmentRoutes = require('./routes/appointments');
const authRoutes = require('./routes/auth');

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes (must come before static files)
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

// Serve frontend in production (only once, at the end)
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the built React app
  app.use(express.static(path.join(__dirname, 'my-app', 'dist')));
  
  // Catch all handler - send React app for any route not handled above
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'my-app', 'dist', 'index.html'));
  });
} else {
  // 404 handler for development
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
