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
// app.use(cors());


let allowedOrigins = [
    'http://localhost:8080', 
    'http://localhost:4200',
    'http://testsite.com', 
    'http://localhost:1234', 
    'https://kirnetsmoviesapp.netlify.app/',
    'https://myflix-client-abc.netlify.app',
    'https://kir-net.github.io',
];


app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
            let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));


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

// DB CONNECTION OPTIONS:
// connect to local database
// mongoose.connect("mongodb://localhost:27017/myFlixDB", { useNewUrlParser: true, useUnifiedTopology: true });
// connect to online database
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// ----------------- CRUD -------------------------------

//default text response when at /
/**
 * Redirects to index.html
 * @param {express.request} req
 * @param {express.response} res
 */
app.get("/",  
    (req, res) => {res.send("Welcome to my app!")}
);

/**
 * @function [path]/movies/
 * GET: Get list of data about ALL movies
 * @returns {Object[]} movies
 * @requires passport
 */
app.get("/movies",  
    passport.authenticate("jwt", { session: false }),
    (req, res)  => {
        Movies
        .find()
        .then((movies) => {res.status(201).json(movies)})
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
    }
);

/**
 * @function [path]/movies/:Title
 * GET: Get one movie by title
 * @param {any} Title
 * @returns {Object} movie
 * @requires passport
 */
app.get("/movies/:Title",  
    passport.authenticate("jwt", { session: false }), 
    (req, res) => {
        Movies
        .findOne({Title: req.params.Title})
        .then((movie) => {res.json(movie)})
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
    }
);

/**
 * @function [path]/genres/:genreName
 * GET: get data about a single genre by Genre Name
 * @param {any} genreName
 * @returns {Object} genre
 * @requires passport
 */
app.get("/movies/genres/:genreName",  
    passport.authenticate("jwt", { session: false }), 
    (req, res) => {
        Movies
        .findOne({"Genre.Name": req.params.genreName})
        .then((theFoundMovie) => {
            res.status(201).json(theFoundMovie.Genre.Description);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
    }
);

/**
 * @function [path]/movies/directors/:directorName
 * GET: get info about a director by name
 * @param Name (of director)
 * @returns {Object} director
 * @requires passport
 */
app.get("/movies/directors/:directorsName",  
    passport.authenticate("jwt", { session: false }), 
    (req, res) => {
        Movies
        .findOne({"Director.Name": req.params.directorsName})
        .then((theFoundMovie) => {
            res.status(201).json(theFoundMovie.Director.Bio);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
    }
);


// 
/**
 * @function [path]/users/
 * GET: Read information about all users
 * @returns {Object[]} users
 */
app.get("/users",  
    passport.authenticate("jwt", { session: false }), 
    (req, res) => {
        Users
        .find()
        .then((users) => {res.status(201).json(users)})
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
    }
);


/**
 * @function [path]/users/:username
 * GET: Return data on one user by username
 * @param {string} username
 * @returns {Object} user
 * @requires passport
 */
app.get("/users/:Username",  
    passport.authenticate("jwt", { session: false }), 
    (req, res) => {
        Users
        .findOne({Username: req.params.Username})
        .then((user) => {res.json(user)})
        .catch((err) =>  {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
    }
);


/**
 * Password is hashed
 * @function [path]/users/
 * POST: Create new user
 * @param {JSON} data from registration form
 * @returns user object
 */
app.post('/users',
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
    }
);


/**
 * @function [path]/users/:username/update
 * PUT: Allow users to update their user data
 * @param {string} Username
 * @returns {Object} user - with new informations
 * @requires passport
 */
app.put("/users/:Username",
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required.').not().isEmpty(),
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
/**
 * @function [path]/users/:username/movies/:movieID
 * POST: Allow users to add a movie to their list of favorites
 * @param {any} movieID
 * @requires passport
 */ 
app.post("/users/:Username/movies/:MovieID",  passport.authenticate("jwt", { session: false }), (req, res) => {
    Users
    .findOneAndUpdate(
        {Username: req.params.Username}, 
        {$addToSet: {FavoriteMovies: req.params.MovieID}
    },
    {new: true}, 
    // make sure that the updated document is returned
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error: " + err);
        } else {
            res.json(updatedUser);
        }
    });
});


/** 
 * @function [path]/users/:Username/Movies/:MovieID
 * DELETE: Remove movie from a user"s list of favorite movies
 * @param {any} movieID
 * @requires passport
 */
app.delete("/Users/:Username/Movies/:MovieID",  passport.authenticate("jwt", { session: false }), (req, res) => {
    Users
    .findOneAndUpdate(
        {Username: req.params.Username}, 
        {$pull: {FavoriteMovies: req.params.MovieID} },
        {new: true}, 
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send("Error: " + err);
            } else {
                res.json(updatedUser)
            }
        }
    );
});

 
/**
 * @function [path]/users/
 * DELETE: Remove a user by username
 * @param {string} Username
 * @requires passport
 */
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
 
/**
 * Error handler: log application-level errors to the terminal
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  });

/**
 * Run the server on the specified port
 * @function app.listen
 * @param {number} port
 */
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0",() => {
  console.log("Listening on Port " + port);
});

