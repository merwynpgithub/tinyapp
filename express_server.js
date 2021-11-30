const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.set("view engine", "ejs");

function generateRandomString() {
  const date = Date.now();
  dateStr = Math.round(date / Math.pow(10, 6)).toString();
  return dateStr;
  // return 'abcdef';
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortUrlString = req.params.shortURL;
  delete urlDatabase[shortUrlString];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  if (req.body.editlongURL) {
    urlDatabase[req.params.shortURL] = req.body.editlongURL;
    const templateVars = { shortURL: req.params.shortURL, longURL: req.body.editlongURL };
    console.log(templateVars);
    templateVars["username"] = req.cookies["username"];
    res.render("urls_show", templateVars);
    return;
  };
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  console.log(templateVars);
  templateVars["username"] = req.cookies["username"];
  res.render("urls_show", templateVars);
  // res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const shortUrlString = generateRandomString();
  urlDatabase[shortUrlString] = req.body.longURL;
  // res.redirect('/urls/' + shortUrlString);
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  const templateVars = {
    username: req.cookies["username"],
  };
  // res.render("urls_index", templateVars);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // res.render("urls_show", templateVars);  //redirects to show
  //redirect to the actual url website
  res.redirect(templateVars.longURL);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  templateVars["username"] = req.cookies["username"];
  res.render("urls_index", templateVars);
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