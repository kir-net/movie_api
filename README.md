# MyFlix API

MyFlix API is the server-side component of a small “movies” web application. It provides users with access to information about different movies, directors, and genres. Users may sign up, update their personal information, and create a list of their favorite movies.

## API documentation
For a list of endpoints and responses check out the [documentation](./public/documentation.html) file

## Project details
The project has been developed as an assignment of the CareerFoundry Full Stack Web Developer course.

## Features
- Return a list of ALL movies to the user
- Return data (description, genre, director, image URL, whether it’s featured or not) about a
single movie by title to the user
- Return data about a genre (description) by name/title (e.g., “Thriller”)
- Return data about a director (bio, birth year, death year) by name
- Allow new users to register
- Allow users to update their user info (username, password, email)
- Allow users to add a movie to their list of favorites
- Allow users to remove a movie from their list of favorites
- Allow existing users to deregister

## Tech stack
Built with the MERN tech stack:
- MongoDB 
- Express
- React 
- Node


## Dependencies:
- "bcrypt": "^5.0.1",
- "body-parser": "^1.20.0",
- "cors": "^2.8.5",
- "dotenv": "^16.0.1",
- "express": "^4.18.1",
- "express-validator": "^6.14.1",
- "jsonwebtoken": "^8.5.1",
- "mongoose": "^6.3.5",
- "morgan": "^1.10.0",
- "passport": "^0.6.0",
- "passport-jwt": "^4.0.0",
- "passport-local": "^1.0.0"

