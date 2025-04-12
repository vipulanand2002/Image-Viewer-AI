const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  deleteImage: (filePath) => ipcRenderer.invoke('delete-image', filePath),
  saveImages: (imagePaths) => ipcRenderer.invoke('save-images', imagePaths),
});
