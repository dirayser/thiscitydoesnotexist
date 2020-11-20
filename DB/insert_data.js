'use strict'

const fs = require('fs');
const { Pool } = require('pg');

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

const file = 'Vacancies_1.txt';

pool.query(fs.readFileSync('./toInsert/' + file).toString(), (err, res) => {
  console.log(err, res);
  pool.end();
});
