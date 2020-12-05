'use strict'

const express = require("express");
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

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

const cache = {};

app.get("/users/all", function (request, response) {
  if(cache.users) {
    console.log('from cache');
    console.log(cache.users)
    response.sendStatus(200);
  }
  else {
    pool.query(`SELECT user_id, name, surname FROM public.users`, (err, res) => {
      if(err) console.log(err);
      else {
        cache.users = res.rows;
        console.log(cache.users)
        response.sendStatus(200);
      }
    });
  }
});

app.get("/users/where/:condsStr", function (request, response) {
  const { condsStr } = request.params;
  const conditions = condsStr.split(',');
  const regExps = [
    /^name='[а-яА-ЯёЁ]+'$/, 
    /^surname='[а-яА-ЯёЁ]+'$/,
    /^inst_id=\d+$/
  ]
  console.log(conditions)
  let isValid = true;

  for(const cond of conditions) {
    let flag = false;
    for(const regExp of regExps) {
      if(cond.match(regExp)) flag = true;
    }
    if(!flag) {
      isValid = false;
      break;
    }
  }

  if(isValid) {
    pool.query(`SELECT name, surname, institution_id FROM public.users WHERE ${conditions.join(' and ')}`, (err, res) => {
      if(err) console.log(err);
      else {
        const answer = res.rows;
        response.status(200).json(answer);
      }
    });
  }
});

app.get("/vacancies/:user_id,:user_pswd,:inst_id", function(request, response) {
  const { user_id, user_pswd, inst_id } = request.params;
  pool.query(`SELECT user_id, name, surname, password FROM public.users WHERE user_id=${user_id} and password='${user_pswd}'`, (err, res) => {
    if(err) console.log(err);
    else {
      const user = res.rows[0];
      if(user) { // authorize
        pool.query(`SELECT vacancy_id, institution_id, gender, education, age FROM public.vacancies WHERE institution_id=${inst_id}`, (errV, resV) => {
          if(errV) console.log(errV);
          else {
            const answerVac = resV.rows;
            response.status(200).json(answerVac);
          }
        });
      }
      else { // authorization failed
        response.send('Authorization failed');
      }
    }
  });
})

app.put('/user/:admin_id,:admin_pswd,:user_id', (request, result) => {
  const toChange = Object.entries(request.body);
  for(const field of toChange) {
    if(field[0].slice(-2) !== 'id') {
      field[1] = `'${field[1]}'`
    }
  }
  const toInsert = (toChange.map(pair => pair.join(' = '))).join(',');
  
  const { admin_id, admin_pswd, user_id } = request.params;
  pool.query(`SELECT user_id, name, surname, password FROM public.users WHERE user_id=${admin_id} and password='${admin_pswd}' and mode='Admin'`, (err, res) => {
    if(err) console.log(err);
    else {
      const admin = res.rows[0];
      if(admin) { // authorize
        const query = `
        UPDATE public.users
        SET 
        ${toInsert}
        WHERE
        user_id = ${user_id};
        `;
        console.log(query);
        pool.query(query, (errPut, resPut) => {
          if(errPut) console.log(errPut);
          else {
            console.log(resPut);
          }
        });
        result.sendStatus(200);
      }
      else { // Permission denied
        result.send('Permission denied');
      }
    }
  });

})

app.post('/user/:admin_id,:admin_pswd', (request, result) => {
  let toAdd = Object.entries(request.body);
  for(const field of toAdd) {
    if(field[0].slice(-2) !== 'id') {
      field[1] = `'${field[1]}'`
    }
  }
  toAdd = Object.fromEntries(toAdd);
  
  const { admin_id, admin_pswd } = request.params;
  pool.query(`SELECT user_id, name, surname, password FROM public.users WHERE user_id=${admin_id} and password='${admin_pswd}' and mode='Admin'`, (err, res) => {
    if(err) console.log(err);
    else {
      const admin = res.rows[0];
      if(admin) { // authorize
        pool.query(`SELECT user_id FROM public.users`, (err, res) => {
          if(err) console.log(err);
          else {
            const newID = `10${res.rows.length + 1}`;
            const query = `INSERT INTO Users VALUES (
              ${newID}, ${toAdd.name}, ${toAdd.surname}, ${toAdd.age}, ${toAdd.gender},
              ${toAdd.mode}, ${toAdd.birthday}, ${toAdd.building_id}, ${toAdd.institution_id},
              ${toAdd.education}, ${toAdd.email}, ${toAdd.password}
            )`;
            console.log(query);
            pool.query(query, (errPut, resPut) => {
              if(errPut) console.log(errPut);
              else {
                console.log(resPut);
              }
            });
            result.sendStatus(200);
          }
        });
      }
      else { // Permission denied
        result.send('Permission denied');
      }
    }
  });

})

app.listen(process.env.PORT || 3000);