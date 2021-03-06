const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const { users, urlDatabase, findUserEmail, generateRandomString, urlsForUser } = require('./helper');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

/* ------------------------------------------ */


//POST endpoints
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortUrlString = req.params.shortURL;
  delete urlDatabase[shortUrlString];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  if (req.body.editlongURL) {
    urlDatabase[req.params.shortURL].longURL = req.body.editlongURL;
    const templateVars = { shortURL: req.params.shortURL, longURL: req.body.editlongURL };
    // console.log(templateVars);
    // res.render("urls_show", templateVars);
    templateVars["visits"] = urlDatabase[req.params.shortURL].visits;
    res.redirect('/urls');
    return;
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  templateVars["username"] = users[req.session.userId];
  templateVars["visits"] = urlDatabase[req.params.shortURL].visits;
  res.render("urls_show", templateVars);
  // res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  const shortUrlString = generateRandomString();
  urlDatabase[shortUrlString] = {
    longURL: req.body.longURL,
    userID: req.session.userId,
    visits: 0
  };
  // res.redirect('/urls/' + shortUrlString);
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //HTML5 form required validates email and password
  const user = findUserEmail(email, users);
  //if user is null show 403 status but suggest to register
  if (!user) {
    return res.status(403).render('urls_login', { error: 'Login not found. Please try again or register' })
    // return res.status(403).send('Login not found. Please try again or register');
  }
  //compare entered password with one in the users object
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(403).render('urls_login', { error: 'Password incorrect. Please try again' })
    // return res.status(403).send('Password incorrect. Please try again');
  }
  // res.cookie('userId', user.id);
  req.session.userId = user.id;
  const templateVars = {
    username: users[req.session.userId]
  };
  // res.render("urls_index", templateVars);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  // res.clearCookie("userId");
  req.session = null;
  res.redirect('/login');

});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //HTML5 form required validates email and password
  //Check if email already exists
  const user = findUserEmail(email, users);
  if (user) {
    return res.status(400).send('Email address is already in use.');
  }

  //add new email to users object
  const id = Math.round(Math.random() * 500) + 29;
  users[id] = {
    id, email,
    password: bcrypt.hashSync(password, 10)
  };
  // res.cookie('userId', users[id].id);
  req.session.userId = users[id].id;
  // console.log("User id is------", req.session.userId);
  res.redirect('/urls');
});

/* ------------------------------------------ */


//GET endpoints
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: users[req.session.userId],
  };
  //if not logged, redirect to login page
  if (!templateVars.username) {
    res.redirect('/login');
    return;
  }
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  //if not logged in suggest login or register
  if (!req.session.userId) {
    return res.status(400).send('Not logged in! Please login or register.');
  }
  //if shortUrl doesnt exist return "cannot get short Url"
  const shortLink = Object.keys(urlDatabase);
  if (!shortLink.includes(req.params.shortURL)) {
    return res.status(404).send(`Cannot get /urls/${req.params.shortURL}. Short Url doesn't exist.`);
  }

  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  templateVars["username"] = users[req.session.userId];


  //check that only logged in users can access their own shortUrl
  const urlData = urlsForUser(req.session.userId);
  templateVars["urls"] = urlData;
  
  if (!templateVars["urls"][req.params.shortURL]) {
    return res.status(403).send('Not authorized to use the short Url.');
  }
  
  res.render("urls_show", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  //if not logged in suggest login or register
  // if (!req.session.userId) {
  //   return res.status(400).send('Not logged in! Please login or register.');
  // }
  //if shortUrl doesnt exist return cannot get short Url
  const shortLink = Object.keys(urlDatabase);
  if (!shortLink.includes(req.params.shortURL)) {
    return res.status(404).render('error', { error: `Cannot get /u/${req.params.shortURL}. Short Url doesn't exist.` });
    // return res.status(404).send(`Cannot get /u/${req.params.shortURL}. Short Url doesn't exist.`);
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  templateVars["username"] = users[req.session.userId];

  //check that only logged in users can access their own shortUrl
  const urlData = urlsForUser(req.session.userId);
  templateVars["urls"] = urlData;
  
  // if (!templateVars["urls"][req.params.shortURL]) {
  //   return res.status(403).send('Not authorized to use the short Url.');
  // }

  //Stretch Activity: Add no of visits to shortURL.
  urlDatabase[req.params.shortURL].visits += 1;
  templateVars["visits"] = urlDatabase[req.params.shortURL].visits;
  res.redirect(templateVars.longURL);
});

app.get('/urls', (req, res) => {
  const id = req.session.userId;
  if (!id) {
    res.redirect("/login");
    return;
  }
  const urlData = urlsForUser(id);
  const templateVars = { urls: urlData };
  templateVars["username"] = users[req.session.userId];
  res.render("urls_index", templateVars);
});

app.get('/register', (req, res) => {
  res.render("urls_register");
});

app.get('/login', (req, res) => {
  res.render("urls_login", {error: null});
});

app.get('/', (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

/* //Testing get requests
app.get("/fetch", (req, res) => {
  //will give an error
  res.send(`a = ${a}`);
});
*/
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});