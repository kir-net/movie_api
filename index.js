// import modules
const express = require('express'),
       morgan = require('morgan'),
         uuid = require('uuid'),
   bodyParser = require('body-parser');

// Use the Morgan middleware library to log all requests
const app = express();

// log basic data
app.use(morgan('common'));

app.use(bodyParser.json());

// serve static files
app.use(express.static('public'));

// -------------------- data -----------------------------

// users data
let users = [ 
  {
    id: 1,
    name: "Alan",
    favoriteMovies: ["Winter's Bone"]
  },
  {
    id: 2,
    name: "Bess",
    favoriteMovies: ["One false move"]
  }, 
];

// movies data 
let movies = [
  { 
    "Title": 'Down by Law',
    "Year": 1986,
    "Genre": 'Independent',
    "Director": 'Jim Jarmusch'
  },
  { 
    "Title": 'One False Move',
    "Year": 1992,
    "Genre": 'Thriller',
    "Director": 'Carl Franklin' 
  },
  { 
    "Title": 'Bullets Over Broadway',
    "Year": 1994,
    "Genre": 'Black Comedy',
    "Director": 'Woody Allen'
  },
  { 
    "Title": 'Dead Man',
    "Year": 1995,
    "Genre": 'Western',
    "Director": 'Jim Jarmusch'
  },
  { 
    "Title": "I'm not there",
    "Year": 2007,
    "Genre": 'Biographical',
    "Director": 'Todd Haynes'
  },
  { 
    "Title": "Winter's Bone",
    "Year": 2010,
    "Genre": 'Independent',
    "Director": 'Debra Granik'
  }
];

// genres data
let genres = [
  {
    "Genre": 'Biographical',
    "Description": `A biographical film or biopic is a film that dramatizes the life of a non-fictional or historically-based person or people. Such films show the life of a historical person and the central character's real name is used.`
  },
  {
    "Genre": 'Black comedy',
    "Description": `The black comedy film deals with taboo subjects—including death, murder, crime, suicide, and war—in a satirical manner.`
  },
  {
    "Genre": 'Independent',
    "Description": `An independent film, independent movie, indie film, or indie movie is a feature film or short film that is produced outside the major film studio system, in addition to being produced and distributed by independent entertainment companies (or, in some cases, distributed by major companies).`
  },
  {
    "Genre": 'Thriller',
    "Description": `Thriller is a genre of fiction, having numerous, often overlapping subgenres. Thrillers are characterized and defined by the moods they elicit, giving viewers heightened feelings of suspense, excitement, surprise, anticipation and anxiety. Successful examples of thrillers are the films of Alfred Hitchcock.`
  },
  {
    "Genre": 'Western',
    "Description": `The Western is a genre of fiction and film set primarily in the latter half of the 19th century and the early 20th century in the Western United States, which is styled the "Old West" or the "Wild West".`
  }
];

// directors data
let directors = [
  {
    name: 'Woody Allen',
    birthyear: 1935,
    bio: `He began his career writing material for television in the 1950s, mainly Your Show of Shows (1950-1954) working alongside Mel Brooks, Carl Reiner, Larry Gelbart, and Neil Simon. He also published several books featuring short stories and wrote humor pieces for The New Yorker. In the early 1960s, he performed as a stand-up comedian in Greenwich Village. He released three comedy albums during the mid to late 1960s, earning a Grammy Award for Best Comedy Album nomination for his 1964 comedy album entitled simply, Woody Allen. `
  },
  {
    name: 'Carl Franklin',
    birthyear: 1949,
    bio: `Franklin is a graduate of University of California, Berkeley, and continued his education at the AFI Conservatory, where he graduated with an M.F.A. degree in directing in 1986. Franklin began his on-screen career in the film Five on the Black Hand Side in 1973. Between 1975 and 1985 Franklin was a regular cast member in four TV series. His time at AFI culminated in his master's thesis, Franklin produced a short film called Punk in 1989. `
  },
  {
    name: 'Debra Granik',
    birthyear: 1963,
    bio:'Granik was born in Cambridge, Massachusetts, to father William R. Granik and mother Brenda Granik Zusman. She grew up in the suburbs of Washington D.C. Her parents divorced in 1978. In 1985, Granik received her B.A. in political science from Brandeis University. In 1997, Granik directed her first short film, Snake Feed, as her senior thesis with the mentorship of NYU film professor Boris Frumin, who was instrumental in sharing his love of post-World War II European neorealist films.'
  },
  {
    name: 'Todd Haynes',
    birthyear: 1961,
    bio: ""
  },
  {
    name: 'Jim Jarmusch',
    birthyear: 1953,
    bio: ""
  },
  
];

// ----------------- CRUD -------------------------------

// Read: Get list of data about ALL movies
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

// Read: Get one movie, by title
app.get('/movies/:title', (req, res) => {
  const {title} = req.params;
  const movie = movies.find( movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('Sorry, no such movie.')
  }
})

// Read: get info about genre, by genre name
app.get('/genres/:genreName', (req, res) => {
  const {genreName} = req.params;
  const genre = genres.find( genre => genre.Genre === genreName).Description;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('Sorry, no such genre.')
  }
})

// Read: get info about director, by director's name
app.get('/directors/:directorsName', (req, res) => {
  const {directorsName} = req.params;
  const info = directors.find( director => director.name === directorsName)

  if (info) {
    res.status(200).json(info);
  } else {
    res.status(400).send('Sorry, no such director.')
  }
})

// Create: New user
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name){
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  }else{
    res.status(400).send('New user must have a name.')
  }
})

// Update: User info
app.put('/users/:id', (req, res) => {
  const {id} = req.params;
  const updatedUser = req.body;
 
  let user = users.find(user => user.id==id);
  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  }else{
    res.status(400).send('no such user')
  }
})

// Create: Add movie to a user's list of favorite movies 
app.put('/users/:id/:newMovie', (req, res) => {
  const{id,  newMovie} = req.params;

  let user = users.find(user => user.id == id);
  if (user) {
    user.favoriteMovies.push(newMovie);
    res.status(200).send(`${newMovie} has been added to your favorite's list.`);
  }else{
    res.status(400).send('no such user')
  }
})

// Delete: Remove movie from a user's list of favorite movies 
app.delete('/users/:id/:deleteMovie', (req, res) => {
  const{id,  deleteMovie} = req.params;

  let user = users.find(user => user.id == id);
  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== deleteMovie );
    res.status(200).send(`${deleteMovie} has been removed from your favorite's list.`);
  }else{
    res.status(400).send('no such user')
  }
})

// Delete: Remove user 
app.delete('/users/:deleteID/', (req, res) => {
  const{deleteID} = req.params;

  let user = users.find(user => user.id == deleteID);
  if (user) {
    users = users.filter( user => user.id != deleteID);
    res.status(200).send(`User ${deleteID} has been removed from database.`);
  }else{
    res.status(400).send('no such user')
  }
}) 

// --------------- other ---------------------------

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