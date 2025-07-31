  let savedRange = null;

  function openVideoModal() {
    saveSelection();
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('videoModal').style.display = 'block';
  }

  function closeVideoModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('videoModal').style.display = 'none';
    document.getElementById('videoSource').value = '';
    document.getElementById('videoWidth').value = '560';
    document.getElementById('videoHeight').value = '315';
  }

  function saveSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0).cloneRange();
    }
  }

  function restoreSelection() {
    if (savedRange) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }
  }

  function insertVideo() {
    const source = document.getElementById('videoSource').value.trim();
    const width = document.getElementById('videoWidth').value || 560;
    const height = document.getElementById('videoHeight').value || 315;

    if (!source) {
      alert('Please enter a video URL.');
      return;
    }

    restoreSelection();

    let embedElement;
    const wrapper = document.createElement('div');
    wrapper.setAttribute('style', 'display:inline-block; position:relative; margin-top:10px; border-radius:6px;');

    if (source.includes('youtube.com') || source.includes('youtu.be')) {
      let videoId = '';
      if (source.includes('youtube.com/watch')) {
        const urlParams = new URL(source).searchParams;
        videoId = urlParams.get('v');
      } else if (source.includes('youtu.be')) {
        videoId = source.split('/').pop();
      }

      if (!videoId) {
        alert('Invalid YouTube URL.');
        return;
      }

      embedElement = document.createElement('iframe');
      embedElement.src = `https://www.youtube.com/embed/${videoId}`;
      embedElement.width = width;
      embedElement.height = height;
      embedElement.frameBorder = 0;
      embedElement.allowFullscreen = true;
      embedElement.setAttribute('style', 'display:block; max-width:100%; border-radius:6px;');
    } else {
      embedElement = document.createElement('video');
      embedElement.controls = true;
      embedElement.width = width;
      embedElement.height = height;
      embedElement.setAttribute('style', 'display:block; max-width:100%; border-radius:6px;');

      const sourceTag = document.createElement('source');
      sourceTag.src = source;
      sourceTag.type = "video/mp4";
      embedElement.appendChild(sourceTag);
    }

    const resizeHandle = document.createElement('div');
    resizeHandle.setAttribute('style', 'position:absolute; bottom:0; right:0; width:12px; height:12px; background-color:#3b82f6; cursor:se-resize; border-radius:2px;');
    resizeHandle.className = 'resize-handle';

    wrapper.appendChild(embedElement);
    wrapper.appendChild(resizeHandle);

    if (savedRange) {
      savedRange.deleteContents();
      savedRange.insertNode(wrapper);

      const br = document.createElement('br');
      wrapper.parentNode.insertBefore(br, wrapper.nextSibling);

      savedRange.setStartAfter(br);
      savedRange.setEndAfter(br);

      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRange);
    }

    makeResizable(embedElement, resizeHandle);
    closeVideoModal();
  }

  function makeResizable(element, handle) {
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    handle.addEventListener("mousedown", function (e) {
      e.preventDefault();
      e.stopPropagation();

      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(window.getComputedStyle(element).width, 10);
      startHeight = parseInt(window.getComputedStyle(element).height, 10);

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    function onMouseMove(e) {
      if (!isResizing) return;

      const newWidth = startWidth + e.clientX - startX;
      const newHeight = startHeight + e.clientY - startY;

      if (newWidth > 50 && newHeight > 50) {
        element.style.width = newWidth + "px";
        element.style.height = newHeight + "px";
      }
    }

    function onMouseUp() {
      if (isResizing) {
        isResizing = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }
    }
  }
