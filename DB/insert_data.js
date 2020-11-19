'use strict'

const fs = require('fs');
const { Pool } = require('pg');

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

const file = 'Vacancies_1.txt';

pool.query(fs.readFileSync('./toInsert/' + file).toString(), (err, res) => {
  console.log(err, res);
  pool.end();
});
