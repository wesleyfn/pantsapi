const express = require('express');
const router = express.Router();

const { getQuote } = require('../controllers/getQuote');

// Definir as rotas relacionadas a citações
router.get('/', getQuote);

module.exports = router;
