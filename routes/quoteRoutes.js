const express = require('express');
const router = express.Router();
const { getQuote } = require('../controllers/getQuote');

router.get('/get', getQuote);

module.exports = router;
