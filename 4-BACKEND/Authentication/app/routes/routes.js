const formidable = require("formidable");
const multer = require("multer");
var bcrypt = require("bcrypt-nodejs");
var upload = multer({ dest: 'uploads/' })
const User = require("../models/users");
const Product = require("../models/product")
const Cart = require("../models/cart")
const CartMongo = require("../models/cartmongo")
const Comment = require("../models/comment")
const Notification = require("../models/notification")
const Chat = require("../models/chat")
const messData = require("../models/messdata")
const fs = require("fs")
const mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;



module.exports = function (app, passport) {

    app.get("/notification/:userid", async (req, res) => {
        var userid = "";
        var clientid = "";
        var userID = req.params.userid;
        var doc = await Notification.find({ clientID: userID })
        console.log(doc);
        Notification.findOneAndUpdate({ clientID: userID }, { clientSeen: "seen" })
        var data = await Notification.find({ $and: [{ userID: userID }, { $or: [{ status: "Đã xác nhận!" }, { status: "Đã từ chối!" }] }] })
        console.log(data)



        return res.render("notification", { aaa: doc, user: req.user, data: data, userid: userid, clientid: clientid })
    })
    app.get("/", async function (req, res) {
        var currentPage = 0;
        if (!req.query.page) {
            currentPage = 1;
        } else {
            currentPage = parseInt(req.query.page);
        }
        var page = req.query.page || 1;
        var perPage = 10;
        var start = (page - 1) * perPage;
        var end = page * perPage;
        var drop = (page - 1) * perPage;
        var onemonth = 1 * 24 * 60 * 60 * 1000; /* ms */
        time = new Date(new Date().getTime() - onemonth);
        var products = await Product.find({

            date: { $gte: time } //LỌC THEO THỜI GIAN

        }).limit(5).skip(drop);
        Product.find().limit(10).skip(drop).exec(function (err, product) {
            if (err) throw err;
            else {

                res.render("test", { aaa: product, message: req.flash("productMessage"), products: products, currentPage: currentPage, temp: 0 })
            }
        })
    })
    app.get("/search", (req, res) => {
        var q = req.query.q;
        var page = req.query.page || 1;
        var perPage = 10;
        var start = (page - 1) * perPage;
        var end = page * perPage;
        var drop = (page - 1) * perPage;
        const regex = new RegExp(escapeRegex(q), 'gi');
        Product.find({ name: regex }).limit(10).skip(drop).exec(function (err, product) {
            if (err) throw err;
            else {

                res.render("test", { aaa: product, message: req.flash("productMessage"), temp: 1, currentPage:"" })
            }
        })
    })
    app.get("/location", (req, res) => {
        var q = req.query.q;
        var page = req.query.page || 1;
        var perPage = 10;
        var start = (page - 1) * perPage;
        var end = page * perPage;
        var drop = (page - 1) * perPage;
        const regex = new RegExp(escapeRegex(q), 'gi');
        Product.find({ location: regex }).limit(10).skip(drop).exec(function (err, product) {
            if (err) throw err;
            else {

                res.render("test", { aaa: product, message: req.flash("productMessage"), temp: 1, currentPage:"" })
            }
        })
    })
    app.get("/home/location", (req, res) => {
        var q = req.query.q;
        var page = req.query.page || 1;
        var perPage = 10;
        var start = (page - 1) * perPage;
        var end = page * perPage;
        var drop = (page - 1) * perPage;
        const regex = new RegExp(escapeRegex(q), 'gi');
        Product.find({ location: regex }).limit(10).skip(drop).exec(function (err, product) {
            if (err) throw err;
            else {

                res.render("test2", {user: req.user, aaa: product, message: req.flash("productMessage"), temp: 1, currentPage:"" })
            }
        })
    })

    app.get("/filter_time", function (req, res) {
        var page = req.query.page || 1;
        var perPage = 3;
        var start = (page - 1) * perPage;
        var end = page * perPage;
        var drop = (page - 1) * perPage;
        var sixHours = 24 * 60 * 60 * 1000; /* ms */
        sixHoursAgo = new Date(new Date().getTime() - sixHours);
        Product.find({

            date: { $gte: tenDaysAgo } //LỌC THEO THỜI GIAN

        }).limit(3).skip(drop).exec(function (err, product) {

            if (err) throw err;
            else {
                res.render("test", { aaa: product, message: req.flash("productMessage") })
            }
        })

    })
    app.get("/filter_view",async function (req, res) {
        var page = req.query.page || 1;
        var perPage = 3;
        var start = (page - 1) * perPage;
        var end = page * perPage;
        var drop = (page - 1) * perPage;
       
        var catprice = req.params.name;
       
            var mysort = { view: -1 };
            var product = await Product.find().sort(mysort)
            res.render("test", { aaa: product, message: req.flash("productMessage"), temp:1,currentPage:""})
        

    })
    app.get("/filter_comment",async function (req, res) {
        var page = req.query.page || 1;
        var perPage = 3;
        var start = (page - 1) * perPage;
        var end = page * perPage;
        var drop = (page - 1) * perPage;
        
        var catprice = req.params.name;
       
            var mysort = { comment: -1 };
            var product = await Product.find().sort(mysort)
            res.render("test", { aaa: product, message: req.flash("productMessage"), temp:1,currentPage:""})

    })



    //login
    app.get("/login", function (req, res) {
        res.render("login.ejs", { message: req.flash("loginMessage") });
    })
    //xu ly thong tin khi dang nhap
    //app.post("/login")

    //signup
    app.get("/signup", function (req, res) {
        res.render("signup.ejs", { message: req.flash("signupMessage") });
    })
    //xu ly thong tin khi dang ky

    app.post("/signup", function (req, res) {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const password2 = req.body.password2;
        const messages = [];
        if (password !== password2 || password.length < 6) {
            res.render("signup", { message: "Có lỗi xảy ra! Vui lòng nhập lại!" })


        } else {
            User.findOne({ "local.email": email })
                .then(function (user) {
                    if (user) {
                        res.render("signup", { message: "Email đã đăng ký!" })
                    }
                    else {
                        const newUser = new User();
                        //luu thong tin cho tai khoan local
                        newUser.local.name = username;
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.local.local = "1";
                        newUser.fullname = "";
                        newUser.address = "";
                        newUser.phone = "";
                        //luu user
                        newUser.save(function (err) {
                            if (err) {
                                throw err;
                            }

                        });

                        res.redirect("/login")


                    }
                })

        }



    })


    //trang profile
    //duoc vao khi da dang nhap, can co ham de kiem tra
    app.get("/home", IsLoggedIn, async function (req, res) {
        var currentPage = 0;
        if (!req.query.page) {
            currentPage = 1;
        } else {
            currentPage = parseInt(req.query.page);
        }
        var page = req.query.page || 1;
        var perPage = 10;
        var start = (page - 1) * perPage;
        var end = page * perPage;
        var drop = (page - 1) * perPage;

        var onemonth = 1 * 24 * 60 * 60 * 1000; /* ms */
        time = new Date(new Date().getTime() - onemonth);
        var products = await Product.find({

            date: { $gte: time } //LỌC THEO THỜI GIAN

        }).limit(5);

        Product.find({

            //date: { $gte: sixHoursAgo  } //LỌC THEO THỜI GIAN

        }).limit(10).skip(drop).exec(async function (err, product) {

            if (err) throw err;
            else {
                var a = [];
                var temp = 0;
                var user1 = await Chat.find({ partner: req.user._id });
                if (user1 != "") {
                    for (let i = 0; i < user1.length; i++) {
                        var data = await messData.find({ room: user1[i].room, sender: user1[i].userName, status: "noseen" })
                        if (data.length > 0) {
                            await a.push(data.length);
                        } else {
                            await a.push("-1")
                        }

                        temp++;
                        if (temp == user1.length) {
                            console.log(a);
                            return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a, currentPage: currentPage, products: products, temp: 0 })
                        }
                    }
                } else {
                    var user2 = await Chat.find({ user: req.user._id });
                    if (user2 != "") {
                        for (let i = 0; i < user2.length; i++) {
                            var data = await messData.find({ room: user2[i].room, sender: user2[i].partnerName, status: "noseen", currentPage: currentPage, products: products, temp: 0 })
                            if (data.length > 0) {
                                await a.push(data.length);
                            } else {
                                await a.push("-1")
                            }
                            temp++;
                            if (temp == user2.length) {
                                return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a, currentPage: currentPage, products: products, temp: 0 })
                            }
                        }
                    } else {
                        return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a, currentPage: currentPage, products: products, temp: 0 })
                    }
                }
            }
        })

    })
    app.get("/home/search", (req, res) => {
        var q = req.query.q;
        var page = req.query.page || 1;
        var perPage = 10;
        var start = (page - 1) * perPage;
        var end = page * perPage;
        var drop = (page - 1) * perPage;
        const regex = new RegExp(escapeRegex(q), 'gi');
        Product.find({ name: regex }).limit(10).skip(drop).exec(async function (err, product) {
            if (err) throw err;
            else {

                var a = [];
                var temp = 0;
                var user1 = await Chat.find({ partner: req.user._id });
                if (user1 != "") {
                    for (let i = 0; i < user1.length; i++) {
                        var data = await messData.find({ room: user1[i].room, sender: user1[i].userName, status: "noseen" })
                        if (data.length > 0) {
                            await a.push(data.length);
                        } else {
                            await a.push("-1")
                        }

                        temp++;
                        if (temp == user1.length) {
                            console.log(a);
                            return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a, temp: 1,currentPage:"" })
                        }
                    }
                } else {
                    var user2 = await Chat.find({ user: req.user._id });
                    if (user2 != "") {
                        for (let i = 0; i < user2.length; i++) {
                            var data = await messData.find({ room: user2[i].room, sender: user2[i].partnerName, status: "noseen" })
                            if (data.length > 0) {
                                await a.push(data.length);
                            } else {
                                await a.push("-1")
                            }
                            temp++;
                            if (temp == user2.length) {
                                return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a, temp: 1,currentPage:"" })
                            }
                        }
                    } else {
                        return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a, temp: 1,currentPage:"" })
                    }
                }
            }
        })
    })
    app.get("/home/filter_time", function (req, res) {
        var page = req.query.page || 1;
        var perPage = 5;
        var start = (page - 1) * perPage;
        var end = page * perPage;
        var drop = (page - 1) * perPage;
        var onemonth = 30 * 24 * 60 * 60 * 1000; /* ms */
        time = new Date(new Date().getTime() - onemonth);
        Product.find({

            date: { $gte: time } //LỌC THEO THỜI GIAN

        }).limit(5).skip(drop).exec(async function (err, product) {

            if (err) throw err;
            else {
                var a = [];
                var temp = 0;
                var user1 = await Chat.find({ partner: req.user._id });
                if (user1 != "") {
                    for (let i = 0; i < user1.length; i++) {
                        var data = await messData.find({ room: user1[i].room, sender: user1[i].userName, status: "noseen" })
                        if (data.length > 0) {
                            await a.push(data.length);
                        } else {
                            await a.push("-1")
                        }

                        temp++;
                        if (temp == user1.length) {
                            console.log(a);
                            return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a })
                        }
                    }
                } else {
                    var user2 = await Chat.find({ user: req.user._id });
                    if (user2 != "") {
                        for (let i = 0; i < user2.length; i++) {
                            var data = await messData.find({ room: user2[i].room, sender: user2[i].partnerName, status: "noseen" })
                            if (data.length > 0) {
                                await a.push(data.length);
                            } else {
                                await a.push("-1")
                            }
                            temp++;
                            if (temp == user2.length) {
                                return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a })
                            }
                        }
                    } else {
                        return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a })
                    }
                }
            }
        })

    })
    app.get("/home/filter_view", function (req, res) {
        var page = req.query.page || 1;
        var perPage = 5;
        var start = (page - 1) * perPage;
        var end = page * perPage;
        var drop = (page - 1) * perPage;
        var mysort = { view: -1 };
            
        
        Product.find({

            

        }).sort(mysort).exec(async function (err, product) {

            if (err) throw err;
            else {

                var a = [];
                var temp = 0;
                var user1 = await Chat.find({ partner: req.user._id });
                if (user1 != "") {
                    for (let i = 0; i < user1.length; i++) {
                        var data = await messData.find({ room: user1[i].room, sender: user1[i].userName, status: "noseen" })
                        if (data.length > 0) {
                            await a.push(data.length);
                        } else {
                            await a.push("-1")
                        }

                        temp++;
                        if (temp == user1.length) {
                            console.log(a);
                            return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a, temp: 1,currentPage:"" })
                        }
                    }
                } else {
                    var user2 = await Chat.find({ user: req.user._id });
                    if (user2 != "") {
                        for (let i = 0; i < user2.length; i++) {
                            var data = await messData.find({ room: user2[i].room, sender: user2[i].partnerName, status: "noseen" })
                            if (data.length > 0) {
                                await a.push(data.length);
                            } else {
                                await a.push("-1")
                            }
                            temp++;
                            if (temp == user2.length) {
                                return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a, temp: 1,currentPage:"" })
                            }
                        }
                    } else {
                        return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a, temp: 1,currentPage:"" })
                    }
                }
            }
        })

    })
    app.get("/home/filter_comment", function (req, res) {
        var page = req.query.page || 1;
        var perPage = 5;
        var start = (page - 1) * perPage;
        var end = page * perPage;
        var drop = (page - 1) * perPage;
        var mysort = { view: -1 };
            
        
        Product.find({

            

        }).sort(mysort).exec(async function (err, product) {

            if (err) throw err;
            else {

                var a = [];
                var temp = 0;
                var user1 = await Chat.find({ partner: req.user._id });
                if (user1 != "") {
                    for (let i = 0; i < user1.length; i++) {
                        var data = await messData.find({ room: user1[i].room, sender: user1[i].userName, status: "noseen" })
                        if (data.length > 0) {
                            await a.push(data.length);
                        } else {
                            await a.push("-1")
                        }

                        temp++;
                        if (temp == user1.length) {
                            console.log(a);
                            return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a, temp: 1,currentPage:"" })
                        }
                    }
                } else {
                    var user2 = await Chat.find({ user: req.user._id });
                    if (user2 != "") {
                        for (let i = 0; i < user2.length; i++) {
                            var data = await messData.find({ room: user2[i].room, sender: user2[i].partnerName, status: "noseen" })
                            if (data.length > 0) {
                                await a.push(data.length);
                            } else {
                                await a.push("-1")
                            }
                            temp++;
                            if (temp == user2.length) {
                                return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a, temp: 1 ,currentPage:""})
                            }
                        }
                    } else {
                        return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a, temp: 1,currentPage:"" })
                    }
                }
            }
        })

    })

    app.get("/home/cat=:name", async function (req, res) {

        catname = req.params.name;
        Product.find({ tag: catname }).exec(async function (err, product) {
            if (err) throw err;
            else {

                var a = [];
                var temp = 0;
                var user1 = await Chat.find({ partner: req.user._id });
                if (user1 != "") {
                    for (let i = 0; i < user1.length; i++) {
                        var data = await messData.find({ room: user1[i].room, sender: user1[i].userName, status: "noseen" })
                        if (data.length > 0) {
                            await a.push(data.length);
                        } else {
                            await a.push("-1")
                        }

                        temp++;
                        if (temp == user1.length) {
                            console.log(a);
                            return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a, temp: 1,currentPage:"" })
                        }
                    }
                } else {
                    var user2 = await Chat.find({ user: req.user._id });
                    if (user2 != "") {
                        for (let i = 0; i < user2.length; i++) {
                            var data = await messData.find({ room: user2[i].room, sender: user2[i].partnerName, status: "noseen" })
                            if (data.length > 0) {
                                await a.push(data.length);
                            } else {
                                await a.push("-1")
                            }
                            temp++;
                            if (temp == user2.length) {
                                return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a, temp: 1,currentPage:"" })
                            }
                        }
                    } else {
                        return res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), noseen: a, temp: 1,currentPage:"" })
                    }
                }
            }
        })
    })
    app.get("/cat=:name", function (req, res) {
        catname = req.params.name;
        Product.find({ tag: catname }).exec(function (err, product) {
            if (err) throw err;
            else {
                res.render("test", { aaa: product, message: req.flash("productMessage"), temp:1,currentPage:""})
            }
        })
    })
    app.get("/price=:name", async function (req, res) {
        var catprice = req.params.name;
        if(catprice=="tang"){
            var mysort = { price: 1 };
           var product = await Product.find().sort(mysort)
           res.render("test", { aaa: product, message: req.flash("productMessage"), temp:1,currentPage:""})
        }else{
            var mysort = { price: -1 };
            var product = await Product.find().sort(mysort)
            res.render("test", { aaa: product, message: req.flash("productMessage"), temp:1,currentPage:""})
        }
        // Product.find({ price: catname }).exec(function (err, product) {
        //     if (err) throw err;
        //     else {
        //         res.render("test", { aaa: product, message: req.flash("productMessage"), temp:1,currentPage:""})
        //     }
        // })
    })
    app.get("/home/price=:name", async function (req, res) {
        var catprice = req.params.name;
        if(catprice=="tang"){
            var mysort = { price: 1 };
           var product = await Product.find().sort(mysort)
           res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"),  temp: 1,currentPage:"" })
        }else{
            var mysort = { price: -1 };
            var product = await Product.find().sort(mysort)
            res.render("test2", { user: req.user, aaa: product, message: req.flash("productMessage"), temp: 1,currentPage:"" })
        }
        // Product.find({ price: catname }).exec(function (err, product) {
        //     if (err) throw err;
        //     else {
        //         res.render("test", { aaa: product, message: req.flash("productMessage"), temp:1,currentPage:""})
        //     }
        // })
    })
    //logout
    app.get("/logout", function (req, res) {
        req.logout();
        res.redirect("/");
    });

    // Xử lý thông tin khi có người thực hiện đăng nhập
    app.post('/login', passport.authenticate("local-login", {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }));
    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // yêu cầu xác thực bằng facebook
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
    // xử lý sau khi user cho phép xác thực với facebook
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/home',
            failureRedirect: '/'
        })
    );
    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/home',
            failureRedirect: '/'
        }));
    ////////////////////////////////////////////
    ////////////////////////////////////////////
    ////////////////////////////////////////////
    app.get("/share/:id", IsLoggedIn, function (req, res) {
        res.render("share", { user: req.user, message: req.flash("shareMessage") });
    })

    app.post("/share/:id", IsLoggedIn, function (req, res, next) {
        const userID = req.params.id;
        const form = new formidable.IncomingForm();
        form.uploadDir = "./uploads";
        form.keepExtensions = true;
        form.maxFieldsSize = 10 * 1024 * 1024;
        form.multiples = true;
        form.parse(req, function (err, fields, files) {
            const name = fields.name;
            const decri = fields.decri;
            const price = fields.price;
            const qty = fields.qty;
            const tag = fields.tags;
            const location = fields.location;
            var file = files.avatar.path.split("\\")[1];// lay ten file
            var file2 = files.avatar2.path.split("\\")[1];// lay ten file
            var file3 = files.avatar3.path.split("\\")[1];// lay ten file
            //res.json({ fields, file });

            const urlimage = `http://localhost:3000/open_image?image_name=${file}`;
            const urlimage2 = `http://localhost:3000/open_image?image_name=${file2}`;
            const urlimage3 = `http://localhost:3000/open_image?image_name=${file3}`;
            //res.json({ fields, file })
            const newProduct = new Product();
            newProduct.name = name;
            newProduct.decri = decri;
            newProduct.price = price;
            newProduct.qty = qty;
            newProduct.userId = userID;
            User.find({ _id: ObjectId(userID) }, function (err, user) {
                newProduct.userName = user[0].local.name || user[0].facebook.name || user[0].goole.name;
                newProduct.tag = tag;
                newProduct.location = location;
                newProduct.urlImage = urlimage;
                newProduct.urlImage2 = urlimage2;
                newProduct.urlImage3 = urlimage3;
                newProduct.save(function (err) {
                    if (err) throw err;
                })
                res.redirect("/home")
            })


        })

    })
    app.get("/open_image", function (req, res, next) {
        let imageName = "uploads/" + req.query.image_name;
        fs.readFile(imageName, function (err, imageData) {
            if (err) throw err;
            res.writeHead(200, { "Content-Type": "image/jpeg" });
            res.end(imageData);
        })
    })
    /*app.post('/share', upload.single('avatar'), function (req, res, next) {
        // req.file is the `avatar` file
        // req.body will hold the text fields, if there were any
        const ava = req.file;
        const body = req.body.name;
        const file1 = req.file.path.split("\\")[1];
        const file = "uploads/" + file1;
        //res.json({ava,body});
        console.log(req.file)
      })*/
    /*app.get("/product", function(req,res){
        var products = Product.find();
        let list = [
          {name: 'PHP'},
          {name: 'Ruby'},
          {name: 'Java'},
          {name: 'Python'},
          {name: 'dotNet'},
          {name: 'C#'},
          {name: 'Swift'},
          {name: 'Pascal'},
      ]
        res.render("product",{aaa:list, message: req.flash("productMessage")})
    })*/

    /*app.get("/test", function (req, res, next) {
    
        Product.find().exec(function (err, product) {
            if (err) throw err;
            else {
    
            
                res.render("test", { aaa: product, message: req.flash("productMessage") })
            }
        })
    
    })
    app.get("/test", function (req, res) {
        res.render("test")
    })*/

    app.get("/count/:id", IsLoggedIn, function (req, res) {
        Product.find({ userId: req.params.id }).exec(function (err, product) {
            if (err) throw err;
            else {
                res.render("count", { bbb: product, user: req.user, message: req.flash("shareMessage") })
            }
        })


    })
    app.post("/count/update/:productID/:userID", IsLoggedIn,async function (req, res) {
       var userID = req.params.userID;
       var productID = req.params.productID;
        var price = req.body.price;
        var sl = req.body.sl;
        if(sl<1){
            sl=1;
            
        }else if(price<0){
            price=0;
        }
        var product = await Product.updateOne({ _id:productID, userId: userID },{qty:sl,price:price})
        res.redirect(`/count/${userID}`)
    })

    app.get("/add-to-cart/:userid/:productid/:qty", IsLoggedIn, function (req, res, next) {
        var productId = req.params.productid;
        var userid = req.params.userid;
        var sluong = req.params.qty;
        var cart = new Cart(req.session.cart ? req.session.cart : {});
        Product.findById(productId, function (err, product) {
            if (err) {
                return res.redirect("/home");
            }

            cart.add(product, productId);
            req.session.cart = cart;
            var cat = cart.generateArray();
            var productid = productId;
            var userofproduct = product.userId;
            var productname = product.name;
            
            /*CartMongo.findByIdAndUpdate({productID:productId},{qty:qty+1},{upsert: true})*/


            var Carts = new CartMongo();
            Carts.userID = userid;
            Carts.productID = productid;
            Carts.productName = productname;
            Carts.userofproductID = userofproduct;
            Carts.ImageProduct = cat[0].item.urlImage;
            //Carts.qty = cat[0].qty;
            Carts.qty = sluong;
            Carts.qtymax = product.qty;
            Carts.price = cat[0].price;
            //console.log(cat)

            // Carts.save();



            /*CartMongo.findOne({ productID: productid }, function (err, doc) {
                if (err) throw err;
                else {
                    b = doc.qty + 1;
                    console.log(doc.qty);
                    CartMongo.findOneAndUpdate({ productID: productid }, { qty: b }, function (err, doc) {

                    })
                }

            })*/
            CartMongo.findOne({ userID: userid, productID: productid }, function (err, doc) {
                var b = 0;
                var limit = cat[0].item.qty;
                console.log(limit)

                if (err) throw err;
                if (!doc) {
                    Carts.save();

                }
                else {
                    b = doc.qty;
                    var intsluong = parseInt(sluong);
                    var intb = parseInt(b);
                    var a = intb + intsluong;
                    if (a < limit) {
                        //b++;

                        // console.log(b)
                        CartMongo.findOneAndUpdate({ userID: userid, productID: productid }, { qty: a }, function (err, doc) {

                        })
                    }else if(a>limit){
                        a=limit;
                        CartMongo.findOneAndUpdate({ userID: userid, productID: productid }, { qty: a }, function (err, doc) {

                        })
                    }

                }
                cart.sub(product, productId);
                //console.log(req.session.cart)
                res.redirect("/home");

            })

        })



    })
    app.get("/shopping-cart/:userid", IsLoggedIn, function (req, res) {
        /*if(!req.session.cart){
            return res.render("shopping-cart", {products: null})
        }
        var cart = new Cart(req.session.cart);
        
        res.render("shopping-cart",{products: cart.generateArray(), totalPrice: cart.totalPrice})*/
        CartMongo.find({ userID: ObjectId(req.params.userid) }, async function (err, product) {
            if (err) throw err;
            else {
                
                for (let i = 0; i < product.length; i++) {
                    if (product[i].status == "Đã xác nhận!" || product[i].status == "Đã từ chối!") {
                        var doc = await CartMongo.remove({ _id: product[i]._id })
                    }
                    
                    var product1 = await Product.find({_id:product[i].productID});
                    console.log(product1)
                    if(product1!=[]){
                        console.log("tim thay")
                        if(product1[0].qty<product[i].qty){
                            var update = await CartMongo.update({userID: ObjectId(req.params.userid),productID:product[i].productID },{qty:product1[0].qty,qtymax:product1[0].qty})
                            
                        }
                    }else{
                        console.log("ko tim thay")
                        var delete1 = await CartMongo.remove({userID: ObjectId(req.params.userid),productID:product[i].productID})
                    }
                    
                }
                return res.render("shopping-cart", { products: product, user: req.user, messages: req.flash("shoppingcartMessage") })
            }
        })
    })
    app.get("/shopping-cart/delete/:productID/:userID", IsLoggedIn, (req, res) => {
        var userid = req.params.userID;
        CartMongo.remove({ productID: req.params.productID, userID: req.params.userID }, function (err, product) {
            if (err) throw err;
            res.redirect(`/shopping-cart/${userid}`)
        })

    })
    app.get("/count/delete/:productID/:userID", IsLoggedIn, (req, res) => {
        var userid = req.params.userID;
        Product.remove({ _id: req.params.productID, userId: req.params.userID }, function (err, product) {
            if (err) throw err;
            res.redirect(`/count/${userid}`)
        })
    })
    app.get("/detail/:productid", function (req, res) {
        var productID = req.params.productid;
        var temp = 0;
        Product.findOne({ _id: ObjectId(productID) }, function (err, product) {
            if (err) throw err;
            else {
                var view = product.view;
                view++;
                Product.findOneAndUpdate({ _id: ObjectId(productID) }, { view: view }, function (err, doc) {

                })
                console.log(product.view);
                temp++;
                Comment.find({ productID: ObjectId(productID) }, function (err, comment) {
                    if (err) {
                        throw err;
                    }
                    else {
                        temp++;

                    }
                    console.log(comment);

                    if (temp == 1) {
                        res.render("detailproduct", { aaa: product, bbb: null, user: req.user, message: req.flash("detailMessage") })
                    } else {
                        console.log(temp);
                        res.render("detailproduct", { bbb: comment, aaa: product, user: req.user, message: req.flash("detailMessage") })
                    }
                })

            }
        })

    })
    app.post("/detail/:productid/:userid", (req, res) => {
        var productID = req.params.productid;
        var userID = req.params.userid;
        Product.find({ _id: ObjectId(productID) }, (err, product) => {
            var comment = product[0].comment;
            console.log(comment);
            comment++;
            var CM = new Comment();
            CM.userID = userID;
            CM.userName = req.user.local.name || req.user.facebook.name || req.user.google.name;
            CM.productID = productID;
            CM.text = req.body.comment;

            CM.save();

            Product.findOneAndUpdate({ _id: ObjectId(productID) }, { comment: comment }, (err, doc) => {
                res.redirect(`/detail/${productID}`)
            })

        })

    })
    app.post("/details/:productid/:userid", (req, res) => {
        var userID = req.params.userid;
        var productID = req.params.productid;
        var qty = req.body.sluong;
        console.log(qty + "aaaa");
        res.redirect(`/add-to-cart/${userID}/${productID}/${qty}`)

    })

    app.get("/detail_/:productid", function (req, res) {
        var productID = req.params.productid;
        var temp = 0;
        Product.findOne({ _id: ObjectId(productID) }, function (err, product) {
            if (err) throw err;
            else {
                temp++;
                Comment.find({ productID: ObjectId(productID) }, function (err, comment) {
                    if (err) {
                        throw err;
                    }
                    else {
                        var view = product.view;
                        view++;
                        Product.findOneAndUpdate({ _id: ObjectId(productID) }, { view: view }, function (err, doc) {

                        })
                        console.log(product.view);
                        temp++;

                    }
                    console.log(comment);

                    if (temp == 1) {
                        res.render("detailproduct2", { aaa: product, bbb: null, message: req.flash("detailMessage") })
                    } else {
                        console.log(temp);
                        res.render("detailproduct2", { bbb: comment, aaa: product, message: req.flash("detailMessage") })
                    }
                })

            }
        })

    })
    app.get("/detail_i/:productid", function (req, res) {
        var productID = req.params.productid;
        var temp = 0;
        Product.findOne({ _id: ObjectId(productID) }, function (err, product) {
            if (err) throw err;
            else {
                temp++;
                Comment.find({ productID: ObjectId(productID) }, function (err, comment) {
                    if (err) {
                        throw err;
                    }
                    else {
                        var view = product.view;
                        view++;
                        Product.findOneAndUpdate({ _id: ObjectId(productID) }, { view: view }, function (err, doc) {

                        })
                        console.log(product.view);
                        temp++;

                    }
                    console.log(comment);

                    if (temp == 1) {
                        res.render("detailproduct3", { aaa: product, bbb: null, user: req.user, message: req.flash("detailMessage") })
                    } else {
                        console.log(temp);
                        res.render("detailproduct3", { bbb: comment, aaa: product, user: req.user, message: req.flash("detailMessage") })
                    }
                })

            }
        })

    })
    app.post("/shopping-cart/update/:productid/:userid/:qtymax",async function(req,res){
        var productID = req.params.productid;
        var userID = req.params.userid;
        var qtymax = req.params.qtymax;
        var qty = req.body.sl;
        
        if(qty>qtymax){
            qty=qtymax;
            
            var product = await CartMongo.updateOne({userID:userID,productID:productID},{qty:qty})
            
        }else if(qty<1){
            qty=1;
            var product = await CartMongo.updateOne({userID:userID,productID:productID},{qty:qty})
            
        }else{
            var product = await CartMongo.updateOne({userID:userID,productID:productID},{qty:qty})
            
        }
       
        
        res.redirect(`/shopping-cart/${userID}`)
    })

    app.get("/shopping-cart/payment/:productid/:userid", (req, res) => {

        var userID = req.params.userid;
        var productID = req.params.productid;
        var message = `Có một yêu cầu đên từ người dùng có ID: ${userID}`;
        var clientName;
        CartMongo.find({ userID: ObjectId(userID) }, (err, product) => {

            var Message = new Notification();
            Message.userID = userID;
            Message.productID = productID;
            Message.userName = req.user.local.name || req.user.facebook.name || req.user.google.name;
            Product.find({ _id: ObjectId(productID) }, (err, product) => {
                console.log(product[0].userId);
                var productname = product[0].name;
                Message.productName = productname;
                var message = `Tôi muốn mua ${productname} của bạn! 
                               THÔNG TIN
                               Tên đầy đủ: ${userFullname}
                               Số điện thoại: ${userPhone}
                               Địa chỉ: ${userAddress}`;
                Message.clientID = product[0].userId;
                User.find({ _id: ObjectId(product[0].userId) }, (err, user) => {
                    clientName = user[0].local.name || user[0].facebook.name || user[0].google.name;
                    Message.clientName = clientName;
                    Message.text = message;
                    console.log(message);
                    Message.save();
                    res.redirect(`/shopping-cart/${userID}`);
                })

            })


        })
    })

    app.post("/shopping-cart/checkout/:userid", (req, res) => {
        var userID = req.params.userid;
        const fullname = req.body.fullname;
        const phone = req.body.phone;
        const address = req.body.address;
        const messages = req.body.message;
        const email = req.body.email;

        User.findOneAndUpdate({ _id: ObjectId(userID) }, { fullname: fullname, phone: phone, address: address }, (err, doc) => {

            // res.redirect(`/shopping-cart/checkout/payment/${userID}`);
            var userFullname = req.user.fullname;
            var userAddress = req.user.address;
            var userPhone = req.user.phone;
            var userID = req.params.userid;
            var i = 0;
            var n = 0;
            CartMongo.find({ userID: ObjectId(userID), status: "Chưa gửi yêu cầu" }, (err, product) => {
                console.log(product.length);

                for (i; i < product.length; i++) {
                    var Message = new Notification();
                    Message.userID = userID;
                    Message.userName = req.user.local.name || req.user.facebook.name || req.user.google.name;
                    Message.productID = product[i].productID;
                    Message.productName = product[i].productName;
                    Message.qty = product[i].qty;
                    Message.price = product[i].qty * product[i].price;
                    var productName = product[i].productName;
                    Message.message = messages;
                    Message.clientID = product[i].userofproductID;
                    Message.userFullname = fullname;
                    Message.userPhone = phone;
                    Message.userAddress = address;
                    Message.userEmail = email;
                    Message.save();
                    var status = "Chờ xác nhận";
                    CartMongo.findOneAndUpdate({ productID: product[i].productID }, { status: status }, (err, doc) => {
                        n++;
                    })

                }
                if (n = product.length) {
                    res.redirect(`/shopping-cart/${userID}`);

                }
            })


        })

    })
    app.get("/shopping-cart/checkout/:userid", (req, res) => {
        var userID = req.params.userid;

        CartMongo.find({ $and: [{ userID: userID }, { $or: [{ status: "Chưa gửi yêu cầu" }] }] }, (err, product) => {
            console.log(product);
            res.render("checkout.ejs", { user: req.user, product: product })
        })

    })
    app.get("/status_ok/:userid/:productid", async (req, res) => {
        var userID = req.params.userid;
        var productID = req.params.productid;
        var status = "Đã xác nhận!";
        var product = await Product.find({ _id: productID });
        var cart = await CartMongo.find({ userID: userID, productID: productID })
        var cartqty = cart[0].qty;
        var limit = product[0].qty;
        var final = 0;
        final = limit - cartqty;
        if (final == 0) {
            Product.remove({ _id: productID }, function (err, doc) {

            })
        } else if (final > 0) {
            Product.findOneAndUpdate({ _id: productID }, { qty: final }, function (err, doc) {

            })
        }
        CartMongo.findOneAndUpdate({ userID: ObjectId(userID), productID: ObjectId(productID) }, { status: status }, (err, doc) => {
            Notification.findOneAndUpdate({ userID: ObjectId(userID), productID: ObjectId(productID) }, { status: status }, (err, doc2) => {

                res.redirect(`/notification/${req.user._id}`);
            })

        })
    })
    app.get("/status_no/:userid/:productid", (req, res) => {
        var userID = req.params.userid;
        var productID = req.params.productid;
        var status = "Đã từ chối!";
        CartMongo.findOneAndUpdate({ userID: ObjectId(userID), productID: ObjectId(productID) }, { status: status }, (err, doc) => {

            Notification.findOneAndUpdate({ userID: ObjectId(userID), productID: ObjectId(productID) }, { status: status }, (err, doc2) => {
                res.redirect(`/notification/${req.user._id}`);
            })
        })
    })
    app.get("/status_remove/:userid/:productid", (req, res) => {
        var userID = req.params.userid;
        var productID = req.params.productid;
        Notification.remove({ userID: ObjectId(userID), productID: ObjectId(productID) }, (err, doc2) => {
            res.redirect(`/notification/${req.user._id}`);
        })

    })

    app.get("/profile/:userid", (req, res) => {
        res.render("profile", { user: req.user, message: req.flash("profileMessage"), messages: req.flash("profileMessage") })
    })
    app.post("/profile/:userid", (req, res) => {
        var userID = req.params.userid
        var fullname = req.body.fullname;
        var address = req.body.address;
        var name = req.body.name;
        var phone = req.body.phone;
        var email = req.body.email;
        User.findOneAndUpdate({ _id: ObjectId(userID) }, { fullname: fullname, address: address, phone: phone }, (err, user) => {
            res.redirect(`/profile/${userID}`)

            //res.render("profile", { user: req.user, messages: "Cập nhật thông tin thành công!", message: req.flash("profileMessage") })
        })

    })

    app.get("/profile/change_pass/:userid", (req, res) => {
        res.render("changepass", { user: req.user, message: req.flash("changepassMessage"), messages: req.flash("changepassMessage") })
    })
    app.post("/profile/change_pass/:userid", (req, res) => {
        var userID = req.params.userid;
        var pass1 = req.body.pass1;
        var pass2 = req.body.pass2;
        var hash1;
        if (pass1 !== pass2) {
            res.render("changepass", { user: req.user, message: "Mật khẩu phải trùng khớp", messages: req.flash("changepassMessage") })
        } else {

            bcrypt.genSalt(8, function (err, salt) {
                if (err) {
                    throw err
                } else {
                    bcrypt.hash(pass1, salt, null, function (err, hash) {
                        if (err) {
                            throw err
                        } else {
                            if (req.user.local) {
                                User.findOneAndUpdate({ _id: ObjectId(userID) }, { "local.password": hash }, (err, user) => {
                                    // res.redirect(`/profile/${userID}`)
                                    res.render("profile", { user: req.user, message: req.flash("changepassMessage") })
                                })
                            }

                        }
                    })

                }
            })


        }
    })
    app.get("/chat/:partnerid:userid", function (req, res) {
        partnerID = req.params.partnerid;
        userID = req.params.userid;
        var room = partnerID + userID;
        var partner = room.slice(0, 24);
        var user = room.slice(24, 50)
        var Username = req.user.local.name || req.user.facebook.name || req.user.google.name;
        var Partnername = "";
        Chat.find({ room: room }, function (err, doc) {
            console.log(doc);
            if (doc == "") {
                messData.find({ room: room }, function (err, data3) {
                    res.render("chat", { user: req.user, partnerid: partnerID, userid: userID, data: data3 })
                }).limit(100)

            } else {
                Chat.find({ room: room }, function (err, data) {
                    if (Username == data[0].userName) {
                        Partnername = data[0].partnerName;
                    } else {
                        Partnername = data[0].userName;
                    }
                    messData.find({ room: room, sender: Partnername }, function (err, data1) {

                        messData.updateMany({ room: room, sender: Partnername }, { status: "seen" }, function (err, data2) {
                            messData.find({ room: room }, function (err, data3) {
                                res.render("chat", { user: req.user, partnerid: partnerID, userid: userID, data: data3 })
                            }).limit(100)

                        })

                    })
                })
            }
        })





    })
    app.get("/chat", async function (req, res) {
        var temp = 0;
        var user1 = await Chat.find({ partner: req.user._id });
        
        if (user1 != "") {
            var a = [];
            for (let i = 0; i < user1.length; i++) {
                var data = await messData.find({ room: user1[i].room, sender: user1[i].userName, status: "noseen" })
                a.push(data.length);
                var ok = await Chat.findOneAndUpdate({ room: user1[i].room }, { noseenPartner: data.length })
                temp++;
                if (temp == user1.length) {
                    return res.render("chat2", { user: req.user, findchat: user1, temp: "0", noseen: a })
                }
            }
        } else {
            var user2 = await Chat.find({ user: req.user._id });
            if (user2 != "") {
                var a = [];
                for (let i = 0; i < user2.length; i++) {
                    var data = await messData.find({ room: user2[i].room, sender: user2[i].partnerName, status: "noseen" })
                    a.push(data.length);
                    var ok = await Chat.findOneAndUpdate({ room: user2[i].room }, { noseenUser: data.length })
                    temp++;
                    if (temp == user2.length) {
                        return res.render("chat2", { user: req.user, findchat: user2, temp: "1", noseen: a })
                    }
                }
            } else {
                var a = [];
                return res.render("chat2", { user: req.user, findchat: user2, temp: "2", noseen: a })
            }
        }




    })
    app.get("/a", function (req, res) {
        res.render("a")
    })

}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


//route middleware de kiem tra mot user da dang nhap hay chua
function IsLoggedIn(req, res, next) {
    //da xac thuc, cho di tiep
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/login");
    }
}
