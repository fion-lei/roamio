const express = require('express');
const { readUsers, appendUser } = require('./helpers/csvHelpers'); // Import helper functions
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// ----------------------
// Signup Endpoint
// ----------------------
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // Read current users from CSV
    const users = await readUsers();

    // Check if a user with the provided email already exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    // Create a new user record; here using Date.now() as a simple id
    const newUser = { id: Date.now(), name, email, password };

    // Append the new user to the CSV file
    await appendUser(newUser);

    // Return success response
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

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // Read current users from CSV
    const users = await readUsers();

    // Find user matching email and password
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // Successful login
    return res.status(200).json({ message: 'Login successful.', user });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: 'Error processing login.' });
  }
});

// ----------------------
// Start the Server
// ----------------------
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle potential server errors, such as the port being in use
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose a different port.`);
  } else {
    console.error("Server error:", error);
  }
});