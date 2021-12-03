const users = { 
  "user1": {
    id: "user1", 
    email: "user1@example.com", 
    password: "pass1"
  },
 "user2": {
    id: "user2", 
    email: "user2@example.com", 
    password: "pass2"
  }
};
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2" },
  b2xVn2: {longURL: "http://www.lighthouselabs.ca", userID: "user1" },
  psm5xK: {longURL: "http://www.google.com", userID: "user1" }
};
const findUserEmail = (email, users) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};
//string for shortUrl
const generateRandomString = function() {
  const date = Date.now();
  const dateStr = Math.round((date * Math.random() * 2) / Math.pow(10, 6)).toString();
  return dateStr;
  // return 'abcdef';
};
//helper to sort UrlDatabase as per particular UserId
const urlsForUser = (id) => {
  const urlDataUser = {};
  for (const data in urlDatabase) {
    if (urlDatabase[data].userID === id) {
      urlDataUser[data] = urlDatabase[data];
    }
  }
  return urlDataUser;
};


module.exports = { users, urlDatabase, findUserEmail, generateRandomString, urlsForUser };