const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/', (req, res) => {
  const sql = 'SELECT * FROM events ORDER BY event_date DESC';

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to fetch events',
        error: error.message
      });
    }

    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { title, description, location, event_date, image, created_by } = req.body;

  if (!title || !description || !event_date) {
    return res.status(400).json({
      message: 'Title, description, and event date are required'
    });
  }

  const sql = `
    INSERT INTO events (title, description, location, event_date, image, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, description, location || null, event_date, image || null, created_by || null],
    (error, result) => {
      if (error) {
        return res.status(500).json({
          message: 'Failed to create event',
          error: error.message
        });
      }

      res.status(201).json({
        message: 'Event created successfully',
        eventId: result.insertId
      });
    }
  );
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM events WHERE id = ?';

  db.query(sql, [id], (error, result) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to delete event',
        error: error.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  });
});

module.exports = router;