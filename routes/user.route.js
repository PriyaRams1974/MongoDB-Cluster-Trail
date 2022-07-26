const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
require('dotenv').config();
const UserSchema = require('../models/user.model');


// imported schema
    router.post('/signUp', async(req,res)=>{

    try {
        const username = req.body.username;
        const email = req.body.email;
        const mobileNumber = req.body.mobileNumber;
        
        if(username){

            if(username.search(/\d/)==-1){
                return res.json({status:"Failure",message:'username must contain atleast one number'})
        }else if(username.search(/^[A-Za-z0-9]+$/)){
                return res.json({status:"Failure",message:'username must not contain any special character'})
        }else if(username.search(/[a-zA-Z]/)==-1){
                return res.json({status:"Failure",message:'username must contain atleast one alphabet character'})
            }
            let usernameDetail = await UserSchema.findOne({'username': username}).exec()
            if(usernameDetail){
                return res.json({status: "failure", message: 'username already exist'})
            }
        }else{
            return res.status(400).json({status: "failure", message: 'Username not found'})
        }

        if(mobileNumber){
            let usermobileNumberDetail = await UserSchema.findOne({'mobileNumber': mobileNumber}).exec()
            if(usermobileNumberDetail){
                return res.json({status: "failure", message: 'mobileNumber already exist'})
            }
        }else{
            return res.status(400).json({status: "failure", message: 'Must attach the mobileNumber'})
        }

        if(email){
            let useremailDetail = await UserSchema.findOne({'email': email}).exec()
            if(useremailDetail){
                return res.json({status: "failure", message: 'email already exist'})
            }
        }else{
            return res.status(400).json({status: "failure", message: 'Must attach the email'})
        }

        let user = new UserSchema(req.body);
        console.log("before hashing")
        console.log(user.password);
        if(req.body.password){
            let password = req.body.password;
            let salt = await bcrypt.genSalt(10);
            user.password = bcrypt.hashSync(password, salt);
            console.log("after hashing")
            console.log(user.password);
        }  
        var result = await user.save();
        return res.status(200).json({status: "success", message: "user details added successfully", data: result})    
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({status: "failure", message: error.message})
    }
});

// login
    router.post('/login', async(req,res)=>{

    try {
        let email = req.body.email;
        let password = req.body.password;
        let userDetails;
        let userDetails1 = await UserSchema.findOne({email: email}).select('-password -_id').exec()
        console.log(userDetails1)
        if(email){
            userDetails = await UserSchema.findOne({email: email}).exec()
            if(!userDetails){
                return res.status(400).json({status: "failure", message: "please signup first"});
            }
        }else{
            return res.status(400).json({status: "failure", message: "Please enter the username"})
        }
        if(userDetails){
            let isMatch = await bcrypt.compare(password, userDetails.password)
            if(userDetails.loginStatus !== true){
               await UserSchema.findOneAndUpdate({uuid: userDetails.uuid}, {loginStatus: true}, {new:true}).exec();
            }
            let payload = {uuid: userDetails.uuid, role: userDetails.role}
           
            if(isMatch){
                var userData = userDetails1.toObject()
                console.log(userData);
                let jwttoken = jwt.sign(payload, process.env.secrectKey)
                userData.jwttoken = jwttoken
                console.log(userData);
                return res.status(200).json({status: "success", message: "Login successfully", data: userData})
            }else{
                return res.status(200).json({status: "failure", message: "Login failed"})
            }
        }
    
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({status: "failure", message: error.message})
    }

})

// logout
router.post("/logout/:email", async(req,res)=>{
    try {
    await UserSchema.findOneAndUpdate({email: req.params.email}, {loginStatus: false}, {new:true}).exec();
    return res.status(200).json({status: "success", message: "Logout success"})
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({status: "failure", message: error.message})
    }
})

router.get("/getAllUsers", async(req,res)=>{
    try{
        const UsersDetails = await UserSchema.find().exec();
        if(UsersDetails.length > 0){
            return res.status(200).json({'status': 'success', message: "Product details fetched successfully", 'result': UsersDetails});
        }else{
            return res.status(404).json({'status': 'failure', message: "No Item details available"})
        }
    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});

module.exports = router;