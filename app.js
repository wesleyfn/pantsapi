const express = require('express');
const ordersRoutes = require('./routes/ordersRoutes');
const quoteRoutes = require('./routes/quoteRoutes');

const app = express();

// Usar as rotas de pedidos
app.use('/v1/orders', ordersRoutes);
app.use('/v1/quote', quoteRoutes);


app.get('/', (_req, res) => {
    res.send('Pants API está ativa!');
});

app.listen(3000, () => {
    console.log('Servidor está rodando em http://localhost:3000...');
});
