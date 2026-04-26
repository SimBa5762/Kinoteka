const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const dbManager = require('../public/dbManager');

    let movies = [];

    router.get('/movies', (req, res) => {
        const genre = req.query.genre;
        if(!genre) genre = '';
        movies = dbManager.getMovies(genre);
        res.json(movies);
    });

    router.get('/movies/:id', (req, res) => {
        const movieId = parseInt(req.params.id);
        const movie = movies.find(m => m.id === movieId);
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).json({ error: 'Movie not found' });
        }
    });

    router.post('/movie', (req, res) => {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const newMovie = JSON.parse(body);
            
            const result = dbManager.addMovie(newMovie);
            if(result)
                res.status(201).json({ message: 'Movie added successfully'});
            else 
                res.status(500).json({ message: 'Error adding movie'});
        });
    });

    router.put('/movies/:id', (req, res) => {
        const movieId = parseInt(req.params.id);
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            const updatedMovie = JSON.parse(body);
            
            const result = dbManager.updatedMovie(movieId, updatedMovie);
            if(result)
                res.status(200).json({ message: 'Movie updated successfully'});
            else 
                res.status(500).json({ message: 'Error updating movie'});
        });
    });

    router.delete('/movies/:id', (req, res) => {
        const movieId = parseInt(req.params.id);
        
        const result = dbManager.deleteMovie(movieId);
        if(result)
            res.status(200).json({ message: 'Movie updated successfully'});
        else 
            res.status(500).json({ message: 'Error updating movie'});
    });

    router.post('/movies/:id/reviews', (req, res) => {
        const movieId = parseInt(req.params.id);
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const newReview = JSON.parse(body);
            
            const result = dbManager.addReview(movieId, newReview);
            if(!result)
                res.status(500).json({ message: 'Error adding review'});
            res.status(201).json({ message: 'Review added successfully' });
        });
    });

    router.get('/genres', (req, res) => {
        
    });

module.exports = router;

