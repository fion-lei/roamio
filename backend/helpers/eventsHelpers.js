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
        // Handle quoted fields in CSV properly
        const values = [];
        let currentValue = '';
        let insideQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            values.push(currentValue);
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        
        // Add the last value
        values.push(currentValue);
        
        let event = {};
        header.forEach((key, index) => {
          // Remove surrounding quotes if present
          let value = values[index] ? values[index].trim() : "";
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          }
          
          // Parse tags as JSON if the field is tags
          if (key.trim() === 'tags' && value) {
            try {
              // Try to parse as JSON
              event[key.trim()] = JSON.parse(value);
            } catch (e) {
              // If parsing fails, handle old format (hashtags separated by commas)
              event[key.trim()] = value.split(',').map(tag => tag.trim().replace(/^#/, ''));
            }
          } else {
            event[key.trim()] = value;
          }
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
      
      // Convert tags to JSON array string if it's not already
      let tagsField = "";
      if (event.tags) {
        let tagsArray;
        if (typeof event.tags === 'string') {
          // Handle existing hashtag format by splitting on commas and removing hashtags
          tagsArray = event.tags.startsWith('[') 
            ? JSON.parse(event.tags) // Already JSON array
            : event.tags.split(',').map(tag => tag.trim().replace(/^#/, ''));
        } else if (Array.isArray(event.tags)) {
          tagsArray = event.tags;
        } else {
          tagsArray = [];
        }
        tagsField = `"${JSON.stringify(tagsArray)}"`;
      }
      
      // Ensure description is properly escaped 
      const descriptionField = event.description ? `"${event.description}"` : "";
      
      const newLine = stats.size > 0
        ? `\n${event.event_id},${event.itinerary_id},${event.title},${descriptionField},${event.address},${event.contact},${event.hours},${event.price},${event.rating},${event.rating_count},${tagsField},${event.image_path},${event.start_date},${event.start_time},${event.end_date},${event.end_time}`
        : `${event.event_id},${event.itinerary_id},${event.title},${descriptionField},${event.address},${event.contact},${event.hours},${event.price},${event.rating},${event.rating_count},${tagsField},${event.image_path},${event.start_date},${event.start_time},${event.end_date},${event.end_time}`;
      
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