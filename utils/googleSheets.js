const { google } = require('googleapis');

const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8')
);

async function getAuthSheets() {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    });

    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: 'v4', auth: client });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    return { auth, client, googleSheets, spreadsheetId };
}

module.exports = { getAuthSheets };
