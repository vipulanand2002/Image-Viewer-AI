let imagePaths = [];
let currentIndex = 0;
let zoomLevel = 1;
let rotation = 0;

const openFolderBtn = document.getElementById('openFolder');
const gallery = document.getElementById('gallery');
const singleView = document.getElementById('singleView');
const switchToSingleBtn = document.getElementById('switchToSingleView');
const singleImage = document.getElementById('singleImage');

openFolderBtn.addEventListener('click', async () => {
  imagePaths = await window.electronAPI.selectFolder();
  gallery.innerHTML = '';
  switchToSingleBtn.style.display = imagePaths.length ? 'block' : 'none';

  imagePaths.forEach((src) => {
    const container = document.createElement('div');
    container.classList.add('img-container');

    const img = document.createElement('img');
    img.src = `file://${src}`;
    container.appendChild(img);

    gallery.appendChild(container);
  });
});

// Switch to single viewer mode
switchToSingleBtn.addEventListener('click', () => {
  currentIndex = 0;
  showSingleImage();
  gallery.style.display = 'none';
  switchToSingleBtn.style.display = 'none';
  singleView.style.display = 'flex';
});

function showSingleImage() {
  if (imagePaths[currentIndex]) {
    singleImage.src = `file://${imagePaths[currentIndex]}`;
  }
}

function showSingleImage() {
  if (imagePaths[currentIndex]) {
    singleImage.src = `file://${imagePaths[currentIndex]}`;
    resetTransform();
  }
}

function resetTransform() {
  zoomLevel = 1;
  rotation = 0;
  updateTransform();
}

function updateTransform() {
  singleImage.style.transform = `scale(${zoomLevel}) rotate(${rotation}deg)`;
}

document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    showSingleImage();
  }
});

document.getElementById('nextBtn').addEventListener('click', () => {
  if (currentIndex < imagePaths.length - 1) {
    currentIndex++;
    showSingleImage();
  }
});

document.getElementById('deleteBtn').addEventListener('click', async () => {
  const deleted = await window.electronAPI.deleteImage(imagePaths[currentIndex]);
  if (deleted) {
    imagePaths.splice(currentIndex, 1);
    if (currentIndex >= imagePaths.length) currentIndex--;
    showSingleImage();
  }
});

document.getElementById('saveBtn').addEventListener('click', async () => {
  await window.electronAPI.saveImages(imagePaths);
  alert('Images copied to new folder!');
});

document.getElementById('exitBtn').addEventListener('click', () => {
  singleView.style.display = 'none';
  gallery.style.display = 'flex';
  switchToSingleBtn.style.display = 'block';
});

document.getElementById('zoomInBtn').addEventListener('click', () => {
  zoomLevel += 0.1;
  updateTransform();
});

document.getElementById('zoomOutBtn').addEventListener('click', () => {
  zoomLevel = Math.max(0.1, zoomLevel - 0.1);
  updateTransform();
});

document.getElementById('rotateBtn').addEventListener('click', () => {
  rotation = (rotation + 90) % 360;
  updateTransform();
});

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case '+':
    case '=': // Shift + = also counts as +
      zoomLevel += 0.1;
      updateTransform();
      break;
    case '-':
    case '_':
      zoomLevel = Math.max(0.1, zoomLevel - 0.1);
      updateTransform();
      break;
    case 'r':
    case 'R':
      rotation = (rotation + 90) % 360;
      updateTransform();
      break;
    case 'ArrowRight':
      if (currentIndex < imagePaths.length - 1) {
        currentIndex++;
        showSingleImage();
      }
      break;
    case 'ArrowLeft':
      if (currentIndex > 0) {
        currentIndex--;
        showSingleImage();
      }
      break;
    case 'Delete':
      deleteImage();
      break;
    case 'Escape':
      document.getElementById('singleView').style.display = 'none';
      document.getElementById('imageGrid').style.display = 'block';
      break;
  }
});

