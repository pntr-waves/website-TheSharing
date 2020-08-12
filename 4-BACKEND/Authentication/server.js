var express = require("express");
var app = express();
const http = require("http").Server(app);
const socket = require("socket.io");
const io = socket(http);

var port = process.env.PORT || 3000;
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var moment = require("moment")
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
var configDB = require("./config/database");
var Chat = require("./app/models/chat");
var messData = require("./app/models/messdata");
var User = require("./app/models/users");
mongoose.connect(configDB.url, { useNewUrlParser: true, useUnifiedTopology: true});

require('./config/passport')(passport);

app.use("/",express.static("public"));
app.use("/home",express.static("public"));
app.use("/chat", express.static("public"));
app.use("/detail/:productid", express.static("public"));
app.use("/detail_/:productid", express.static("public"));
app.use("/detail_i/:productid", express.static("public"));
app.use("/shopping-cart/:userid", express.static("public"));
app.use("/profile/:userid", express.static("public"));
app.use("/count/:id", express.static("public"));
app.use("/profile/change_pass/:userid", express.static("public"));
app.use("/chat", express.static("public"));
app.use("/notification/:userid", express.static("public"));
app.use("/shopping-cart/checkout/:userid", express.static("public"));
app.use("/chat/:partnerid:userid", express.static("public"));
app.use("/share/:id", express.static("public"));


app.use(morgan("dev"));
app.use("/share", express.static("share"))
app.use(cookieParser());
//app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: true }))



app.set("view engine", "ejs");
app.set("views", "./views");
app.use(session({
    secret: "ilovecodetheworld",
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//Global var
app.use(function (req, res, next) {
    res.locals.loginn = req.isAuthenticated();
    res.locals.session = req.session;
    next();
})

require("./app/routes/routes")(app, passport);
//Global vars
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
})


http.listen(port);
console.log("Listenning: " + port);

var mangUsers = [];

io.on("connection", function (socket) {
    console.log("Co nguoi ket noi: " + socket.id);

    socket.on("tao-room",async function (data) {
        console.log(data)
        var partner = data.slice(0, 24);
        var user = data.slice(24, 50);
        var temp = 0;
        var userName = "";
        var partnerName = "";
        
         var data1 = await   User.find({ _id: user })
                console.log(data1);
                userName = data1[0].local.name || data1[0].facebook.name || data1[0].google.name;
                console.log(userName+"a");
                temp = 1;
           
         var data2 = await   User.find({ _id: partner })
                partnerName = data2[0].local.name || data2[0].facebook.name || data2[0].google.name;
                console.log(partnerName+"b");
                temp = 2;
            
        

        console.log(user);
        console.log(partner);
        var Chats = new Chat();
        console.log(temp);
        Chat.find({ room: data }, function (err, room) {
            if (room == "") {

               
                    Chats.userName = userName;console.log(userName+"a");
                    Chats.partnerName = partnerName;console.log(partnerName+"b");
                    Chats.room = data;
                    Chats.user = user;
                    Chats.partner = partner;
                    Chats.save();
                    socket.join(data);
                    socket.Phong = data;
                    io.to(data).emit("server-send-room", { nd: data })
                

            } else {
                socket.join(data);
                socket.Phong = data;
                io.to(data).emit("server-send-room", { nd: data })
            }
        })

        //socket.emit("server-send-room",{nd:data});

    })

    socket.on("client-send-name", function (data) {

        socket.Username = data;

    })
    socket.on("user-send-message", function (data) {
        var timeis = moment().format("hh:mm a, DD/MM/YYYY");
        io.to(socket.Phong).emit("server-send-message", { un: socket.Username, nd: data, time: timeis });
        let Data = new messData({ room: socket.Phong, sender: socket.Username, data: data })
        Data.save();

    });
    socket.on("toi-dang-go-chu", function () {
        Chat.find({ room: socket.Phong }, function (err, data) {
            data.forEach(function (item) {
                if (socket.Username == item.userName) {
                    socket.Partnername = item.partnerName;
                } else {
                    socket.Partnername = item.userName;
                }
            })
            messData.find({ room: socket.Phong, sender: socket.Partnername }, function (err, data1) {

                messData.updateMany({ room: socket.Phong, sender: socket.Partnername }, { status: "seen" }, function (err, data2) {

                })

            })
        })


    });
    socket.on("toi-stop-go-chu", function () {
        io.sockets.emit("ai-do-STOP-go-chu");
        //console.log(socket.Username + " stop go chu");
    });
});