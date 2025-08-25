const express = require('express');
const { body } = require('express-validator');
const { todoController } = require('../controllers/todoController');

const router = express.Router();

const todoValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().isLength({ max: 1000 }),
  body('assignedTo').notEmpty().withMessage('AssignedTo is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('originatingIssue').isMongoId().withMessage('Valid originating issue ID is required'),
  body('status').optional().isIn(['pending', 'completed', 'late'])
];

const updateTodoValidation = [
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().isLength({ max: 1000 }),
  body('assignedTo').optional().notEmpty(),
  body('dueDate').optional().isISO8601(),
  body('status').optional().isIn(['pending', 'completed', 'late'])
];

router.get('/', todoController.getAllTodos);
router.get('/:id', todoController.getTodoById);
router.post('/', todoValidation, todoController.createTodo);
router.put('/:id', updateTodoValidation, todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);
router.put('/:id/complete', todoController.completeTodo);

module.exports = router;
