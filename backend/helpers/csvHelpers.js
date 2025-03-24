const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const USERS_CSV = path.join(__dirname, '..', 'data', 'users.csv');
// Define the correct header string (without extra spaces)
const HEADER = 'id,email,password,first_name,last_name,phone_number,traveller_type';
// Define the expected order of fields
const HEADER_FIELDS = ["id", "email", "password", "first_name", "last_name", "phone_number", "traveller_type"];

// Ensure the CSV file exists with the correct header
if (!fs.existsSync(USERS_CSV)) {
  fs.writeFileSync(USERS_CSV, HEADER);
}

// Function to read users from the CSV file
const readUsers = () => {
  return new Promise((resolve, reject) => {
    const users = [];
    fs.createReadStream(USERS_CSV)
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim() // Trim any extra spaces in header names
      }))
      .on('data', (row) => users.push(row))
      .on('end', () => resolve(users))
      .on('error', reject);
  });
};

// Function to append a new user to the CSV file
const appendUser = (user) => {
  return new Promise((resolve, reject) => {
    fs.stat(USERS_CSV, (err, stats) => {
      if (err) return reject(err);
      // Build the CSV row using HEADER_FIELDS order.
      const row = HEADER_FIELDS.map(key => user[key] || "").join(",");
      const newLine = stats.size > 0 ? `\n${row}` : row;
      fs.appendFile(USERS_CSV, newLine, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

// Function to update an existing user's details based on their email
const updateUserDetails = (email, details) => {
  return new Promise((resolve, reject) => {
    readUsers().then((users) => {
      let updated = false;
      // Reorder the user's data by merging the new details (if email matches)
      const updatedUsers = users.map(user => {
        if (user.email === email) {
          updated = true;
          return { ...user, ...details };
        }
        return user;
      });
      if (!updated) {
        return reject(new Error("User not found"));
      }
      // Rebuild CSV content using the HEADER and correct order of fields.
      const lines = updatedUsers.map(user => HEADER_FIELDS.map(key => user[key] || "").join(","));
      const csvData = HEADER + "\n" + lines.join("\n");
      fs.writeFile(USERS_CSV, csvData, (err) => {
        if (err) return reject(err);
        resolve();
      });
    }).catch(reject);
  });
};

module.exports = { readUsers, appendUser, updateUserDetails };
