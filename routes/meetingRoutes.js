
var express = require("express");
var router = express.Router();
var meeting= require('../model/meetingModel.js');
const request = require("request");


//zoom

const jwt = require('jsonwebtoken'); // npm package link here
let ZOOM_API_KEY = "oqpc2oahRwecY2ZntyQpxA"
let ZOOM_SECRET = "ZIulIIKsImwl7l4VMbBjC1yFgD8uqAr6yZ7b"
const token = jwt.sign({ 
  "iss": ZOOM_API_KEY,
  "exp": 1496091964000
}, ZOOM_SECRET);







router.get("/get",(req,res)=>{
    console.log("erer");
    meeting.find({},(err,result)=>{
        if (err) throw err
        res.status(200).send(result);
    })


    
})

router.post("/createMeeting",(req,res)=>{
    let newMeeting = new meeting({
        title: req.body.title,
        agenda:req.body.agenda,
        scheduledAt:req.body.scheduledAt,
        timestamps:req.body.timestamps,
        
    });

    
    const options = {
        method: 'POST',
        url: 'https://api.zoom.us/v2/users/GgB8KPhaTMyjmSJrgQaKvA/meetings',
        headers: {'content-type': 'application/json', authorization: `Bearer ${token}`}, 
        body: {
        topic: 'Demo Meeting 2',
        type: 2,
        start_time: req.body.scheduledAt, // "2021-03-31T12:02:00Z format" provided scheduled at here scheduledAt
        password: 'Hey123',
        agenda: 'This is the meeting description',
        settings: {
            host_video: false,
            participant_video: false,
            join_before_host: false,
            mute_upon_entry: true,
            use_pmi: false,
            approval_type: 0
        }
        },
        json: true
    };
    
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(body.join_url);
        meetingUrl = body.join_url;
        newMeeting.meetingUrl = meetingUrl
        newMeeting.save((err,results)=>{
            if(err) throw err
            res.status(200).send({results});
    
        })

    });

   

})
router.post("/updateMeeting",(req,res)=>{
    let meetingId = req.body.meetingid;
    let updatedValues = {
        title: req.body.title,
        agenda:req.body.agenda,
        scheduledAt:req.body.scheduledAt,
        timestamps:req.body.timestamps,
        meetingUrl : req.body.meetingUrl
    }


    newValue = req.body;
    meeting.findOneAndUpdate({"_id":meetingId},updatedValues,{new:true},function(err,result){
        if(err) throw err;
        res.status(200).send(result);    
    })
})

router.post("/deleteMeeting",(req,res)=>{
    let meetingId = req.body.meetingid;
    contract.findOneAndRemove({"_id":meetingId},(err,result)=>{
        if(err) throw err;
        res.json({msg:"success"});
    })
})




module.exports = router;