const { getAuthSheets } = require('../utils/googleSheets');

async function getList(_req, res) {
    const { googleSheets, spreadsheetId } = await getAuthSheets();

    try {
        const cells = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Página1!B2:B',
        });

        const items = cells.data.values.map(cell => cell[0]).join(', ');

        res.json({
            status: '200',
            message: 'Dados recuperados com sucesso',
            data: items,
        });
        
    } catch (error) {
        res.status(500).json({ status: '500', message: 'Erro ao recuperar dados' });
    }
}

module.exports = { getList };
