const rendererJs = `
const { ipcRenderer } = require('electron');
let images = [];
let currentIndex = 0;

document.getElementById('select-folder').addEventListener('click', async () => {
    const result = await ipcRenderer.invoke('select-folder');
    if (result && result.images.length > 0) {
        images = result.images;
        currentIndex = 0;
        displayImage();
    }
});

document.getElementById('prev').addEventListener('click', () => {
    if (images.length > 0) {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        displayImage();
    }
});

document.getElementById('next').addEventListener('click', () => {
    if (images.length > 0) {
        currentIndex = (currentIndex + 1) % images.length;
        displayImage();
    }
});

function displayImage() {
    document.getElementById('current-image').src = images[currentIndex];
}
`;
fs.writeFileSync(path.join(__dirname, 'renderer.js'), rendererJs);