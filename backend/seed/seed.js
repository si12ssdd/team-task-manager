const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: '../.env' });

const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Alice Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    const member1 = await User.create({
      name: 'Bob Member',
      email: 'member@example.com',
      password: 'password123',
      role: 'member',
    });

    const member2 = await User.create({
      name: 'Carol Dev',
      email: 'carol@example.com',
      password: 'password123',
      role: 'member',
    });

    console.log('Users created');

    // Create projects
    const project1 = await Project.create({
      title: 'Website Redesign',
      description: 'Redesign the company website with a modern look and feel.',
      createdBy: admin._id,
      members: [member1._id, member2._id],
    });

    const project2 = await Project.create({
      title: 'Mobile App MVP',
      description: 'Build the first version of the mobile app for iOS and Android.',
      createdBy: admin._id,
      members: [member1._id],
    });

    console.log('Projects created');

    // Create tasks for project 1
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    await Task.create([
      {
        title: 'Design homepage mockup',
        description: 'Create wireframes and high-fidelity mockups for the new homepage.',
        status: 'completed',
        priority: 'high',
        dueDate: yesterday,
        assignedTo: member1._id,
        project: project1._id,
        createdBy: admin._id,
      },
      {
        title: 'Set up React project',
        description: 'Initialize the frontend project with Vite and Tailwind CSS.',
        status: 'in-progress',
        priority: 'high',
        dueDate: nextWeek,
        assignedTo: member2._id,
        project: project1._id,
        createdBy: admin._id,
      },
      {
        title: 'Write content for About page',
        description: 'Draft the copy for the About Us section.',
        status: 'todo',
        priority: 'low',
        dueDate: nextWeek,
        assignedTo: member1._id,
        project: project1._id,
        createdBy: admin._id,
      },
      {
        title: 'SEO audit',
        description: 'Run an SEO audit on the current site and document improvements.',
        status: 'todo',
        priority: 'medium',
        dueDate: yesterday, // overdue
        assignedTo: null,
        project: project1._id,
        createdBy: admin._id,
      },
    ]);

    // Create tasks for project 2
    await Task.create([
      {
        title: 'Define app architecture',
        description: 'Decide on the tech stack and folder structure for the mobile app.',
        status: 'completed',
        priority: 'high',
        dueDate: yesterday,
        assignedTo: member1._id,
        project: project2._id,
        createdBy: admin._id,
      },
      {
        title: 'Build login screen',
        description: 'Implement the login and registration screens.',
        status: 'in-progress',
        priority: 'high',
        dueDate: nextWeek,
        assignedTo: member1._id,
        project: project2._id,
        createdBy: admin._id,
      },
      {
        title: 'API integration',
        description: 'Connect the app to the backend REST APIs.',
        status: 'todo',
        priority: 'medium',
        dueDate: nextWeek,
        assignedTo: null,
        project: project2._id,
        createdBy: admin._id,
      },
    ]);

    console.log('Tasks created');
    console.log('\n--- Seed complete ---');
    console.log('Admin:  admin@example.com  / password123');
    console.log('Member: member@example.com / password123');
    console.log('Member: carol@example.com  / password123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seed();
