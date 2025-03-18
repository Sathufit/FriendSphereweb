const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

// Get all players
router.get('/', async (req, res) => {
    const players = await Player.find();
    res.json(players);
});

// Add a player
router.post('/', async (req, res) => {
    const newPlayer = new Player(req.body);
    await newPlayer.save();
    res.json(newPlayer);
});

module.exports = router;
