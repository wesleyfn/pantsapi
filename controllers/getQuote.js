const { getAuthSheets } = require('../utils/googleSheets');

async function getQuote(_req, res) {
    const { googleSheets, spreadsheetId } = await getAuthSheets();

    try {
        const quotes = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Chapolim!A:A',
        });

        const quotesLength = quotes.data.values.length;
        const randomQuoteIndex = parseInt(Math.random() * quotesLength);
        const randomQuote = quotes.data.values[randomQuoteIndex][0];

        res.json({
            status: '200',
            message: 'Dado recuperado com sucesso',
            data: randomQuote,
        });
    } catch (error) {
        res.status(500).json({ status: '500', message: 'Erro ao recuperar dados' });
    }
}

module.exports = { getQuote };