const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)';

  db.query(sql, [name, email, hashedPassword, role || 'admin'], (error, result) => {
    if (error) {
      return res.status(500).json({
        message: 'Failed to register admin',
        error: error.message
      });
    }

    res.status(201).json({
      message: 'Admin registered successfully',
      adminId: result.insertId
    });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const sql = 'SELECT * FROM admins WHERE email = ?';

  db.query(sql, [email], async (error, results) => {
    if (error) {
      return res.status(500).json({
        message: 'Login failed',
        error: error.message
      });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const admin = results[0];

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  });
});

module.exports = router;