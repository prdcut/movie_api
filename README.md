# flixMe API

## Overview

flixMe is an API which provides users access to information about movies, genres and directors. Users are able to register and deregister, update their user profile, and create a list of their favorite movies.

## API Documentation

For a full list of endpoints and request methods used, [check out the API documentation](https://flixme.herokuapp.com/documentation.html).

## Features

- Return a list of all movies
- Return data about a sinlge movie by title
- Return data about a genre by name
- Return data about a director by name
- Return user profile
- Allow new users to register
- Allow users to update their user info
- Allow users to add a movie to their list of favorites
- Allow users to remove a movie form their list of favorites
- Allow existing users to deregister

## Core Back-End Technologies

- MongoDB
- Express.js
- Node.js
- Mongoose
- Heroku
- NPM

## Authentication

The app uses JWT (token-based) authentication with the help of passport.js.