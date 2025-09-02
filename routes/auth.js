const express = require('express');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Demo login check
  if (email === 'john@automax.com' && password === 'password') {
    res.json({ 
      success: true, 
      user: { email, name: 'John Doe' },
      token: 'demo-token' 
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
});

module.exports = router;
