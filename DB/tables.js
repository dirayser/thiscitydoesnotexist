'use strict'

const tables = {
  'Public.Streets': {
    street_id: 'int',
    name: 'varchar',
    'PRIMARY KEY': '(street_id)'
  },
  'Public.Buildings': {
    building_id: 'int',
    street_id: 'int',
    number: 'int',
    type: 'varchar',
    'PRIMARY KEY': '(building_id)'
  },
  'Public.Institutions': {
    institution_id: 'int',
    name: 'varchar',
    specialization: 'varchar',
    description: 'varchar',
    building_id: 'int',
    'PRIMARY KEY': '(institution_id)'
  },
  'Public.Users': {
    user_id: 'int',
    name: 'varchar',
    surname: 'varchar',
    age: 'int',
    gender: 'varchar',
    mode: 'varchar',
    birthday: 'date',
    building_id: 'int',
    institution_id: 'int',
    education: 'varchar',
    email: 'varchar',
    password: 'varchar',
    'PRIMARY KEY': '(user_id)'
  },
  'Public.Vacancies': {
    vacancy_id: 'int',
    institution_id: 'int',
    gender: 'varchar',
    education: 'varchar',
    age: 'int',
    'PRIMARY KEY': '(vacancy_id)'
  },
  'Public.Applications': {
    application_id: 'int',
    user_id: 'int',
    vacancy_id: 'int',
    'PRIMARY KEY': '(application_id)'
  }
}

module.exports = tables;