const express = require('express');
const router = express.Router();

const { getList } = require('../controllers/getList');
const { appendList } = require('../controllers/appendList');

// Definir as rotas relacionadas a lista
router.get('/', (req, res) => {
    const item  = req.query.item;
    
    // Se o item for informado, chama a função appendList, senão chama a função getList
    item ? appendList(req, res) : getList(req, res);
});

module.exports = router;
