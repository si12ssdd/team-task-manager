const Task = require('../models/Task');
const Project = require('../models/Project');

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    let tasks = [];
    let projectCount = 0;

    if (req.user.role === 'admin') {
      const myProjects = await Project.find({ createdBy: req.user._id }).select('_id');
      projectCount = myProjects.length;
      const ids = myProjects.map((p) => p._id);

      tasks = await Task.find({ project: { $in: ids } })
        .populate('assignedTo', 'name email')
        .populate('project', 'title')
        .sort({ updatedAt: -1 });
    } else {
      const memberProjects = await Project.find({ members: req.user._id }).select('_id');
      projectCount = memberProjects.length;

      tasks = await Task.find({ assignedTo: req.user._id })
        .populate('assignedTo', 'name email')
        .populate('project', 'title')
        .sort({ updatedAt: -1 });
    }

    const completed = tasks.filter((t) => t.status === 'completed').length;
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed'
    ).length;

    res.json({
      totalTasks: tasks.length,
      completedTasks: completed,
      pendingTasks: tasks.length - completed,
      overdueTasks: overdue,
      totalProjects: projectCount,
      recentActivity: tasks.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboardStats };
