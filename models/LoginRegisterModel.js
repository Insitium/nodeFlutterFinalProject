//login register model for nurses login

const mongoose = require("mongoose")
const Schema = mongoose.Schema;

//register and login model
const LoginRegisterSchema = new Schema({
    username:{
        type: String,
        unique: true,
        required: true
    },
    nurseName:{
        type: String,
        required: true
    },
    nurseNumber:{
        type: String,
        unique: true,
        required: true
    },
    password:{
        type: String,
        required: true
    }
})
module.exports = mongoose.model("nurse",LoginRegisterSchema)


