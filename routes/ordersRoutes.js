const express = require('express');
const router = express.Router();
const { getAllOrders } = require('../controllers/getAllOrdersController');
const { appendOrder } = require('../controllers/appendOrderController');

// Definir as rotas relacionadas a pedidos
router.get('/get-all', getAllOrders);
router.get('/append1', appendOrder);

module.exports = router;
