
var express = require("express");
var router = express.Router();
var contract= require('../model/contractsModel');
var user= require('../model/userModel.js');
var transaction= require('../model/transactionModal.js');


{/** market contract routes */}

router.get("/showMarketContracts",(req,res)=>{
    dataCondition = {
        contractStatus:"postedOnMarket",
        contractPostedBy:{$ne:req.user[0].username},
        contractRequestedBy:{$ne:req.user[0].username}
    };
    contract.find(dataCondition,(err,result)=>{
        if(err) throw err;
        res.status(200).send(result);
    })

})
router.post("/sendRequest",(req,res)=>{
    let contractId = req.body.id;
    contract.findOneAndUpdate({_id: contractId}, {$push: {contractRequestedBy: req.user[0].username}},(err,result)=>{
        if(err) throw err;
        res.json({clientUsername:result.contractPostedBy,devUsername:req.user[0].username})
    });
})
{/** my contract routes */}
router.post("/createContract",(req,res)=>{
    let newContract = new contract({
        contractTitle: req.body.contractTitle,
        contractPublishDate:req.body.contractPublishDate,
        contractField:req.body.contractField,
        contractDescription:req.body.contractDescription,
        contractPostedBy:req.user[0].username,
        contractAcceptedBy:"none",
        contractRequestedBy:[],
        contractStatus:"postedOnMarket",
        contractMilestones:req.body.contractMilestones,
        contractPoints:req.body.contractPoints,
        //
        contractDropReason:"",
        contractDropBy:"",
        contractDropFireCash:{
            clientFireCash:0,
            developerFireCash:0,
        }
    });
    newContract.save((err,contract)=>{
        if(err) throw err
        res.status(200).send({msg:"success"});

    })
})
router.get("/getContractRequestRecieved",(req,res)=>{
    var dataCondition={
        contractPostedBy:req.user[0].username,
        contractRequestedBy:{$ne:[]},
        $or:[{contractAcceptedBy:""},{contractAcceptedBy:"none"}],

    }
    
    contract.find(dataCondition,(err,result)=>{
        if(err) throw err;
        res.status(200).send(result);
    });
})
router.post("/updateRequestRecievedInfo",(req,res)=>{
    if(req.body.confirmId===2){
        contract.findOneAndUpdate({_id:req.body.contractId},{ $pullAll: {contractRequestedBy: [req.body.contractRequestedBy] }},(err,result)=>{
            if(err) throw err;
            res.send({msg:"success"})
            
        })
    }else if(req.body.confirmId===1){
        let updateInfo={
            contractRequestedBy:[] ,
            contractAcceptedBy: req.body.contractRequestedBy,
            contractStatus:"active"
        }
        contract.findOneAndUpdate({_id:req.body.contractId},updateInfo,(err,result)=>{
            res.send({msg:"success"}) 
        })
    }else{
        res.json({msg:"error"})
    

    }
    
})
router.get("/getContractRequestSent",(req,res)=>{
    var dataCondition={
        contractRequestedBy:req.user[0].username,
        $or:[{contractAcceptedBy:""},{contractAcceptedBy:"none"}],
    }
    contract.find(dataCondition,(err,result)=>{
        if(err) throw err;
        let dataArray=[];
        for(var i=0;i<result.length;i++){
                let data = {
                    _id : result[i]._id,
                    contractTitle:result[i].contractTitle,
                    contractDescription:result[i].contractDescription,
                    contractPostedBy:result[i].contractPostedBy,
                    contractPoints:result[i].contractPoints,
                    contractMilestones:result[i].contractMilestones,
                    contractRequestedBy:req.user[0].username,
                }
                dataArray.push(data);
            
            
        }
        res.status(200).send(dataArray);
    });  
})
router.get("/getActiveContracts",async (req,res)=>{
    var dataCondition={
        contractStatus:{$in:['active','droppedByDev','droppedByClient']},
        $or:[{contractPostedBy:req.user[0].username},{contractAcceptedBy:req.user[0].username}],    
        $and:[{contractAcceptedBy:{$ne:""}},{contractAcceptedBy:{$ne:"none"}}],
    }
    contract.find(dataCondition,async (err,result)=>{
        if(err) throw err;
       
        let dataArray=[];
        for (var i = 0; i < result.length; i++) {
            let isDeveloper,client,developer;
            if (result[i].contractPostedBy === req.user[0].username) {
                isDeveloper = false;
            } else if (result[i].contractAcceptedBy === req.user[0].username) {
                isDeveloper = true;
            }
            client = await user.find({username:result[i].contractPostedBy},async(errU,data)=>{
                return data
            })
            developer = await user.find({username:result[i].contractAcceptedBy},async(errU,data)=>{
                return data
            })

            let data = {
                _id: result[i]._id,
                contractTitle: result[i].contractTitle,
                contractDescription: result[i].contractDescription,
                contractPostedBy: result[i].contractPostedBy,
                contractPoints: result[i].contractPoints,
                contractMilestones: result[i].contractMilestones,
                contractStatus: result[i].contractStatus,
                contractAcceptedBy: result[i].contractAcceptedBy,
                contractDropReason:result[i].contractDropReason,
                contractDropBy:result[i].contractDropBy,
                contractDropFireCash:result[i].contractDropFireCash,
                clientPersonName: client[0].personName,
                developerPersonName:developer[0].personName,
                isDeveloper: isDeveloper,
            }
            dataArray.push(data);


        }
        res.status(200).send(dataArray);
    });  
})
router.post("/updateMilestoneInfo",(req,res)=>{
    let contractId = req.body.contractId;
    let newMilestones = req.body.milestones;
    let newFireCash = 0;
    for(var i = 0; i<newMilestones.length;i++){
        newFireCash = parseInt(newMilestones[i].fireCash) +parseInt(newFireCash);
    }
    contract.findOneAndUpdate({_id:contractId},{contractMilestones:newMilestones,contractPoints:newFireCash},(err,result)=>{
        if(err) throw err;
        res.status(200).send({msg:"success",fireCash:newFireCash});
    })
})
router.post("/finishContract",(req,res)=>{
    let contractId = req.body.contractId;
    let contractStatus = req.body.contractStatus;
    let contractDropFireCash = req.body.contractDropFireCash;
    let contractDropBy = req.body.contractDropBy;
    if(contractDropBy==="" || contractDropBy=== undefined){
        // that means developer finished every deliverable and working that stuff accordingly.
        contract.findOneAndUpdate({_id:contractId},{contractStatus:contractStatus},(err,result)=>{
            if(err) throw err;
            let condition = {
                username:result.contractAcceptedBy,
            }
            user.find(condition,(err,userInfo)=>{
                if(err) throw err;
                console.log(userInfo);
                
    
                let transferredFromPersonName = req.user[0].personName;
                let newTransaction = new transaction({
                    transferredFromUsername:req.user[0].username,
                    transferredToUsername:userInfo[0].username,
                    transferredFromPersonName:transferredFromPersonName,
                    transferredToPersonName:userInfo[0].personName,
                    pointsTransferred:result.contractPoints,
                    transactionDate:new Date().toLocaleString(),
                    transactionStatus:"Completed",
                    accountNumber:"none",
                    easyPaisaId:"none",
                });
                newTransaction.save((err,savedInfo)=>{
                    let devWallet = parseInt(userInfo[0].wallet) + parseInt(result.contractPoints);
                    let clientWallet = parseInt(req.user[0].wallet) - parseInt(result.contractPoints);
                    if(err) throw err;
                    user.findOneAndUpdate({username:req.user[0].username},{wallet:clientWallet},{new:true},(errU,data)=>{
                        if(errU) throw errU;
    
                    });
                    user.findOneAndUpdate({username:userInfo[0].username},{wallet:devWallet},{new:true},(errU,data)=>{
                        if(errU) throw errU;
    
                    })
                    res.json({devUsername:userInfo[0].username,clientUsername:req.user[0].username});
                })
            })
            
        });
    }
    if(contractDropBy==="developer" || contractDropBy==="client"){
        let fireCashToAdd;
        if(contractDropBy==="client"){
            fireCashToAdd = parseInt(contractDropFireCash.clientFireCash);
        }else if(contractDropBy==="developer"){
            fireCashToAdd = parseInt(contractDropFireCash.developerFireCash);
        }
        contract.findOneAndUpdate({_id:contractId},{contractStatus:contractStatus},(err,result)=>{
            if(err) throw err;
            let condition = {
                username:result.contractAcceptedBy,
            }
            user.find(condition,(err,devInfo)=>{
                if(err) throw err;
                user.find({username:result.contractPostedBy},(errr,clientInfo)=>{
                    let newTransaction = new transaction({
                        transferredFromUsername: clientInfo[0].username,
                        transferredFromPersonName: clientInfo[0].personName,
                        transferredToUsername: devInfo[0].username,
                        transferredToPersonName: devInfo[0].personName,
                        pointsTransferred: fireCashToAdd,
                        transactionDate: new Date().toLocaleString(),
                        transactionStatus: "Completed",
                        accountNumber: "none",
                        easyPaisaId: "none",
                    });
                    newTransaction.save((err, savedInfo) => {
                        let devWallet = parseInt(devInfo[0].wallet) + parseInt(fireCashToAdd);
                        let clientWallet = parseInt(clientInfo[0].wallet) - parseInt(fireCashToAdd);
                        if (err) throw err;
                        // updating client wallet
                        user.findOneAndUpdate({ username: clientInfo[0].username }, { wallet: clientWallet }, { new: true }, (errU, data) => {
                            if (errU) throw errU;
                        });
                        //updating developer wallet
                        user.findOneAndUpdate({ username: devInfo[0].username }, { wallet: devWallet }, { new: true }, (errU, data) => {
                            if (errU) throw errU;

                        });
                        console.log(devWallet,clientWallet)
                        res.json({ devUsername: devInfo[0].username, clientUsername: clientInfo[0].username });
                    })
                })
                
            })
            
        });

    }
    


});
router.post("/disputeContract",(req,res)=>{
    let contractId = req.body.contractId;
    let contractStatus = req.body.contractStatus;
        contract.findOneAndUpdate({_id:contractId},{contractStatus:contractStatus},(err,result)=>{
            if(err) throw err;
            res.send({msg:"contract set to dispute"});
            
        });

});
// update contract info is used for dropping contract
router.post("/updateContractInfo",(req,res)=>{
    let recievedData = req.body;
    updateInfo = {
        contractStatus: recievedData.contractStatus,
        contractDropFireCash : recievedData.contractDropFireCash,
        contractDropBy : recievedData.contractDropBy,
        contractDropReason : recievedData.contractDropReason,
    }
    contract.findOneAndUpdate({_id:recievedData.contractId},updateInfo,(err,result)=>{
        if(err) throw err;
        res.json({msg:"success"})
    })
})
router.get("/getNonActiveContracts",async (req,res)=>{
    var dataCondition={
        contractStatus:{$in:['completed','disputed']},
        $or:[{contractPostedBy:req.user[0].username},{contractAcceptedBy:req.user[0].username}],    
    }
    contract.find(dataCondition,async (err,result)=>{
        if(err) throw err;
        let dataArray=[];
        for(var i=0;i<result.length;i++){
                let contractUserDisplay = result[i].contractPostedBy;
                let userData,personName;
                userData = await user.find({username:contractUserDisplay},(inErr,userData)=>{
                    if(inErr) throw err;
                    return userData
                    
                })
                personName = userData[0].personName;
                
                let data = {
                    _id : result[i]._id,
                    contractTitle:result[i].contractTitle,
                    contractDescription:result[i].contractDescription,
                    contractPostedBy:result[i].contractPostedBy,
                    contractPoints:result[i].contractPoints,
                    contractMilestones:result[i].contractMilestones,
                    contractStatus:result[i].contractStatus,
                    contractAcceptedBy:result[i].contractAcceptedBy,
                    contractUserDisplay: personName,
                }
                dataArray.push(data);
            
            
        }
        res.status(200).send(dataArray);
    });
})
router.get("/getMyContracts",(req,res)=>{
    dataCondition = {
        contractStatus:"postedOnMarket",
        contractPostedBy:req.user[0].username,
        contractRequestedBy:{$ne:req.user[0].username}
    };
    contract.find(dataCondition,(err,result)=>{
        if(err) throw err;
        res.status(200).send(result);
    })

})
router.post("/removeContract",(req,res)=>{
    contract.findOneAndRemove({_id:req.body.contractId},(err,result)=>{
        if(err) throw err;
        res.json({msg:"success"});
    })
})





module.exports = router;