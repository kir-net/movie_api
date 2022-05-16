// import modules
const express = require('express'),
    morgan = require('morgan');

// Use the Morgan middleware library to log all requests
const app = express();

// log basic data
app.use(morgan('common'));

// serve static files
app.use(express.static('public'));

// Using the Express routing syntax, create an Express GET route located at the endpoint “/movies” that returns a JSON object containing data about your top 10 movies
app.get('/movies', (req, res) => {
    res.json(topMovies);
})

//Create another GET route located at the endpoint “/” that returns a default textual response of your choosing
app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});

// Create an error-handling middleware function that will log all application-level errors to the terminal
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});