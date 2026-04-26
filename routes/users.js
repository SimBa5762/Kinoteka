const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const dbManager = require('../public/dbManager');
const bcrypt = require('bcrypt');
const session = require('express-session');


router.use(
    session({
        secret: 'super-secret-key',
        saveUninitialized: false,
        cookie: {
            httpOnly:true,
        },
        resave: false
    })
);

router.get('/login', (req, res) => {
    const [password, email] = [req.query.password, req.query.email];

    dbManager.getUser(email)
    .then(user =>{
        if(user)
        {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    req.session.user = user;
                    res.json({ message: 'Login successful' });
                } else {
                    res.status(401).json({ message: 'Wrong password' });
                }
            });
        }
        else {
            res.status(401).json({ message: 'User not found' });
        }
    })
    
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logout successful' });
});

router.get('/register', (req, res) => {
    const [password, email, name] = [req.query.password, req.query.email, req.query.name];

    dbManager.getUser(email)
    .then(user =>{
        if(!user)
        {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    res.status(500).json({ message: 'Error hashing password' });
                } else {
                    const data = {
                        name: email,
                        mail: email,
                        password: hash
                    };
                    dbManager.addUser(data);
                    res.json({ message: 'Registration successful' });
                }
            });
        }
        else {
            res.status(401).json({ message: 'User already exists' });
        }
    })
});

router.get('/profile', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: 'User not logged in' });
    }
});

router.get('/delete-account', (req, res) => {
    if (req.session.user) {
        const user = req.session.user;
        dbManager.deleteUser(user.mail);
        req.session.destroy();
        res.json({ message: 'Account deleted successfully' });
    } else {
        res.status(401).json({ message: 'User not logged in' });
    }
});

module.exports = router;