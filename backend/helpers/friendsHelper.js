const { readUsers, updateUserDetails } = require('./usersHelpers');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');


const REQUESTS_CSV = path.join(__dirname, '..', 'data', 'friend_requests.csv');


// Write header if it doesn't exist
const REQUEST_HEADER = 'id,from_email,to_email';
if (!fs.existsSync(REQUESTS_CSV)) {
  console.log("[INIT] friend_requests.csv not found. Creating new file.");
  fs.writeFileSync(REQUESTS_CSV, REQUEST_HEADER);
} else {
  console.log("[INIT] friend_requests.csv found.");
}


// Add a friend to a user's friends list
const addFriend = async (user_email, friend_email) => {
  console.log(`[addFriend] Adding ${friend_email} to ${user_email}'s friends list`);
  const users = await readUsers();
  console.log("[addFriend] Users loaded:", users.length);


  const user = users.find(u => u.email === user_email);
  const friend = users.find(u => u.email === friend_email);


  if (!user || !friend) {
    console.error("[addFriend] User or friend not found", { user_email, friend_email });
    throw new Error("User or friend not found");
  }


  let friends = [];
  try {
    friends = JSON.parse(user.friends || "[]");
    console.log("[addFriend] Current friends list:", friends);
  } catch (err) {
    console.error("[addFriend] Failed to parse friends list JSON:", user.friends, err);
    friends = [];
  }


  if (!friends.includes(friend_email)) {
    friends.push(friend_email);
    console.log("[addFriend] Updated friends list to save:", friends);
    const friendsJSON = JSON.stringify(friends); // e.g. ["email1", "email2"]
    await updateUserDetails(user_email, { friends: JSON.stringify(friends) });
     console.log("[addFriend] Friends list updated successfully.");
  } else {
    console.log("[addFriend] Friend already exists in the list.");
  }
};


// Remove a friend from a user's friends list
const removeFriend = async (user_email, friend_email) => {
  console.log(`[removeFriend] Removing ${friend_email} from ${user_email}'s friends list`);
  const users = await readUsers();
  const user = users.find(u => u.email === user_email);


  if (!user) {
    console.error("[removeFriend] User not found:", user_email);
    throw new Error("User not found");
  }


  let friends = [];
  try {
    friends = JSON.parse(user.friends || "[]");
    console.log("[removeFriend] Current friends list:", friends);
  } catch (err) {
    console.error("[removeFriend] Failed to parse friends list JSON:", user.friends, err);
    friends = [];
  }


  const updatedFriends = friends.filter(f => f !== friend_email);
  console.log("[removeFriend] Updated friends list:", updatedFriends);
  await updateUserDetails(user_email, { friends: JSON.stringify(updatedFriends) });
  console.log("[removeFriend] Friends list updated successfully.");
};


// Get a user's friends list with full friend data
const getFriends = async (user_email) => {
  console.log(`[getFriends] Getting friends for user: ${user_email}`);
  const users = await readUsers();
  console.log("[getFriends] Users loaded:", users.length);


  const user = users.find(u => u.email === user_email);
  if (!user) {
    console.error("[getFriends] User not found:", user_email);
    throw new Error("User not found");
  }


  let friendEmails = [];
  try {
    friendEmails = JSON.parse(user.friends || "[]");
    console.log("[getFriends] Friend emails:", friendEmails);
  } catch (err) {
    console.error("[getFriends] Failed to parse friends list JSON:", user.friends, err);
    friendEmails = [];
  }


  const friendsData = friendEmails
    .map(email => users.find(u => u.email === email))
    .filter(Boolean);


  console.log("[getFriends] Resolved friend profiles:", friendsData.length);
  return friendsData;
};


// Check if two users are friends
const areFriends = async (user_email, friend_email) => {
  console.log(`[areFriends] Checking if ${user_email} and ${friend_email} are friends`);
  const friends = await getFriends(user_email);
  const isFriend = friends.some(f => f.email === friend_email);
  console.log(`[areFriends] Result: ${isFriend}`);
  return isFriend;
};


// Reads all friend requests
const readFriendRequests = () => {
  console.log("[readFriendRequests] Reading friend requests from CSV...");
  return new Promise((resolve, reject) => {
    const requests = [];
    fs.createReadStream(REQUESTS_CSV)
      .pipe(csv())
      .on('data', row => {
        console.log("[readFriendRequests] Parsed row:", row);
        requests.push(row);
      })
      .on('end', () => {
        console.log("[readFriendRequests] Finished reading, total:", requests.length);
        resolve(requests);
      })
      .on('error', (err) => {
        console.error("[readFriendRequests] Error reading CSV:", err);
        reject(err);
      });
  });
};


// Get requests sent *to* a user (incoming)
const getIncomingFriendRequests = async (email) => {
  console.log(`[getIncomingFriendRequests] Getting requests for: ${email}`);
  const requests = await readFriendRequests();
  const incoming = requests.filter(r => r.to_email === email);
  console.log(`[getIncomingFriendRequests] Incoming requests count: ${incoming.length}`);
  return incoming;
};


// Clear a request by ID
const clearRequest = async (requestId) => {
  const requests = await readFriendRequests();


  const filteredRequests = requests.filter((r) => r.id !== requestId);


  const header = 'id,from_email,to_email\n';
  const rows = filteredRequests.map(r => `${r.id},${r.from_email},${r.to_email}`).join('\n');
  const newContent = header + rows;


  fs.writeFileSync(REQUESTS_CSV, newContent);
};


module.exports = {
  readFriendRequests,
  getIncomingFriendRequests,
  addFriend,
  removeFriend,
  getFriends,
  areFriends,
  clearRequest,
};
