const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { users } = require('../utils/inMemoryDb');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with that email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      id: uuidv4(),
      name,
      email,
      phone,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rides: [],
      paymentMethods: [],
    };

    // Save user to in-memory database
    users.push(newUser);

    // Create JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data and token (excluding password)
    const { password: _, ...userData } = newUser;
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

// Login a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data and token (excluding password)
    const { password: _, ...userData } = user;
    res.json({
      message: 'Login successful',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in user' });
  }
};

// Verify token
exports.verifyToken = (req, res) => {
  try {
    // User will be available from the auth middleware
    const { id, email } = req.user;
    res.json({
      verified: true,
      user: { id, email },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Error verifying token' });
  }
};

// Get user profile
exports.getProfile = (req, res) => {
  try {
    const userId = req.user.id;

    // Find user by ID
    const user = users.find(user => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data (excluding password)
    const { password, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error getting user profile' });
  }
};

// Update user profile
exports.updateProfile = (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    // Find user by ID
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      phone: phone || users[userIndex].phone,
      updatedAt: new Date().toISOString(),
    };

    // Return updated user data (excluding password)
    const { password, ...userData } = users[userIndex];
    res.json({
      message: 'Profile updated successfully',
      user: userData,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
};

// Reset password
exports.resetPassword = (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = users.find(user => user.email === email);
    if (!user) {
      // For security reasons, don't reveal if the email exists or not
      return res.json({ message: 'If your email is registered, you will receive a password reset link' });
    }

    // In a real app, send an email with a reset link
    // For now, just return a success message
    res.json({ message: 'If your email is registered, you will receive a password reset link' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error processing password reset request' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Find user by ID
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isPasswordValid = await bcrypt.compare(currentPassword, users[userIndex].password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    users[userIndex].password = hashedPassword;
    users[userIndex].updatedAt = new Date().toISOString();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
};
