const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: String,    
});

const model = new mongoose.model("Actor", schema);

module.exports = model;