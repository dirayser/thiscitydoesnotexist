'use strict'

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


pool.query('SELECT street_id, name FROM public.streets', (err, res) => {
  if(err) {
    console.error(err)
  }
  else {
    const answer = res.rows;
    console.log(answer)
  }
  
  pool.end();
});


pool.query('SELECT user_id, name, surname, gender, birthday FROM public.users WHERE mode=\'Admin\'', (err, res) => {
  if(err) {
    console.error(err)
  }
  else {
    const answer = res.rows;
    console.log(answer)
  }
  
  pool.end();
});
