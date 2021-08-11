const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  cors = require('cors');

const { check, validationResult } = require('express-validator');

require('./passport');

const app = express();

const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/flixmeDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(morgan(':method :host :url :status :res[content-length] - :response-time ms'));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

let auth = require('./auth')(app);

morgan.token('host', (req, res) => {
  return req.hostname;
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('YOU broke something!');
});

// return a list of all movies
/**
 * This method makes a call to the movies endpoint,
 * authenticates the user using passport and jwt
 * and returns an array of movies objects.
 * @method getMovies
 * @param {string} moviesEndpoint - https://flixme.herokuapp.com/movies
 * @param {func} passportAuthentication - Authenticates JavaScript Web Token using the passport node package.
 * @param {func} callback - Uses Movies schema to find list of movies.
 * @returns {Array} - Returns array of movie objects.
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
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
/**
 * This method makes a call to the movie title endpoint,
 * authenticates the user using passport and jwt
 * and returns a single movies object.
 * @method getMovieByTitle
 * @param {string} movieEndpoint - https://flixme.herokuapp.com/movies/:Title
 * @param {func} passportAuthentication - Authenticates JavaScript Web Token using the passport node package.
 * @param {func} callback - Uses Movies schema to find one movie by title.
 * @returns {Object} - Returns single movie object.
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title }).then((movie) => {
    res.status(201).json(movie);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// return data about a genre by name
/**
 * This method makes a call to the movie genre name endpoint,
 * authenticates the user using passport and jwt
 * and returns a genre object.
 * @method getGenreByName
 * @param {string} genreEndpoint - https://flixme.herokuapp.com/movies/genre/:Name
 * @param {func} passportAuthentication - Authenticates JavaScript Web Token using the passport node package.
 * @param {func} callback - Uses Movies schema to find genre by name.
 * @returns {Object} - Returns genre info object.
 */
app.get('/movies/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.Name }).then((genre) => {
    res.status(201).json(genre.Genre);
  })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// return data about a director by name
/**
 * This method makes a call to the movie director name endpoint,
 * authenticates the user using passport and jwt
 * and returns a director object.
 * @method getDirectorByName
 * @param {string} directorEndpoint - https://flixme.herokuapp.com/movies/director/:Name
 * @param {func} passportAuthentication - Authenticates JavaScript Web Token using the passport node package.
 * @param {func} callback - Uses Movies schema to find director by name.
 * @returns {Object} - Returns director info object.
 */
app.get('/movies/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ "Director.Name": req.params.Name }).then((director) => {
    res.status(201).json(director.Director);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// return user profile
/**
* This method makes a call to the users endpoint,
* validates the object sent through the request
* and returns a user object.
* @method addUser
* @param {string} usersEndpoint - https://flixme.herokuapp.com/users/:Username
* @param {Array} expressValidator - Validate form input using the express-validator package.
* @param {func} callback - Uses Users schema to register user.
 */
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username }).then((user) => {
    res.status(201).json(user);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// allow new users to register
/**
* This method makes a call to the users endpoint,
* validates the object sent through the request
* and creates a user object.
* @method addUser
* @param {string} usersEndpoint - https://flixme.herokuapp.com/users/:Username
* @param {Array} expressValidator - Validate form input using the express-validator package.
* @param {func} callback - Uses Users schema to register user.
 */
app.post('/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthdate: req.body.Birthdate
            })
            .then((user) => { res.status(201).json(user) })
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
/**
* Update a user's info, by username.
* @method updateUser
* @param {string} userNameEndpoint - https://flixme.herokuapp.com/users/:Username
* @param {Array} expressValidator - Validate form input using the express-validator package.
* @param {func} callback - Uses Users schema to update user's info by username.
 */
app.put('/users/:Username',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  passport.authenticate('jwt', { session: false }), (req, res) => {

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({ Username: req.params.Username }, {
      $set:
      {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
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

// allow users to add a movie to their list of favorites
/**
* This method makes a call to the user's movies endpoint,
* and pushes the movieID in the FavoriteMovies array.
* @method addToFavorites
* @param {string} userNameMoviesEndpoint - https://flixme.herokuapp.com/users/:Username/favorites/:MovieID
* @param {Array} expressValidator - Validate form input using the express-validator package.
* @param {func} callback - Uses Users schema to add movieID to list of favorite movies.
 */
app.post('/users/:Username/favorites/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
    { $push: { FavoriteMovies: req.params.MovieID } },
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
/**
 * This method makes a call to the user's movies endpoint,
 * and deletes the movieID from the FavoriteMovies array.
 * @method removeFromFavorites
 * @param {string} userNameMoviesEndpoint - https://flixme.herokuapp.com/users/:Username/favorites/:MovieID
 * @param {Array} expressValidator - Validate form input using the express-validator package.
 * @param {func} callback - Uses Users schema to remove movieID from list of favorite movies.
  */
app.delete('/users/:Username/favorites/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
    { $pull: { FavoriteMovies: req.params.MovieID } },
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
/**
 * DELETE request to delete a user by username.
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username }).then((user) => {
    if (!user) {
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
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log('Listening on Port ${port}');
});
