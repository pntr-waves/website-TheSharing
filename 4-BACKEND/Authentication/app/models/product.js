var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

var productSchema = mongoose.Schema({

    name: String,
    decri: String,
    price: Number,
    qty:String,
    userId: String,
    userName:String,
    tag: String,
    urlImage: String,
    urlImage2: String,
    urlImage3: String,
    location:String,
    view: {type:Number, default:0},
    comment: {type:Number, default:0},
    date: { type: Date, default: Date.now },
    
});


module.exports = mongoose.model("product", productSchema);