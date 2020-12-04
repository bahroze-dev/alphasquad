var express = require("express");
var router = express.Router();
var user= require('../model/userModel.js');




module.exports = function(passport){
    //login
    
    router.post('/login' ,(req,res)=>{
        passport.authenticate('local-login', function(err, user, info){
            var token;
            // If Passport throws/catches an error
            if (err) {
              console.log(err)
              res.status(404).json(err);
              return;
            }
            
            // If a user is found
            if(user){
              
              token = user.generateJwt();
              expireTime = user.getExpireTime();
              res.status(200);
              res.json({
                "token" : token,
                "expiresAt" : expireTime,
              });
            } else {
              // console.log(user);
              //  console.log("here");
              // If user is not found
              res.status(401).json({"loginError":"true"});
            }
          })(req, res);
        

    });

    //signup    
    router.post('/signup',(req,res)=>{
        bodyData = req.body;
        console.log(bodyData)
        user.find({username:bodyData.userName},(err,result)=>{
            if(err) throw err;
            console.log(result);
            if(isEmpty(result)){
                var newUser = new user()
                newUser.username = bodyData.userName;
                newUser.password = bodyData.userPassword;
                newUser.save((err,user)=>{
                    console.log(user);
                    if(err) throw err;
                    else res.status(200).json({"success":"true"});
                });
                
            }else{
              res.status(200).json({"error":"user exits"});
                
            }
        });
    });
    function isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
    return router;
}

