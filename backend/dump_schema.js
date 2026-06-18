const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect();

db.query('SHOW TABLES', (err, tables) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  
  const tableNames = tables.map(t => Object.values(t)[0]);
  console.log('Tables:', tableNames);
  
  let queriesCompleted = 0;
  
  tableNames.forEach(table => {
    db.query(`DESCRIBE ${table}`, (err, schema) => {
      console.log(`\nSchema for ${table}:`);
      console.log(schema);
      queriesCompleted++;
      if (queriesCompleted === tableNames.length) {
        process.exit(0);
      }
    });
  });
});
