const express = require('express');
const router = express.Router();

const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');


const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const CREDENTIALS_JSON = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
const CREDENTIALS = JSON.parse(CREDENTIALS_JSON);

const TOKEN_JSON = Buffer.from(process.env.GOOGLE_TOKEN_BASE64, 'base64').toString('utf-8');
const TOKEN = JSON.parse(TOKEN_JSON);


function formatDate(date) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }, options);
}

async function loadSavedCredentialsIfExist() {
    try {
        const credentials = TOKEN
        return google.auth.fromJSON(credentials);
    } catch (err) {
        console.error("Error loading credentials from Local Storage", err);
        return null;
    }
}

async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        credentials: CREDENTIALS,
    });

    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

async function listOrders(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    try {
        const rangeResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Página1!A:A',
        });

        const lastRow = rangeResponse.data.values ? rangeResponse.data.values.length : 0;
        if (lastRow-1 === 0) return [];

        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `Página1!B2:B${lastRow}`,
        });

        return res.data.values || [];
    } catch (error) {
        console.error('Error retrieving data from Sheets:', error);
        return [];
    }
}

async function addOrder(auth, nickname) {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    let lastRow = 0;
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Página1!A:A',
        });
        lastRow = response.data.values ? response.data.values.length : 0;
    } catch (err) {
        console.error('Error getting last row:', err);
        return;
    }

    const date = new Date();
    const formattedDate = formatDate(date);
    const updatedRange = `A${lastRow + 1}`;

    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: updatedRange,
            valueInputOption: 'USER_ENTERED',
            resource: { values: [[formattedDate, nickname]] }
        });
    } catch (err) {
        console.error('Error updating sheet:', err);
        throw err;
    }
}

router.get('/', (req, res) => {
    const secret = req.query.secret;
    const name = req.query.name;

    if (secret) {
        // Rota para adicionar um pedido
        if (secret === process.env.NIGHTBOT_SECRET && name) {
            authorize()
                .then((result) => addOrder(result, name.replace('@', '')))
                .then(() => {
                    res.send({ message: 'Pedido enviado com sucesso!' });
                })
                .catch(console.error);
        } else {
            res.status(403).send({ error: 'Acesso Negado!' });
        }
    } else {
        // Rota para listar pedidos
        authorize()
            .then(listOrders)
            .then((rows) => {
                if (rows.length > 0) {
                    const orders = rows.map(row => row[0]);
                    const strOrders = orders.join(', ');
                    res.send({ orders: strOrders }); 
                } else {
                    res.send({ orders: 'Nenhum pedido encontrado.' });
                }
            })
            .catch(console.error);
    }
});


module.exports = router;

