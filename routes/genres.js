const express = require('express');
const router = express.Router();
const dbManager = require('../public/dbManager');

router.get('/', async (req, res) => {
    try {
        const genres = await dbManager.getGenres();
        res.json(genres);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;