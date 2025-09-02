const express = require('express');
const router = express.Router();

// Mock auth for now
const mockUser = {
  id: '1',
  email: 'john@automax.com',
  name: 'John Doe',
  role: 'admin'
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'john@automax.com' && password === 'password') {
    // Set no-cache headers
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({
      success: true,
      user: mockUser,
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
  // IMPORTANT: Set headers to prevent caching
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  
  // Always return fresh data
  res.status(200).json({
    success: true,
    user: mockUser
  });
});

router.post('/logout', (req, res) => {
  res.json({ success: true });
});

module.exports = router;
