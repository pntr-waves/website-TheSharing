var mongoose = require("mongoose");
var moment = require("moment")
var productSchema = mongoose.Schema({
    userID: String,
    productID: String,
    productName:String,
    userofproductID: String,
    ImageProduct:String,
    qty: Number,
    qtymax:Number,
    price: Number,
    status:{type: String, default:"Chưa gửi yêu cầu"},
    time:{type:String, default:()=>moment().format("hh:mm a, DD/MM/YYYY")}
});


module.exports = mongoose.model("cart",productSchema);