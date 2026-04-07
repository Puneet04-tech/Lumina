import Joi from 'joi';
import { User } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { checkConnection } from '../config/database.js';
import { memoryStore } from '../config/memoryStore.js';
import bcrypt from 'bcryptjs';

const registerSchema = Joi.object({
  name: Joi.string().required().min(2),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email: value.email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = new User(value);
    await user.save();

    const token = generateToken(user._id, user.email, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    let user;
    let isPasswordValid = false;

    if (checkConnection()) {
      // Production: Use database
      user = await User.findOne({ email: value.email });
      if (user) {
        isPasswordValid = await user.comparePassword(value.password);
      }
    } else {
      // Offline mode: Allow test account
      if (value.email === 'test@example.com' && value.password === 'password123') {
        user = {
          _id: 'dev-user-1',
          email: 'test@example.com',
          username: 'testuser',
          role: 'admin',
          isActive: true,
          toJSON: () => ({
            _id: 'dev-user-1',
            email: 'test@example.com',
            username: 'testuser',
            role: 'admin'
          })
        };
        isPasswordValid = true;
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!checkConnection() || user.isActive) {
      const token = generateToken(user._id, user.email, user.role || 'user');

      res.json({
        success: true,
        message: 'Login successful',
        user: user.toJSON ? user.toJSON() : user,
        token,
        mode: checkConnection() ? 'production' : 'offline-dev'
      });
    } else {
      return res.status(401).json({ success: false, message: 'User account is inactive' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};
