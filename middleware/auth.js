const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next(); // Пропускаємо далі
    } else {
        res.status(401).json({ message: 'Будь ласка, увійдіть у систему' });
    }
};

const isAdmin = (req, res, next) => {
    const role = req.session.user?.role;
    if (role === 'admin' || role === 'owner') {
        next(); // Пропускаємо далі
    } else {
        res.status(403).json({ message: 'Доступ заборонено. Тільки для адміністраторів.' });
    }
};

const isOwner = (req, res, next) => {
    if (req.session.user?.role === 'owner') {
        next(); // Пропускаємо далі
    } else {
        res.status(403).json({ message: 'Доступ заборонено. Тільки для власника.' });
    }
};

module.exports = { isAuthenticated, isAdmin, isOwner };