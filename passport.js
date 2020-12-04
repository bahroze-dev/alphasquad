var localStrategy = require('passport-local').Strategy;
var User= require('./model/userModel');
const passportJWT = require("passport-jwt");

const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy   = passportJWT.Strategy;


module.exports = function(passport){
    passport.serializeUser(function(user,done)
    {
        done(null,user)
    })
    passport.deserializeUser(function(user,done)
    {
        done(null,user)

    })
    passport.use('local-login', new localStrategy(
        {
            passReqToCallback: true
        },
        function(req, username, password, done) {
            
        User.findOne({ username :  username }, function(err, user) {
            if (err){
                return done(err);
                }
            if (!user){
                return done(null, false);
            }
                

            if (password===user.password){
                
                return done(null, user);
            }
            else{
                return done(null, false);
            }

            
        });

    }));
    passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : 'loli'
    },
    function (jwtPayload, cb) {

        //find the user in db if needed
        return User.find({username:jwtPayload.username})
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    }
    ));


}