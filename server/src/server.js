var util = require('./util.js');
var reverseString = util.reverseString;
var bodyParser = require('body-parser');
// Imports the express Node module.
var express = require('express');
// Creates an Express server.
var app = express();

app.use(bodyParser.text());

// Starts the server on port 3000!
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
// You run the server from `server`, so `../client/build` is `server/../client/build`.
// '..' means "go up one directory", so this translates into `client/build`!
app.use(express.static('../client/build'));