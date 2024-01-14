const express = require('express');
const app = express();

const sheet = require('./routes/api/sketch_order');

app.use('/v1', sheet);

app.get('/', (req, res) => {
    res.send('Hello World! This is Pants API.');
});

app.get('/v1', (req, res) => {
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Servidor está rodando em http://localhost:3000...');
});