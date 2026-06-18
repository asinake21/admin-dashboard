const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 27786, // <-- Make sure port is included!
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false // <-- This is necessary for Aiven connections
  }
});

db.connect((error) => {
  if (error) {
    console.log('Database connection failed:', error.message);
    return;
  }

  console.log('Connected to MySQL database');
});

module.exports = db;