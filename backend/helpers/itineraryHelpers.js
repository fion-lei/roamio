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

// (You can add read, update, and delete functions similarly)
module.exports = { appendItinerary /*, readItineraries, updateItinerary, deleteItinerary */ };
