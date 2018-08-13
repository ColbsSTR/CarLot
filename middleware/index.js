var middleWareObj = {};
var Car = require("../models/cars");

middleWareObj.isLoggedIn = function(req,res,next){
    //If user is logged in continue
    if (req.isAuthenticated()) {
        return next();
    }
    //Otherwise redirect to login and tell them whats wrong
    req.flash("error", "Need to be logged in!");
    res.redirect("/login");
};

module.exports = middleWareObj;