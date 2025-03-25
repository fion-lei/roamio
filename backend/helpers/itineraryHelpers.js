const fs = require('fs');
const path = require('path');
const itineraryCSV = path.join(__dirname, '..', 'data', 'itineraries.csv');
const ITINERARY_HEADER = 'itinerary_id,user_email,trip_title,trip_description,start_date,end_date,destinations';

// Ensure file exists
if (!fs.existsSync(itineraryCSV)) {
  fs.writeFileSync(itineraryCSV, ITINERARY_HEADER);
}

const appendItinerary = (itinerary) => {
  return new Promise((resolve, reject) => {
    fs.stat(itineraryCSV, (err, stats) => {
      if (err) return reject(err);
      const newLine = stats.size > 0
        ? `\n${itinerary.itinerary_id},${itinerary.user_email},${itinerary.trip_title},${itinerary.trip_description},${itinerary.start_date},${itinerary.end_date},${itinerary.destinations}`
        : `${itinerary.itinerary_id},${itinerary.user_email},${itinerary.trip_title},${itinerary.trip_description},${itinerary.start_date},${itinerary.end_date},${itinerary.destinations}`;
      fs.appendFile(itineraryCSV, newLine, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

const readItineraries = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(itineraryCSV, 'utf8', (err, data) => {
      if (err) return reject(err);
      const lines = data.trim().split('\n');
      if (lines.length < 2) {
        // Only header exists
        return resolve([]);
      }
      const header = lines[0].split(',');
      const itineraries = lines.slice(1).map(line => {
        const values = line.split(',');
        let itinerary = {};
        header.forEach((key, index) => {
          itinerary[key.trim()] = values[index] ? values[index].trim() : "";
        });
        return itinerary;
      });
      resolve(itineraries);
    });
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
        return headerFields.map(field => it[field.trim()] || "").join(',');
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
        return headerFields.map(field => it[field.trim()] || "").join(',');
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

module.exports = { appendItinerary, readItineraries, updateItinerary, deleteItinerary };
