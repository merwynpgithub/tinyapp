const assert = require('chai').assert;
const { urlDatabase, findUserEmail, urlsForUser } = require('../helper');


describe('testing helper functions', () => {
  it('should return user object for email ', () => {
    const ObjToTest = {
      "user1": {
        id: "user1",
        email: "user1@example.com",
      },
      "user2": {
        id: "user2",
        email: "user2@example.com",
      }
    };
    const result = {
      id: "user2",
      email: "user2@example.com",
    };
    assert.deepEqual(findUserEmail("user2@example.com", ObjToTest), result);
  });

  it('should return url object for userId', () => {
    const result = {
      b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "user1", visits: 0 },
      psm5xK: { longURL: "http://www.google.com", userID: "user1", visits: 0 }
    };
    assert.deepEqual(urlsForUser("user1"), result);
  });
});