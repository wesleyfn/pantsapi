const { getAuthSheets } = require('../utils/googleSheets');
const { formatDate } = require('../utils/formatDate');

async function appendOrder(req, res) {
    const { googleSheets, spreadsheetId } = await getAuthSheets();

    const name = req.query.name;
    const secret = req.query.secret;

    if (secret !== process.env.NIGHTBOT_SECRET) {
        res.status(403).json({
            status: '403',
            message: 'Você não tem permissão para adicionar dados',
        });
        return;
    }

    try {
        const orders = await googleSheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Página1!A:B',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [formatDate(new Date()), name.replace('@', '')],
                ],
            },
        });
        
        res.json({
            status: '200',
            message: 'Dados adicionados com sucesso',
            data: orders.data,
        });
    } 
    catch (error) {
        res.status(500).json({ status: '500', message: 'Erro ao adicionar dados' });
    }
}

module.exports = { appendOrder };
