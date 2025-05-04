const { app, BrowserWindow, dialog, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');
const { Porcupine, BuiltinKeyword } = require('@picovoice/porcupine-node');
const record = require('node-record-lpcm16');

const ACCESS_KEY = 'obGbbKi+PQmXd5xM/L3tyHdcOhPFCVTSh5pjgfcVPkaRfkLeGrKYhw==';  // Replace with your real AccessKey
const KEYWORD_PATH = path.join(__dirname, './resources/porcupine_params.ppn'); // Path to your .ppn file

let porcupine;
let micStream;

async function startPorcupine() {
  try {
    // Initialize Porcupine with the .ppn file and sensitivity
    porcupine = new Porcupine(
      ACCESS_KEY,
      [KEYWORD_PATH],  // Array with the path to your .ppn file
      [0.7]            // Sensitivity array (you can adjust sensitivity if needed)
    );

    console.log('Porcupine initialized');

    // Record audio stream from microphone
    micStream = record
      .record({
        sampleRateHertz: porcupine.sampleRate,
        threshold: 0,
        verbose: false,
        recordProgram: 'sox',  // You can use 'arecord' or 'rec' depending on your OS
        device: null,
      })
      .stream();

    micStream.on('data', (data) => {
      const pcm = new Int16Array(data.buffer, data.byteOffset, data.length / 2);
      const keywordIndex = porcupine.process(pcm);
      if (keywordIndex !== -1) {
        console.log(`Wake word detected! Index: ${keywordIndex}`);
      }
    });

    micStream.on('error', (err) => {
      console.error('Mic error:', err);
    });

    // Cleanup on app quit
    app.on('will-quit', () => {
      micStream.destroy();
      porcupine.release();
    });
  } catch (err) {
    console.error('Failed to initialize Porcupine:', err);
  }
}

// IPC handlers for starting and stopping voice listening
ipcMain.handle('start-voice', async () => {
  if (!porcupine) {
    await startPorcupine();
    return 'Voice listening started';
  } else {
    return 'Porcupine already running';
  }
});

ipcMain.handle('stop-voice', async () => {
  if (micStream) {
    micStream.destroy();
    micStream = null;
  }
  if (porcupine) {
    porcupine.release();
    porcupine = null;
  }
  return 'Voice listening stopped';
});

// Function to create the main window
function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');

  // IPC handler for folder selection
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

  // IPC handler for image deletion
  ipcMain.handle('delete-image', async (_, filePath) => {
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  });

  // IPC handler for saving images
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

// Application lifecycle management
app.whenReady().then(() => {
  createWindow();

  // Allow media permissions for the app (microphone access)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      callback(true);
    } else {
      callback(false);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
