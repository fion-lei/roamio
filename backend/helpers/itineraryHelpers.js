const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const itineraryCSV = path.join(__dirname, '..', 'data', 'itineraries.csv');
const ITINERARY_HEADER = 'itinerary_id,user_email,trip_title,trip_description,start_date,end_date,destinations,shared_with';

// Ensure file exists
if (!fs.existsSync(itineraryCSV)) {
  fs.writeFileSync(itineraryCSV, ITINERARY_HEADER);
}

// Escape CSV-safe values (especially strings with commas, quotes, or newlines)
const escapeCSV = (value) => {
  if (typeof value !== 'string') value = String(value);
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const appendItinerary = (itinerary) => {
  return new Promise((resolve, reject) => {
    fs.stat(itineraryCSV, (err, stats) => {
      if (err) return reject(err);
      // If you later decide to include shared_with here, it will be escaped too.
      const fields = ITINERARY_HEADER.split(',');
      const row = fields.map(field => escapeCSV(itinerary[field.trim()] || "")).join(",");
      const newLine = stats.size > 0 ? `\n${row}` : row;
      fs.appendFile(itineraryCSV, newLine, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

const readItineraries = () => {
  return new Promise((resolve, reject) => {
    const itineraries = [];
    fs.createReadStream(itineraryCSV)
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim()
      }))
      .on('data', (row) => itineraries.push(row))
      .on('end', () => resolve(itineraries))
      .on('error', (err) => reject(err));
  });
};

const updateItinerary = (itinerary_id, updates) => {
  return new Promise(async (resolve, reject) => {
    try {
      const itineraries = await readItineraries();
      let found = false;
      const updatedItineraries = itineraries.map((itinerary) => {
        if (itinerary.itinerary_id === itinerary_id) {
          found = true;
          return { ...itinerary, ...updates };
        }
        return itinerary;
      });
      if (!found) {
        return reject(new Error("Itinerary not found"));
      }
      const headerFields = ITINERARY_HEADER.split(',');
      const lines = updatedItineraries.map(it => {
        return headerFields.map(field => escapeCSV(it[field.trim()] || "")).join(',');
      });
      const newCSV = ITINERARY_HEADER + "\n" + lines.join("\n");
      fs.writeFile(itineraryCSV, newCSV, (err) => {
        if (err) return reject(err);
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteItinerary = (itinerary_id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const itineraries = await readItineraries();
      const filteredItineraries = itineraries.filter(it => it.itinerary_id !== itinerary_id);
      if (filteredItineraries.length === itineraries.length) {
        return reject(new Error("Itinerary not found"));
      }
      const headerFields = ITINERARY_HEADER.split(',');
      const lines = filteredItineraries.map(it => {
        return headerFields.map(field => escapeCSV(it[field.trim()] || "")).join(',');
      });
      const newCSV = ITINERARY_HEADER + "\n" + lines.join("\n");
      fs.writeFile(itineraryCSV, newCSV, (err) => {
        if (err) return reject(err);
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateSharedWith = async (itinerary_id, friend_email, access_type,friend_name,owner_name) => {
  console.log('updateSharedWith called with:', { itinerary_id, friend_email, access_type,owner_name });
  try {
    // Read all itineraries using your existing helper.
    const itineraries = await readItineraries();
    console.log('Fetched itineraries:', itineraries);

    // Find the itinerary to update.
    const itinerary = itineraries.find(it => it.itinerary_id === itinerary_id);
    if (!itinerary) {
      console.error('Itinerary not found:', itinerary_id);
      throw { status: 404, message: 'Itinerary not found' };
    }
    console.log('Found itinerary:', itinerary);

    // Parse the current shared_with field.
    let sharedWith = [];
    if (itinerary.shared_with && itinerary.shared_with.trim() !== '') {
      try {
        sharedWith = JSON.parse(itinerary.shared_with);
        console.log('Parsed existing shared_with:', sharedWith);
      } catch (parseErr) {
        console.error('Error parsing shared_with JSON:', parseErr);
        sharedWith = [];
      }
    } else {
      console.log('No existing shared_with data found, initializing empty array.');
    }

    // Check if the friend is already added.
    if (sharedWith.some(item => item.email === friend_email)) {
      console.error('Friend already added:', friend_email);
      throw { status: 400, message: 'Friend already added' };
    }

    // Add the new friend.
    sharedWith.push({ email: friend_email, access: access_type,friend_name:friend_name,owner_name:owner_name});
    console.log('Updated shared_with array:', sharedWith);

    // Use JSON.stringify to create the JSON string, and then rely on updateItinerary to escape it
    await updateItinerary(itinerary_id, { shared_with: JSON.stringify(sharedWith) });
    console.log('Itinerary updated successfully.');
    return { message: 'Itinerary shared successfully' };
  } catch (error) {
    console.error('Error in updateSharedWith:', error);
    throw error;
  }
};

module.exports = { appendItinerary, readItineraries, updateItinerary, deleteItinerary, updateSharedWith };
