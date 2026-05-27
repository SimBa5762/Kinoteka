const express = require('express');
const router = express.Router();
const dbManager = require('../public/dbManager');
const bcrypt = require('bcrypt');
const { isAuthenticated, isAdmin, isOwner } = require('../middleware/auth');
const sessionConfig = require('../config/session');

router.use(sessionConfig);

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await dbManager.getUser(email);
        
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                req.session.user = { id: user.id, userName: user.userName, userMail: user.userMail, role: user.role };
                res.json({ message: 'Login successful' });
            } else {
                res.status(401).json({ message: 'Wrong password' });
            }
        } else {
            res.status(401).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logout successful' });
});

// Виправлено: GET -> POST. 
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await dbManager.getUser(email);

        if (!existingUser) {
            const hash = await bcrypt.hash(password, 10);
            const data = {
                name: name, // Виправлено: було name: email
                mail: email,
                password: hash
            };
            await dbManager.addUser(data);
            res.status(201).json({ message: 'Registration successful' });
        } else {
            res.status(401).json({ message: 'User already exists' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/profile', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: 'User not logged in' });
    }
});

router.post('/update-profile', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: 'User not logged in' });
        }

        const { name, password } = req.body;
        const userMail = req.session.user.userMail;

        const updateData = { name };
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            updateData.password = hash;
        }

        await dbManager.updateUser(userMail, updateData);

        // Обновляем сессию
        req.session.user.userName = name;
        
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/delete-account', async (req, res) => { // Змінено на DELETE для правильної REST архітектури
    try {
        if (req.session.user) {
            const user = req.session.user;
            await dbManager.deleteUser(user.userMail);
            req.session.destroy();
            res.json({ message: 'Account deleted successfully' });
        } else {
            res.status(401).json({ message: 'User not logged in' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/add-admin', isAuthenticated, isOwner, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await dbManager.getUser(email);

        if (existingUser) {
            return res.status(400).json({ message: 'Користувач вже існує!' });
        }

        const hash = await bcrypt.hash(password, 10);

        // Передаємо явно роль 'admin'
        await dbManager.addUser({ name, mail: email, password: hash, role: 'admin' });
        res.status(201).json({ message: 'Адміністратора успішно створено' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;