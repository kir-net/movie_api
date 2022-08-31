// Must be the same key used in the JWTStrategy in passport.js
const jwtSecret = "your_jwt_secret"; 

const jwt = require("jsonwebtoken"),
    passport = require("passport");

require("./passport.js"); // local passport file

/**
 * @function generateJWTToken
 * Creates a JWT token
 * @param {Object} user
 * @returns {Object} user, jwt, and token parameters
 */
let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, // username encoded in the JWT
        expiresIn: "7d",  
        algorithm: "HS256" // algorithm used to encode the JWT values 
    });
}


/**
 * @function [path]/login
 * POST: User login 
 * @param {any} router
 * @returns {Object} user with jwt 
 * @requires passport
 */ 
module.exports = (router) => {
    router.post("/login", (req, res) => {
        passport.authenticate("local", { session: false }, (error, user) => {
            if (error || !user) {
                return res.status(400).json({
                    message: "Something is not right",
                    user: user
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {res.send(error)};
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token });
            });
        })(req, res);
    });
}