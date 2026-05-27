const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

//додати функцію додавання постеру
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

    getMovies(genreId = '', search = '', sort = '', page = 1, limit = 5) {
    return new Promise((resolve, reject) => {
        let query = 'SELECT id, title, poster_url, rating, "year" FROM movies';
        let countQuery = 'SELECT COUNT(*) as total FROM movies';
        let params = [];
        let conditions = [];

        if (genreId !== '') {
            conditions.push('genre_id = ?');
            params.push(genreId);
        }

        if (search !== '') {
            conditions.push('title LIKE ?');
            params.push(`%${search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }

        if (sort === 'rating') {
            query += ' ORDER BY rating DESC';
        } else if (sort === 'year') {
            query += ' ORDER BY "year" DESC';
        }

        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        console.log('SQL Query:', query);
        console.log('SQL Params:', params);

        // Спочатку отримуємо загальну кількість
        this.db.get(countQuery, params.slice(0, conditions.length), (err, countRow) => {
            if (err) reject(err);
            else {
                const total = countRow.total;
                // Потім отримуємо фільми для поточної сторінки
                this.db.all(query, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve({
                        movies: rows || [],
                        pagination: {
                            page: parseInt(page),
                            limit: parseInt(limit),
                            total: total,
                            totalPages: Math.ceil(total / limit)
                        }
                    });
                });
            }
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
            const { title, poster_url, year, genre_id, description, rating } = movie;
            console.log('Adding movie:', { title, poster_url, year, genre_id, description, rating });
            this.db.run('INSERT INTO movies (title, poster_url, "year", genre_id, "description", rating) VALUES (?, ?, ?, ?, ?, ?)',
                [title, poster_url, year, genre_id, description, rating],
                function(err) {
                    if (err) {
                        console.error('Error adding movie:', err);
                        reject(err);
                    }
                    else resolve({ id: this.lastID, ...movie });
                }
            );
        });
    }
    
    updateMovie(id, movie) {
        return new Promise((resolve, reject) => {
            const { title, poster_url, year, genre_id, description, rating } = movie;
            console.log('Updating movie:', { id, title, poster_url, year, genre_id, description, rating });
            this.db.run('UPDATE movies SET title = ?, poster_url = ?, "year" = ?, genre_id = ?, "description" = ?, rating = ? WHERE id = ?',
                [title, poster_url, year, genre_id, description, rating, id],
                function(err) {
                    if (err) {
                        console.error('Error updating movie:', err);
                        reject(err);
                    }
                    else resolve({ id, ...movie });
                }
            );
        });
    }

    deleteMovie(id) {
        return new Promise((resolve, reject) => {
            // Спочатку видаляємо всі відгуки фільму (каскадне видалення)
            this.db.run('DELETE FROM reviews WHERE movie_id = ?', [id], (err) => {
                if (err) reject(err);
                else {
                    // Потім видаляємо сам фільм
                    this.db.run('DELETE FROM movies WHERE id = ?', [id], function(err) {
                        if (err) reject(err);
                        else resolve(true);
                    });
                }
            });
        });
    }

    // Додано метод для відгуків
    addReview(movieId, review) {
        return new Promise((resolve, reject) => {
            const { user_id, author, text, rating } = review;
            console.log('Adding review:', { movieId, user_id, author, text, rating });
            const db = this.db; // Зберігаємо посилання на db для використання в callback
            
            // Спочатку перевіряємо структуру таблиці reviews
            db.all("PRAGMA table_info(reviews)", [], (err, columns) => {
                if (err) {
                    console.error('Error getting table info:', err);
                    reject(err);
                    return;
                }
                console.log('Reviews table structure:', columns);
                
                db.run('INSERT INTO reviews (user_id, movie_id, author, "text", rating) VALUES (?, ?, ?, ?, ?)',
                    [user_id, movieId, author, text, rating],
                    function(err) {
                        if (err) {
                            console.error('Error inserting review:', err);
                            reject(err);
                        }
                        else {
                            console.log('Review inserted successfully, ID:', this.lastID);
                            // Після додавання відгуку перераховуємо рейтинг фільму
                            db.run('UPDATE movies SET rating = (SELECT AVG(rating) FROM reviews WHERE movie_id = ?) WHERE id = ?',
                                [movieId, movieId],
                                (updateErr) => {
                                    if (updateErr) {
                                        console.error('Error updating movie rating:', updateErr);
                                        reject(updateErr);
                                    }
                                    else {
                                        console.log('Movie rating updated successfully');
                                        resolve({ id: this.lastID, ...review });
                                    }
                                }
                            );
                        }
                    }
                );
            });
        });
    }

    getReviewsByMovieId(movieId) {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM reviews WHERE movie_id = ? ORDER BY created_at DESC', [movieId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    getReviewById(reviewId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM reviews WHERE id = ?', [reviewId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    deleteReview(reviewId, movieId) {
        return new Promise((resolve, reject) => {
            const db = this.db;
            db.run('DELETE FROM reviews WHERE id = ?', [reviewId], function(err) {
                if (err) {
                    console.error('Error deleting review:', err);
                    reject(err);
                }
                else {
                    // Після видалення відгуку перераховуємо рейтинг фільму
                    db.run('UPDATE movies SET rating = (SELECT AVG(rating) FROM reviews WHERE movie_id = ?) WHERE id = ?',
                        [movieId, movieId],
                        (updateErr) => {
                            if (updateErr) {
                                console.error('Error updating movie rating:', updateErr);
                                reject(updateErr);
                            }
                            else {
                                console.log('Movie rating updated successfully after delete');
                                resolve(true);
                            }
                        }
                    );
                }
            });
        });
    }

    updateReview(reviewId, review, movieId) {
        return new Promise((resolve, reject) => {
            const { text, rating } = review;
            const db = this.db;
            db.run('UPDATE reviews SET "text" = ?, rating = ? WHERE id = ?', [text, rating, reviewId], function(err) {
                if (err) {
                    console.error('Error updating review:', err);
                    reject(err);
                }
                else {
                    // Після оновлення відгуку перераховуємо рейтинг фільму
                    db.run('UPDATE movies SET rating = (SELECT AVG(rating) FROM reviews WHERE movie_id = ?) WHERE id = ?',
                        [movieId, movieId],
                        (updateErr) => {
                            if (updateErr) {
                                console.error('Error updating movie rating:', updateErr);
                                reject(updateErr);
                            }
                            else {
                                console.log('Movie rating updated successfully after update');
                                resolve(true);
                            }
                        }
                    );
                }
            });
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
            this.db.get('SELECT * FROM users WHERE userMail = ?', [mail], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    addUser(data) {
        return new Promise((resolve, reject) => {
            const { name, mail, password, role } = data;
            // Виправлено: у схемі поля userName та userMail
            let query = 'INSERT INTO users (userName, userMail, password';
            let params = [name, mail, password];

            if (role) {
                query += ', role';
                params.push(role);
            }

            query += ') VALUES (?, ?, ?';
            if (role) {
                query += ', ?';
            }
            query += ')';

            this.db.run(query, params,
                function(err) {
                    if (err) reject(err);
                    else resolve(true);
                }
            );
        });
    }

    addAdmin(data)
    {
        const bcrypt = require('bcrypt');

        return new Promise((resolve, reject) => {
            const { name, mail, password } = data;
            this.db.run('INSERT INTO admins (adminName, adminMail, password) VALUES (?, ?, ?)', [name, mail,  bcrypt.hashSync(password, 10)], 
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

    updateUser(email, data) {
        return new Promise((resolve, reject) => {
            const { name, password } = data;
            let query = 'UPDATE users SET userName = ?';
            let params = [name];

            if (password) {
                query += ', password = ?';
                params.push(password);
            }

            query += ' WHERE userMail = ?';
            params.push(email);

            this.db.run(query, params, function(err) {
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
    }
});

// Створюємо менеджер ОДРАЗУ, щоб він був доступний для експорту
const manager = new DbManager(db);

// Ініціалізацію можна викликати окремо
const schemaPath = path.join(__dirname, '../db/schema.sql');
const dataPath = path.join(__dirname, '../db/data.sql');

if (fs.existsSync(schemaPath) && fs.existsSync(dataPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    const data = fs.readFileSync(dataPath, 'utf-8');
    manager.init(schema, data);
}

// ЕКСПОРТ МАЄ БУТИ ТУТ (не в колбеку!)
module.exports = manager;