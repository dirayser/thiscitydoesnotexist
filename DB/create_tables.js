'use strict';

const { Pool } = require('pg');
const tables = require('./tables.js');

process.on('unhandledRejection', error => {
  pool.end();
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const pool = new Pool({
  user: 'pqlxmrkjegmhme',
  host: 'ec2-34-246-141-162.eu-west-1.compute.amazonaws.com',
  database: 'd8prkt2gob7i6r',
  password: '18172bd6fa3ff4dec753f81ea8a603f61becffa66c959673dd1dadce42f6a78a',
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
