// import modules
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

// log basic data
app.use(morgan("common"));

// serve static files
app.use(express.static("public"));

// connect to database
mongoose.connect("mongodb://localhost:27017/myFlixDB", { useNewUrlParser: true, useUnifiedTopology: true });



// ----------------- CRUD -------------------------------

//default text response when at /
app.get("/",  
  passport.authenticate("jwt", { session: false }), 
  (req, res) => {
    res.send("Welcome to my app!");
  }
);

// OK Read: Get list of data about ALL movies
app.get("/movies",  
  passport.authenticate("jwt", { session: false }),
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
app.post("/users", 
  (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users
    // see if the requested username already exists
    .findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email:    req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send("Error: " + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
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
  passport.authenticate("jwt", { session: false }), 
  (req, res) => {
    Users
    .findOneAndUpdate({Username: req.params.Username}, { 
      $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
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
});

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

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});