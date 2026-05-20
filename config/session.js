const session = require('express-session');

const sessionConfig = session({
    secret: 'твоє-супер-секретне-слово-яке-знає-тільки-сервер',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,     // Захищає від крадіжки сесії через JS-скрипти
        maxAge: 1000 * 60 * 60 * 24, // Час життя сесії (наприклад, 1 день)
        secure: false       // Постав true, якщо використовуєш HTTPS (в реальних проектах обов'язково)
    }
});

module.exports = sessionConfig;