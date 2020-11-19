'use strict'

const fs = require('fs');
let { N, agePercentage, START_ID } = require('./constants')

const genStartCount = group => {
  return Math.round(random(group.min, group.max, 0) / 100 * N); // generates start amount of people
}

//generate start amount of people by age
const middleMaleCount = genStartCount(agePercentage.mid);
const middleFemaleCount = genStartCount(agePercentage.mid);
const lowAgeCount = genStartCount(agePercentage.low);
const highAgeCount = genStartCount(agePercentage.high);
N = middleMaleCount + middleFemaleCount + lowAgeCount + highAgeCount; 

const getNames = (fileLinkMale, fileLinkFemale) => { // get names from file
  const maleNamesFile = fs.readFileSync(fileLinkMale, 'utf8');
  const femaleNamesFile = fs.readFileSync(fileLinkFemale, 'utf8');
  const regexp = /[а-яА-ЯёЁ]{2,}/g;
  const maleNames = maleNamesFile.match(regexp);
  const femaleNames = femaleNamesFile.match(regexp);
  const namesObject = {
      male: maleNames,
      female: femaleNames,
  };
  return namesObject;
};

const getSurnames = fileLink => { // get surnames from file
  const maleSurnamesFile = fs.readFileSync(fileLink, 'utf8');
  const regexp = /[а-яА-ЯёЁ]{2,}/g;
  const maleSurnames = maleSurnamesFile.match(regexp);
  const femaleSurnames = maleSurnames.map(x => x + 'a');
  const surnamesObject = {
      male: maleSurnames,
      female: femaleSurnames,
  };
  return surnamesObject;
};

const getStreets = fileLink => { // get streets from file
  let content = fs.readFileSync(fileLink).toString();
  content = content.split(/[0-9]. /);
  content.shift();
  for (let i = 0; i < content.length; i++) {
    const begin = content[i].search(/[0-9]|[А-Я]/);
    const end = content[i].indexOf('\n') - 1;
    content[i] = content[i].slice(begin, end);
  }
  return content;
};

const getCompanies = fileLink => { // get companies from file
  let allCompanies = fs.readFileSync(fileLink).toString();
  allCompanies = allCompanies.split('\n');
  for (let i = 0; i < allCompanies.length; i++) {
    allCompanies[i] = allCompanies[i].trim();
  }
  return allCompanies;
}

function makeRandomArr() { // for random array sorting
  return Math.random() - 0.5;
}

const data = { // fill data from files
  names: getNames('./generation/textFiles/M_NAMES.txt', './generation/textFiles/F_NAMES.txt'),
  surnames: getSurnames('./generation/textFiles/SURNAMES.txt'),
  streets: (getStreets('./generation/textFiles/STREETS.txt')).sort(makeRandomArr),
  companies: getCompanies('./generation/textFiles/COMPANIES.txt')
}

const idGenerator = type => { // returns new id generator
  let currentID = 1;
  return () => +([START_ID[type], currentID++].join(''));
}

const userIdGenerator = idGenerator('user');
const buildingIdGenerator = idGenerator('building');
const streetIdGenerator = idGenerator('street');
const institutionIdGenerator = idGenerator('institution');
const vacancyIdGenerator = idGenerator('vacancy');
const applicationIdGenerator = idGenerator('application');

function random(min, max, rounded = true) { // returns random number in a range
  const answer = min + Math.random() * (max - min + 1);
  return !rounded ? answer : Math.floor(answer);
}

function normal(mu = 32, nsamples = 1){ // normal random for age
  let run_total = 0;
  const sigma = mu / 3;
  for(let i = 0 ; i < nsamples ; i++){
     run_total += Math.random()
  }

  return Math.round(sigma*(run_total - nsamples / 2)/(nsamples / 2) + mu);
}

function createBuildingsForStreet(street) {

  const buildings = {};

  for(let i = 1; i <= street.buildsAmount; i++) {

    const places = random(50, 130);
    const building_id = buildingIdGenerator();

    buildings[building_id] = {
      building_id,
      street_id : street.street_id,
      number : i,
      type: 'Residental',
      places,
    }

  }
  return buildings;
}

function checkPlaces(streetsObj) {
  let sum = 0;

  for(let street in streetsObj) {
    const currBuildings = streetsObj[street].buildings;
    for(let building in currBuildings) {
      sum += currBuildings[building].places; // all buildings places amount
    }
  }
  return sum < N * 1.1;
}

function generateBirthday(age) {
  const now = new Date();
  const [currYear, currMonth, currDay] = [now.getFullYear(), now.getUTCMonth() + 1, now.getUTCDate()];
  const birthMonth = random(1, 12);
  const birthDay = random(1, 27);
  let birthYear = currYear - age - 1;
  if(birthMonth < currMonth || (birthMonth === currMonth && birthDay < currDay)) {
    birthYear++;
  }
  const newBirth = new Date(`${birthYear}-${birthMonth}-${birthDay + 1}`);
  return newBirth;
}

function generateEmail(name, surname, year) {
  return `${name}.${surname}.${year}@thiscity.com`
}

function generatePassword(name, surname, year) {
  return `${random(1000, 9999)}${name}${surname}${year}`
}

function identifyUsers(usersObj) {
  for(let user in usersObj) {
    const thisUser = usersObj[user];
    thisUser.birthday = generateBirthday(thisUser.age)
    thisUser.email = generateEmail(thisUser.name, thisUser.surname, thisUser.birthday.getFullYear());
    thisUser.password = generatePassword(thisUser.name, thisUser.surname, thisUser.birthday.getFullYear())
    thisUser.birthday = `${thisUser.birthday.getFullYear()}-${thisUser.birthday.getUTCMonth() + 1}-${thisUser.birthday.getUTCDate()}`
  }
}

function generateName(gender) {
  const names = data.names[gender];
  const randomInt = random(0, names.length - 1);
  return names[randomInt];
}

function generateSurname(gender) {
  const surnames = data.surnames[gender];
  const randomInt = random(0, surnames.length - 1);
  return surnames[randomInt];
}

function createUsers(institObj) {
  const usersObj = {};
  const institution_ids = Object.keys(institObj);
  for(let i = 0; i < middleMaleCount; i++) { // add middleAge male user
    const newUserId = userIdGenerator();
    usersObj[newUserId] = {
      user_id: newUserId,
      name: generateName('male'),
      surname: generateSurname('male'),
      age: normal(),
      gender: 'male',
      mode: 'User',
      education: Math.random() < 0.95 ? 'Higher' : 'Middle',
      institution_id: +institution_ids[random(0, institution_ids.length - 1)]
    }
  }

  for(let i = 0; i < middleFemaleCount; i++) { //add middleAge female users
    const newUserId = userIdGenerator();
    usersObj[newUserId] = {
      user_id: newUserId,
      name: generateName('female'),
      surname: generateSurname('female'),
      age: normal(),
      gender: 'female',
      mode: 'User',
      education: Math.random() < 0.95 ? 'Higher' : 'Middle',
      institution_id: +institution_ids[random(0, institution_ids.length - 1)]
    }
  }

  for(let i = 0; i < lowAgeCount; i++) { // add low age users
    const gender =  Math.random() > 0.5 ? 'female' : 'male';
    const newUserId = userIdGenerator();
    usersObj[newUserId] = {
      user_id: newUserId,
      name: generateName(gender),
      surname: generateSurname(gender),
      age: random(0, 18),
      gender,
      mode: 'User',
      education: 'Lower',
      institution_id: -1
    }
  }

  for(let i = 0; i < highAgeCount; i++) { // add high age students
    const gender =  Math.random() > 0.5 ? 'female' : 'male';
    const newUserId = userIdGenerator();
    usersObj[newUserId] = {
      user_id: newUserId,
      name: generateName(gender),
      surname: generateSurname(gender),
      age: random(45, 90),
      gender,
      mode: 'User',
      education:  Math.random() < 0.95 ? 'Higher' : 'Middle',
      institution_id: +institution_ids[random(0, institution_ids.length - 1)]
    }
  }

  identifyUsers(usersObj);

  return usersObj;
}

function createStreets() {
  const streetsObj = {};
  const streetsIt = data.streets[Symbol.iterator]();
  while(checkPlaces(streetsObj)) {
    const newStreet = {};
    newStreet.street_id = streetIdGenerator();
    newStreet.buildsAmount = random(25, 100); // generates random buildings amount for the new street
    newStreet.name = streetsIt.next().value;
    newStreet.buildings = createBuildingsForStreet(newStreet);
    streetsObj[newStreet.street_id] = newStreet;
  }

  return streetsObj;
}

function getBuildings(streetsObj) {
  let buildings = {};

  for(let street in streetsObj) {
    buildings = {...buildings, ...streetsObj[street].buildings}
  }

  return buildings;
}

function distributeBuilds(usersObj, buildingsObj) {
  let placesArray = [];
  for(let curr in buildingsObj) {
    const build = buildingsObj[curr]; 
    for(let i = 0; i < build.places; i++) {
      placesArray.push(build.building_id)
    }
  }
  placesArray.sort(makeRandomArr);
  const buildIt = placesArray[Symbol.iterator]();
  for(let curr in usersObj) {
    usersObj[curr].building_id = buildIt.next().value;
  }
}

function createInstitutions(streetsObj) {
  const institutions = {};
  for(const companyName of data.companies) {
    const institution_id = institutionIdGenerator();
    const name = companyName;
    const specialization = 'Institution';
    const description = 'Institution in This City';

    const streetsAmount = Object.keys(streetsObj).length;
    const randomStreet = streetsObj[`20${random(1, streetsAmount)}`];
    const building_id = buildingIdGenerator();
    randomStreet.buildsAmount++;
    randomStreet.buildings[building_id] = {
      building_id,
      street_id: randomStreet.street_id,
      number: randomStreet.buildsAmount,
      type: 'Institution'
    };

    institutions[institution_id] = {
      institution_id,
      name,
      specialization,
      description,
      building_id
    }
  }
  return institutions;
}

function createVacancies(institsObj) {
  const vacancies = {};
  const institution_ids = Object.keys(institsObj);

  const vacancyAmount = random(500, 1000);
  for(let i = 0; i < vacancyAmount; i++) {
    const vacancy_id = vacancyIdGenerator();
    const institution_id = +institution_ids[random(0, institution_ids.length - 1)];
    const gender = Math.random() < 0.5 ? 'Any' : (Math.random() < 0.5 ? 'male' : 'female');
    const education = Math.random() < 0.5 ? 'Higher' : 'Middle';
    const age = random(18, 50);

    vacancies[vacancy_id] = {
      vacancy_id,
      institution_id,
      gender,
      education,
      age
    }
  }

  return vacancies;
}

function createApplications(vacancObj, usersObj) {
  const applications = {};

  const vacanciesIds = Object.keys(vacancObj);
  const usersIds = Object.keys(usersObj);
  for(const vacancy of vacanciesIds) {
    const amount = random(0, 10);
    for(let i = 0; i < amount; i++) {
      const application_id = applicationIdGenerator();
      const user_id = +usersIds[random(0, usersIds.length - 1)];
      applications[application_id] = {
        application_id,
        user_id,
        vacancy_id: +vacancy
      }
    }
  }

  return applications;
}

function createAdmins(usersObj) {
  const user_ids = Object.keys(usersObj);

  for(let i = 0; i < 5; i++) {
    const randomUser = usersObj[user_ids[random(0, user_ids.length - 1)]];
    if(randomUser.age > 18) randomUser.mode = 'Admin';
  }
}

const streets = createStreets();
const institutions = createInstitutions(streets);
const buildings = getBuildings(streets);
const users = createUsers(institutions);
createAdmins(users);
const vacancies = createVacancies(institutions);
const applications = createApplications(vacancies, users);

distributeBuilds(users, buildings);

module.exports = {
  'Streets': streets,
  'Institutions': institutions,
  'Buildings': buildings,
  'Users': users,
  'Vacancies': vacancies,
  'Applications': applications
}