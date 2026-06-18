const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/', (req, res) => {
  const sql = 'SELECT * FROM contacts ORDER BY created_at DESC';

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to fetch contacts',
        error: error.message
      });
    }

    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      message: 'Name, email, and message are required'
    });
  }

  const sql = `
    INSERT INTO contacts (name, email, subject, message)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, email, subject || null, message], (error, result) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to create contact message',
        error: error.message
      });
    }

    res.status(201).json({
      message: 'Contact message created successfully',
      contactId: result.insertId
    });
  });
});

router.patch('/:id/read', (req, res) => {
  const { id } = req.params;

  const sql = "UPDATE contacts SET status = 'read' WHERE id = ?";

  db.query(sql, [id], (error, result) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to update contact status',
        error: error.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    res.json({ message: 'Contact marked as read' });
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM contacts WHERE id = ?';

  db.query(sql, [id], (error, result) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to delete contact message',
        error: error.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    res.json({ message: 'Contact message deleted successfully' });
  });
});

module.exports = router;