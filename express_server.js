var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');




app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());



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
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


function generateRandomString() {
   var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


app.get("/", (req, res) => {
  res.send("Hello!");

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user_id: req.cookies["user_id"],
    users: users
   };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
    users: users
  }
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  res.render("register")
})

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  res.render("login")
})

app.get("/login", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
    users: users
  }
  res.render("login", templateVars)
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id: req.cookies["user_id"],
    users: users
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let longURL = req.body.longURL;// debug statement to see POST parameters
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect(`http://localhost:8080/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
})

app.post("/urls/:id/update", (req, res) => {
  console.log(req.body);
  delete urlDatabase[req.params.id];
  let longURL = req.body.input;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`http://localhost:8080/urls/${shortURL}`)
});






app.post("/login", (req, res) => {
let email = req.body.email;
let password = req.body.password;

// console.log(email);

// console.log(password);
if(!email || !password) {
  res.status(403).send('missing email/password');
}  else if(doesUserExist(email) && doesPasswordMatch(password)) {

      for(let user in users){
         if(users[user].email === email){
      res.cookie('user_id', users[user].id);
    }
  }
      res.redirect('/');
    } else {res.status(403).send('email not registered')
}
});

app.post("/logout", (req, res) => {
  // console.log(req.cookie)
  res.clearCookie('user_id');
  res.redirect("/urls")


})
function doesUserExist(email){
  for (let user in users) {
    if(users[user].email === email){
      return true
    }
  }
  return false
}
function doesPasswordMatch(password){
  for (let user in users) {
    if(users[user].password === password){
      return true
    }
  }
  return false
}

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if(!email || !password){
    res.send('Error 400: please provide an email/password.');
  } else if (doesUserExist(email)){
        return res.send('Error 400: this email is already in use.')
  } else {
         let id = generateRandomString();

    res.cookie('user_id', id)
    users[id] = {id, email, password}
    console.log(users[id]);
    console.log(users);
    res.redirect("/urls")
  }

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})