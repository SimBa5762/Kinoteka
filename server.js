const http = require('http');
const fs = require('fs');
const path = require('path');
const epxress = require('express');




const app = epxress();
const PORT = 3000;


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 






app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
