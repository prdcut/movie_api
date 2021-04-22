const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  mongoose = require('mongoose'),
  passport = require('passport');

  require('./passport');

const app = express();

const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/flixmeDB', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(morgan(':method :host :url :status :res[content-length] - :response-time ms'));
app.use(bodyParser.json());
app.use(express.static('public'));

let auth = require('./auth')(app);

morgan.token('host', (req, res) =>{
  return req.hostname;
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('YOU broke something!');
});

// return a list of all movies
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find()
  .then(movies => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// return data about a sinlge movie by title
app.get('/movies/:title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({Title: req.params.Title}).then((movie) => {
    res.status(201).json(movie);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// return data about a genre by name
app.get('/movies/genre/:name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({"Genre.Name": req.params.Name}).then((genre) => {
    res.status(201).json(genre.Name);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// return data about a director by name
app.get('/movies/director/:name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({"Director.Name": req.params.Name}).then((director) => {
    res.status(201).json(director.Name);
  }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// allow new users to register
app.post('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// allow users to update their user info
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true },
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// allow users to add a movie to their list of favorites
app.post('/users/:id/favorites/:Movie_ID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
    {$push: { FavoriteMovies: req.params.MovieID }},
    { new: true },
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// allow users to remove a movie form their list of favorites
app.delete('/users/:id/favorites/:Movie_ID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
    {$push: { FavoriteMovies: req.params.MovieID }},
    { new: true },
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// allow existing users to deregister
  app.delete('/users/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username }).then((user) => {
      if(!user) {
        res.status(400).send(req.params.Username + ' was not found.');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      };
    }).catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
