const express = require('express');
const { readUsers, appendUser, updateUserDetails } = require('./helpers/usersHelpers');
const { appendItinerary, readItineraries, updateItinerary, deleteItinerary } = require('./helpers/itineraryHelpers');
const app = express();

const PORT = process.env.PORT || 3000;

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
    // Filter itineraries to include only those belonging to the specified email
    const filtered = itineraries.filter(it => it.user_email === email);
    return res.status(200).json({ itineraries: filtered });
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    return res.status(500).json({ error: "Error fetching itineraries" });
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