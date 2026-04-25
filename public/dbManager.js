const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(path.join(__dirname, 'db/database.sqlite'), (err) => {
    if (err) {
        console.error('Помилка підключення до БД:', err.message);
    } else {
        console.log('Підключено до SQLite.');
        dbManager.init(); 
    }
});
    const schema = fs.readFileSync(path.join(__dirname, 'db/schema.sql'), 'utf-8');
    const data = fs.readFileSync(path.join(__dirname, 'db/data.sql'), 'utf-8');
    let moviesCache = {};
class dbManager {
    constructor(db) {
        this.db = db;
    }

    init()
    {
        db.exec(schema, (err) => {
            if (err) {
                console.error('Помилка створення таблиць:', err.message);
                return;
            }
            console.log('Таблиці створено.');
        
            // 2. Перевіряємо, чи база вже заповнена (наприклад, перевіряємо таблицю genres)
            db.get('SELECT COUNT(*) as count FROM genres', (err, row) => {
                if (err) {
                    console.error('Помилка перевірки даних:', err.message);
                    return;
                }
        
                if (row.count === 0) {
                    console.log('База порожня');
                    seedDatabase();
                }
            });
        });
    }

    seedDatabase() {
        db.exec(data, (err) => {
            if (err) {
                console.error('Помилка заповнення бази даних:', err.message);
            } else {
                console.log('✅ База успішно заповнена початковими даними.');
            }
        });
    }

    getMovies(genre = '') {
        return new Promise((resolve, reject) => {
            let result;
            let query = 'SELECT id, title, poster_url FROM movies';

            if (genre == '') {
                query += ' WHERE genre = ?';
                params.push(genre);
            }

            moviesCache = db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    
    getMovieById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM movies WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }   
            });
        });
    }
    addMovie(movie) {
        return new Promise((resolve, reject) => {
            const { title, director, genre, year, description } = movie;
            db.run('INSERT INTO movies (title, director, genre, year, description) VALUES (?, ?, ?, ?, ?)', [title, director, genre, year, description], 
                function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, ...movie });
                }
            });
        });
    }
    
    updateMovie(id, movie) {
        return new Promise((resolve, reject) => {
            const { title, director, genre, year, description } = movie;

            db.run('UPDATE movies SET title = ?, director = ?, genre = ?, year = ?, description = ? WHERE id = ?', 
                [title, director, genre, year, description, id], 
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id, ...movie });
                    }
                });
        });
    }

    deleteMovie(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM movies WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ message: 'Movie deleted successfully' });
                }
            });
        });
    }

    getUser(mail)
    {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE mail = ?', [mail], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }   
            });
        });
    }

    addUser(data)
    {
        return new Promise((resolve, reject) => {
            const { name, mail, password } = data;
            db.run('INSERT INTO users (name, mail, password) VALUES (?, ?, ?)', [name, mail, password], 
                function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
    deleteUser(email)
    {
        return new Promise((resolve, reject) => {
            const { mail } = data;
            db.run('DELETE FROM users WHERE mail = ?', [mail], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
}








