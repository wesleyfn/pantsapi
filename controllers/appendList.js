const { getAuthSheets } = require('../utils/googleSheets');
const { formatDate } = require('../utils/formatDate');

async function appendList(req, res) {
    const { googleSheets, spreadsheetId } = await getAuthSheets();

    const items = (req.query.item).replace('@', '').split(' ');
    const secret = req.query.secret;

    if (secret !== process.env.KEY_SECRET) {
        res.status(403).json({
            status: '403',
            message: 'Chave secreta inválida',
        });
        return;
    }

    try {
        const data = items.map(item => (
            [formatDate(new Date()), item]
        ));

        await googleSheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Página1!A:B',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: data,
            },
        });

        res.json({
            status: '201',
            message: 'Dados adicionados com sucesso',
        });
    }
    catch (error) {
        res.status(500).json({ status: '500', message: 'Erro ao adicionar dados'});
    }
}

module.exports = { appendList };
