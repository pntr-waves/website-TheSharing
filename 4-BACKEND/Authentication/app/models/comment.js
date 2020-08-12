var mongoose = require("mongoose");
var moment = require("moment");

var commentSchema = mongoose.Schema({
    userID: String,
    userName:String,
    productID: String,
    text:String,
    time:{type:String, default:()=>moment().format("hh:mm a, DD/MM/YYYY")}
});


module.exports = mongoose.model("comment",commentSchema);