const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const pdf = require('html-pdf');
const dynamicResume = require('../docs/dynamic-resume');
const staticResume = require('../docs/static-resume');




const options = {
  "height": "10.5in",        // allowed units: mm, cm, in, px
  "width": "8in",            // allowed units: mm, cm, in, pxI
};

//login form
router.get("/login", (req, res) => {
  res.render("login");
});




//login user request

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard" ,
    failureRedirect: "/users/login",
    failureFlash: true
  })
);

// register page

router.get("/register", (req, res) => {
  res.render("register");
});

// Register 

router.post("/register", (req, res) => {
  const { email, password, password2 } = req.body;
  
  //validation

  let errors = [];
  if (!email || !password || !password2) {
    errors.push({
      msg: "please enter all feilds"
    });
  }
  if (password !== password2) {
    errors.push({
      msg: "password does not match"
    });
  }

  if (password.length < 3) {
    errors.push({
      msg: "password must be more than 3 characteres"
    });
  }

  if (errors.length > 0) {
    res.render("register", { errors });
  } else {
    //validationis ok
    // check if user is exist or not
    User.findOne({
      where: {
        email: email
      }
    })
      .then(user => {
        if (user) {
          errors.push({
            msg: "email was already used"
          });
          res.render("register", { errors });
        } else {
          //create user

          const newUser = new User({
            email,
            password
          });
          //hash the password
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  console.log("user created");
                  req.flash(
                    "successMessage",
                    " your account is created ,please login"
                  );
                  res.redirect("/users/login");
                })
                .catch(err => {
                  console.log(err);
                  req.flash("ErrorMessage", "There an error");
                  res.redirect("/users/register");
                }); //end new user
            });
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }
});
// logout
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/users/login");
});













// choise your teamplet

router.get('/resume-marker/:theme', (req, res, next) => {
  console.log("theme: ", req.params.theme);
  switch (req.params.theme) {
      case '1':
          res.render('resume-marker', { theme: "blue" });
          break;
      case '2':
          res.render('resume-marker', { theme: "green" });
          break;
      default:
          res.render('resume-marker', { theme: "green" });
          break;
  }
});



router.post('/resume-marker', (req, res, next) => {
  console.log(req.body);
  // LOWERCASE -> REMOVE SPACE -> SHORT NAME 
  const userName = req.body.name;
  const lowercaseName = userName.toLowerCase();
  const noSpaceName = lowercaseName.replace(' ', '');
  const shortName = noSpaceName.slice(0, 10);
  console.log("short name: ", shortName);


  let themeOptions = {
      leftTextColor: "rgb(91, 88, 255)",
      leftBackgroundColor: 'rgb(12, 36, 58)',
      wholeBodyColor: ' rgb(183, 182, 255)',
      rightTextColor: 'rgb(12, 36, 58)'
  };

  if (req.body.theme === 'blue') {

      // HTML TO PDF CONVERTING
      pdf.create(dynamicResume(req.body, themeOptions), options).toFile(__dirname + "/docs/" + shortName + "-resume.pdf", (error, response) => {
          if (error) throw Error("File is not created");
          console.log(response.filename);
          res.sendFile(response.filename);
      });
  } else if (req.body.theme === 'green') {
      themeOptions = {
          leftTextColor: "rgb(183, 217, 255)",
          leftBackgroundColor: 'rgb(0, 119, 89)',
          wholeBodyColor: ' rgb(rgb(139, 247, 205))',
          rightTextColor: 'rgb(0, 119, 89)'
      };

      // HTML TO PDF CONVERTING
      pdf.create(dynamicResume(req.body, themeOptions), options).toFile(__dirname + "/docs/" + shortName + "-resume.pdf", (error, response) => {
          if (error) throw Error("File is not created");
          console.log(response.filename);
          res.sendFile(response.filename);
      });
  } else {
      // SETTING DEFAULT VALUE
      // HTML TO PDF CONVERTING
      pdf.create(dynamicResume(req.body, themeOptions), options).toFile(__dirname + "/docs/" + shortName + "-resume.pdf", (error, response) => {
          if (error) throw Error("File is not created");
          console.log(response.filename);
          res.sendFile(response.filename);
      });
  }


});

router.get('/pdf-static-resume', (req, res, next) => {
  // HTML TO PDF CONVERTING
  pdf.create(staticResume(), options).toFile(__dirname + "/docs/static-resume.pdf", (error, response) => {
      if (error) throw Error("File is not created");
      console.log(response.filename);
      res.sendFile(response.filename);
  });
});








module.exports = router;
