const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'icon.png'), // Add your icon here
        webPreferences: {
            nodeIntegration: true,
        },
    });

    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});














