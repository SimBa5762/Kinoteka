const fs = require('fs');
const path = require('path');
const express = require('express');
const movieRouter = require('./routes/movies.js');
const userRouter = require('./routes/users.js');



const app = express();
const PORT = 3000;


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/movies', movieRouter);
app.use('/users', userRouter);




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
