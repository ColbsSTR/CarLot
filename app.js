//Basic Route setup
var express = require("express");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var app = express();
var mongoose = require("mongoose");
var $ = require("jquery");
var Car = require("./models/cars");
var refined = false;
mongoose.connect("mongodb://localhost/carlot_v1");

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

//****************
//FUNCTIONS
//****************
var AllCars;
var LoadCars = function() {
    Car.find({}, function(err, allCars) {
        if (err) {
            console.log(err);
        } else {
            AllCars = allCars;
        }
    });
}

//****************
//ROUTES
//****************

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
            res.render("inventory.ejs", {cars: allCars, AllCars: allCars});               
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


//Refined Inventory
app.post("/cars/refined", function(req, res) {
    LoadCars();
    var AnyOption = "";
    var queryString = "";
    var make = req.body.make;
    var model = req.body.model;
    var year = req.body.year;
    
    //Delegates which aspects of the query should be anything or unique
    if (req.body.make == "Any Make") {
        AnyOption += "a";
    } 
    if (req.body.model == "Any Model") {
        AnyOption += "b";
    }
    if (req.body.year == "Any Year") {
        AnyOption += "c";
    } else {
        year = parseInt(req.body.year, 10);
    }
    
    //Creating the Query string based off of the AnyOption Var
    switch (AnyOption) {
        case 'a':
            queryString = {'model': model,'year': year}
            break;
        case 'b':
            queryString = {'make': make,'year': year}
            break;
        case 'c':
            queryString = {'make': make,'model': model}
            break;
        case 'ab':
            queryString = {'year': year}
            break;
        case 'ac':
            queryString = {'model': model}
            break;
        case 'bc':
            queryString = {'make': make}
            break;
        case 'abc':
            queryString = {}
            break;
        
        default:
            queryString = {'make': make,'model': model,'year': year}
    }
    
    Car.find(queryString, 'make model year price briefdescription', function (err, cars) {
        if (err) {
            console.log("HERES THE ERROR: " + err);
        } else {
            AnyOption = "";
            res.render("inventory.ejs", {cars: cars, AllCars: AllCars});
        }
    });
});

//
//Start the server
app.listen(process.env.PORT, process.env.IP);