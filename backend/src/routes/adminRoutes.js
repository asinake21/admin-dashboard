const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/', (req, res) => {
  // Exclude passwords from the results
  const sql = 'SELECT id, name, email, role, created_at FROM admins ORDER BY created_at DESC';

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to fetch admins',
        error: error.message
      });
    }

    res.json(results);
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM admins WHERE id = ?';

  db.query(sql, [id], (error, result) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to delete admin',
        error: error.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ message: 'Admin deleted successfully' });
  });
});

module.exports = router;
