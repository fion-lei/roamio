const fs = require('fs');
const path = require('path');

const eventsCSV = path.join(__dirname, '..', 'data', 'events.csv');
const EVENTS_HEADER = 'event_id,itinerary_id,title,description,address,contact,hours,price,rating,rating_count,tags,image_path,start_date,start_time,end_date,end_time';

// Ensure the CSV file exists with the correct header or writes one if it doesn't exist 
if (!fs.existsSync(eventsCSV)) {
  fs.writeFileSync(eventsCSV, EVENTS_HEADER);
}

// Reads events from events.csv and converts to objects 
const readEvents = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(eventsCSV, 'utf8', (err, data) => {
      if (err) return reject(err);
      const lines = data.trim().split('\n');
      if (lines.length < 2) return resolve([]);
      
      const header = lines[0].split(',');
      const events = lines.slice(1).map(line => {
        const values = parseCsvLine(line);
        let event = {};
        
        header.forEach((key, index) => {
          const trimmedKey = key.trim();
          let value = values[index] ? values[index].trim() : "";
          
          if (trimmedKey === 'tags' && value) {
            try {
              event[trimmedKey] = JSON.parse(value);
            } catch (e) {
              event[trimmedKey] = value.split(',').map(tag => tag.trim().replace(/^#/, ''));
            }
          } else {
            event[trimmedKey] = value;
          }
        });
        
        return event;
      });
      
      resolve(events);
    });
  });
};

// Parses a single CSV line, properly handling quoted fields and commas
const parseCsvLine = (line) => {
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
  
  values.push(currentValue);
  
  return values.map(value => {
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.substring(1, value.length - 1);
    }
    return value;
  });
};

// Appends an event to events.csv with proper formatting 
const appendEvent = (event) => {
  return new Promise((resolve, reject) => {
    fs.stat(eventsCSV, (err, stats) => {
      if (err) return reject(err);
      
      const tagsField = formatTags(event.tags);
      
      const fields = [
        event.event_id,
        event.itinerary_id,
        event.title,
        event.description,
        event.address,
        event.contact,
        event.hours,
        event.price,
        event.rating,
        event.rating_count,
        tagsField,
        event.image_path,
        event.start_date,
        event.start_time,
        event.end_date,
        event.end_time
      ].map((value, i) => i !== 10 ? escapeCSVField(value) : value);
      
      const newLine = stats.size > 0 ? `\n${fields.join(',')}` : fields.join(',');
      
      fs.appendFile(eventsCSV, newLine, err => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

// Formats tags 
const formatTags = (tags) => {
  if (!tags) return "";
  
  let tagsArray;
  if (typeof tags === 'string') {
    tagsArray = tags.startsWith('[') 
      ? JSON.parse(tags)
      : tags.split(',').map(tag => tag.trim().replace(/^#/, ''));
  } else if (Array.isArray(tags)) {
    tagsArray = tags;
  } else {
    tagsArray = [];
  }
  
  return `"${JSON.stringify(tagsArray).replace(/"/g, '""')}"`;
};

// Escapes value for CSV storing 
const escapeCSVField = (value) => {
  if (value === undefined || value === null) return "";
  
  const stringValue = String(value);
  if (stringValue.includes('"') || stringValue.includes(',')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

// Gets events by itinerary id for viewing 
const getEvents = async (itineraryId) => {
  try {
    const events = await readEvents();
    const itineraryIdStr = String(itineraryId);
    return events.filter(event => String(event.itinerary_id) === itineraryIdStr);
  } catch (error) {
    throw error;
  }
};

// Counts events per itinerary 
const countEvents = async () => {
  try {
    const events = await readEvents();
    return events.reduce((counts, event) => {
      const itineraryId = String(event.itinerary_id);
      counts[itineraryId] = (counts[itineraryId] || 0) + 1;
      return counts;
    }, {});
  } catch (error) {
    throw error;
  }
};

// Delete an event by event_id
const deleteEvent = (eventId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const events = await readEvents();
      const filteredEvents = events.filter(event => String(event.event_id) !== String(eventId));
      
      // Check if event was found and removed
      if (filteredEvents.length === events.length) {
        return reject(new Error("Event not found"));
      }
      
      const headerFields = EVENTS_HEADER.split(',');
      const lines = filteredEvents.map(event => {
        
        const fields = headerFields.map(field => {
          const trimmedField = field.trim();
          let value = event[trimmedField] || "";
          
          if (trimmedField === 'tags') {
            if (typeof value !== 'string') {
              return formatTags(value);
            }
            return value;
          }
           
          return escapeCSVField(value);
        });
        
        return fields.join(',');
      });
      
      const newCSV = EVENTS_HEADER + (filteredEvents.length > 0 ? "\n" + lines.join("\n") : "");
      
      fs.writeFile(eventsCSV, newCSV, (err) => {
        if (err) return reject(err);
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = { appendEvent, readEvents, getEvents, countEvents, deleteEvent };