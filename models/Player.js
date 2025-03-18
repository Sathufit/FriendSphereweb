const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    name: String,
    age: Number,
    profilePic: String // URL for player's image
});

module.exports = mongoose.model('Player', PlayerSchema);
