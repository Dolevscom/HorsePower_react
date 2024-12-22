const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json());

// Log directory
const logDir = path.join(__dirname, 'log');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Log endpoint
app.post('/log', (req, res) => {
    const logEntry = `[${new Date().toISOString()}] ${req.body.action}\n`;
    fs.appendFileSync(path.join(logDir, 'actions.log'), logEntry);
    res.status(200).send('Logged');
});

app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] Server started on port ${PORT}`);
});
