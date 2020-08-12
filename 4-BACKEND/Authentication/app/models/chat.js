var mongoose = require("mongoose");
var moment = require("moment");
var chatSchema = mongoose.Schema({
    room:String,
    user:String,
    userName:String,
    partner:String,
    partnerName:String,
    noseenUser:{type:Number,default:0},
    noseenPartner:{type:Number,default:0},
    time:{type:Date, default:Date.now},
    time:{type:String, default:()=>moment().format("hh:mm a, DD/MM/YYYY")}
});


module.exports = mongoose.model("chat",chatSchema);