const fs = require('fs');
const path = require('path');
const express = require('express');
const moviesRouter = require('./routes/movies');
const usersRouter = require('./routes/users');
const genresRouter = require('./routes/genres');


const app = express();
const PORT = 3000;


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api/movies', moviesRouter);
app.use('/api/users', usersRouter);
app.use('/api/genres', genresRouter);



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
