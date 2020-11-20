'use strict';

const { Pool } = require('pg');
const tables = require('./tables.js');

process.on('unhandledRejection', error => {
  pool.end();
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const pool = new Pool({
  user: process.env.db_user,
  host: process.env.db_host,
  database: process.env.db_name,
  password: process.env.db_pswd,
  port: 5432,
  ssl: true
});

for(const table in tables) { // add tables
  let query = `CREATE TABLE IF NOT EXISTS ${table} `;
  query += '(';
  for(const field in tables[table]) { // add field and data type
    query += ` ${field} ${tables[table][field]}`;
    if(field !== 'PRIMARY KEY') query += ',';
  }
  query += ')';

  pool.query(query, (err, res) => { // send query
    console.log(err, res);
    pool.end();
  })
}
