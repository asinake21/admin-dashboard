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
  const sql = 'SELECT * FROM gallery ORDER BY created_at DESC';

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to fetch gallery items',
        error: error.message
      });
    }

    res.json(results);
  });
});

router.post('/', upload.single('imageFile'), (req, res) => {
  const { title, imageUrl, category, uploaded_by } = req.body;

  let image = null;

  if (req.file) {
    image = `http://localhost:5000/uploads/${req.file.filename}`;
  } else if (imageUrl) {
    image = imageUrl;
  }

  if (!image) {
    return res.status(400).json({
      message: 'An image file or image URL is required'
    });
  }

  const sql = `
    INSERT INTO gallery (title, image, category, uploaded_by)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [title || null, image, category || null, uploaded_by || null], (error, result) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to add gallery item',
        error: error.message
      });
    }

    res.status(201).json({
      message: 'Gallery item added successfully',
      galleryId: result.insertId,
      imageUrl: image
    });
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM gallery WHERE id = ?';

  db.query(sql, [id], (error, result) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to delete gallery item',
        error: error.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    res.json({ message: 'Gallery item deleted successfully' });
  });
});

module.exports = router;