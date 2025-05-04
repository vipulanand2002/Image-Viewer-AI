let imagePaths = [];
let currentIndex = 0;
let zoomLevel = 1;
let rotation = 0;

const openFolderBtn = document.getElementById('openFolder');
const gallery = document.getElementById('gallery');
const singleView = document.getElementById('singleView');
const singleImage = document.getElementById('singleImage');
const voiceToggleBtn = document.getElementById('voiceToggleBtn');
const wakeStatus = document.getElementById('wakeStatus'); // Wake word status element

// Open folder button handler
openFolderBtn.addEventListener('click', async () => {
  imagePaths = await window.electronAPI.selectFolder(); // Get image paths from the main process
  gallery.innerHTML = ''; // Clear the gallery

  // Create gallery items dynamically
  imagePaths.forEach((src, index) => {
    const container = document.createElement('div');
    container.classList.add('img-container');

    const img = document.createElement('img');
    img.src = `file://${src}`; // Use file URL for local images
    container.appendChild(img);

    // Add click event to show image in single view
    container.addEventListener('click', () => {
      currentIndex = index;
      showSingleImage();
      gallery.style.display = 'none'; // Hide gallery
      singleView.style.display = 'flex'; // Show single image view
    });

    gallery.appendChild(container);
  });
});

// Show the selected image in single view
function showSingleImage() {
  if (imagePaths[currentIndex]) {
    singleImage.src = `file://${imagePaths[currentIndex]}`;
    resetTransform(); // Reset zoom and rotation
  }
}

// Reset the zoom and rotation for the image
function resetTransform() {
  zoomLevel = 1;
  rotation = 0;
  updateTransform();
}

// Update image transformations (zoom, rotate)
function updateTransform() {
  singleImage.style.transform = `scale(${zoomLevel}) rotate(${rotation}deg)`;
}

// Navigation buttons
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

// Delete the current image
document.getElementById('deleteBtn').addEventListener('click', async () => {
  const deleted = await window.electronAPI.deleteImage(imagePaths[currentIndex]);
  if (deleted) {
    imagePaths.splice(currentIndex, 1); // Remove deleted image from array
    if (currentIndex >= imagePaths.length) currentIndex--; // Adjust index if needed
    showSingleImage(); // Show next image
  }
});

// Save images to a new folder
document.getElementById('saveBtn').addEventListener('click', async () => {
  await window.electronAPI.saveImages(imagePaths); // Call save function
  alert('Images copied to new folder!');
});

// Exit single image view and return to gallery
document.getElementById('exitBtn').addEventListener('click', () => {
  singleView.style.display = 'none';
  gallery.style.display = 'flex';
});

// Zoom in and zoom out buttons
document.getElementById('zoomInBtn').addEventListener('click', () => {
  zoomLevel += 0.1;
  updateTransform();
});

document.getElementById('zoomOutBtn').addEventListener('click', () => {
  zoomLevel = Math.max(0.1, zoomLevel - 0.1); // Prevent zooming out too much
  updateTransform();
});

// Rotate the image
document.getElementById('rotateBtn').addEventListener('click', () => {
  rotation = (rotation + 90) % 360;
  updateTransform();
});

// Keyboard shortcuts for zoom, rotate, and navigation
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case '+':
    case '=':
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
      document.getElementById('deleteBtn').click();
      break;
    case 'Escape':
      singleView.style.display = 'none';
      gallery.style.display = 'flex';
      break;
  }
});

// Voice command toggle
let isListening = false;

voiceToggleBtn.addEventListener('click', async () => {
  isListening = !isListening;
  if (isListening) {
    await window.electronAPI.startVoice(); // Start voice listening
    voiceToggleBtn.textContent = '🎤 Stop Voice Commands';
  } else {
    await window.electronAPI.stopVoice(); // Stop voice listening
    voiceToggleBtn.textContent = '🎤 Start Voice Commands';
  }
});

// Handle voice commands
window.electronAPI.onVoiceCommand((command) => {
  console.log('Voice command:', command);

  // Execute corresponding actions based on the voice command
  if (command.includes('next')) {
    document.getElementById('nextBtn').click();
  } else if (command.includes('previous') || command.includes('back')) {
    document.getElementById('prevBtn').click();
  } else if (command.includes('zoom in')) {
    document.getElementById('zoomInBtn').click();
  } else if (command.includes('zoom out')) {
    document.getElementById('zoomOutBtn').click();
  } else if (command.includes('rotate')) {
    document.getElementById('rotateBtn').click();
  } else if (command.includes('delete')) {
    document.getElementById('deleteBtn').click();
  } else if (command.includes('exit')) {
    document.getElementById('exitBtn').click();
  }
});

// Handle wake word detection
window.electronAPI.onWakeWordDetected(() => {
  if (wakeStatus) {
    wakeStatus.textContent = '🎤 Wake word detected!'; // Show wake word message
    setTimeout(() => {
      wakeStatus.textContent = ''; // Hide after 2 seconds
    }, 2000);
  }
});

// Handle response from start voice function
window.electronAPI.onStartVoiceResponse((message) => {
  console.log(message); // Log or update UI based on response
});

// Start voice listening (separate response handling)
window.electronAPI.on('start-voice-response', (message) => {
  console.log(message); // Log response or update UI to reflect listening state
});
