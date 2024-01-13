const express = require('express');
const router = express.Router();

const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');


const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const CREDENTIALS_JSON = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
const CREDENTIALS = JSON.parse(CREDENTIALS_JSON);

const TOKEN_JSON = Buffer.from(process.env.GOOGLE_TOKEN_BASE64, 'base64').toString('utf-8');
const TOKEN = JSON.parse(TOKEN_JSON);

/**
 * Reads previously authorized credentials from the save file.
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
        const credentials = TOKEN
        return google.auth.fromJSON(credentials);
    } catch (err) {
        console.error("Error loading credentials from Local Storage", err);
        return null;
    }
}


/* async function saveCredentials(client) {
    const keys = CREDENTIALS;
    const key = keys.installed || keys.web;

    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
} */

/**
 * Load or request or authorization to call APIs.
 */

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


async function listNicknames(auth) {
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
    const formattedDate = `=DATE(${date.getFullYear()};${date.getMonth()+1};${date.getDay()})`;
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


router.get('/nicknames', (req, res) => {
    authorize()
        .then(listNicknames)
        .then((rows) => {
            if (rows.length > 0) {
                const nicknames = rows.map(row => row[0].replace('@', ''));
                const strNicknames = nicknames.join(', ');
    
                res.send({
                    nicknames: strNicknames
                }); 
            }
            else {
                res.send({
                    nicknames: 'Nenhum pedido encontrado.'
                });
            }
        })
        .catch(console.error);
});

router.get('/add/:nickname', (req, res) => {
    const nickname = req.params.nickname;

    authorize()
        .then((result) => addOrder(result, nickname))
        .then(() => {
            res.send({
                messagem: 'Pedido enviado com sucesso!',
            });
        })
        .catch(console.error);
});

module.exports = router;

