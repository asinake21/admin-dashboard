const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/stats', (req, res) => {
  const queries = {
    blogs: 'SELECT COUNT(*) AS count FROM blogs',
    events: 'SELECT COUNT(*) AS count FROM events',
    messages: 'SELECT COUNT(*) AS count FROM contacts',
    resources: 'SELECT COUNT(*) AS count FROM resources'
  };

  const results = {};
  let completed = 0;
  const keys = Object.keys(queries);
  let hasError = false;

  keys.forEach(key => {
    db.query(queries[key], (error, data) => {
      if (hasError) return;

      if (error) {
        hasError = true;
        return res.status(500).json({
          message: 'Failed to fetch dashboard stats',
          error: error.message
        });
      }

      results[key] = data[0].count;
      completed++;

      if (completed === keys.length) {
        res.json(results);
      }
    });
  });
});

module.exports = router;
