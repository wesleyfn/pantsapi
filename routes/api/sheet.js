const express = require('express');
const router = express.Router();

const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;

    console.log(key);
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function listNicknames(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1ZRNOL_QfEmg6Z1SqQE3IpwTQJlpYWEpWGdPR627LGzg';
    const range = 'Página1!B1';

    // Obter o número da última linha com conteúdo
    const lastRow = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Página1!A:A',
    }).then(res => res.data.values ? res.data.values.length : 0);
    
    if (lastRow === 0) {
        console.log('No data found.');
        return;
    }

    // Atualizar o range para incluir a última linha
    const updatedRange = `${range}:B${lastRow}`;

    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: updatedRange,
    });

    const rows = res.data.values;

    return rows;
}

async function addOrder(auth, nickname) {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1ZRNOL_QfEmg6Z1SqQE3IpwTQJlpYWEpWGdPR627LGzg';

    // Obter o número da última linha com conteúdo
    const lastRow = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Página1!A:A',
    }).then(res => res.data.values ? res.data.values.length : 0);

    // Atualizar o range para incluir a última linha
    const updatedRange = `A${lastRow + 1}`;
    const date = new Date();
    const formattedDate = date.getDay() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: updatedRange,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [formattedDate, nickname]
                ]
            }
        });
    } catch (err) {
        throw err;
    }
}

router.get('/nicknames', (req, res) => {
    authorize()
        .then(listNicknames)
        .then((rows) => {
            if (rows) {
                const nicknames = rows.map(row => row[0]);
                const strNicknames = nicknames.join(', ');
    
                res.send({
                    nicknames: strNicknames
                }); 
            }
            else {
                res.send({
                    nicknames: ''
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
