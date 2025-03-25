const express = require('express');
const { readUsers, appendUser, updateUserDetails } = require('./helpers/csvHelpers');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

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
  const { email, first_name, last_name, phone_number, traveller_type } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    // For debugging: log the email and the users from CSV
    const users = await readUsers();
    console.log("Email to update:", email);
    console.log("Current users:", users);

    await updateUserDetails(email, { first_name, last_name, phone_number, traveller_type });
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
