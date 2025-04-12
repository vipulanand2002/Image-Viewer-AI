const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');

  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    });

    if (result.canceled) return [];

    const folderPath = result.filePaths[0];
    const files = fs.readdirSync(folderPath);
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    );

    return imageFiles.map((file) => path.join(folderPath, file));
  });

  ipcMain.handle('delete-image', async (_, filePath) => {
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  });

  ipcMain.handle('save-images', async (_, imagePaths) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory', 'createDirectory'],
      message: 'Select destination folder to save images',
    });

    if (result.canceled || !result.filePaths[0]) return;

    const destFolder = result.filePaths[0];
    imagePaths.forEach((imgPath) => {
      const fileName = path.basename(imgPath);
      const destPath = path.join(destFolder, fileName);
      fs.copyFileSync(imgPath, destPath);
    });
  });
}
app.whenReady().then(createWindow);
