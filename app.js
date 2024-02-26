const express = require('express');
const listRoutes = require('./routes/list');
const quoteRoutes = require('./routes/quote');

const app = express();

// Usar as rotas de pedidos
app.use('/v1/list', listRoutes);
app.use('/v1/quote', quoteRoutes);


app.get('/', (_req, res) => {
    res.send('Pants API está ativa!');
});

app.listen(3000, () => {
    console.log('Servidor está rodando em http://localhost:3000...');
});
