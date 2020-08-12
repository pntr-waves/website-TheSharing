var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
var moment = require("moment");
var userSchema = mongoose.Schema({
    local: {
        name:String,
        email: String,
        password: String,
        local:String,
    },
    
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String,
        facebook:String,
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String,
        google:String,
    },
    fullname:String,
    address:String,
    phone:String,
    time:{type:String, default:()=>moment().format("hh:mm a, DD/MM/YYYY")}
});
//phuong thuc hash
userSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8),null);
}
//kiem tra pass
userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password,this.local.password);
}

module.exports = mongoose.model("user1",userSchema);