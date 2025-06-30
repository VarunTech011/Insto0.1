
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');


// REGISTER
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match!' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//FORGET PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 1000 * 60 * 15; // 15 mins

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const link = `https://insto-frontend-gsbr.vercel.app/reset-password?token=${token}`;
    await sendEmail(user.email, 'Reset Your Password', `
      <p>Hello ${user.firstName},</p>
      <p>Click below to reset your password:</p>
      <a href="${link}">Reset Password</a>
      <p>This link expires in 15 minutes.</p>
    `);

    res.status(200).json({ message: 'Reset link sent to email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//RESET PASSWORD 
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


