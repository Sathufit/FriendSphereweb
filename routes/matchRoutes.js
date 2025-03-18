const express = require('express');
const router = express.Router();
const Match = require('../models/Match');

// Get all match stats
router.get('/', async (req, res) => {
    const matches = await Match.find();
    res.json(matches);
});

// Add new match stats
router.post('/', async (req, res) => {
    const newMatch = new Match(req.body);
    await newMatch.save();
    res.json(newMatch);
});

module.exports = router;
