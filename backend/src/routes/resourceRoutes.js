const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', (req, res) => {
  const sql = 'SELECT * FROM resources ORDER BY created_at DESC';

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to fetch resources',
        error: error.message
      });
    }

    res.json(results);
  });
});

router.post('/', upload.single('resourceFile'), (req, res) => {
  const { title, description, type, uploaded_by } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'A file is required' });
  }

  const file = `http://localhost:5000/uploads/${req.file.filename}`;

  const sql = `
    INSERT INTO resources (title, description, file, type, uploaded_by)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [title, description || null, file, type || 'Document', uploaded_by || null], (error, result) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to create resource',
        error: error.message
      });
    }

    res.status(201).json({
      message: 'Resource created successfully',
      resourceId: result.insertId,
      fileUrl: file
    });
  });
});

router.put('/:id', upload.single('resourceFile'), (req, res) => {
  const { id } = req.params;
  const { title, description, type } = req.body;

  // If a new file was uploaded, use it; otherwise keep existing file
  if (req.file) {
    const file = `http://localhost:5000/uploads/${req.file.filename}`;

    const sql = `
      UPDATE resources 
      SET title = ?, description = ?, file = ?, type = ?
      WHERE id = ?
    `;

    db.query(sql, [title, description || null, file, type || 'Document', id], (error, result) => {
      if (error) {
        return res.status(500).json({
          message: 'Failed to update resource',
          error: error.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      res.json({ message: 'Resource updated successfully', fileUrl: file });
    });
  } else {
    // Update without changing the file
    const sql = `
      UPDATE resources 
      SET title = ?, description = ?, type = ?
      WHERE id = ?
    `;

    db.query(sql, [title, description || null, type || 'Document', id], (error, result) => {
      if (error) {
        return res.status(500).json({
          message: 'Failed to update resource',
          error: error.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      res.json({ message: 'Resource updated successfully' });
    });
  }
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM resources WHERE id = ?';

  db.query(sql, [id], (error, result) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to delete resource',
        error: error.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json({ message: 'Resource deleted successfully' });
  });
});

module.exports = router;
