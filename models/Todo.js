 
const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  assignedTo: {
    type: String,
    required: true
  },
  assignedBy: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'late'],
    default: 'pending'
  },
  originatingIssue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

todoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = Date.now();
  }
  
  if (this.status === 'pending' && new Date() > this.dueDate) {
    this.status = 'late';
  }
  
  next();
});

todoSchema.index({ assignedTo: 1, status: 1 });
todoSchema.index({ assignedBy: 1, status: 1 });
todoSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('ToDo', todoSchema);