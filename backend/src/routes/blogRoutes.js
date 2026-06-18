const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/', (req, res) => {
  const sql = 'SELECT * FROM blogs ORDER BY created_at DESC';

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to fetch blogs',
        error: error.message
      });
    }

    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { title, content, image, status, created_by } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const sql = `
    INSERT INTO blogs (title, content, image, status, created_by)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [title, content, image || null, status || 'draft', created_by || null], (error, result) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to create blog',
        error: error.message
      });
    }

    res.status(201).json({
      message: 'Blog created successfully',
      blogId: result.insertId
    });
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM blogs WHERE id = ?';

  db.query(sql, [id], (error, result) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to delete blog',
        error: error.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({ message: 'Blog deleted successfully' });
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, image, status } = req.body;

  const sql = `
    UPDATE blogs 
    SET title = ?, content = ?, image = ?, status = ?
    WHERE id = ?
  `;

  db.query(sql, [title, content, image || null, status || 'draft', id], (error, result) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to update blog',
        error: error.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({ message: 'Blog updated successfully' });
  });
});

module.exports = router;