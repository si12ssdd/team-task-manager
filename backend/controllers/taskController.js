const Task = require('../models/Task');
const Project = require('../models/Project');

const taskPopulate = [
  { path: 'assignedTo', select: 'name email' },
  { path: 'project', select: 'title' },
  { path: 'createdBy', select: 'name email' },
];

const getTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === 'admin') {
      const myProjects = await Project.find({ createdBy: req.user._id }).select('_id');
      const ids = myProjects.map((p) => p._id);
      tasks = await Task.find({ project: { $in: ids } })
        .populate(taskPopulate)
        .sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate(taskPopulate)
        .sort({ createdAt: -1 });
    }

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const uid = req.user._id.toString();
    const canView =
      project.createdBy.toString() === uid ||
      project.members.some((m) => m.toString() === uid);

    if (!canView) return res.status(403).json({ message: 'Access denied' });

    const tasks = await Task.find({ project: req.params.projectId })
      .populate(taskPopulate)
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createTask = async (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo, project } = req.body;

  if (!title || !project) {
    return res.status(400).json({ message: 'Title and project ID are required' });
  }

  try {
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: 'Project not found' });

    if (proj.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can add tasks' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo: assignedTo || null,
      project,
      createdBy: req.user._id,
    });

    const populated = await Task.findById(task._id).populate(taskPopulate);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(taskPopulate);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isAdmin = req.user.role === 'admin';
    const isAssignee = task.assignedTo?.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you' });
    }

    if (isAdmin) {
      // admin can change everything
      const fields = ['title', 'description', 'status', 'priority', 'dueDate', 'assignedTo'];
      fields.forEach((f) => {
        if (req.body[f] !== undefined) {
          task[f] = req.body[f] || (f === 'assignedTo' ? null : task[f]);
        }
      });
    } else {
      // members can only move the status
      if (req.body.status) task.status = req.body.status;
    }

    await task.save();
    const updated = await Task.findById(task._id).populate(taskPopulate);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const proj = await Project.findById(task.project);
    if (!proj || proj.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can delete tasks' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTasks, getTasksByProject, createTask, getTaskById, updateTask, deleteTask };
