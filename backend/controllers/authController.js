const jwt = require('jsonwebtoken');
const User = require('../models/User');

function makeToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are all required' });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'An account with that email already exists' });
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: makeToken(user._id),
    });
  } catch (err) {
    console.error('register error:', err.message);
    res.status(500).json({ message: 'Something went wrong, try again' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Wrong email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: makeToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed, try again' });
  }
};

// just returns the logged-in user's info
const getMe = async (req, res) => {
  const { _id, name, email, role } = req.user;
  res.json({ _id, name, email, role });
};

module.exports = { register, login, getMe };
