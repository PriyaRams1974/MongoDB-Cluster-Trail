const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    uuid: {type: String, required: false},
    username:{type: String, required: true, trim: true, unique: true},// seetharam123
    email:{type: String, required: true, trim: true, unique: true},
    password:{type: String, required: true},
    role:{type: String, enum:['admin', 'user'], required: false, default: 'user'},
    mobileNumber:{type: String, required: true},
    loginStatus:{type: Boolean, required: false, default: false},//online = true, offline = false
},{
    timestamps: true
});

//Date and time in uuid
var timestamp = new Date();
var date = timestamp.getFullYear()+''+(timestamp.getMonth()+1)+''+timestamp.getDate();
var time = timestamp.getHours()+''+timestamp.getMinutes()+''+timestamp.getSeconds();

function time(){
    let date = new Date();
    let month=  date.getMonth()+1;
    let d=(date.getFullYear().toString())+(month.toString())+(date.getDate().toString())+(date.getHours().toString())+(date.getMinutes().toString());
    return d ;
}

userSchema.pre('save', function(next){
    this.uuid = "USER-" + crypto.pseudoRandomBytes(6).toString('hex').toUpperCase()
    next()
});

module.exports = mongoose.model('user', userSchema, 'user');