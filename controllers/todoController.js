// controllers/todoController.js
const { validationResult } = require('express-validator');
const Issue = require('../models/Issue');
const ToDo = require('../models/Todo');

const todoController = {
  // GET /api/todos
  async getAllTodos(req, res) {
    try {
      const { assignedTo, assignedBy, status, page = 1, limit = 50 } = req.query;
      const filter = {};
      
      if (assignedTo) filter.assignedTo = assignedTo;
      if (assignedBy) filter.assignedBy = assignedBy;
      if (status) filter.status = status;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { dueDate: 1, createdAt: -1 }
      };

      const todos = await ToDo.find(filter)
        .populate('originatingIssue', 'title type priority')
        .limit(options.limit * 1)
        .skip((options.page - 1) * options.limit)
        .sort(options.sort)
        .exec();

      const total = await ToDo.countDocuments(filter);

      res.json({
        success: true,
        data: todos,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/todos/:id
  async getTodoById(req, res) {
    try {
      const todo = await ToDo.findById(req.params.id)
        .populate('originatingIssue', 'title description type priority');
      
      if (!todo) {
        return res.status(404).json({ success: false, message: 'ToDo not found' });
      }

      res.json({ success: true, data: todo });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/todos
  async createTodo(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const todo = new ToDo({
        ...req.body,
        assignedBy: req.body.assignedBy || 'system'
      });

      await todo.save();
      await todo.populate('originatingIssue', 'title type priority');
      
      res.status(201).json({ success: true, data: todo });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // PUT /api/todos/:id
  async updateTodo(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const todo = await ToDo.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('originatingIssue', 'title type priority');

      if (!todo) {
        return res.status(404).json({ success: false, message: 'ToDo not found' });
      }

      res.json({ success: true, data: todo });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // DELETE /api/todos/:id
  async deleteTodo(req, res) {
    try {
      const todo = await ToDo.findByIdAndDelete(req.params.id);
      
      if (!todo) {
        return res.status(404).json({ success: false, message: 'ToDo not found' });
      }

      res.json({ success: true, message: 'ToDo deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // PUT /api/todos/:id/complete
  async completeTodo(req, res) {
    try {
      const todo = await ToDo.findByIdAndUpdate(
        req.params.id,
        { status: 'completed', completedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('originatingIssue', 'title type priority');

      if (!todo) {
        return res.status(404).json({ success: false, message: 'ToDo not found' });
      }

      res.json({ success: true, data: todo });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};
module.exports = { todoController };