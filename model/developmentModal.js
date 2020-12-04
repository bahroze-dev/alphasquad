var mongoose = require('mongoose');

var schema = mongoose.Schema;

var developmentSchema = new schema({
    developmentRequestedBy:{
        type:String,
    },
    developmentRequestedTo:{
        type:String,
    },
    developmentStatus:{
        type:String,
    },

})





module.exports = mongoose.model('mainDevelopment',developmentSchema);