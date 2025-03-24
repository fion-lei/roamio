const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const USERS_CSV = path.join(__dirname, '..', 'data', 'users.csv');

// Read users from CSV
const readUsers = () => {
  return new Promise((resolve, reject) => {
    const users = [];
    fs.createReadStream(USERS_CSV)
      .pipe(csv())
      .on('data', (row) => users.push(row))
      .on('end', () => resolve(users))
      .on('error', reject);
  });
};

// Append a new user to the CSV
const appendUser = (user) => {
  return new Promise((resolve, reject) => {
    // Format the new CSV line (ensure the order matches your CSV headers)
    const newLine = `\n${user.id},${user.name},${user.email},${user.password}`;
    fs.appendFile(USERS_CSV, newLine, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

module.exports = { readUsers, appendUser };
