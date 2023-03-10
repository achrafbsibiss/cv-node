const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const app = new express();
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const port = 9000;
//body parser
//configure session and flash

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);
// incude passpor
require("./config/passport");
// add passport
app.use(passport.initialize());
app.use(passport.session());
//configure passport
app.use(flash());
// add middleware for flash messages

app.use((req, res, next) => {
  res.locals.successMessage = req.flash("successMessage");
  res.locals.errorMessage = req.flash("errorMessage");
  res.locals.error = req.flash("error");

  if (req.user) {
    res.locals.user = req.user;
  }
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

// view enginge
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

app.use('/resources',express.static('public'))
app.use('/resources', express.static(__dirname+'/public'))



app.listen(port, () => {
  console.log(` The server started at port ${port} `);
});
