const express = require('express');
const router = express.Router();
const dbManager = require('../public/dbManager');
const { isAuthenticated, isAdmin} = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Налаштування multer для завантаження постерів
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const postersDir = path.join(__dirname, '../db/posters');
        if (!fs.existsSync(postersDir)) {
            fs.mkdirSync(postersDir, { recursive: true });
        }
        cb(null, postersDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Дозволені лише зображення (jpeg, jpg, png, gif, webp)'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.get('/', async (req, res) => {
    try {
        const genre = req.query.genre || '';
        const search = req.query.search || '';
        const sort = req.query.sort || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        console.log('API Request params:', { genre, search, sort, page, limit });
        // Чекаємо на виконання промісу
        const result = await dbManager.getMovies(genre, search, sort, page, limit);
        console.log('Movies returned:', result.movies.length);
        res.json(result);
    } catch (err) {
        console.error('Error in movies route:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        const movie = await dbManager.getMovieById(movieId);
        if (movie) res.json(movie);
        else res.status(404).json({ error: 'Movie not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', isAuthenticated, isAdmin, upload.single('poster'), async (req, res) => {
    try {
        const movieData = {
            title: req.body.title,
            year: req.body.year,
            genre_id: req.body.genre_id,
            rating: req.body.rating,
            description: req.body.description
        };

        // Якщо файл завантажено, зберігаємо шлях до нього
        if (req.file) {
            movieData.poster_url = `/posters/${req.file.filename}`;
        } else if (req.body.poster_url) {
            // Якщо файл не завантажено, але передано URL
            movieData.poster_url = req.body.poster_url;
        }

        await dbManager.addMovie(movieData);
        res.status(201).json({ message: 'Movie added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', isAuthenticated, isAdmin, upload.single('poster'), async (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        const movieData = {
            title: req.body.title,
            year: req.body.year,
            genre_id: req.body.genre_id,
            rating: req.body.rating,
            description: req.body.description
        };

        // Якщо файл завантажено, зберігаємо шлях до нього
        if (req.file) {
            movieData.poster_url = `/posters/${req.file.filename}`;
        } else if (req.body.poster_url) {
            // Якщо файл не завантажено, але передано URL
            movieData.poster_url = req.body.poster_url;
        }

        await dbManager.updateMovie(movieId, movieData);
        res.status(200).json({ message: 'Movie updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        await dbManager.deleteMovie(movieId);
        res.status(200).json({ message: 'Movie deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/:id/reviews', isAuthenticated, async (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        const review = {
            user_id: req.user.id,
            author: req.user.userName,
            text: req.body.text,
            rating: req.body.rating
        };
        await dbManager.addReview(movieId, review);
        res.status(201).json({ message: 'Review added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id/reviews', async (req, res) => {
    try {
        const movieId = parseInt(req.params.id);
        const reviews = await dbManager.getReviewsByMovieId(movieId);
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/reviews/:reviewId', isAuthenticated, async (req, res) => {
    try {
        const reviewId = parseInt(req.params.reviewId);
        const review = await dbManager.getReviewById(reviewId);

        // Перевіряємо, чи користувач може видалити відгук
        if (req.user.role !== 'admin' && req.user.role !== 'owner' && review.user_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own reviews' });
        }

        await dbManager.deleteReview(reviewId, review.movie_id);
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/reviews/:reviewId', isAuthenticated, async (req, res) => {
    try {
        const reviewId = parseInt(req.params.reviewId);
        const review = await dbManager.getReviewById(reviewId);

        // Перевіряємо, чи користувач може редагувати відгук
        if (review.user_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only edit your own reviews' });
        }

        const updatedReview = {
            text: req.body.text,
            rating: req.body.rating
        };
        await dbManager.updateReview(reviewId, updatedReview, review.movie_id);
        res.status(200).json({ message: 'Review updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;