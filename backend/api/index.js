// Vercel serverless entry point — wraps the Express app
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

// Routes
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/projects', require('../routes/projectRoutes'));
app.use('/api/tasks', require('../routes/taskRoutes'));
app.use('/api/dashboard', require('../routes/dashboardRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Team Task Manager API is running' });
});

// Reuse the mongoose connection across warm lambda invocations
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
};

// Vercel expects a default export of the handler
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
