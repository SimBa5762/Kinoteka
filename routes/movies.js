const express = require('express');
const router = express.Router();
const dbManager = require('../public/dbManager');

router.get('/movies', async (req, res) => {
    try {
        const genre = req.query.genre || '';
        // Чекаємо на виконання промісу
        const movies = await dbManager.getMovies(genre);
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/movies/:id', async (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        const movie = await dbManager.getMovieById(movieId);
        if (movie) res.json(movie);
        else res.status(404).json({ error: 'Movie not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/movies', async (req, res) => {
    try {
        // Замість ручного парсингу використовуємо req.body (потрібен app.use(express.json()) у server.js)
        await dbManager.addMovie(req.body);
        res.status(201).json({ message: 'Movie added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/movies/:id', async (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        await dbManager.updateMovie(movieId, req.body); // Виправлено одруківку 'updatedMovie'
        res.status(200).json({ message: 'Movie updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/movies/:id', async (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        await dbManager.deleteMovie(movieId);
        res.status(200).json({ message: 'Movie deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/movies/:id/reviews', async (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        await dbManager.addReview(movieId, req.body);
        res.status(201).json({ message: 'Review added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/genres', async (req, res) => {
    try {
        const genres = await dbManager.getGenres();
        res.json(genres);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;