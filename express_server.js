var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secrets'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))



let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "asdf"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "asdf"
  }
};

var urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    user_id: 'default'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    user_id: 'default'
    }
};


function generateRandomString() {
   var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


app.get("/", (req, res) => {
  if(req.session.user_id){
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

function getUrlsForUser(userid){
 var urlsForUser={};
 for(var key in urlDatabase){
    if(urlDatabase[key].user_id === userid){
      urlsForUser[key] = urlDatabase[key].longURL;
    }
  }
  return urlsForUser;
}

app.get("/urls", (req, res) => {

  if(req.session.user_id){
    let templateVars = {
      urls: getUrlsForUser(req.session.user_id),
      user_id: req.session.user_id,
      users: users,
      //users: users,
      //getUserIdFromData: getUserIdFromData
  };
    //console.log("rohit ",templateVars);
    res.render("urls_index", templateVars);
  } else{
    res.send("Please register first @ /register, or login @ /login");
  }
  //let user_id = req.session.user_id;
  //if user is registered and logged in, they can access this page
  //check for cookie,
  // if(user_id){//&& users[user_id]) {
  // //otherwise redirect to /urls
  //   res.render("urls_index", templateVars);
  // } else {
  //   res.send("please register to use tinyApp")
  // }
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    users: users,
  }
  let user_id = req.session.user_id;
  //if user is registered and logged in, they can access this page
  //check for cookie,
  if(user_id && users[user_id]) {
  //otherwise redirect to /urls
  res.render("urls_new", templateVars);
  } else {
    res.redirect('/login')
  }
  console.log(urlDatabase);
});

app.get("/register", (req, res) => {
  res.render("register");
})

app.get("/u/:shortURL", (req, res) => {
  let user_id = req.session.user_id;
  if(user_id){
  let longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL);
  res.redirect(longURL);
  } else {
    res.send('please register or login first')
  }
});



app.get("/login", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    users: users
  }
  res.render("login", templateVars)
});

app.get("/urls/:id", (req, res) => {
let user_id = req.session.user_id;
  if(user_id){
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user_id: req.session.user_id,
    users: users

  }
  res.render("urls_show", templateVars);
  }
});

app.post("/urls", (req, res) => {

  let longURL = req.body.longURL;// debug statement to see POST parameters
  let shortURL = generateRandomString();
  let user_id = req.session.user_id;
  urlDatabase[shortURL] = {
    longURL : longURL,
    user_id : user_id
  }
  //  urlDatabase[shortURL] = {longURL, user_id};
  //console.log(urlDatabase);
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});



app.post("/urls/:id/delete", (req, res) => {

    let user_id = req.session.user_id;
    if(user_id){
      delete urlDatabase[req.params.id];
      console.log(req.params.id)
      //delete the id
    } else{
      res.send('sorry you are not logged in');
    }
    res.redirect("/urls");
  });

app.post("/urls/:id/update", (req, res) => {
  console.log(req.body);
  let user_id = req.session.user_id;

  if(user_id === getUserIdFromShortURL(req.params.id, user_id)){
    // console.log(("Got data"))
    delete urlDatabase[req.params.id];
    let longURL = req.body.input;
    let shortURL  = generateRandomString();
    urlDatabase[shortURL] = {
      longURL, user_id
    }
    console.log(urlDatabase)
  // let templateVars = {
  //   shortURL: req.params.id,
  //   longURL: urlDatabase[r].longURL,
  //   user_id: req.session.user_id,
  //   users: users
  // }
    res.redirect(`/urls`);
  } else {
    console.log("Didn't get data");
    res.redirect("/urls");
  }
});

//make function to enter in userID from data base, and if it is registered and matches the id for the url, then it can delete

function getUserIdFromShortURL(short, user){
    if(urlDatabase[short].user_id === user){
      return urlDatabase[short].user_id;
  } else {
    return;
  }
};

// function DeleteUserIdFromData(user_id, link_id){
function DeleteUserIdFromData(user_id){
  for(let short in urlDatabase){
    if(urlDatabase[short].userID === user_id ){
       // if(urlDatabase[short].userID === user_id && if urlDatabase[short] === link_id){
      // console.log("LINK ID:", urlDatabase[link_id]);
      delete urlDatabase[short];
    }
  }
  return
}


app.post("/login", (req, res) => {
let email = req.body.email;
let password = req.body.password;

console.log(password)
// console.log(email);

// console.log(password);
if(!email || !password) {
  res.status(403).send('missing email/password');
}  else if(doesUserExist(email) && bcrypt.compareSync(password, gettingPasswordFromEmail(email))) {

      for(let user in users){
         if(users[user].email === email){
      req.session.user_id = users[user].id;
    }
  }
      res.redirect('/urls');
    } else {res.status(403).send('email not registered or wrong password')
}
console.log(users)
});

app.post("/logout", (req, res) => {
  // console.log(req.cookie)
  req.session = null;
  res.redirect("/urls");


})
function doesUserExist(email){
  for (let user in users) {
    if(users[user].email === email){
      return true
    }
  }
  return false
}
function gettingPasswordFromEmail(email){
  for(let user in users){
    if(users[user].email === email){
      return users[user].password
    }
  }
  return
}

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = bcrypt.hashSync(req.body.password, 10);

  if(!email || !password){
    res.send('Error 400: please provide an email/password.');
  } else if (doesUserExist(email)){
        return res.send('Error 400: this email is already in use.')
  } else {
         let id = generateRandomString();

    req.session.user_id = id;
    users[id] = {id, email, password}
    console.log(users[id]);
    console.log(users);
    res.redirect("/urls")
  }
  console.log(users);
  console.log(req.session.user_id)

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})