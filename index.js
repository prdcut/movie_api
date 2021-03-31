const express = require('express');
  morgan = require('morgan');
  bodyParser = require('body-parser');
  uuid = require('uuid');

const app = express();

// In-Memory data
let topMovies = [
  {
    title: 'Fight Club',
    year: '1999',
    director: 'David Fincher',
    genre:'Drama',
  },
  {
    title: 'Call Me By Your Name',
    year: '2017',
    director: 'Luca Guadagnino',
    genre:'Romance',
  },
  {
    title: 'Mala Educación',
    year: '2004',
    director: 'Pedro Almodóvar',
    genre:'Drama',
  },
  {
    title: 'Freier Fall',
    year: '2013',
    director: 'Stephan Lacant',
    genre:['Romance','Drama'],
  },
  {
    title: 'Wir Kinder Vom Bahnhof Zoo',
    year: '1981',
    director: 'Uli Edel',
    genre:['Biography','Drama'],
  },
  {
    title: 'Good Bye, Lenin!',
    year: '2003',
    director: 'Wolfgang Becker',
    genre:['Comedy','Drama','Romance'],
  },
  {
    title: 'Die Welle',
    year: '2008',
    director: 'Dennis Gansel',
    genre:['Thriller','Drama'],
  },
  {
    title: 'La Piel Que Habito',
    year: '2011',
    director: 'Pedro Almodóvar',
    genre:['Thriller','Drama'],
  },
  {
    title: 'Pulp Fiction',
    year: '1994',
    director: 'Quentin Tarantino',
    genre:['Crime','Drama']
  },
  {
    title: 'The Breakfast Club',
    year: '1985',
    director: 'John Hughes',
    genre:['Comedy','Drama']
  },
];

app.use(morgan(':method :host :url :status :res[content-length] - :response-time ms'));
app.use(bodyParser.json());
app.use(express.static('public'));

morgan.token('host', (req, res) =>{
  return req.hostname;
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('YOU broke something!');
});

// GET requests
app.get('/movies', (req, res, next) => {
  res.send(topMovies);
});

app.get('/movies/:title', (req, res) => {
    let title = req.params.title;

    let reqMovie = topMovies.find((movie) => {
      return movie.title === title;
    })
    if (reqMovie){
      res.send(reqMovie);
    }else{
      res.status(404).send('Movie not found!');
    }
});

app.get('/movies/:title/genre',(req, res) => {
  res.send('This movie is: ');
});

app.get('movies/:title/director', (req, res) => {
  res.send('Director is being fetched.');
});

//POST request
app.post('/users', (req, res) => {
  res.send('Registration successful.');
});

app.post('/users/:id/favourites/:movie_id', (req, res) => {
  res.send('Movie has been added.');
});

//PUT requests
app.put('/movies', (req, res) => {
  res.send('Movie has been added.');
});

app.put('/users/:username', (req, res) => {
  res.send('User information has been updated.')
});

//DELETE requests
app.delete('/movies', (req, res) => {
  res.send('Movie has been removed.')
});

app.delete('/users', (req, res) =>{
  res.send('User has been removed.')
});

//Listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
