const { readUsers, updateUserDetails } = require('./usersHelpers');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const REQUESTS_CSV = path.join(__dirname, '..', 'data', 'friend_requests.csv');
const REQUEST_HEADER = 'id,from_email,to_email';


// Ensure the CSV file exists with the proper header
if (!fs.existsSync(REQUESTS_CSV)) {
  fs.writeFileSync(REQUESTS_CSV, FRIEND_REQUESTS_HEADER + "\n");
}

// Ensure CSV exists
if (!fs.existsSync(REQUESTS_CSV)) {
  console.log("[INIT] friend_requests.csv not found. Creating new file.");
  fs.writeFileSync(REQUESTS_CSV, REQUEST_HEADER);
} else {
  console.log("[INIT] friend_requests.csv found.");
}

const appendFriendRequest = ({ id, from_email, to_email }) => {
  return new Promise((resolve, reject) => {
    fs.stat(REQUESTS_CSV, (err, stats) => {
      if (err) return reject(err);
      // If file has data, prepend a newline; otherwise, don't.
      const newLine = stats.size > 0
        ? `\n${id},${from_email},${to_email}`
        : `${id},${from_email},${to_email}`;
      fs.appendFile(REQUESTS_CSV, newLine, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

// Add a friend (as an object with metadata)
const addFriend = async (user_email, friend_email) => {
  const users = await readUsers();
  const user = users.find(u => u.email === user_email);
  const friend = users.find(u => u.email === friend_email);

  if (!user || !friend) throw new Error("User or friend not found");

  let friends = [];
  try { friends = JSON.parse(user.friends || "[]"); } catch (err) { friends = []; }

  if (!friends.some(f => f.email === friend_email)) {
    friends.push({ email: friend_email, favorite: false });
    await updateUserDetails(user_email, { friends: JSON.stringify(friends) });
  }
};

// Remove friend
const removeFriend = async (user_email, friend_email) => {
  const users = await readUsers();
  const user = users.find(u => u.email === user_email);
  if (!user) throw new Error("User not found");

  let friends = [];
  try { friends = JSON.parse(user.friends || "[]"); } catch (err) { friends = []; }

  const updatedFriends = friends.filter(f => f.email !== friend_email);
  await updateUserDetails(user_email, { friends: JSON.stringify(updatedFriends) });
};

// Get full friend profiles
const getFriends = async (user_email) => {
  const users = await readUsers();
  const user = users.find(u => u.email === user_email);
  if (!user) throw new Error("User not found");

  let friendList = [];
  try { friendList = JSON.parse(user.friends || "[]"); } catch (err) { friendList = []; }

  const friendsData = friendList.map(fObj => {
    const match = users.find(u => u.email === fObj.email);
    return match ? { ...match, favorite: fObj.favorite } : null;
  }).filter(Boolean);

  return friendsData;
};

// Check if two users are friends
const areFriends = async (user_email, friend_email) => {
  const friends = await getFriends(user_email);
  return friends.some(f => f.email === friend_email);
};

// Toggle favorite status
const toggleFavorite = async (user_email, friend_email, isFavorite) => {
  const users = await readUsers();
  const user = users.find(u => u.email === user_email);
  if (!user) throw new Error("User not found");

  let friends = [];
  try { friends = JSON.parse(user.friends || "[]"); } catch (e) {}

  const updatedFriends = friends.map(f =>
    f.email === friend_email ? { ...f, favorite: isFavorite } : f
  );

  await updateUserDetails(user_email, { friends: JSON.stringify(updatedFriends) });
};

// Friend request functions
const readFriendRequests = () => {
  return new Promise((resolve, reject) => {
    const requests = [];
    fs.createReadStream(REQUESTS_CSV)
      .pipe(csv())
      .on('data', row => requests.push(row))
      .on('end', () => resolve(requests))
      .on('error', reject);
  });
};

const getIncomingFriendRequests = async (email) => {
  const requests = await readFriendRequests();
  return requests.filter(r => r.to_email === email);
};

const clearRequest = async (requestId) => {
  const requests = await readFriendRequests();
  const filteredRequests = requests.filter((r) => r.id !== requestId);
  const header = 'id,from_email,to_email\n';
  const rows = filteredRequests.map(r => `${r.id},${r.from_email},${r.to_email}`).join('\n');
  fs.writeFileSync(REQUESTS_CSV, header + rows);
};

module.exports = {
  readFriendRequests,
  getIncomingFriendRequests,
  addFriend,
  removeFriend,
  getFriends,
  areFriends,
  toggleFavorite,
  clearRequest,
  appendFriendRequest,
};