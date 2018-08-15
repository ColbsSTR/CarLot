var mongoose = require("mongoose");

//Schema setup
var carSchema = new mongoose.Schema({
    make: String,
    model: String,
    price: Number,
    year: Number,
    briefdescription: String,
    drive: String,
    engine: String,
    image: String
});

var Car = mongoose.model("Car", carSchema);
module.exports = Car;