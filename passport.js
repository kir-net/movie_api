const passport = require('passport'),
    // LocalStrategy uses Mongoose to check the database for 
    //   the submitted username; does NOT check the password
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require(passport-jwt);

let Users = Models.User,
JWTStrategy = passportJWT.STrategy,
ExtractJWT = passportJWT.Extract;


passport.use(new LocalStrategy({
        usernameField: 'Username',
        passwordField: 'Password'
    }, 
    (username, password, callback) => {
        console.log(username + '  ' + password);
        Users.findOne({ Username: username }, (error, user) => {
        if (error) {
            console.log(error);
            return callback(error);
        }
        if (!user) {
            console.log('incorrect username');
            return callback(null, false, {message: 'Incorrect username or password.'});
        } 
        console.log('finished');
        return callback(null, user);
        });
    })
);


passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'your_jwt_secret'
    }, 
    (jwtPayload, callback) => {
        return Users.findById(jwtPayload._id)
        .then((user) => {
            return callback(null, user);
        })
        .catch((error) => {
            return callback(error)
        });
    })
);