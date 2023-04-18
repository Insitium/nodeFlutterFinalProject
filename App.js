
// Setting up server
var express = require("express");
var parserBody = require('body-parser');
var http_port = process.env.PORT || 8080
require("dotenv").config();
const mongodb = require("mongoose")
const cors = require('cors');
const { connectDB, disconnectDB } = require('./database');
var jwt = require("jsonwebtoken");


var app = express();


// set body parser
app.use(parserBody.urlencoded({extended:false}));
app.use(parserBody.json({limit: '150mb'}))
app.use(express.static("views"));
app.use(express.static("public"))
app.use(cors({origin: true, credentials: true}));

// start server helper method
function onStartingServer(){
    console.log("The server is listenibng on the port: "+http_port);
}

// number validation
function containsOnlyNumbers(str) {
    return /^\d+$/.test(str);
}

const clientSessions = require("client-sessions");
app.use(
    clientSessions({
      cookieName: "session",
      secret: "node-react-project",
      duration: 30 * 60 * 2000,
      activeDuration: 2000 * 60*10
    })
  );


//data models
const patientModel = require("./models/PatientModel.js")
const RecordModel = require("./models/RecordModel.js")
const LoginregisterModel = require("./models/LoginRegisterModel")
const { on } = require("events");

//connecting to the db using the link in env file
connectDB();

//register post request
app.post("/signup",(req,res)=>{
    console.log('/signup METHOD: POST')
    var newSignup = new LoginregisterModel({
        username: req.body.username,
        nurseName: req.body.nurseName,
        nurseNumber: req.body.nurseNumber,
        password: req.body.password
    })
    if(req.body.username == "" || req.body.username == undefined){
        res.send({
            "success" : "false",
            "message" : "username is required"
        })
    }
    if(req.body.nurseName == "" || req.body.nurseName == undefined){
        res.send({
            "success" : "false",
            "message" : "nurse Name is required"
        })
    }
    if(req.body.nurseNumber == "" || req.body.nurseNumber == undefined || !containsOnlyNumbers(req.body.nurseNumber)){
        res.send({
            "success" : "false",
            "message" : "nurse Number is required"
        })
    }
    
    if(req.body.password == "" || req.body.password == undefined){
        res.send({
            "success" : "false",
            "message" : "password is required"
        })
    }
    try{
        newSignup.save();
        return res.send({
            "success": "true"
        })
    }catch(err){
        console.log(err)
        return res.send({
            "success": "false",
            "message": err
        })
    }
    
})
//login post request
app.post('/login',(req, res)=>{
    const username = req.body.username
    const password = req.body.password

    const usern = {name:username}
    
    const accessToken = jwt.sign(usern,process.env.ACCESS_TOEN_SECRET)
    //validating the user
    if(username == "" || username == undefined || username.length< 5){
        res.send({
            "success" : "false",
            "message" : "Please enter a valid username"
        })
    }
    if(password == "" || password == undefined || password.length< 5){
        res.send({
            "success" : "false",
            "message" : "Please enter a valid password"
        })
    }
    var checkedLogin = false
    LoginregisterModel.findOne({username : username})
    .exec()
    .then((usr)=>{
        if(!usr){
            //if user is not found
            res.send({
                "success" : "false",
                "message" : "User does not exist"
            })
        }else{
            //user esists
            if(password == usr.password){
                checkedLogin = true
                res.send({
                    accessToken:accessToken
                })
            }else{
                res.send({
                    "success" : "false",
                    "message" : "User and password does not match"
                })
            }
        }
    })

})

//login get request
app.get('/login', (req, res) => {
    res.send({
        "success" : "Success",
        "message" : "User on login page"
    })
    
});

//json web tokens 

// post patient data method
app.post("/patient",authenticatetoken,(req,res) =>{

    console.log('/patient METHOD:POST')
    var newPatient = new patientModel({
        patient_id: req.body.patientId,
        fullName: req.body.fullName,
        age: req.body.age,
        address: req.body.address,
        dob: req.body.dob,
        phoneNumber: req.body.phoneNumber,
        image: req.body.image
    });
    if(req.body.fullName == "" || req.body.fullName == undefined){
        res.status(400).send({
            "success" : "false",
            "message" : "fullName is required"
        })
    }
    if(!containsOnlyNumbers(req.body.age) || req.body.age == undefined){
        return res.status(400).send({
            "success": "false",
            "message": "invalid age or age not given"
        })
    }
    if(req.body.address=="" || req.body.address == undefined){
        return res.status(400).send({
            "success" : "false",
            "message" : "address is required"
        })
    }
    if(req.body.dob=="" || req.body.dob == undefined){
        return res.status(400).send({
            "success" : "false",
            "message" : "dob is required"
        })
    }

    if(req.body.phoneNumber =="" || req.body.phoneNumber == undefined){  
        return res.status(400).send({
            "success" : "false",
            "message" : "phonenumber is required"
        })
    }else{
        if(!containsOnlyNumbers(req.body.phoneNumber) || !((req.body.phoneNumber.length) == 10)){
            return res.status(400).send({
                "success" : "false",
                "message" : "invalid phone number"
            }) 
        }    
    }

    if(req.body.fullName != "" && containsOnlyNumbers(req.body.age) && req.body.address!=""
        && req.body.dob!="" && req.body.phoneNumber !="" && req.body.phoneNumber.length == 10 && containsOnlyNumbers(req.body.phoneNumber)) {
        try{
            newPatient.save();
            return res.status(200).send({
                "success": "true",
                "message": "Record added successfully"
            })
        }catch(err){
            console.log(err)
            return res.send({
                "success": "false",
                "message": err
            })
        }
    }
})

// find patient by id
app.get('/patient/:postId',authenticatetoken, async (req, res) => {
    try {
        const data = await patientModel.findById(req.params.postId);
        res.status(200).send({ data});
    } catch (err) {
        res.status(404).send({message: err });
   
    }
});

// delete patient by id
app.delete("/patient/:id",authenticatetoken, async (req, res) => { 
    try {
        const data = await patientModel.remove({ _id: req.params.id});
        res.status(200).send({ data});
    } catch (err) {
        res.status(404).send({message: err });
   
    }
})

// returns records belonging to a patient
app.get("/patient/record/:patientId",authenticatetoken, async (req, res) => {
    console.log('/patient/record METHOD:GET')
    try{
        const data = await RecordModel.find({patient_id: req.params.patientId})
        res.send({data});
    } catch (err){
        console.log(err)
        res.send({message: err})
    }
})

// get all patients
app.get('/patients',authenticatetoken, (req, res) => {
    let posts = patientModel.find({}, function(err, posts){
        if(err){
            console.log(err);
            res.status(404).send(err);
        }
        else {
            res.status(200).send(posts)
        }
    });
});

//post record data method
app.post("/record",authenticatetoken,(req,res)=>{

    console.log('/record METHOD:POST')
    let date = new Date() 
    var newRecord = new RecordModel({
        patient_id: req.body.patientId,
        time: date,
        bloodPressure: req.body.bloodPressure,
        respirationRate: req.body.respirationRate,
        bloodOxygen: req.body.bloodOxygen,
        heartBeat: req.body.heartBeat
    });

    if(req.body.patientId == "" || req.body.patientId == undefined || req.body.bloodPressure == "" || req.body.bloodPressure == undefined || req.body.respirationRate == "" || req.body.respirationRate == undefined || req.body.bloodOxygen == "" || req.body.bloodOxygen == undefined){
        res.status(400).send({
            "success": "false",
            "message": "All the details needs to be filled"
        })
    } else {
        try{
            newRecord.save();
            return res.send({
                "success": "true"
            })
        }catch(err){
            console.log(err)
            return res.send({
                "success": "false",
                "message": err
            })
        }
    }
   
})

//get all records
app.get('/records',authenticatetoken, async (req, res) => {
    try {
        const data = await RecordModel.find();
        res.status(200).send({ data});
    } catch (err) {
        res.status(404).send({message: err });
   
    }
});

//get records by id
app.get('/record/:postId',authenticatetoken, async (req, res) => {
    console.log('/record METHOD:GET')
    try {
        const data = await RecordModel.findById(req.params.postId);
        res.status(200).send({ data});
    } catch (err) {
        res.status(404).send({message: err });
   
    }
});

// delete record by id
app.delete("/record/:id",authenticatetoken, async (req, res) => { 
    try {
        const data = await RecordModel.remove({ _id: req.params.id});
        res.status(200).send({ data});
    } catch (err) {
        res.status(404).send({message: err });
    }
})

//authenticate function
function authenticatetoken(req,res,next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null){
        res.send({"failure":"token is null"})
    }
    jwt.verify(token, process.env.ACCESS_TOEN_SECRET,(err, user)=>{
        if(err){
            return res.send({"failure":"token is invalod"})
        }
        req.user = user
        next()
    })
}

//app listen
app.listen(http_port,onStartingServer)

module.exports = { app };