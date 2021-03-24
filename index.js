const express = require('express');
  morgan = require('morgan');

const app = express();

app.use(morgan('common'));

let topMovies = [
  {
    title: 'Fight Club',
    year: '1999',
    director: 'David Fincher',
    genere:'Drama',
  },
  {
    title: 'Call Me By Your Name',
    year: '2017',
    director: 'Luca Guadagnino',
    genere:'Romance',
  },
  {
    title: 'Mala Educación',
    year: '2004',
    director: 'Pedro Almodóvar',
    genere:'Drama',
  },
  {
    title: 'Freier Fall',
    year: '2013',
    director: 'Stephan Lacant',
    genere:['Romance','Drama'],
  },
  {
    title: 'Wir Kinder Vom Bahnhof Zoo',
    year: '1981',
    director: 'Uli Edel',
    genere:['Biography','Drama'],
  },
  {
    title: 'Good Bye, Lenin!',
    year: '2003',
    director: 'Wolfgang Becker',
    genere:['Comedy','Drama','Romance'],
  },
  {
    title: 'Die Welle',
    year: '2008',
    director: 'Dennis Gansel',
    genere:['Thriller','Drama'],
  },
  {
    title: 'La Piel Que Habito',
    year: '2011',
    director: 'Pedro Almodóvar',
    genere:['Thriller','Drama'],
  },
  {
    title: 'Pulp Fiction',
    year: '1994',
    director: 'Quentin Tarantino',
    genere:['Crime','Drama']
  },
  {
    title: 'The Breakfast Club',
    year: '1985',
    director: 'John Hughes',
    genere:['Comedy','Drama']
  },
];

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to the best movie collection of all times!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});


// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
