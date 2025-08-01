document.addEventListener('DOMContentLoaded', () => {
  let textArea = document.getElementById('textArea');

  // Prevent default drag behaviors globally
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => e.preventDefault());

  textArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    textArea.style.borderColor = 'blue';
  });

  textArea.addEventListener('dragleave', () => {
    textArea.style.borderColor = '#aaa';
  });

  textArea.addEventListener('drop', (e) => {
    e.preventDefault();
    textArea.style.borderColor = '#aaa';

    const files = e.dataTransfer.files;
    if (!files.length) return;

    for (const file of files) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('Only image or video files are allowed.');
        continue;
      }

      const reader = new FileReader();
      reader.onload = function (event) {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.display = 'inline-block';
        container.style.resize = 'both';
        container.style.overflow = 'auto';
        container.style.border = '1px solid #ccc';
        container.style.minWidth = '50px';
        container.style.minHeight = '50px';
        container.style.maxWidth = '100%';
        container.style.maxHeight = '100%';
        container.style.width = '200px';
        container.style.height = '200px';
        container.style.left = `${e.offsetX}px`;
        container.style.top = `${e.offsetY}px`;

        const content = document.createElement('div');
        content.style.width = '100%';
        content.style.height = '100%';
        content.style.cursor = 'move';
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        content.style.justifyContent = 'center';

        let mediaElement;
        if (file.type.startsWith('image/')) {
          mediaElement = document.createElement('img');
        } else {
          mediaElement = document.createElement('video');
          mediaElement.controls = true;
          mediaElement.muted = true;
        }

        mediaElement.src = event.target.result;
        mediaElement.style.maxWidth = '100%';
        mediaElement.style.maxHeight = '100%';
        mediaElement.style.objectFit = 'contain';
        mediaElement.style.userSelect = 'none';
        mediaElement.style.pointerEvents = 'none';

        content.appendChild(mediaElement);
        container.appendChild(content);
        textArea.appendChild(container);

        makeDraggable(container, content);
      };

      reader.readAsDataURL(file);
    }
  });

  function makeDraggable(container, handle) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'VIDEO' || e.target.tagName === 'IMG') return;
      isDragging = true;
      offsetX = e.clientX - container.offsetLeft;
      offsetY = e.clientY - container.offsetTop;
      container.style.zIndex = 1000;
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const rect = textArea.getBoundingClientRect();
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;

      const maxX = rect.width - container.offsetWidth;
      const maxY = rect.height - container.offsetHeight;

      container.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
      container.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      container.style.zIndex = '';
    });
  }
});
