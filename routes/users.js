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

    // dbManager.getUsers()
    // .then(users => {
    //     const user = users.find(u => u.email === email);
    //     if(user) {
    //         bcrypt.compare(password, user.password, (err, result) => {
    //             if(result) {
    //                 req.session.user = user;
    //                 res.redirect('/');
    //             } else {
    //                 res.status(401).json({ message: 'Invalid credentials' });
    //             }
    //         });
    //     } else {
    //         res.status(404).json({ message: 'User not found' });
    //     }
    // })
    // .catch(err => {
    //     res.status(500).json({ message: 'Error retrieving users' });
    // });
});