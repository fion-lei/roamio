const express = require('express');
const { readUsers, appendUser, updateUserDetails } = require('./helpers/usersHelpers');
const { appendItinerary, readItineraries, updateItinerary, deleteItinerary,updateSharedWith,unshareItinerary} = require('./helpers/itineraryHelpers');
const { appendEvent, readEvents, getEvents, countEvents } = require('./helpers/eventsHelpers');
const app = express();
const cors = require('cors'); // Add this
const { readFriendRequests } = require('./helpers/friendsHelper'); // if not already imported
const {
  getIncomingFriendRequests,
  addFriend,
  removeFriend,
  clearRequest,
  getFriends,
  toggleFavorite,
  appendFriendRequest
} = require('./helpers/friendsHelper');

const PORT = process.env.PORT || 3000;
app.use(cors()); //Add this before routes (try deleting if not work on emulator)

// Middleware to parse JSON bodies
app.use(express.json());

// ----------------------
// Start the Server
// ----------------------
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Error handling for server startup issues
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose a different port.`);
  } else {
    console.error("Server error:", error);
  }
});

// ---------------------------------------------------------------------------------
// User Endpoints
// ---------------------------------------------------------------------------------

// ----------------------
// Signup Endpoint (using email as identifier)
// ----------------------
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // Read current users from the CSV file
    const users = await readUsers();

    // Check if a user with the provided email already exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    // Create a new user record with extra fields set to empty strings
    const newUser = {
      id: Date.now(),
      email,
      password,
      first_name: "",
      last_name: "",
      phone_number: "",
      traveller_type: ""
    };

    // Append the new user using our helper, ensuring only the correct fields are written
    await appendUser(newUser);

    return res.status(201).json({ message: 'User created successfully.', user: newUser });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ error: 'Error processing signup.' });
  }
});

// ----------------------
// Login Endpoint
// ----------------------
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // Read users from the CSV file
    const users = await readUsers();

    // Find the matching user
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }
    console.log("User logged in:", user);
    return res.status(200).json({ message: 'Login successful.', user });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: 'Error processing login.' });
  }
});

// ----------------------
// Update User Details Endpoint
// ----------------------
app.put('/updateUserDetails', async (req, res) => {
  const { email, first_name, last_name, phone_number, traveller_type, bio } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    // For debugging: log the email and the users from CSV
    const users = await readUsers();
    console.log("Email to update:", email);
    console.log("Current users:", users);

    await updateUserDetails(email, { first_name, last_name, phone_number, traveller_type , bio});
    return res.status(200).json({ message: 'User details updated successfully.' });
  } catch (error) {
    console.error("Error updating user details:", error);
    return res.status(500).json({ error: 'Error updating user details.' });
  }
});

// ----------------------
// Reset Password Endpoint
// ----------------------

app.post('/resetPassword', async (req, res) => {
  const { email, newPassword } = req.body;

  // Validate that email and newPassword are provided
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // Update only the password field for the specified email
    await updateUserDetails(email, { password: newPassword });
    console.log(`Password reset successful for email: ${email}`);
    return res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ error: 'Error resetting password.' });
  }
});


// ----------------------
// Fetch Profile Deets Endpoint
// ----------------------
app.get('/profile', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  try {
    const users = await readUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ error: 'Error fetching profile.' });
  }
});

// ---------------------------------------------------------------------------------
// Itinerary Endpoints
// ---------------------------------------------------------------------------------

// ----------------------
// Create trip Endpoint
// ----------------------
app.post('/itineraries', async (req, res) => {
  const { user_email, trip_title, trip_description, start_date, end_date, destinations } = req.body;
  if (!user_email || !trip_title) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  
  const itinerary = {
    itinerary_id: Date.now(), // simple unique id
    user_email,
    trip_title,
    trip_description: trip_description || "",
    start_date: start_date || "",
    end_date: end_date || "",
    destinations: destinations || "",
  };

  try {
    await appendItinerary(itinerary);
    res.status(201).json({ message: 'Itinerary created successfully.', itinerary });
  } catch (error) {
    console.error("Error creating itinerary:", error);
    res.status(500).json({ error: 'Error creating itinerary.' });
  }
});

// ----------------------
// Get trip Endpoint
// ----------------------
app.get('/itineraries', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email parameter is required" });
  }
  try {
    const itineraries = await readItineraries();
    console.log('Fetched itineraries:', itineraries);

    const filtered = itineraries.filter(itinerary => {
      // Default: no shared_with info
      let sharedEmails = [];
      if (itinerary.shared_with && itinerary.shared_with.trim() !== '') {
        try {
          // Parse shared_with JSON string to an array of objects
          const sharedArray = JSON.parse(itinerary.shared_with);
          sharedEmails = sharedArray.map(item => item.email);
        } catch (error) {
          console.error("Error parsing shared_with field:", error);
        }
      }
      // Check if the email is the owner or in the shared_with list
      const isOwner = itinerary.user_email === email;
      const isShared = sharedEmails.includes(email);
      console.log(`Itinerary ${itinerary.itinerary_id}: isOwner=${isOwner}, isShared=${isShared}`);
      return isOwner || isShared;
    });

    return res.status(200).json({ itineraries: filtered });
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    return res.status(500).json({ error: "Error fetching itineraries" });
  }
});

// ----------------------
// Get active itineraries (ongoing or upcoming) 
// ----------------------
app.get('/active-itineraries', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email parameter is required" });
  }
  try {
    const itineraries = await readItineraries();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter itineraries to include only those belonging to the specified email that are either ongoing or upcoming 
    // (end date >= today)
    const filtered = itineraries.filter(it => {
      if (it.user_email !== email) return false;
      
      // Parse the end date from MM/DD/YYYY format
      if (!it.end_date) return true; // If no end date, include it
      
      const [month, day, year] = it.end_date.split('/');
      const endDate = new Date(Number(year), Number(month) - 1, Number(day));
      
      // Keep only if end date is today or in future
      return endDate >= today;
    });
    
    return res.status(200).json({ itineraries: filtered });
  } catch (error) {
    return res.status(500).json({ error: "Error fetching active itineraries" });
  }
});

// ----------------------
// Update trip Endpoint
// ----------------------
app.put('/itineraries/:id', async (req, res) => {
  const itinerary_id = req.params.id;
  const updates = req.body;
  try {
    await updateItinerary(itinerary_id, updates);
    return res.status(200).json({ message: "Itinerary updated successfully." });
  } catch (error) {
    console.error("Error updating itinerary:", error);
    return res.status(500).json({ error: error.message || "Error updating itinerary." });
  }
});

// ----------------------
// Delete trip Endpoint
// ----------------------
app.delete('/itineraries/:id', async (req, res) => {
  const itinerary_id = req.params.id;
  try {
    await deleteItinerary(itinerary_id);
    return res.status(200).json({ message: "Itinerary deleted successfully." });
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    return res.status(500).json({ error: error.message || "Error deleting itinerary." });
  }
});

// ---------------------------------------------------------------------------------
// Events Endpoints
// ---------------------------------------------------------------------------------

// ----------------------
// Add event to itinerary 
// ----------------------
app.post('/events', async (req, res) => {
  const { 
    itinerary_id, 
    title, 
    description, 
    address, 
    contact, 
    hours, 
    price, 
    rating, 
    rating_count, 
    tags,
    image_path,
    start_date,
    start_time,
    end_date,
    end_time
  } = req.body;

  if (!itinerary_id || !title) {
    return res.status(400).json({ error: 'Missing required fields for itinerary id and title.' });
  }

  try {
    // Check if the itinerary exists
    const itineraries = await readItineraries();
    
    // Convert to string for comparison since IDs from CSV will be strings
    const itineraryIdStr = String(itinerary_id);
    const itinerary = itineraries.find(id => String(id.itinerary_id) === itineraryIdStr);
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found.' });
    }
    
    // Process tags to ensure they're handled as an array
    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags;
      } else if (typeof tags === 'string') {
        // Handle comma-separated tags or already formatted JSON string
        try {
          processedTags = tags.startsWith('[') ? JSON.parse(tags) : tags.split(',').map(tag => tag.trim().replace(/^#/, ''));
        } catch (e) {
          processedTags = tags.split(',').map(tag => tag.trim().replace(/^#/, ''));
        }
      }
    }

    const event = {
      event_id: Date.now().toString(),
      itinerary_id: itineraryIdStr,
      title,
      description: description || "",
      address: address || "",
      contact: contact || "",
      hours: hours || "",
      price: price || "",
      rating: rating || "",
      rating_count: rating_count || "",
      tags: processedTags,
      image_path: image_path || "",
      start_date: start_date || "",
      start_time: start_time || "",
      end_date: end_date || "",
      end_time: end_time || ""
    };

    await appendEvent(event);
    return res.status(201).json({ message: 'Event added successfully', event });
  } catch (error) {
    console.error("Error adding event:", error);
    return res.status(500).json({ error: 'Error adding event to itinerary.' });
  }
});

// ----------------------
// Get events for a specific itinerary 
// ----------------------
app.get('/events/:itineraryId', async (req, res) => {
  const itineraryId = req.params.itineraryId;
  
  try {
    const events = await getEvents(itineraryId);
    return res.status(200).json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({ error: 'Error fetching events.' });
  }
});

// ----------------------
// Get event counts for active itineraries 
// ----------------------
app.get('/event-counts', async (req, res) => {
  try {
    const counts = await countEvents();
    const itineraries = await readItineraries();
    
    // Filter out past itineraries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const filteredCounts = {};
    
    // Only include counts for non-past itineraries
    Object.keys(counts).forEach(itineraryId => {
      const itinerary = itineraries.find(it => String(it.itinerary_id) === itineraryId);
      
      // If no itinerary found or no end date, keep the count
      if (!itinerary || !itinerary.end_date) {
        filteredCounts[itineraryId] = counts[itineraryId];
        return;
      }
      
      // Parse the end date from MM/DD/YYYY format
      const [month, day, year] = itinerary.end_date.split('/');
      const endDate = new Date(Number(year), Number(month) - 1, Number(day));
      
      // Only include counts for active itineraries 
      if (endDate >= today) {
        filteredCounts[itineraryId] = counts[itineraryId];
      }
    });
    
    return res.status(200).json({ counts: filteredCounts });
  } catch (error) {
    console.error("Error fetching event counts:", error);
    return res.status(500).json({ error: 'Error fetching event counts.' });
  }
});

// ----------------------
// Get event counts for a specific itinerary 
// ----------------------
app.get('/event-counts/:itineraryId', async (req, res) => {
  const itineraryId = req.params.itineraryId;
  
  try {
    // First check if the itinerary is past
    const itineraries = await readItineraries();
    const itinerary = itineraries.find(it => String(it.itinerary_id) === itineraryId);
    
    if (itinerary && itinerary.end_date) {
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Parse the end date from MM/DD/YYYY format
      const [month, day, year] = itinerary.end_date.split('/');
      const endDate = new Date(Number(year), Number(month) - 1, Number(day));
      
      // If itinerary is past, return empty object without count field so it does not show up in the interface
      if (endDate < today) {
        return res.status(200).json({});
      }
    }
    
    const events = await getEvents(itineraryId);
    return res.status(200).json({ count: events.length });
  } catch (error) {
    console.error("Error fetching event count:", error);
    return res.status(500).json({ error: 'Error fetching event count.' });
  }
});

// ---------------------------------------------------------------------------------
// Friends Endpoints
// ---------------------------------------------------------------------------------

// ----------------------
// Get Friends Endpoint
// ----------------------
app.get('/friends', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    const friends = await getFriends(email);
    return res.status(200).json(friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    return res.status(500).json({ error: "Failed to fetch friends." });
  }
});

// ----------------------
// Friend Request End Point
// ----------------------
app.get("/friendRequests", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required." });

    const requests = await readFriendRequests();
    const incoming = requests.filter(r => r.to_email === email);
    res.status(200).json(incoming);
  } catch (err) {
    console.error("Error fetching friend requests:", err);
    res.status(500).json({ error: "Failed to get friend requests." });
  }
});

app.post('/acceptFriendRequest', async (req, res) => {
  const { id, from_email, to_email } = req.body;

  if (!id || !from_email || !to_email) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    await addFriend(to_email, from_email); // The recipient adds the sender
    await addFriend(from_email, to_email); // Optionally make it mutual
    await clearRequest(id);
    res.status(200).json({ message: "Friend request accepted." });
  } catch (error) {
    console.error("Error accepting request:", error);
    res.status(500).json({ error: "Failed to accept friend request." });
  }
});
app.post('/declineFriendRequest', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Request ID is required." });
  }

  try {
    await clearRequest(id);
    res.status(200).json({ message: "Friend request declined." });
  } catch (error) {
    console.error("Error declining request:", error);
    res.status(500).json({ error: "Failed to decline request." });
  }
});

app.post('/addFriend', async (req, res) => {
  const { user_email, friend_email } = req.body;
  try {
    await addFriend(user_email, friend_email);
    res.status(200).json({ message: 'Friend added successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/unFriend', async (req, res) => {
  const { user_email, friend_email } = req.body;
  try {
    await removeFriend(user_email, friend_email);
    res.status(200).json({ message: 'Friend removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/Favorite', async (req, res) => {
  const { user_email, friend_email, favorited } = req.body;
  if (!user_email || !friend_email || typeof favorited !== 'boolean') {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    await toggleFavorite(user_email, friend_email, favorited);
    return res.status(200).json({ message: "Favorite status updated." });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return res.status(500).json({ error: "Failed to update favorite status." });
  }
});

app.post('/shareItinerary', (req, res) => {
  const { itinerary_id, friend_email, access_type,friend_name,owner_name } = req.body;

  // Validate required fields
  if (!itinerary_id || !friend_email || !access_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  updateSharedWith(itinerary_id, friend_email, access_type,friend_name,owner_name)
    .then((result) => res.status(200).json(result))
    .catch((err) =>
      res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
    );
});

/**
 * DELETE endpoint for owners to unshare an itinerary with a friend.
 * Expected body: { itinerary_id: string, friend_email: string }
 */
app.delete('/unshare', async (req, res) => {
  const { itinerary_id, friend_email } = req.body;
  if (!itinerary_id || !friend_email) {
    return res.status(400).json({ error: "Missing itinerary_id or friend_email" });
  }
  try {
    const result = await unshareItinerary(itinerary_id, friend_email);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error unsharing itinerary:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE endpoint for shared users (non-owners) to unadd themselves from an itinerary.
 * Expected body: { itinerary_id: string, friend_email: string }
 * (Here, friend_email should be the email of the current user.)
 */
app.delete('/unadd', async (req, res) => {
  const { itinerary_id, friend_email } = req.body;
  if (!itinerary_id || !friend_email) {
    return res.status(400).json({ error: "Missing itinerary_id or friend_email" });
  }
  try {
    const result = await unshareItinerary(itinerary_id, friend_email);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error unadding from itinerary:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/sendFriendRequest', async (req, res) => {
  const { from_email, to_email } = req.body;
  console.log("request received")
  if (!from_email || !to_email) {
    return res.status(400).json({ error: "Missing from_email or to_email" });
  }
  
  try {
    // Generate a unique ID using current timestamp (or replace with your preferred method)
    const newId = Date.now();
    
    // Optionally, you might check for duplicate requests here

    await appendFriendRequest({ id: newId, from_email, to_email });
    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Error sending friend request" });
  }
});

app.get('/findUserByPhone', async (req, res) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ error: "Missing phone number" });
  }
  try {
    const users = await readUsers();
    // Match the phone number exactly.
    // You might want to trim spaces and/or standardize the format if necessary.
    const user = users.find(u => u.phone_number && u.phone_number.trim() === phone.trim());
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Return the user's email (and any other info if needed)
    res.status(200).json({ email: user.email });
  } catch (error) {
    console.error("Error finding user by phone:", error);
    res.status(500).json({ error: "Error looking up phone number" });
  }
});