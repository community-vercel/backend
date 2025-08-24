const express = require('express');
const issueRoutes = require('./issues');
const todoRoutes = require('./todos');

const router = express.Router();

router.use('/issues', issueRoutes);
router.use('/todos', todoRoutes);

router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'EOS API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;