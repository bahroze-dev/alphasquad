const express = require('express')
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var passport = require('passport');
require('./passport')(passport)
var auth = require('./routes/auth')(passport);

var meetingRoutes = require("./routes/meetingRoutes.js");

var mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('./config/jwtConfig');
const http = require("http");


const app = express();
const port = 4000;
const server = http.createServer(app);
const io = require('socket.io')(server)

//
mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/alphasquad",{ useNewUrlParser: true });

//
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json({limit:"50mb"}));
app.use(bodyParser.urlencoded({extended:true,limit:"50mb"}));
app.use(jwt());
app.use(passport.initialize());
app.use(passport.session());



//routes
app.use('/auth',auth);
app.use('/meeting',passport.authenticate('jwt'), meetingRoutes);




//listening on port
server.listen(port, () => console.log(`app listening on port ${port}!`))

module.exports=app;