const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    title: String,
    year: Number,
});

const model = new mongoose.model("Movie", schema);

module.exports = model;