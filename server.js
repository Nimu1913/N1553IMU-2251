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

// Disable caching for all API routes
app.use('/api/*', (req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/appointments', appointmentRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'my-app', 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'my-app', 'dist', 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
