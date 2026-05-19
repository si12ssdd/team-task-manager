const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTasksByProject,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getTasks);
router.get('/project/:projectId', protect, getTasksByProject);
router.post('/', protect, adminOnly, createTask);
router.get('/:id', protect, getTaskById);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, adminOnly, deleteTask);

module.exports = router;
