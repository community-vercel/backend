 
const express = require('express');
const { body } = require('express-validator');
const { issueController } = require('../controllers/issueController');

const router = express.Router();

const issueValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().isLength({ max: 2000 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('type').optional().isIn(['short', 'long']),
  body('status').optional().isIn(['open', 'resolved'])
];

const convertToTodoValidation = [
  body('assignedTo').notEmpty().withMessage('AssignedTo is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('title').optional().trim().isLength({ max: 200 }),
  body('description').optional().isLength({ max: 1000 })
];

router.get('/', issueController.getAllIssues);
router.get('/:id', issueController.getIssueById);
router.post('/', issueValidation, issueController.createIssue);
router.put('/:id', issueValidation, issueController.updateIssue);
router.delete('/:id', issueController.deleteIssue);
router.post('/:id/convert-to-todo', convertToTodoValidation, issueController.convertToTodo);
router.put('/:id/move-to-longterm', issueController.moveToLongTerm);
router.put('/:id/move-to-shortterm', issueController.moveToShortTerm);


module.exports = router;

