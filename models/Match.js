const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    playerName: String,
    venue: String,
    runs: Number,
    innings: Number,
    outs: Number,
    date: Date
});

module.exports = mongoose.model('Match', MatchSchema);
