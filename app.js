const express = require('express')
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var passport = require('passport');
require('./passport')(passport)
var auth = require('./routes/auth')(passport);
var users = require("./routes/users.js");
// var contracts = require("./routes/contracts.js");
// var transactions = require("./routes/transactions.js");
// var developments = require("./routes/development.js");
// var messages = require("./routes/messageRoutes");
// var adminRoutes = require("./routes/adminRoutes.js");
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
// app.use(jwt());
app.use(passport.initialize());
app.use(passport.session());
// app.use("/uploads",express.static("uploads"));

// const socketOps = require('./socketOps/socketOps.js')
// socketOps.allSocketOps(io)


//routes
app.use('/auth',auth);
app.use('/meeting',passport.authenticate('jwt'), meetingRoutes);


// app.use('/users',passport.authenticate('jwt'), users);

// app.use('/contracts',passport.authenticate('jwt'), contracts);
// app.use('/transactions',passport.authenticate('jwt'), transactions);
// app.use('/developments',passport.authenticate('jwt'), developments);
// app.use('/messages',passport.authenticate('jwt'),messages)
// app.use('/admin',passport.authenticate('jwt'), adminRoutes);



//listening on port
server.listen(port, () => console.log(`app listening on port ${port}!`))

module.exports=app;