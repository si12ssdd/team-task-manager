const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const getProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === 'admin') {
      projects = await Project.find({ createdBy: req.user._id })
        .populate('createdBy', 'name email')
        .populate('members', 'name email role');
    } else {
      projects = await Project.find({ members: req.user._id })
        .populate('createdBy', 'name email')
        .populate('members', 'name email role');
    }

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createProject = async (req, res) => {
  const { title, description, members } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Project title is required' });
  }

  try {
    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: members || [],
    });

    const populated = await project.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'members', select: 'name email role' },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some((m) => m._id.toString() === req.user._id.toString());
    const isOwner = project.createdBy._id.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'You do not have access to this project' });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProject = async (req, res) => {
  const { title, description } = req.body;

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can update it' });
    }

    project.title = title || project.title;
    project.description = description !== undefined ? description : project.description;

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can delete it' });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: 'Project and its tasks deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addMember = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Member email is required' });
  }

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can add members' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'No user found with that email' });
    }

    const alreadyMember = project.members.some(
      (m) => m.toString() === userToAdd._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    project.members.push(userToAdd._id);
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can remove members' });
    }

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
