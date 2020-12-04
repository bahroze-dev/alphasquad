var mongoose = require('mongoose');

var schema = mongoose.Schema;

var meetingSchema = new schema({
    title:{
        type:String,
    },
    agenda:{
        type:String,
    },
    scheduledAt:{
        type:String,
    },
    timestamps:{
        type:String,
    },
    meetingUrl:{
        type:String,
    }
    

})





module.exports = mongoose.model('meetings',meetingSchema);