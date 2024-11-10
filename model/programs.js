const mongoose = require('mongoose');

const programsSchema = new mongoose.Schema({
    name: String,
    category: String,
    time: String,
    stage: Number,
    order: Number,
    status: Number,
});

const Programs = mongoose.model('Programs', programsSchema);

module.exports = Programs;
