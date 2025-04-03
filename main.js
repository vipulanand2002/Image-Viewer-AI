const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
});

// Handle folder selection
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    
    if (result.canceled) return null;
    
    const folderPath = result.filePaths[0];
    const files = fs.readdirSync(folderPath).filter(file =>
        ['.jpg', '.png', '.jpeg', '.gif'].includes(path.extname(file).toLowerCase())
    );
    
    return { folderPath, images: files.map(file => path.join(folderPath, file)) };
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});