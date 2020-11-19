'use strict';

const fs = require('fs');
const data = require('./generation/generate.js');
const tables = require('./tables.js');

const result = {};

for(const key in data) { // generate  SQL insert commands
  let query = `INSERT INTO ${key} VALUES `;
  result[query] = [];
  const currTable = 'Public.' + key;
  let counter = 0;
  for(const field in data[key]) { // for each row
    counter++;
    const currArrIndex = Math.trunc(counter/600000); // splitting data by 100k rows
    result[query][currArrIndex] = result[query][currArrIndex] || []; // create new rows array if needed
    const currArr = result[query][currArrIndex];
    const newData = [];
    for(const table in tables[currTable]) { // add VALUES to insert
      if(table !== 'PRIMARY KEY') {
        if(tables[currTable][table] !== 'int')
          newData.push(`'${data[key][field][table]}'  `);
        else 
          newData.push(data[key][field][table]);
      }
    }
    currArr.push(newData);
  }

}

for(const table in result){ // write data to files
  let counter = 1;
  result[table].forEach(nArrays => {
    let output = table; // command name
    nArrays.forEach(rowArray => {
      rowArray = ' (' + rowArray.join(', ') + '),\n'; // value
      output += rowArray;
    });
    output = output.slice(0, -2); // delete last coma
    const fileName = table.split(' ')[2] + '_' + counter; // create file name
    console.log(fileName);
    fs.writeFileSync(`./toInsert/${fileName}.sql`, output, (err, data) => { // write to files
      if(err) console.log(err);
    });
    counter++;
  })

}
