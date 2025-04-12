let imagePaths = [];
let currentIndex = 0;

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
