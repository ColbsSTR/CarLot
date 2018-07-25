//Basic Route setup
var express = require("express");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var app = express();
var mongoose = require("mongoose");
var $ = require("jquery");
var Car = require("./models/cars");

mongoose.connect("mongodb://localhost/carlot_v1");

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

//Home||landing Page
app.get("/", function(req,res) {
    res.render("home.ejs");
});

//Index route
app.get("/cars", function(req,res) {
    Car.find({}, function(err,allCars) {
        if (err) {
            console.log(err);
        } else {
            res.render("inventory.ejs", {cars: allCars});
        }
    });
});

//NEW Route
app.get("/cars/new", function(req, res) {
    res.render("new.ejs");
});

//Information Route
app.get("/information", function(req, res) {
    res.render("information.ejs");
});

//CREATE Route
app.post("/cars", function(req,res) {
    var newCar = {
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        price: req.body.price,
        briefdescription: req.body.briefdescription
    };
    
    Car.create(newCar, function(err, car) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/cars");
        }
    });
});
//
//Start the server
app.listen(process.env.PORT, process.env.IP);