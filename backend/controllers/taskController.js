const Task = require('../models/Task');
const Project = require('../models/Project');

const getTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === 'admin') {
      const adminProjects = await Project.find({ createdBy: req.user._id }).select('_id');
      const projectIds = adminProjects.map((p) => p._id);
      
      tasks = await Task.find({ project: { $in: projectIds } })
        .populate('assignedTo', 'name email')
        .populate('project', 'title')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate('assignedTo', 'name email')
        .populate('project', 'title')
        .populate('createdBy', 'name email')
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

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some((m) => m.toString() === req.user._id.toString());
    const isOwner = project.createdBy.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createTask = async (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo, project } = req.body;

  if (!title || !project) {
    return res.status(400).json({ message: 'Title and project are required' });
  }

  try {
    const projectDoc = await Project.findById(project);

    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (projectDoc.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project admin can create tasks' });
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

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name email');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you' });
    }

    if (!isAdmin) {
      if (req.body.status) {
        task.status = req.body.status;
      }
    } else {
      const { title, description, status, priority, dueDate, assignedTo } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    }

    await task.save();

    const updated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name email');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);

    if (!project || project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project admin can delete tasks' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getTasks,
  getTasksByProject,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
};
