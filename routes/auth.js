// routes/auth.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabase_connect');

// Simple session storage (in production, use proper sessions/JWT)
const sessions = new Map();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For MVP/testing - using hardcoded credentials
    // In production, check against Supabase auth or your users table
    if (email === 'john@automax.com' && password === 'password') {
      const user = {
        id: '1',
        name: 'John Smith',
        email: 'john@automax.com',
        dealership: 'AutoMax Dealership',
        role: 'salesperson'
      };
      
      // Create a simple session
      const sessionId = Math.random().toString(36).substring(7);
      sessions.set(sessionId, user);
      
      res.json({
        success: true,
        user: user,
        token: sessionId // In production, use JWT
      });
    } else {
      // Try to authenticate against Supabase users table
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error || !users) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      // In production, verify password hash here
      // For now, just return the user if email exists
      const sessionId = Math.random().toString(36).substring(7);
      sessions.set(sessionId, users);
      
      res.json({
        success: true,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          dealership: users.dealership,
          role: users.role
        },
        token: sessionId
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check current session
router.get('/me', (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (token && sessions.has(token)) {
      const user = sessions.get(token);
      res.json({
        success: true,
        user: user
      });
    } else {
      res.json({
        success: true,
        user: null
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (token) {
      sessions.delete(token);
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Register endpoint (optional - for creating new users)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, dealership, phone } = req.body;
    
    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }
    
    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        email,
        username: email.split('@')[0],
        password: password, // In production, hash this!
        name,
        dealership,
        phone,
        role: 'salesperson'
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;