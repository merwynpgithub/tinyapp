const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
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
const { findUserEmail, generateRandomString } = require('./helper');

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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

//POST
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
    res.redirect('/urls');
    return;
  };
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  templateVars["username"] = users[req.cookies["userId"]];
  res.render("urls_show", templateVars);
  // res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  const shortUrlString = generateRandomString();
  urlDatabase[shortUrlString] = {
    longURL: req.body.longURL,
    userID: req.cookies["userId"]
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
    return res.status(403).send('Login not found. Please try again or register');
  }
  //compare entered password with one in the users object
  if (user.password !== password) {
    return res.status(403).send('Password incorrect. Please try again');
  }
  res.cookie('userId', user.id);
  const templateVars = {
    username: users[req.cookies["userId"]]
  };
  // res.render("urls_index", templateVars);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId");
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
  users[id] = { id, email, password };
  res.cookie('userId', users[id].id);
  res.redirect('/urls');
});


//GET endpoints
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: users[req.cookies["userId"]],
  };
  //if not logged, redirect to login page
  if (!templateVars.username) {
    res.redirect('/login');
    return;
  }
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  // res.render("urls_show", templateVars);  //redirects to show
  //redirect to the actual url website
  res.redirect(templateVars.longURL);
});

app.get('/urls', (req, res) => {
  const id = req.cookies["userId"];
  if (!id) {
    res.redirect("/login");
    return;
  }
  const urlData = urlsForUser(id);
  const templateVars = { urls: urlData };
  templateVars["username"] = users[req.cookies["userId"]];
  res.render("urls_index", templateVars);
});

app.get('/register', (req, res) => {
  res.render("urls_register");
});

app.get('/login', (req, res) => {
  res.render("urls_login");
});

app.get('/', (req, res) => {
  res.send("Hello");
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

app.get("/fetch", (req, res) => {
  //will give an error
  res.send(`a = ${a}`);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});