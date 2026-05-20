const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/projects', require('../routes/projectRoutes'));
app.use('/api/tasks', require('../routes/taskRoutes'));
app.use('/api/dashboard', require('../routes/dashboardRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'API is up' });
});

// keep one connection alive across serverless invocations
let connected = false;

const connectDB = async () => {
  if (connected) return;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set in environment variables');
  }

  await mongoose.connect(process.env.MONGO_URI);
  connected = true;
};

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connect error:', err.message);
    return res.status(500).json({ message: 'Database connection failed: ' + err.message });
  }

  return app(req, res);
};
