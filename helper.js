const findUserEmail = (email, users) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

const generateRandomString = function() {
  const date = Date.now();
  const dateStr = Math.round((date * Math.random() * 2) / Math.pow(10, 6)).toString();
  return dateStr;
  // return 'abcdef';
}

module.exports = { findUserEmail, generateRandomString };