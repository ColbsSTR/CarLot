//Basic Route setup
var express = require("express");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var app = express();
var mongoose = require("mongoose");
var $ = require("jquery");
var Car = require("./models/cars");
var refined = false;
var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("./models/user");
var middleWare = require("./middleware");
var flash = require("connect-flash");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'precisionimports', 
  api_key: 816376549971795, 
  api_secret: 'BDJm-iDZpthRvw1x-mvN_4zsrCk'
});


//***********************
//CONNECTION TO MONGODB
//***********************
// mongoose.connect("mongodb://localhost/carlot_v2");
mongoose.connect("mongodb://colby:colby7432@ds119442.mlab.com:19442/carlot");


//***********************
// STANDARD SETUP
//***********************
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash());


//***********************
// PASSPORT CONFIGURATION
//***********************
app.use(require("express-session")({
    secret: "Once again Branny wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//**********************************************
// PASS USER AND FLASH MESSAGES TO ALL TEMPLATES
//**********************************************
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

//******************************
// DISABLE CACHING ON ALL ROUTES
//******************************
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

//****************
//FUNCTIONS
//****************
var AllCars;
var queryString = {};
var price;
var Drive;

var LoadCars = function(make, model, year) {
    Car.find({}, {}, {sort: {'make': 1, 'model': 1, 'year': 1}}, function(err, allCars) {
        if (err) {
            console.log(err);
        } else {
            AllCars = allCars;
        }
    });
}

var CreateMakeArray = function(cars) {
    var MakeArray = [];
    
    //Loop through the cars array of objects passed in 
    cars.forEach(function (car) {
        //if the car is not found in the make array it will be pushed in
        var found = MakeArray.find(function(make) {
               return make == car.make;
        });
       
         if (!found) {
           MakeArray.push(car.make);  
         } 
    });
    
    return MakeArray;
}

var CreateModelArray = function(cars) {
    var ModelArray = [];
    
    //Loop through the cars array of objects passed in 
    cars.forEach(function (car) {
        //if the car is not found in the model array it will be pushed in
        var found = ModelArray.find(function(model) {
               return model == car.model;
        });
       
         if (!found) {
           ModelArray.push(car.model);  
         } 
    });
    
    return ModelArray;
}

var CreateYearArray = function(cars) {
    var YearArray = [];
    
    //Loop through the cars array of objects passed in 
    cars.forEach(function (car) {
        //if the car is not found in the year array it will be pushed in
        var found = YearArray.find(function(year) {
               return year == car.year;
        });
       
         if (!found) {
           YearArray.push(car.year);  
         } 
    });
    
    return YearArray;
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
    Car.find({}, {}, {sort: {'make': 1, 'model': 1, year: -1}}, function(err,allCars) {
        var Makes = CreateMakeArray(allCars);
        var Models = CreateModelArray(allCars);
        var Years = CreateYearArray(allCars);
        
        queryString = {};
        if (err) {
            console.log(err);
        } else {
            res.render("inventory.ejs", {cars: allCars, AllCars: allCars, queryString: queryString, price: price, Makes: Makes, Models: Models, Years: Years, Drive:Drive});               
        }
    });   
});

//NEW Route
app.get("/cars/new", middleWare.isLoggedIn,function(req, res) {
    res.render("new.ejs");
});

//Information Route
app.get("/information", function(req, res) {
    res.render("information.ejs");
});

//CREATE Route
app.post("/cars", middleWare.isLoggedIn, upload.array('image'), async function(req,res) {
    var newCar;
    
    req.body.image = [];
    req.body.image_id = [];
    for (const file of req.files) {
        let result = await cloudinary.uploader.upload(file.path);
        req.body.image.push(result.secure_url);
        req.body.image_id.push(result.public_id);
    }

    
    newCar = {
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        price: req.body.price,
        description: req.body.description,
        drive: req.body.drive_type,
        engine: req.body.engine_type,
        image: req.body.image,
        image_id: req.body.image_id,
        mileage: req.body.mileage,
        mpg: req.body.mpg
    };
      
      Car.create(newCar, function(err, car) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        console.log(car);
        req.flash("success", "Successfully added new car.");
        res.redirect("/cars");
      });
    });              

//Refined Inventory
app.post("/cars/refined", function(req, res) {
    LoadCars();
    var AnyOption = "";
    var make = req.body.make;
    var model = req.body.model;
    var year = req.body.year;
    price = req.body.price;
    Drive = req.body.drive_type;
    
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
            queryString = {'model': model,'year': year};
            break;
        case 'b':
            queryString = {'make': make,'year': year};
            break;
        case 'c':
            queryString = {'make': make,'model': model};
            break;
        case 'ab':
            queryString = {'year': year};
            break;
        case 'ac':
            queryString = {'model': model};
            break;
        case 'bc':
            queryString = {'make': make};
            break;
        case 'abc':
            queryString = {};
            break;
        
        default:
            queryString = {'make': make,'model': model,'year': year};
    }
    
    Car.find(queryString, 'make model year price description drive image mileage mpg', {sort: {'make': 1, 'model': 1, 'year': 'desc'}}, function (err, cars) {
        var Makes = CreateMakeArray(AllCars);
        var Models = CreateModelArray(AllCars);
        var Years = CreateYearArray(AllCars);
        
        if (err) {
            console.log("HERES THE ERROR: " + err);
        } else {
            AnyOption = "";
            //Array to hold the cars that match the price refinement
            var refinedByPriceCars = [];
            //Push the car in if it's less than or equal to price
            if (price) {
                if (price == "Any Price") {
                    refinedByPriceCars = cars;
                    } else {
                        cars.forEach(function(car){
                        if (car.price <= price) {
                             refinedByPriceCars.push(car);
                         }
                    });
                }
            }
            
            var finalArray = [];
            
            if (Drive == "Any Type") {
                finalArray = refinedByPriceCars;
            } else {
                 cars.forEach(function(car){
                   if (car.drive == Drive) {
                        //Push to final array
                        finalArray.push(car);
                    } 
                });
            }
        }
            
            res.render("inventory.ejs", {cars: finalArray, AllCars: AllCars, queryString: queryString, price: price, Makes: Makes, Models: Models, Years: Years, Drive: Drive});
            price = "";
            Drive = "";
    });
});

//SHOW ROUTE
app.get("/cars/:id", function(req, res) {
    Car.findById(req.params.id, function(err, foundCar) {
        if (err) {
            req.flash("error", "Could not load car.");
        } else {
            res.render("show.ejs", {car: foundCar});
        }
    });
});

//DELETE ROUTE
app.delete("/cars/:id", function(req,res) {
    Car.findById(req.params.id, async function(err, car) {
        if (err) {
            req.flash("error", err);
        } else {
            for (const image_id of car.image_id) {
                let result = await cloudinary.v2.uploader.destroy(image_id);
            }
            Car.findByIdAndRemove(req.params.id, function(err) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("back");
                }
            });
            res.redirect("/cars");
        }
    })
});

//  ===========
// AUTH ROUTES
//  ===========

//Show Login Form
app.get("/login", function(req,res){
    res.render("login.ejs");
});

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/cars",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: 'Welcome James!'
    }),
    function(req, res) {
});

app.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged out successfully!");
    res.redirect("/cars");
});

//Start the server
app.listen(process.env.PORT, process.env.IP);