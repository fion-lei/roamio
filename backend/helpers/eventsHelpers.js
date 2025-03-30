const fs = require('fs');
const path = require('path');

const eventsCSV = path.join(__dirname, '..', 'data', 'events.csv');
const EVENTS_HEADER = 'event_id,itinerary_id,title,description,address,contact,hours,price,rating,rating_count,tags,image_path,start_date,start_time,end_date,end_time';

// Ensure the CSV file exists with the correct header
if (!fs.existsSync(eventsCSV)) {
  fs.writeFileSync(eventsCSV, EVENTS_HEADER);
}

// Reads events from events.csv and converts to objects 
const readEvents = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(eventsCSV, 'utf8', (err, data) => {
      if (err) return reject(err);
      const lines = data.trim().split('\n');
      if (lines.length < 2) {
        // Only header exists
        return resolve([]);
      }
      const header = lines[0].split(',');
      const events = lines.slice(1).map(line => {
        const values = line.split(',');
        let event = {};
        header.forEach((key, index) => {
          event[key.trim()] = values[index] ? values[index].trim() : "";
        });
        return event;
      });
      resolve(events);
    });
  });
};

// Appends an event to events.csv 
const appendEvent = (event) => {
  return new Promise((resolve, reject) => {
    fs.stat(eventsCSV, (err, stats) => {
      if (err) return reject(err);
      const newLine = stats.size > 0
        ? `\n${event.event_id},${event.itinerary_id},${event.title},${event.description},${event.address},${event.contact},${event.hours},${event.price},${event.rating},${event.rating_count},${event.tags || ""},${event.image_path},${event.start_date},${event.start_time},${event.end_date},${event.end_time},`
        : `${event.event_id},${event.itinerary_id},${event.title},${event.description},${event.address},${event.contact},${event.hours},${event.price},${event.rating},${event.rating_count},${event.tags || ""},${event.image_path},${event.start_date},${event.start_time},${event.end_date},${event.end_time},`;
      fs.appendFile(eventsCSV, newLine, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

// Gets events by itinerary id for viewing 
const getEvents = (itineraryId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const events = await readEvents();
      const itineraryIdStr = String(itineraryId);
      const filteredEvents = events.filter(event => String(event.itinerary_id) === itineraryIdStr);
      resolve(filteredEvents);
    } catch (error) {
      reject(error);
    }
  });
};

// Counts events per itinerary 
const countEvents = async () => {
  try {
    const events = await readEvents();
    const counts = {};
    
    events.forEach(event => {
      const itineraryId = String(event.itinerary_id);
      if (counts[itineraryId]) {
        counts[itineraryId]++;
      } else {
        counts[itineraryId] = 1;
      }
    });
    
    return counts;
  
  } catch (error) {
    throw error;
  }
};

module.exports = { appendEvent, readEvents, getEvents, countEvents };