var mongoose = require("mongoose");
var moment = require("moment")
var chatSchema = mongoose.Schema({
    userID: String,
    userName:String,
    productID:String,
    productName:String,
    qty:String,
    price:String,
    clientID:String,
    clientName:String,
    message:String,
    userFullname:String,
    userPhone:String,
    userAddress:String,
    userEmail:String,
    status:{type: String, default:"Chưa gửi yêu cầu"},
    userSeen:{type:String, default:"noseen"},
    clientSeen:{type:String, default:"noseen"},
    time:{type:String, default:()=>moment().format("hh:mm a, DD/MM/YYYY")}
});


module.exports = mongoose.model("notification",chatSchema);