const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const populateProject = (query) =>
  query
    .populate('createdBy', 'name email')
    .populate('members', 'name email role');

const getProjects = async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin'
        ? { createdBy: req.user._id }
        : { members: req.user._id };

    const projects = await populateProject(Project.find(filter));
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createProject = async (req, res) => {
  const { title, description, members } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: 'Project needs a title' });
  }

  try {
    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: members || [],
    });

    const result = await populateProject(Project.findById(project._id));
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await populateProject(Project.findById(req.params.id));

    if (!project) return res.status(404).json({ message: 'Project not found' });

    const uid = req.user._id.toString();
    const hasAccess =
      project.createdBy._id.toString() === uid ||
      project.members.some((m) => m._id.toString() === uid);

    if (!hasAccess) {
      return res.status(403).json({ message: "You're not part of this project" });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can edit this project' });
    }

    if (req.body.title) project.title = req.body.title;
    if (req.body.description !== undefined) project.description = req.body.description;

    await project.save();
    const updated = await populateProject(Project.findById(project._id));
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete this project' });
    }

    // clean up tasks too
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addMember = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can add members' });
    }

    const newMember = await User.findOne({ email });
    if (!newMember) {
      return res.status(404).json({ message: 'No user found with that email' });
    }

    const alreadyIn = project.members.some((m) => m.toString() === newMember._id.toString());
    if (alreadyIn) {
      return res.status(400).json({ message: 'That person is already in this project' });
    }

    project.members.push(newMember._id);
    await project.save();

    const updated = await populateProject(Project.findById(project._id));
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can remove members' });
    }

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();

    const updated = await populateProject(Project.findById(project._id));
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
