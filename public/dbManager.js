const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

class DbManager {
    constructor(db) {
        this.db = db;
    }

    seedDatabase(data) {
        this.db.exec(data, (err) => {
            if (err) console.error('Помилка заповнення бази даних:', err.message);
            else console.log('✅ База успішно заповнена початковими даними.');
        });
    }

    init(schema, data) {
        this.db.exec(schema, (err) => {
            if (err) {
                console.error('Помилка створення таблиць:', err.message);
                return;
            }
            console.log('Таблиці створено.');
        
            this.db.get('SELECT COUNT(*) as count FROM genres', (err, row) => {
                if (err) return console.error('Помилка перевірки даних:', err.message);
                if (row.count === 0) {
                    console.log('База порожня, ініціалізую...');
                    this.seedDatabase(data);
                }
            });
        });
    }

    getMovies(genreId = '') {
    return new Promise((resolve, reject) => {
        let query = 'SELECT id, title, poster_url, rating, "year" FROM movies';
        let params = []; // <--- ПЕРЕВІР, ЩОБ ЦЕЙ РЯДОК БУВ!

        if (genreId !== '') {
            query += ' WHERE genre_id = ?';
            params.push(genreId);
        }

        this.db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []); // Завжди повертаємо масив
        });
    });
}
    getMovieById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM movies WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    addMovie(movie) {
        return new Promise((resolve, reject) => {
            const { title, poster_url, year, genre_id, description } = movie;
            this.db.run('INSERT INTO movies (title, poster_url, "year", genre_id, "description") VALUES (?, ?, ?, ?, ?)', 
                [title, poster_url, year, genre_id, description], 
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, ...movie });
                }
            );
        });
    }
    
    updateMovie(id, movie) {
        return new Promise((resolve, reject) => {
            const { title, poster_url, year, genre_id, description } = movie;
            this.db.run('UPDATE movies SET title = ?, poster_url = ?, "year" = ?, genre_id = ?, "description" = ? WHERE id = ?', 
                [title, poster_url, year, genre_id, description, id], 
                function(err) {
                    if (err) reject(err);
                    else resolve({ id, ...movie });
                }
            );
        });
    }

    deleteMovie(id) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM movies WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve(true);
            });
        });
    }

    // Додано метод для відгуків
    addReview(movieId, review) {
        return new Promise((resolve, reject) => {
            const { user_id, author, text, rating } = review;
            this.db.run('INSERT INTO reviews (user_id, movie_id, author, "text", rating) VALUES (?, ?, ?, ?, ?)',
                [user_id, movieId, author, text, rating],
                function(err) {
                    if (err) reject(err);
                    else resolve(true);
                }
            );
        });
    }

    getGenres() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM genres', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    getUser(mail) {
        return new Promise((resolve, reject) => {
            // Виправлено: у схемі поле називається userMail
            this.db.get('SELECT * FROM users WHERE userMail = ?', [mail], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    addUser(data) {
        return new Promise((resolve, reject) => {
            const { name, mail, password } = data;
            // Виправлено: у схемі поля userName та userMail
            this.db.run('INSERT INTO users (userName, userMail, password) VALUES (?, ?, ?)', [name, mail, password], 
                function(err) {
                    if (err) reject(err);
                    else resolve(true);
                }
            );
        });
    }

    deleteUser(email) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM users WHERE userMail = ?', [email], function(err) {
                if (err) reject(err);
                else resolve(true);
            });
        });
    }
}
    
const db = new sqlite3.Database(path.join(__dirname, '../db/database.sqlite'), (err) => {
    if (err) {
        console.error('Помилка підключення до БД:', err.message);
    } else {
        console.log('Підключено до SQLite.');
        const manager = new DbManager(db);
        const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf-8');
        const data = fs.readFileSync(path.join(__dirname, '../db/data.sql'), 'utf-8');
        manager.init(schema, data);
        module.exports = manager;
    }
});