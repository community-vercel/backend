 
// controllers/issueController.js
const { validationResult } = require('express-validator');
const Issue = require('../models/Issue');
const ToDo = require('../models/Todo');

const issueController = {
  // GET /api/issues
  async getAllIssues(req, res) {
    try {
      const { type, status, priority, page = 1, limit = 50 } = req.query;
      const filter = {};
      
      if (type) filter.type = type;
      if (status) filter.status = status;
      if (priority) filter.priority = priority;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 }
      };

      const issues = await Issue.find(filter)
        .limit(options.limit * 1)
        .skip((options.page - 1) * options.limit)
        .sort(options.sort)
        .exec();

      const total = await Issue.countDocuments(filter);

      res.json({
        success: true,
        data: issues,
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

  // GET /api/issues/:id
  async getIssueById(req, res) {
    try {
      const issue = await Issue.findById(req.params.id);
      
      if (!issue) {
        return res.status(404).json({ success: false, message: 'Issue not found' });
      }

      res.json({ success: true, data: issue });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/issues
  async createIssue(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const issue = new Issue({
        ...req.body,
        createdBy: req.body.createdBy || 'system' // In real app, get from auth
      });

      await issue.save();
      res.status(201).json({ success: true, data: issue });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
// controllers/issueController.js


// Add to exports

  // PUT /api/issues/:id
  async updateIssue(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const issue = await Issue.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!issue) {
        return res.status(404).json({ success: false, message: 'Issue not found' });
      }

      res.json({ success: true, data: issue });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // DELETE /api/issues/:id
  async deleteIssue(req, res) {
    try {
      const issue = await Issue.findByIdAndDelete(req.params.id);
      
      if (!issue) {
        return res.status(404).json({ success: false, message: 'Issue not found' });
      }

      // Also delete related todos
      await ToDo.deleteMany({ originatingIssue: req.params.id });

      res.json({ success: true, message: 'Issue deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
async moveToShortTerm(req, res) {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { type: 'short' },
      { new: true, runValidators: true }
    );

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    res.json({ success: true, data: issue });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
},
  // POST /api/issues/:id/convert-to-todo
  async convertToTodo(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const issue = await Issue.findById(req.params.id);
      if (!issue) {
        return res.status(404).json({ success: false, message: 'Issue not found' });
      }

      const todo = new ToDo({
        title: req.body.title || issue.title,
        description: req.body.description || issue.description,
        assignedTo: req.body.assignedTo,
        assignedBy: req.body.assignedBy || 'system',
        dueDate: req.body.dueDate,
        originatingIssue: issue._id
      });

      await todo.save();

      // Mark issue as resolved
      issue.status = 'resolved';
      await issue.save();

      res.status(201).json({ success: true, data: todo });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // PUT /api/issues/:id/move-to-longterm
  async moveToLongTerm(req, res) {
    try {
      const issue = await Issue.findByIdAndUpdate(
        req.params.id,
        { type: 'long' },
        { new: true, runValidators: true }
      );

      if (!issue) {
        return res.status(404).json({ success: false, message: 'Issue not found' });
      }

      res.json({ success: true, data: issue });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};



module.exports = {issueController };