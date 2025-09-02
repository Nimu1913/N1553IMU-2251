const express = require('express');
const router = express.Router();
const supabase = require('../supabase_connect');

// Mock auth for now (replace with real Supabase auth later)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // For demo purposes - replace with real auth
  if (email === 'john@automax.com' && password === 'password') {
    res.json({
      success: true,
      user: { 
        id: '1',
        email: email,
        name: 'John Doe'
      },
      token: 'demo-token-' + Date.now()
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

router.get('/me', (req, res) => {
  // Return mock user for now
  res.json({
    success: true,
    user: {
      id: '1',
      email: 'john@automax.com',
      name: 'John Doe'
    }
  });
});

router.post('/logout', (req, res) => {
  res.json({ success: true });
});

module.exports = router;
