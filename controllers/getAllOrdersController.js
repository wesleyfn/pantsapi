const { getAuthSheets } = require('../utils/googleSheets');

async function getAllOrders(_req, res) {
    const { googleSheets, spreadsheetId } = await getAuthSheets();

    try {
        const orders = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Página1!B2:B',
        });

        const names = orders.data.values.map(order => order[0]).join(', ');

        res.json({
            status: '200',
            message: 'Dados recuperados com sucesso',
            data: names,
        });
    } catch (error) {
        res.status(500).json({ status: '500', message: 'Erro ao recuperar dados' });
    }
}

module.exports = { getAllOrders };
