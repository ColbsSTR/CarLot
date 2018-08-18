var mongoose = require("mongoose");

//Schema setup
var carSchema = new mongoose.Schema({
    make: String,
    model: String,
    price: Number,
    year: Number,
    description: String,
    drive: String,
    engine: String,
    image: 
    [{
        type: String
    }],
    mileage: Number,
    mpg: String
});

var Car = mongoose.model("Car", carSchema);
module.exports = Car;