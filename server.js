/*Main file for server execution*/

/*Set up all the tools we need*/

/*Expressjs framework*/
var express = require('express');
var app = express();
var http = require('http');
var socketio = require('socket.io');

http = http.Server(this.app)
var socket = socketio(http);

/*TODO:Uncomment below lines after creating files*/
//var socketEvents = require('./app/socket')
//var config = require('./config/settings')

/*If not running on a server that listens on specific port, use port 7331*/
var port = process.env.PORT || 7331;

/*Database*/
var mongoose = require('mongoose');

/*Authentication for local account*/
var passport = require('passport');

/*store messages temporarily*/
var flash = require('connect-flash');

/*Http request logger middleware*/
var morgan = require('morgan');

/*Cookies and body (html) parser*/
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');

/*Variable for configuring database*/
var configDB = require('./config/database.js');

/*CORS*/
var cors = require('cors');

/*Socket events*/
/*TODO:Uncomment below line*/
//new socketEvents(socket).socketConfig();

/*Configure database and connect*/
mongoose.connect(configDB.url);

require('./config/passport')(passport); //pass passport configuration

/*set up express*/
app.use(morgan('dev'));         //Print every request to console
app.use(cookieParser());        //read Cookies
//TODO:Check if bodyParser.json() is better choice
app.use(bodyParser());          //Get data from html forms

/**/

/*Use cors*/
app.use(cors())

/*TODO:Uncomment below line*/
//new config(this.app)

app.set('view engine','ejs');   //User ejs views

app.use(session({secret: 'random'}));  //TODO:Change secret later
app.use(passport.initialize());
app.use(passport.session());          //persistent login
app.use(flash());

/*Route file*/
require('./app/routes.js')(app, passport);

/*Launch server*/
app.listen(port);
console.log('App started at port ' + port);
