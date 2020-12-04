var express = require("express");
var router = express.Router();
var transaction= require('../model/transactionModal.js');
var user= require('../model/userModel.js');
var contract= require('../model/contractsModel');

router.get("/getMTRequestData", async (req,res)=>{
    let buyReqData = await transaction.find({transferredToUsername:"admin",transactionStatus:"Pending",},async(err,result)=>{
        if(err) throw err;
        return result;
    });
    let cashoutReqData = await transaction.find({transferredFromUsername:"admin",transactionStatus:"Pending",},async(err,result)=>{
        if(err) throw err;
        return result;
    })
    let approveCondition = {
        $or:[{transferredFromUsername:"admin"},{transferredToUsername:"admin"}],
        $or:[{transactionStatus:"Completed"},{transactionStatus:"Rejected"}],
    }
    let approvedTransaction =  await transaction.find(approveCondition,async(err,result)=>{
        if(err) throw err;
        return result;
    });
    let data={
        buyReqData:buyReqData,
        cashoutReqData:cashoutReqData,
        approvedTransaction:approvedTransaction,
    }
    res.status(200).send(data);
});
router.get("/getAllUsers",(req,res)=>{
    user.find({userType:"client"},{username:1,email:1,personName:1,currentContracts:1,finishedContracts:1,wallet:1,accountStatus:1},(err,result)=>{
        if(err) throw err;
        res.status(200).send(result);
    });
})
router.post("/updateAccStatus",(req,res)=>{
    user.findOneAndUpdate({username:req.body.username},{accountStatus:req.body.accountStatus},(err,result)=>{
        if(err) throw err;
        res.status(200).send({"msg":"success"});
    })
})
router.post("/updateFirecash",(req,res)=>{
    user.find({username:req.body.username},(err,result)=>{
        if(err) throw err;
        let cwallet = result[0].wallet;
        if(req.body.action==="add"){
            cwallet = parseInt(cwallet) + parseInt(req.body.wallet)
        }else if(req.body.action==="remove"){
            cwallet = parseInt(cwallet) - parseInt(req.body.wallet)
        }
        user.findOneAndUpdate({username:req.body.username},{wallet:cwallet},(errI,data)=>{
            res.json({"msg":"success"})
        })
    })
})
router.get("/getUser/:username",(req,res)=>{
    user.find({username:req.params.username},(err,data)=>{
        res.send(data);
    })
})
router.post("/updateTransaction",(req,res)=>{
    transaction.findOneAndUpdate({_id:req.body.transactionId},{transactionStatus:req.body.transactionStatus},(err,result)=>{
        if(err) throw err;
        if(req.body.reqType==="buy" && req.body.transactionStatus==="Completed"){
            user.find({username:result.transferredFromUsername},(errU,userData)=>{
                let cwallet = userData[0].wallet;
                cwallet = parseInt(cwallet) + parseInt(result.pointsTransferred);
                user.findOneAndUpdate({username:userData[0].username},{wallet:cwallet},(errC,updated)=>{
                    res.json({"msg":"success"})
                })
            })
        }
        if(req.body.reqType==="cashout" && req.body.transactionStatus==="Completed"){
            user.find({username:result.transferredToUsername},(errU,userData)=>{
                let cwallet = userData[0].wallet;
                cwallet = parseInt(cwallet) - parseInt(result.pointsTransferred);
                user.findOneAndUpdate({username:userData[0].username},{wallet:cwallet},(errC,updated)=>{
                    res.json({"msg":"success"})
                })
            })
        }
    })
})
router.get("/getContractData",async (req,res)=>{
    let onGoingContracts = await contract.find({contractStatus:"active"},async(err,result)=>{
        if(err) throw err;
        return result;
    })
    let completedContracts = await contract.find({contractStatus:"completed"},async(err,result)=>{
        if(err) throw err;
        return result;
    })
    let pendingContracts = await contract.find({contractStatus:"postedOnMarket"},async(err,result)=>{
        if(err) throw err;
        return result;
    })
    res.send({
        onGoingContracts:onGoingContracts,        
        completedContracts:completedContracts, 
        pendingContracts:pendingContracts,
    });
})
router.get("/getDisputeData",async(req,res)=>{
    contract.find({contractStatus:"disputed"},async(err,result)=>{
        if(err) throw err;
        let userEmails =[];
        for(let i=0;i<result.length;i++){
            let clientInfo = await user.find({username:result[i].contractPostedBy},(err,data)=>{
                return data
            });
            let devInfo = await user.find({username:result[i].contractAcceptedBy},(err,data)=>{
                return data
            });
            userEmails.push({
                clientEmail:clientInfo[0].email,
                developerEmail:devInfo[0].email,
            })
            
        }
        console.log(userEmails);
        res.send({disputedContracts:result,userEmails:userEmails});
    });
})
router.post("/finishDispute",(req,res)=>{
    let contractId = req.body.contractId;
    let contractStatus = req.body.contractStatus;
    contract.findOneAndUpdate({_id:contractId},{contractStatus:contractStatus},(err,result)=>{
        if(err) throw err;
        res.send({msg:"success"});
    })
})




module.exports = router