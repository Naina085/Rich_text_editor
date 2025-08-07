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
      if (!file.type.startsWith('image/')) continue;
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = document.createElement('img');
        img.src = event.target.result;
        img.className = 'editor-image img-left'; // default left align
        img.style.maxWidth = '400px';
        img.style.height = 'auto';
        img.style.margin = '8px';
        img.style.border = '1.5px dashed #888';
        img.style.verticalAlign = 'top';
        img.setAttribute('contenteditable', 'false');
        img.style.userSelect = 'none';
        img.style.cursor = 'pointer';
        img.draggable = false;
        img.ondragstart = function() { return false; };
        textArea.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });

  // Alignment toolbar logic
  let selectedImage = null;
  let toolbar = document.getElementById('imageAlignToolbar');
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.id = 'imageAlignToolbar';
    toolbar.style.display = 'none';
    toolbar.style.position = 'absolute';
    toolbar.style.zIndex = 1000;
    toolbar.style.background = '#fff';
    toolbar.style.border = '1px solid #ccc';
    toolbar.style.borderRadius = '4px';
    toolbar.style.padding = '4px';
    toolbar.style.boxShadow = '0 2px 8px #0002';
    toolbar.innerHTML = `
      <button type="button" data-align="left">Left</button>
      <button type="button" data-align="center">Center</button>
      <button type="button" data-align="right">Right</button>
    `;
    document.body.appendChild(toolbar);
  }

  textArea.addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG' && e.target.classList.contains('editor-image')) {
      selectedImage = e.target;
      showImageAlignToolbar(selectedImage);
    } else if (!toolbar.contains(e.target)) {
      toolbar.style.display = 'none';
      selectedImage = null;
    }
  });

  function showImageAlignToolbar(img) {
    const rect = img.getBoundingClientRect();
    toolbar.style.top = (window.scrollY + rect.top - toolbar.offsetHeight - 8) + 'px';
    toolbar.style.left = (window.scrollX + rect.left) + 'px';
    toolbar.style.display = 'block';
  }

  toolbar.addEventListener('click', function(e) {
    if (!selectedImage) return;
    if (e.target.tagName === 'BUTTON') {
      selectedImage.classList.remove('img-left', 'img-center', 'img-right');
      const align = e.target.getAttribute('data-align');
      selectedImage.classList.add('img-' + align);
      // For center, allow resize
      if (align === 'center') {
        selectedImage.style.resize = 'both';
        selectedImage.style.overflow = 'auto';
        selectedImage.style.display = 'block';
        selectedImage.style.marginLeft = 'auto';
        selectedImage.style.marginRight = 'auto';
      } else {
        selectedImage.style.resize = 'none';
        selectedImage.style.overflow = 'visible';
        selectedImage.style.display = 'inline-block';
        selectedImage.style.marginLeft = align === 'left' ? '' : '8px';
        selectedImage.style.marginRight = align === 'right' ? '' : '8px';
      }
      // Always disable browser drag/copy
      selectedImage.draggable = false;
      selectedImage.ondragstart = function() { return false; };
      toolbar.style.display = 'none';
      selectedImage = null;
    }
  });
});
