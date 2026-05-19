const Task = require('../models/Task');
const Project = require('../models/Project');

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    let tasks;
    let projects;

    if (req.user.role === 'admin') {
      const adminProjects = await Project.find({ createdBy: req.user._id }).select('_id');
      const projectIds = adminProjects.map((p) => p._id);
      tasks = await Task.find({ project: { $in: projectIds } })
        .populate('assignedTo', 'name email')
        .populate('project', 'title')
        .sort({ createdAt: -1 });
      projects = adminProjects;
    } else {
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate('assignedTo', 'name email')
        .populate('project', 'title')
        .sort({ createdAt: -1 });
      const memberProjects = await Project.find({ members: req.user._id }).select('_id');
      projects = memberProjects;
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed'
    ).length;

    const recentActivity = tasks.slice(0, 5).map((t) => ({
      _id: t._id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      project: t.project,
      assignedTo: t.assignedTo,
      updatedAt: t.updatedAt,
    }));

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalProjects: projects.length,
      recentActivity,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboardStats };
