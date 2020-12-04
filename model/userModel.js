var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var expireTime;

var schema = mongoose.Schema;

var userSchema = new schema({
    username:{
        type:String
    },
    password:{
        type:String
    },

})

userSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    expireTime = parseInt(expiry.getTime() / 1000);
    return jwt.sign({username:this.username}, "loli",{
        expiresIn:expireTime,
    }); 
  };
  userSchema.methods.getExpireTime = function() {
    return expireTime;
  };



module.exports = mongoose.model('mainUsers',userSchema);