// import modules
const dotenv = require('dotenv'); 
dotenv.config()
 const express = require("express"),
        morgan = require("morgan"),
    bodyParser = require("body-parser"),
      mongoose = require("mongoose"),
        Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

// Use the Morgan middleware library to log all requests
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// MUST be placed BEFORE let auth = require("./auth.js")(app)
const cors = require("cors");

// allow requests from all origins (!)
app.use(cors());

/* comment this part in and delete "app.use(cors());"
    to allow access only from allowed origins

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on allowedOrigins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));
*/

// MUST be placed after bodyParser middleware function
// (app) argument => make Express available in "auth.js"
let auth = require("./auth.js")(app); 

const passport = require("passport");
require("./passport.js");

const { check, validationResult } = require('express-validator');

// log basic data
app.use(morgan("common"));

// serve static files
app.use(express.static("public"));


// connect to local database
// mongoose.connect("mongodb://localhost:27017/myFlixDB", { useNewUrlParser: true, useUnifiedTopology: true });
// connect to online database
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// ----------------- CRUD -------------------------------

//default text response when at /
app.get("/",  
  (req, res) => {
    res.send("Welcome to my app!");
  }
);

// OK Read: Get list of data about ALL movies
app.get("/movies",  
  // temporarily commented out in order to enable React app access
  // passport.authenticate("jwt", { session: false }),
  (req, res)  => {
      Movies
      .find()
      .then((movies) => {
          res.status(201).json(movies);
        }
      )
      .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        }
      );
    }
);

// OK Read: Get one movie, by title
app.get("/movies/:Title",  
  passport.authenticate("jwt", { session: false }), 
  (req, res) => {
      Movies
      .findOne({Title: req.params.Title})
      .then((movie) => {
          res.json(movie);
        }
      )
      .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        }
      );
    }
);

// OK Read: get genre info, by genre name
app.get("/movies/genres/:genreName",  
  passport.authenticate("jwt", { session: false }), 
    (req, res) => {
        Movies
        .findOne({"Genre.Name": req.params.genreName})
        .then((theFoundMovie) => {
            res.status(201).json(theFoundMovie.Genre.Description);
          }
        )
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
          }
        );
      }
);

// OK Read: get director info, by director"s name
app.get("/movies/directors/:directorsName",  
  passport.authenticate("jwt", { session: false }), 
  (req, res) => {
      Movies
      .findOne({"Director.Name": req.params.directorsName})
      .then((theFoundMovie) => {
          res.status(201).json(theFoundMovie.Director.Bio);
        }
      )
      .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        }
      );
    }
);

// Read: get all users info
app.get("/users",  
  passport.authenticate("jwt", { session: false }), 
  (req, res) => {
      Users
      .find()
      .then((users) => {
        res.status(201).json(users);
        }
      )
      .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        }
      );
    }
);

// Read: get user info, by username
app.get("/users/:Username",  
  passport.authenticate("jwt", { session: false }), 
  (req, res) => {
      Users
      .findOne({Username: req.params.Username})
      .then((user) => {
          res.json(user);
        }
      )
      .catch((err) =>  {
          console.error(err);
          res.status(500).send("Error: " + err);
        }
      );
    }
);

// Create: New user
/* expects JSON in this format:
{
  ID: Integer,
  Username: String,
  Password: String,
  Email:    String,
  Birthday: Date
}*/
app.post('/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {
  // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    // See if user with requested username already exists
    Users
    .findOne({ Username: req.body.Username }) 
    .then((user) => {
      if (user) {
        //If the user is found, send a response that it already exists
        return res.status(400).send(req.body.Username + ' already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) => { res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });


// Update: User info
/* expects JSON in this format:
{
  Username: String, (required)
  Password: String, (required)
  Email:    String, (required)
  Birthday: Date
}*/
app.put("/users/:Username",
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], 
  passport.authenticate("jwt", { session: false }), 
  (req, res) => {
      // check the validation object for errors
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users
    .findOneAndUpdate({Username: req.params.Username}, { 
      $set:
      {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    {new: true}, // make sure that the updated document is returned
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    });
  }
);

// Create: Add movie to a user"s list of favorite movies 
app.post("/users/:Username/movies/:addMovieID",  passport.authenticate("jwt", { session: false }), (req, res) => {
  Users
  .findOneAndUpdate(
    {Username: req.params.Username}, 
    {$addToSet: {FavoriteMovies: req.params.addMovieID}
  },
  {new: true}, // make sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Delete: Remove movie from a user"s list of favorite movies 
app.delete("/Users/:Username/Movies/:removeMovieID",  passport.authenticate("jwt", { session: false }), (req, res) => {
  Users
  .findOneAndUpdate(
    {Username: req.params.Username}, 
    {$pull: {FavoriteMovies: req.params.removeMovieID} },
    {new: true}, 
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  );
});

// Delete: Remove user 
app.delete("/users/:Username",  passport.authenticate("jwt", { session: false }), (req, res) => {
  Users
  .findOneAndRemove({ Username: req.params.Username })
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params.Username + " was not found");
    } else {
      res.status(200).send(req.params.Username + " was deleted.");
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

// --------------- other ---------------------------

// Create an error-handling middleware function that will log all application-level errors to the terminal
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  });

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0",() => {
  console.log("Listening on Port " + port);
});

