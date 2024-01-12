const express = require('express');
const app = express();

const sheet = require('./routes/api/sheet');

app.use('/v1', sheet);

app.get('/', (req, res) => {
    res.send('Hello World! This is Pants API.');
});

app.listen(3000, () => {
    console.log('Servidor está rodando em http://localhost:3000...');
});