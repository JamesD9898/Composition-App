const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // This is a mock authentication - in production, verify against database
  if (email === 'user@example.com' && password === 'password123') {
    // Set HTTP-only cookie
    res.cookie('authToken', 'your-jwt-token-would-go-here', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      sameSite: 'strict'
    });
    
    res.json({ success: true, user: { name: 'User Name' } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Verify authentication status
app.get('/api/auth/verify', (req, res) => {
  // Check if auth cookie exists
  if (req.cookies.authToken) {
    // In production, verify JWT signature here
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout route
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({ success: true });
});

// Protected route middleware
function requireAuth(req, res, next) {
  if (!req.cookies.authToken) {
    return res.redirect('/auth/login.html');
  }
  next();
}

// Protect dashboard routes
app.get('/dashboard/*', requireAuth, (req, res, next) => {
  next();
});

// Fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
