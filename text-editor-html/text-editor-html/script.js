let fileHandles = {}; // To store FileSystemFileHandle for each file

let editorState = {
    content: '',
    history: [''],
    historyIndex: -1,
    fontSize: '14px',
    fontFamily: 'Arial',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    isBold: false,
    isItalic: false,
    isUnderline: false,
    textAlign: 'left'
};
let fileHandle = null;

// Color Palettes
const standardColors = ['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef',
    '#f3f3f3', '#ffffff', '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff',
    '#4a86e8', '#0000ff', '#9900ff', '#ff00ff', '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc',
    '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'];

const backgroundColors = ['#ffffff', '#f8f9fa', '#f1f3f4', '#e8eaed', '#dadce0', '#bdc1c6', '#9aa0a6', '#5f6368',
    '#3c4043', '#202124', '#fef7e0', '#fce8e6', '#fde7f3', '#e8f0fe', '#e6f4ea', '#fff3e0',
    '#f3e5f5', '#e1f5fe', '#e0f2f1', '#fff8e1'];

const gradientColors = [
    'linear-gradient(45deg, #ff6b6b, #feca57)',
    'linear-gradient(45deg, #48cae4, #023e8a)',
    'linear-gradient(45deg, #06ffa5, #0077b6)',
    'linear-gradient(45deg, #f72585, #b5179e)',
    'linear-gradient(45deg, #f77f00, #fcbf49)',
    'linear-gradient(45deg, #7209b7, #560bad)',
    'linear-gradient(45deg, #f72585, #4361ee)',
    'linear-gradient(45deg, #06ffa5, #7209b7)'
];
// Recent colors storage
let recentTextColors = JSON.parse(localStorage.getItem('recentTextColors') || '[]');
let recentBackgroundColors = JSON.parse(localStorage.getItem('recentBackgroundColors') || '[]');
let activePicker = null;
let backgroundOpacity = 1; // Default opacity for background
let savedRange = null; // To save the selection range
// Initialize editor
function initEditor() {
    updateTextAreaStyle();
    updateButtonStates();
    updateStats();
}
// Close color pickers when clicking outside
const textarea = document.getElementById('textArea');
function showColorPicker(type) {
    document.querySelectorAll('.color-picker-dropdown').forEach(dropdown => dropdown.classList.remove('show'));
    const dropdown = document.getElementById(`${type}ColorPicker`);
    dropdown.classList.add('show');
    if (!dropdown.hasChildNodes()) createColorPicker(`${type}ColorPicker`, type);
    // Save the current selection range
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
    }
}
function toggleColorPicker(type) {
    document.querySelectorAll('.color-picker-dropdown').forEach(dropdown => {
        if (!dropdown.id.includes(type)) dropdown.classList.remove('show');
    });
    const dropdown = document.getElementById(`${type}ColorPicker`);
    dropdown.classList.toggle('show');
    if (!dropdown.hasChildNodes()) createColorPicker(`${type}ColorPicker`, type);
}


// Create color pickers
function createColorPicker(containerId, type) {
    const container = document.getElementById(containerId);
    const colors = type === 'text' ? standardColors : backgroundColors;
    const recentColors = type === 'text' ? recentTextColors : recentBackgroundColors;

    let html = `
      <div class="color-section"><div class="color-section-title">Standard Colors</div><div class="color-grid">`;
    colors.forEach(color => {
        html += `<div class="color-option" style="background-color: ${color}" onclick="selectColor('${type}', '${color}')"></div>`;
    });
    html += `</div></div>`;

    if (type === 'background') {
        html += `<div class="color-section"><div class="color-section-title">Gradient Backgrounds</div><div class="color-grid large">`;
        gradientColors.forEach(gradient => {
            html += `<div class="gradient-option" style="background: ${gradient}" onclick="selectColor('${type}', '${gradient}')"></div>`;
        });
        html += `</div></div>`;
    }

    html += `<div class="color-section">
        <div class="color-section-title">Recent Colors</div>
        <div class="recent-colors">${recentColors.map(c => `<div class="color-option" style="background:${c}" onclick="selectColor('${type}', '${c}')"></div>`).join('')}</div>
      </div>
      <div class="custom-color-section">
        <div class="color-section-title">Custom Color</div>
        <input type="color" onchange="selectColor('${type}', this.value)">
        <div class="color-input-group">
          <input type="text" id="${type}Hex" placeholder="#000000" maxlength="7">
          <button onclick="applyHex('${type}')">Apply</button>
        </div>
        ${type === 'background' ? `
        <div class="color-input-group">
          <label>Opacity</label>
          <input type="range" min="0" max="100" value="100" oninput="changeOpacity('${type}', this.value)">
          <span id="${type}Opacity">100%</span>
        </div>` : ''}
      </div>`;

    container.innerHTML = html;
}

function selectColor(type, color) {

    // Restore the saved selection range
    const selection = window.getSelection();
    if (savedRange) {
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return; // No text selected

    const textArea = document.getElementById('textArea');
    if (!textArea.contains(range.commonAncestorContainer)) return;

    const span = document.createElement('span');
    if (type === 'background') {
        if (color.startsWith('linear-gradient')) {
            span.style.backgroundImage = color;
        } else {
            // If opacity is not 1, convert to rgba
            if (backgroundOpacity < 1) {
                span.style.backgroundColor = hexToRgba(color, backgroundOpacity);
            } else {
                span.style.backgroundColor = color;
            }
        }
    } else {
        span.style.color = color;
    }

    updateRecent(type, color);

    span.appendChild(range.extractContents());
    range.deleteContents();
    range.insertNode(span);

    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    selection.addRange(newRange);

    const dropdown = document.getElementById(`${type}ColorPicker`);
    dropdown?.classList.remove('show');

    // Clear saved range after applying
    savedRange = null;
}
// Apply hex color
function applyHex(type) {
    const val = document.getElementById(`${type}Hex`).value;
    if (/^#[0-9A-F]{6}$/i.test(val)) {
        selectColor(type, val); // Already hides the dropdown
    } else {
        alert('Invalid Hex Code');
    }
}

function updateRecent(type, color) {
    let list = type === 'text' ? recentTextColors : recentBackgroundColors;
    list = list.filter(c => c !== color);
    list.unshift(color);
    if (list.length > 10) list.pop();
    localStorage.setItem(type === 'text' ? 'recentTextColors' : 'recentBackgroundColors', JSON.stringify(list));
}
function changeOpacity(type, value) {
    document.getElementById(`${type}Opacity`).textContent = `${value}%`;
    if (type === 'background') {
        backgroundOpacity = value / 100;
    }
}

// Convert hex to rgba
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
// Close pickers on outside click
document.addEventListener('click', e => {
    const isInsidePicker = e.target.closest('.color-picker-palette');
    if (!isInsidePicker) {
        document.querySelectorAll('.color-picker-dropdown').forEach(el => el.classList.remove('show'));
    }
});

const state = {
    text: { manuallyToggled: false },
    background: { manuallyToggled: false }
};
document.getElementById('textPickerContainer').addEventListener('click', () => showColorPicker('text'));
document.getElementById('textPickerContainer').addEventListener('mouseenter', () => showColorPicker('text'));

document.getElementById('backgroundPickerContainer').addEventListener('click', () => showColorPicker('background'));
document.getElementById('backgroundPickerContainer').addEventListener('mouseenter', () => showColorPicker('background'));

// Expose functions for inline event handlers
window.selectColor = selectColor;
window.applyHex = applyHex;
window.changeOpacity = changeOpacity;

function saveToHistory() {
    const content = document.getElementById('textArea').innerHTML;
    if (editorState.history[editorState.historyIndex] !== content) {
        editorState.historyIndex++;
        editorState.history = editorState.history.slice(0, editorState.historyIndex); // remove redo steps
        editorState.history.push(content);
    }
}

// Undo function
function handleUndo() {
    if (editorState.historyIndex > 0) {
        editorState.historyIndex--;
        const previousContent = editorState.history[editorState.historyIndex];
        document.getElementById('textArea').innerHTML = previousContent;
    }
}

// (Optional) Redo function
function handleRedo() {
    if (editorState.historyIndex < editorState.history.length - 1) {
        editorState.historyIndex++;
        const nextContent = editorState.history[editorState.historyIndex];
        document.getElementById('textArea').innerHTML = nextContent;
    }
}

// Auto save on keyup/input
document.getElementById('textArea').addEventListener('input', saveToHistory);

// Initialize first state
saveToHistory();

// // History management
// function addToHistory(content) {
//     const newHistory = editorState.history.slice(0, editorState.historyIndex + 1);
//     newHistory.push(content);
//     editorState.history = newHistory;
//     editorState.historyIndex = newHistory.length - 1;
// }

// // Undo functionality
// function handleUndo() {
//     if (editorState.historyIndex > 0) {
//         editorState.historyIndex--;
//         editorState.content = editorState.history[editorState.historyIndex];
//         document.getElementById('textArea').value = editorState.content;
//         updateStats();
//         updateButtonStates();
//     }
// }

// // Redo functionality
// function handleRedo() {
//     if (editorState.historyIndex < editorState.history.length - 1) {
//         editorState.historyIndex++;
//         editorState.content = editorState.history[editorState.historyIndex];
//         document.getElementById('textArea').value = editorState.content;
//         updateStats();
//         updateButtonStates();
//     }
// }




//select the whole content
function selectAllText() {
    const textArea = document.getElementById("textArea");
    const range = document.createRange();
    range.selectNodeContents(textArea);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

//cut the selected text
async function cutText() {
    const selection = window.getSelection();
    let selectedText = selection.toString();
    const textArea = document.getElementById("textArea");

    // If nothing is selected, cut all text
    if (!selectedText || selectedText.trim().length === 0) {
        selectedText = textArea.innerText || textArea.textContent;
        if (!selectedText || selectedText.trim().length === 0) {
            alert('Editor is empty.');
            return;
        }
        // Select all text in the editor
        const range = document.createRange();
        range.selectNodeContents(textArea);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    // Now, cut the selected text
    if (selection.rangeCount > 0 && textArea.contains(selection.anchorNode)) {
        try {
            await navigator.clipboard.writeText(selection.toString());
            selection.deleteFromDocument();
            alert('Cut to clipboard!');
        } catch (err) {
            textArea.focus();
            document.execCommand('cut');
            alert('Cut using fallback method. If not working, check browser permissions.');
        }
    } else {
        alert('Please select text inside the editor.');
    }
}

//paste clipboard text at cursor position
async function pasteText() {
    const textArea = document.getElementById("textArea");
    textArea.focus();
    try {
        const text = await navigator.clipboard.readText();
        document.execCommand("insertText", false, text);
    } catch (err) {
        // Fallback: use execCommand('paste')
        document.execCommand('paste');
        alert('Pasted using fallback method. If not working, check browser permissions.');
    }
}

//copy the selected text
function copySelectedText() {
    const selection = window.getSelection();
    let selectedText = selection.toString();

    // If nothing is selected, copy all text from editor
    if (!selectedText || selectedText.trim().length === 0) {
        const textArea = document.getElementById("textArea");
        selectedText = textArea.innerText || textArea.textContent;
        if (!selectedText || selectedText.trim().length === 0) {
            alert('Editor is empty.');
            return;
        }
    }

    navigator.clipboard.writeText(selectedText).then(() => {
        alert('Copied to clipboard!');
    }).catch(err => {
        alert('Failed to copy: ' + err);
    });
}
// Font family change
// function handleFontFamilyChange() {
//     const fontFamily = document.getElementById('fontFamily').value;
//     editorState.fontFamily = fontFamily;
//     updateTextAreaStyle();
// } 

function handleFontFamilyChange() {
    const fontFamily = document.getElementById('fontFamily').value;
    const selection = window.getSelection();

    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    // If text is selected
    if (!selection.isCollapsed) {
        const span = document.createElement("span");
        span.style.fontFamily = fontFamily;

        const content = range.extractContents(); // cut selected text
        span.appendChild(content);               // wrap in span
        range.deleteContents();                  // delete original
        range.insertNode(span);                  // insert styled version

        // Optional: reselect the new span
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(newRange);
    } else {
        // Cursor only — insert span for future text
        const span = document.createElement("span");
        span.style.fontFamily = fontFamily;
        span.innerHTML = "\u200B"; // zero-width space

        range.insertNode(span);

        // Move cursor inside span after the ZWSP
        const newRange = document.createRange();
        newRange.setStart(span.firstChild, 1);
        newRange.setEnd(span.firstChild, 1);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }
}
// Font size change

function handleFontSizeChange() {
    const fontSize = document.getElementById('fontSize').value + "px";
    const selection = window.getSelection();

    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    // If there's selected text
    if (!selection.isCollapsed) {
        const span = document.createElement("span");
        span.style.fontSize = fontSize;

        const content = range.extractContents();
        span.appendChild(content);
        range.deleteContents();
        range.insertNode(span);

        // Move cursor after the new span
        range.setStartAfter(span);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        // No selected text, insert span for future typing
        const span = document.createElement("span");
        span.style.fontSize = fontSize;
        span.innerHTML = "\u200B"; // zero-width space

        range.insertNode(span);

        // Move cursor inside the new span
        range.setStart(span.firstChild, 1);
        range.setEnd(span.firstChild, 1);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}
// Font size change
// function handleFontSizeChange() {
//     const fontSize = document.getElementById('fontSize').value;
//     editorState.fontSize = fontSize;
//     updateTextAreaStyle();
// }

// Toggle text formatting
function toggleFormat(format) {
    let buttonId = '';
    switch (format) {
        case 'bold':
            editorState.isBold = !editorState.isBold;
            buttonId = 'boldBtn';
            break;
        case 'italic':
            editorState.isItalic = !editorState.isItalic;
            buttonId = 'italicBtn';
            break;
        case 'underline':
            editorState.isUnderline = !editorState.isUnderline;
            buttonId = 'underlineBtn';
            break;
    }

    // Toggle visual active state
    const button = document.getElementById(buttonId);
    button.classList.toggle('active');

    // Apply formatting
    document.execCommand(format, false, null);

    // Optional: update other UI elements if needed
    updateButtonStates();
}



function toggleFormat(format) {
    document.execCommand(format, false, null);

    switch (format) {
        case 'bold':
            editorState.isBold = !editorState.isBold;
            break;
        case 'italic':
            editorState.isItalic = !editorState.isItalic;
            break;
        case 'underline':
            editorState.isUnderline = !editorState.isUnderline;
            break;
    }

    updateButtonStates();
}
//showing file bar
// function MenuClick() {
//     const menu = document.getElementsByClassName('file-menu')[0];
//     if (menu.style.display == "block") {
//         menu.style.display = "none";
//     }
//     else {
//         menu.style.display = "block";
//     }
// }
// //showing edit bar
// function MenuClick2() {
//     const menu = document.getElementsByClassName('file-menu')[1];
//     if (menu.style.display == "block") {
//         menu.style.display = "none";
//     }
//     else {
//         menu.style.display = "block";
//     }
// }
// // showing insert bar
// function MenuClick3() {
//     const menu = document.getElementsByClassName('file-menu')[2];
//     if (menu.style.display == "block") {
//         menu.style.display = "none";
//     }
//     else {
//         menu.style.display = "block";
//     }
// }

// function MenuClick5() {
//     const menu = document.getElementsByClassName('file-menu')[3];
//     if (menu.style.display == "block") {
//         menu.style.display = "none";
//     }
//     else {
//         menu.style.display = "block";
//     }
// }
const naina = document.getElementsByClassName('file-menu')[3];
document.getElementsByClassName("file-navbar-5")[0].addEventListener("mouseenter", () =>{
    naina.style.display ="block";
});
document.getElementsByClassName("file-navbar-5")[0].addEventListener("mouseleave", () =>{
    naina.style.display ="none";
});




function showfont() {
    const show = document.getElementsByClassName('fomenu')[0];
    if (show.style.display == "none") {
        show.style.display = "block"
    }
    else {
        show.style.display = "none"
    }
}

// for upload
function submitText() {
    const textArea = document.getElementById("textArea");
    const alertBox = document.getElementById("successAlert");

    const topLevelElements = Array.from(textArea.children);
    let idCounter = 1;

    topLevelElements.forEach(el => {
        assignIdsRecursively(el);
        console.log(el.outerHTML);
    });

    const text = textArea.innerHTML.trim().replace(/<[^>]*>/g, '').trim();

    if (text === "") {
        alertBox.innerText = "Please write the text first";
        alertBox.style.display = "block";
        alertBox.style.backgroundColor = "#fc3e28";
    } else if (!isSaved) {
        alertBox.innerText = "Please save the file first";
        alertBox.style.display = "block";
        alertBox.style.backgroundColor = "#f2c855";
    } else {
        alertBox.innerText = "Successfully submitted!";
        alertBox.style.display = "block";
        alertBox.style.backgroundColor = "#4ade80";
    }

    setTimeout(() => {
        alertBox.style.display = "none";
    }, 3000);

    function assignIdsRecursively(element) {
        if (!element.id) {
            element.id = "elem-" + idCounter++;
        }
        Array.from(element.children).forEach(child => assignIdsRecursively(child));
    }
}




//for font in menu 
// function textsize() {
//     const font = document.getElementsByClassName('font-size-select-menu')[0];
//     if (font.style.display == "none") {
//         font.style.display = "block"
//     }
//     else {
//         font.style.display = "none"
//     }
// }

// Set text alignment
function setAlignment(alignment) {
    editorState.textAlign = alignment;
    document.execCommand('justify' + alignment.charAt(0).toUpperCase() + alignment.slice(1), false, null);
    updateButtonStates();
}

// Update textarea styling
function updateTextAreaStyle() {
    const textArea = document.getElementById('textArea');
    textArea.style.fontSize = editorState.fontSize + 'px';
    textArea.style.fontFamily = editorState.fontFamily;
    textArea.style.color = editorState.textColor;

    // Handle gradient backgrounds
    if (editorState.backgroundColor.includes('gradient')) {
        textArea.style.background = editorState.backgroundColor;
        textArea.style.backgroundColor = 'transparent';
    } else {
        textArea.style.backgroundColor = editorState.backgroundColor;
        textArea.style.background = 'none';
    }

    textArea.style.fontWeight = editorState.isBold ? 'bold' : 'normal';
    textArea.style.fontStyle = editorState.isItalic ? 'italic' : 'normal';
    textArea.style.textDecoration = editorState.isUnderline ? 'underline' : 'none';
    textArea.style.textAlign = editorState.textAlign;
}

// Update button states
function updateButtonStates() {
    // === Remove 'active' class from all formatting buttons ===
    ['boldBtn', 'italicBtn', 'underlineBtn'].forEach(id => {
        document.getElementById(id).classList.remove('active');
    });

    // === Add 'active' class for formatting based on state ===
    if (editorState.isBold) {
        document.getElementById('boldBtn').classList.add('active');
    }
    if (editorState.isItalic) {
        document.getElementById('italicBtn').classList.add('active');
    }
    if (editorState.isUnderline) {
        document.getElementById('underlineBtn').classList.add('active');
    }

    // === Remove 'active' class from all alignment buttons ===
    ['Left', 'Center', 'Right', 'Justify'].forEach(align => {
        document.getElementById('align' + align + 'Btn').classList.remove('active');
    });

    // === Add 'active' class to current alignment button ===
    const currentAlign = editorState.textAlign.charAt(0).toUpperCase() + editorState.textAlign.slice(1);
    const alignBtn = document.getElementById('align' + currentAlign + 'Btn');
    if (alignBtn) {
        alignBtn.classList.add('active');
    }
}



// Update character and word count
function updateStats() {
    const content = editorState.content;
    const charCount = content.length;
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

    document.getElementById('charCount').textContent = `Characters: ${charCount}`;
    document.getElementById('wordCount').textContent = `Words: ${wordCount}`;
}
const textArea = document.getElementById("textArea");

textArea.addEventListener("input", () => {
    editorState.content = textArea.innerText; // or textArea.innerHTML if needed
    updateStats();
});

function updateStatsFromHTML() {
    const htmlContent = document.getElementById("textArea").innerHTML;
    const textContent = document.getElementById("textArea").textContent || "";

    const charCount = textContent.length;
    const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;

    document.getElementById('charCount').textContent = `Characters: ${charCount}`;
    document.getElementById('wordCount').textContent = `Words: ${wordCount}`;
}


// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'z':
                e.preventDefault();
                if (e.shiftKey) {
                    handleRedo();
                } else {
                    handleUndo();
                }
                break;
            case 'y':
                e.preventDefault();
                handleRedo();
                break;
            case 'b':
                e.preventDefault();
                toggleFormat('bold');
                break;
            case 'i':
                e.preventDefault();
                toggleFormat('italic');
                break;
            case 'u':
                e.preventDefault();
                toggleFormat('underline');
                break;
        }
    }
});

// Initialize when page loads
window.addEventListener('load', initEditor);

function insertHorizontalLine() {
    const editor = document.getElementById('textArea');

    // Create elements
    const br = document.createElement("br");
    const hr = document.createElement("hr");

    // Append <br> and <hr> at the end
    editor.appendChild(br.cloneNode());
    editor.appendChild(hr);
    editor.appendChild(br.cloneNode());

    // Scroll to bottom after inserting line
    editor.scrollTop = editor.scrollHeight;
}
function MenuClick3() {
    const menu = document.querySelector('.file-navbar-3');
    menu.classList.toggle('show-menu');
}

function insertHorizontalLine() {
    const editor = document.getElementById('textArea');

    // Create HR and spacing
    const br = document.createElement("br");
    const hr = document.createElement("hr");

    editor.appendChild(br.cloneNode());
    editor.appendChild(hr);
    editor.appendChild(br.cloneNode());

    editor.scrollTop = editor.scrollHeight;
}
let files = {};
let currentFile = null;
let fileCounter = 1;
let openedFiles = [];
// let fileContents = {};

function createNewFile() {
    // Save current file if any
    if (currentFile !== null) {
        files[currentFile] = document.getElementById("textArea").innerHTML;
    }

    const fileName = `Untitled-${fileCounter++}`;
    files[fileName] = ""; // Set blank content
    currentFile = fileName;

    if (!openedFiles.includes(fileName)) {
        openedFiles.push(fileName);
    }

    document.getElementById("currentFileName").innerText = fileName;
    document.getElementById("textArea").innerHTML = ""; // CLEAR TEXTAREA
    updateFileTabs();
}

function openFile(fileName) {
    if (currentFile !== null) {
        files[currentFile] = document.getElementById("textArea").innerHTML;
    }

    currentFile = fileName;
    document.getElementById("currentFileName").innerText = fileName;
    document.getElementById("textArea").innerHTML = files[fileName];

    if (!openedFiles.includes(fileName)) {
        openedFiles.push(fileName);
    }

    updateFileTabs();
}

// function updateFileTabs() {
//     const tabBar = document.getElementById("fileTabs");
//     tabBar.innerHTML = "";

//     openedFiles.forEach(fileName => {
//         const tab = document.createElement("div");
//         tab.className = "tab" + (fileName === currentFile ? " active" : "");

//         const nameSpan = document.createElement("span");
//         nameSpan.textContent = fileName;
//         nameSpan.onclick = () => openFile(fileName);

//         const closeBtn = document.createElement("button");
//         closeBtn.textContent = "x";
//         closeBtn.onclick = (e) => {
//             e.stopPropagation();
//             const index = openedFiles.indexOf(fileName);
//             if (index !== -1) openedFiles.splice(index, 1);
//             updateFileTabs();

//             if (currentFile === fileName) {
//                 document.getElementById("currentFileName").innerText = "No file opened";
//                 document.getElementById("textArea").innerHTML = "";
//                 currentFile = null;
//             }
//         };

//         tab.appendChild(nameSpan);
//         tab.appendChild(closeBtn);
//         tabBar.appendChild(tab);
//     });
// }

//modified
function updateFileTabs() {
    const tabBar = document.getElementById("fileTabs");
    tabBar.innerHTML = "";

    openedFiles.forEach(fileName => {
        const tab = document.createElement("div");
        tab.className = "tab" + (fileName === currentFile ? " active" : "");

        const nameSpan = document.createElement("span");
        nameSpan.textContent = fileName;
        nameSpan.style.cursor = "pointer";
        nameSpan.onclick = () => openFile(fileName); // 🟢 Load file when tab clicked

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "×";
        closeBtn.title = "Close file";
        closeBtn.style.marginLeft = "6px";
        closeBtn.style.border = "none";
        closeBtn.style.background = "transparent";
        closeBtn.style.color = "red";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.fontSize = "16px";
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            const index = openedFiles.indexOf(fileName);
            if (index !== -1) {
                openedFiles.splice(index, 1);
                delete files[fileName];
            }

            // If the closed file was active, switch to last file or clear
            if (currentFile === fileName) {
                currentFile = openedFiles[openedFiles.length - 1] || null;
                if (currentFile) {
                    const newContent = files[currentFile];
                    document.getElementById("currentFileName").textContent = currentFile;
                    document.getElementById("textArea").innerHTML = marked.parse(newContent);
                } else {
                    document.getElementById("currentFileName").textContent = "No file opened";
                    document.getElementById("textArea").innerHTML = "";
                }
            }

            updateFileTabs();
        };

        tab.style.display = "flex";
        tab.style.alignItems = "center";
        tab.style.gap = "4px";

        tab.appendChild(nameSpan);
        tab.appendChild(closeBtn);
        tabBar.appendChild(tab);
    });
}


// Auto-save while typing
document.getElementById("textArea").addEventListener("input", () => {
    if (currentFile !== null) {
        files[currentFile] = document.getElementById("textArea").innerHTML;
    }
});

// Auto-create first file on load
createNewFile();

//when the user click on save 
let isSaved = false; // ✅ Declare globally

async function saveAsTextFile() {
    const content = document.getElementById("textArea").innerText;

    try {
        // If current file already has a handle, save directly
        if (currentFile && fileHandles[currentFile]) {
            const writable = await fileHandles[currentFile].createWritable();
            await writable.write(content);
            await writable.close();

            files[currentFile] = content;
            isSaved = true;

            alert('File updated successfully!');
            return;
        }

        // Show Save As dialog (first time)
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: currentFile || "untitled.txt",
            types: [{
                description: 'Text Files',
                accept: { 'text/plain': ['.txt'] }
            }]
        });

        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();

        const fileName = fileHandle.name;

        // Store file data
        files[fileName] = content;
        fileHandles[fileName] = fileHandle;

        // Rename tab if it's "Untitled-X"
        if (currentFile && currentFile.startsWith("Untitled-")) {
            const oldIndex = openedFiles.indexOf(currentFile);
            if (oldIndex !== -1) openedFiles[oldIndex] = fileName;
            delete files[currentFile];
        }

        currentFile = fileName;
        document.getElementById("currentFileName").innerText = fileName;
        updateFileTabs();

        isSaved = true;

        alert('File saved successfully!');
    } catch (err) {
        console.error('Save cancelled or failed', err);
        alert("Save cancelled or failed.");
    }
}

//event listener for CTRL+S
document.addEventListener("keydown", function (e) {
    // Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault(); // Prevent browser's default Save As behavior
        saveAsTextFile();   // Call your save function
    }
});


//when the user click on save as
async function saveAs() {
    try {
        const content = document.getElementById("textArea").innerText;

        const newHandle = await window.showSaveFilePicker({
            suggestedName: currentFileHandle?.name || "untitled.txt",
            types: [{
                description: "Text Files",
                accept: { "text/plain": [".txt"] }
            }]
        });

        const writable = await newHandle.createWritable();
        await writable.write(content);
        await writable.close();

        alert("File saved successfully.");
    } catch (err) {
        if (err.name !== 'AbortError') {
            alert("Save As failed: " + err.message);
        }
    }
}

textArea.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
        e.preventDefault(); // Prevent default tab behavior

        // Create 4 spaces or a tab character
        const tabSpaces = '\u00a0\u00a0\u00a0\u00a0'; // Non-breaking spaces

        // Insert spaces at caret position
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const tabNode = document.createTextNode(tabSpaces);
        range.insertNode(tabNode);

        // Move cursor after inserted spaces
        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);
        selection.removeAllRanges();
        selection.addRange(range);
    }
});

//for subscript and superscript
function applyFormat(tag) {
    const editor = document.getElementById("textArea");
    const selection = window.getSelection();

    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();

    // Walk up to check if selection is inside the editor
    let node = range.startContainer;
    let insideEditor = false;
    while (node) {
        if (node === editor) {
            insideEditor = true;
            break;
        }
        node = node.parentNode;
    }

    if (!insideEditor) {
        alert("Please select text inside the editor.");
        return;
    }

    if (selectedText.trim() === "") return;

    const wrapper = document.createElement(tag);
    wrapper.textContent = selectedText;

    range.deleteContents();
    range.insertNode(wrapper);

    const newRange = document.createRange();
    newRange.setStartAfter(wrapper);
    newRange.collapse(true);

    selection.removeAllRanges();
    selection.addRange(newRange);
}

//wrap in the <>
function wrapWithAngleBrackets() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (!range || selection.isCollapsed) return; // nothing selected

    const selectedText = range.toString();
    const wrappedText = `<${selectedText}>`;

    const textNode = document.createTextNode(wrappedText);
    range.deleteContents(); 
    range.insertNode(textNode); 

    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.setStartAfter(textNode);
    newRange.collapse(true);
    selection.addRange(newRange);
}

//heading in the menu
function headingElement(tag) {
    const editor = document.getElementById("textArea");
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();
    let node = range.startContainer;
    let insideEditor = false;
    while (node) {
        if (node === editor) {
            insideEditor = true;
            break;
        }
        node = node.parentNode;
    }
    if (!insideEditor) {
        alert("Please select text inside the editor.");
        return;
    }
    if (selectedText.trim() === "") return;
    const wrapper = document.createElement(tag);
    wrapper.textContent = selectedText;
    range.deleteContents();
    range.insertNode(wrapper);
    const newRange = document.createRange();
    newRange.setStartAfter(wrapper);
    newRange.collapse(true);

    selection.removeAllRanges();
    selection.addRange(newRange);
}
//for opening any file
// async function openFile() {
//   try {
//     const [fileHandle] = await window.showOpenFilePicker({
//       types: [{
//         description: 'Text or Markdown Files',
//         accept: { 'text/plain': ['.txt', '.md'] }
//       }]
//     });

//     const file = await fileHandle.getFile();
//     const content = await file.text();

//     // Get file name
//     const fileName = file.name;

//     // ✅ Set current file
//     currentFile = fileName;

//     // ✅ Add to opened files if not already there
//     if (!openedFiles.includes(fileName)) {
//       openedFiles.push(fileName);
//     }

//     // ✅ Update file tabs
//     updateFileTabs();

//     // ✅ Show current file name
//     document.getElementById("currentFileName").textContent = fileName;

//     // ✅ Convert Markdown to HTML and display
//     const htmlContent = marked.parse(content);
//     document.getElementById("textArea").innerHTML = htmlContent;

//   } catch (err) {
//     console.error("Error opening file:", err);
//   }
// }
if (currentFile) {
    files[currentFile] = document.getElementById("textArea").innerHTML;
}
async function openFile(fileNameToOpen = null) {
    try {
        // ✅ Save current editor content before switching
        if (currentFile) {
            files[currentFile] = document.getElementById("textArea").innerHTML;
        }

        let fileName;
        let content;

        if (fileNameToOpen) {
            // ✅ Switch to existing file/tab
            fileName = fileNameToOpen;
            content = files[fileName] || "";
        } else {
            // ✅ Import new file
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'Text or Markdown Files',
                    accept: { 'text/plain': ['.txt', '.md'] }
                }]
            });

            const file = await fileHandle.getFile();
            const rawName = file.name;
            content = await file.text();

            // ✅ Ensure unique name
            let counter = 1;
            fileName = rawName;
            while (openedFiles.includes(fileName)) {
                const base = rawName.replace(/\.[^/.]+$/, "");
                const ext = rawName.match(/\.[^/.]+$/)?.[0] || "";
                fileName = `${base} (${counter})${ext}`;
                counter++;
            }

            // ✅ Store content
            openedFiles.push(fileName);
            files[fileName] = content;
        }

        // ✅ Set current and render
        currentFile = fileName;
        document.getElementById("currentFileName").textContent = fileName;
        document.getElementById("textArea").innerHTML = marked.parse(content || "");
        updateStatsFromHTML(); // ✅ Add this line

        updateFileTabs();
    } catch (err) {
        console.error("Error opening file:", err);
    }
}

function createUntitledFile() {
    const fileName = "Untitled";
    if (!openedFiles.includes(fileName)) {
        openedFiles.push(fileName);
        files[fileName] = "Start writing here..."; // or "" if preferred
    }
    currentFile = fileName;
    document.getElementById("currentFileName").textContent = fileName;
    document.getElementById("textArea").innerHTML = marked.parse(files[fileName]);
    updateFileTabs();
}

//when the user clicks on table button
// const tableBtn = document.getElementById('tableBtn');
// const tableGrid = document.getElementById('tableGrid');

// const maxRows = 10;
// const maxCols = 10;

// // Create 10x10 grid
// for (let i = 0; i < maxRows; i++) {
//     for (let j = 0; j < maxCols; j++) {
//         const cell = document.createElement('div');
//         cell.className = 'grid-cell';
//         cell.dataset.row = i + 1;
//         cell.dataset.col = j + 1;
//         cell.style.width = '20px';
//         cell.style.height = '20px';
//         cell.style.border = '1px solid #ccc';
//         cell.style.display = 'inline-block';
//         cell.style.boxSizing = 'border-box';
//         tableGrid.appendChild(cell);
//     }
//     tableGrid.appendChild(document.createElement('br'));
// }

// let selectedRows = 0;
// let selectedCols = 0;

// // Show/hide grid
// tableBtn.addEventListener('click', () => {
//     tableGrid.style.display = 'block';
// });

// document.addEventListener('click', (e) => {
//     if (!tableGrid.contains(e.target) && e.target !== tableBtn) {
//         tableGrid.style.display = 'none';
//     }
// });

// tableGrid.addEventListener('mouseover', (e) => {
//     if (!e.target.classList.contains('grid-cell')) return;

//     selectedRows = parseInt(e.target.dataset.row);
//     selectedCols = parseInt(e.target.dataset.col);

//     const cells = document.querySelectorAll('.grid-cell');
//     cells.forEach(cell => {
//         const row = parseInt(cell.dataset.row);
//         const col = parseInt(cell.dataset.col);
//         cell.style.backgroundColor = (row <= selectedRows && col <= selectedCols) ? '#42a7f5' : '';
//     });
// });
// tableGrid.addEventListener('click', () => {
//     const wrapper = document.createElement('div');
//     wrapper.className = 'resizable-wrapper';
//     wrapper.contentEditable = false;
//     wrapper.style.display = 'inline-block';
//     wrapper.style.resize = 'both';
//     wrapper.style.overflow = 'auto';
//     wrapper.style.padding = '2px';
//     wrapper.style.margin = '10px 0';

//     const table = document.createElement('table');
//     table.style.borderCollapse = 'collapse';
//     table.style.width = '100%';
//     table.style.height = '100%';

//     for (let i = 0; i < selectedRows; i++) {
//         const tr = document.createElement('tr');
//         for (let j = 0; j < selectedCols; j++) {
//             const td = document.createElement('td');
//             td.contentEditable = "true";
//             td.innerHTML = '&nbsp;';
//             td.style.border = '1px solid #333';
//             td.style.padding = '5px';
//             td.style.textAlign = 'center';
//             td.style.outline = 'none';
//             td.style.boxShadow = 'none';
//             td.style.width = '100px';
//             tr.appendChild(td);
//         }
//         table.appendChild(tr);
//     }

//     wrapper.appendChild(table);
//     textArea.appendChild(wrapper);
//     tableGrid.style.display = 'none';
// });
const tableBtn = document.getElementById('tableBtn');
const tableGrid = document.getElementById('tableGrid');

const maxRows = 10;
const maxCols = 10;

// Create 10x10 grid
for (let i = 0; i < maxRows; i++) {
    for (let j = 0; j < maxCols; j++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = i + 1;
        cell.dataset.col = j + 1;
        Object.assign(cell.style, {
            width: '20px',
            height: '20px',
            border: '1px solid #ccc',
            display: 'inline-block',
            boxSizing: 'border-box'
        });
        tableGrid.appendChild(cell);
    }
    tableGrid.appendChild(document.createElement('br'));
}

let selectedRows = 0;
let selectedCols = 0;

// Show grid
tableBtn.addEventListener('click', () => {
    tableGrid.style.display = 'block';
});

// Hide grid when clicking outside
document.addEventListener('click', (e) => {
    if (!tableGrid.contains(e.target) && e.target !== tableBtn) {
        tableGrid.style.display = 'none';
    }
});

// Hover to highlight
tableGrid.addEventListener('mouseover', (e) => {
    if (!e.target.classList.contains('grid-cell')) return;

    selectedRows = parseInt(e.target.dataset.row);
    selectedCols = parseInt(e.target.dataset.col);

    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        cell.style.backgroundColor = (row <= selectedRows && col <= selectedCols) ? '#42a7f5' : '';
    });
});

// Click to insert table (only once)
tableGrid.addEventListener('click', (e) => {
    if (!e.target.classList.contains('grid-cell')) return;

    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);

    insertTable(row, col);         // ✅ Insert correct-sized table
    tableGrid.style.display = 'none'; // ✅ Hide the grid
});

// ✅ Separate function for inserting the table
function insertTable(rows, cols) {
    const wrapper = document.createElement('div');
    wrapper.className = 'resizable-wrapper';
    wrapper.contentEditable = false;
    Object.assign(wrapper.style, {
        display: 'inline-block',
        resize: 'both',
        overflow: 'auto',
        padding: '2px',
        margin: '10px 0'
    });

    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.height = '100%';

    for (let i = 0; i < rows; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            const td = document.createElement('td');
            td.contentEditable = "true";
            td.innerHTML = '&nbsp;';
            Object.assign(td.style, {
                border: '1px solid #333',
                padding: '5px',
                textAlign: 'center',
                outline: 'none',
                boxShadow: 'none',
                width: '100px'
            });
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    wrapper.appendChild(table);
    textArea.appendChild(wrapper);
    tableGrid.style.display = 'none';
}










function insertSpacing() {
    const textArea = document.getElementById('textArea');
    textArea.focus();

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    // Create a span element with 100px width spacer
    const spacer = document.createElement('span');
    spacer.style.display = 'inline-block';
    spacer.style.width = '100px';
    spacer.innerHTML = '&nbsp;'; // Needed to keep the span from collapsing

    range.insertNode(spacer);

    // Move cursor after the inserted span
    range.setStartAfter(spacer);
    range.setEndAfter(spacer);
    selection.removeAllRanges();
    selection.addRange(range);
}

// image uploading 
const fileInput = document.getElementById("fileInput");
textArea.addEventListener("mouseup", saveCursor);
textArea.addEventListener("keyup", saveCursor);
textArea.addEventListener("focus", saveCursor);

function saveCursor() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0);
    }
}

fileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const wrapper = document.createElement("span");
        wrapper.className = "image-wrapper";
        wrapper.setAttribute("contenteditable", "false");

        const img = document.createElement("img");
        img.src = e.target.result;
        img.style.width = "200px"; // Default width

        const resizer = document.createElement("div");
        resizer.className = "resizer";

        wrapper.appendChild(img);
        wrapper.appendChild(resizer);
        makeResizable(img, resizer);

        insertImageAtCursor(wrapper);
    };

    reader.readAsDataURL(file);

    // ✅ Reset input so selecting the same file again will trigger 'change'
    fileInput.value = "";
});


function insertImageAtCursor(imageWrapper) {
    if (!savedRange) {
        textArea.appendChild(imageWrapper);
        return;
    }

    const range = savedRange.cloneRange();
    range.deleteContents();

    range.insertNode(imageWrapper);

    // Insert space to move cursor after image
    const space = document.createTextNode("\u00A0");
    imageWrapper.parentNode.insertBefore(space, imageWrapper.nextSibling);

    const newRange = document.createRange();
    newRange.setStartAfter(space);
    newRange.collapse(true);

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(newRange);
    textArea.focus();

    saveCursor(); // update for next image
}


function makeResizable(img, handle) {
    handle.addEventListener("mousedown", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startWidth = parseInt(window.getComputedStyle(img).width, 10);

        function onMouseMove(e) {
            const newWidth = startWidth + e.clientX - startX;
            img.style.width = newWidth + "px";
        }

        function onMouseUp() {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });
}
// uploading pptx\

//  function insertHTMLAtCursor(html) {
//     const sel = window.getSelection();
//     if (!sel || !sel.rangeCount) {
//       // Append if no selection
//       document.getElementById('textArea').insertAdjacentHTML('beforeend', html);
//       return;
//     }

//     const range = sel.getRangeAt(0);
//     const el = document.createElement("div");
//     el.innerHTML = html;

//     const frag = document.createDocumentFragment();
//     let node, lastNode;
//     while ((node = el.firstChild)) {
//       lastNode = frag.appendChild(node);
//     }

//     range.deleteContents();
//     range.insertNode(frag);

//     // Move cursor to the end of inserted content
//     if (lastNode) {
//       range.setStartAfter(lastNode);
//       range.setEndAfter(lastNode);
//       sel.removeAllRanges();
//       sel.addRange(range);
//     }
//   }

function saveCursor() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        savedRange = sel.getRangeAt(0).cloneRange();
    }
}

// Restore the cursor before inserting content
function insertHTMLAtCursor(htmlString) {
    const range = savedRange;
    if (!range) {
        textArea.insertAdjacentHTML("beforeend", htmlString);
        return;
    }

    const temp = document.createElement("div");
    temp.innerHTML = htmlString;
    const fragment = document.createDocumentFragment();

    Array.from(temp.childNodes).forEach(node => fragment.appendChild(node));

    range.deleteContents();
    range.insertNode(fragment);

    // Move cursor after inserted content
    const newRange = document.createRange();
    newRange.setStartAfter(fragment.lastChild);
    newRange.collapse(true);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(newRange);

    // Save updated position
    saveCursor();
}

// Track cursor on click or keyup
textArea.addEventListener("mouseup", saveCursor);
textArea.addEventListener("keyup", saveCursor);
textArea.addEventListener("input", saveCursor);

function uploadPPT() {
    const fileInput2 = document.getElementById('fileInput2');
    const file = fileInput2.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('ppt', file);

    fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.content) {
                insertHTMLAtCursor(data.content);
            } else {
                alert('Failed to read PPT');
            }
        })
    // .catch(err => {
    //     console.error(err);
    //     alert('Error uploading PPT');
    // });
}
//adding pdf button
async function openPDF() {
    try {
        // Open file picker
        const [fileHandle] = await window.showOpenFilePicker({
            types: [{ description: 'PDF files', accept: { 'application/pdf': ['.pdf'] } }],
            multiple: false
        });

        const file = await fileHandle.getFile();
        const arrayBuffer = await file.arrayBuffer();

        // Load PDF with PDF.js
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const textAreaDiv = document.getElementById("textArea");
        textAreaDiv.innerHTML = ""; // Clear previous content

        let htmlContent = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // Each item as a span, each page as a paragraph
            const pageHtml = textContent.items.map(item => `<span>${item.str}</span>`).join(" ");
            htmlContent += `<p>${pageHtml}</p>`;
        }
        textAreaDiv.innerHTML = htmlContent.trim();
    } catch (err) {
        console.error("Error:", err);
        alert("Failed to open or read PDF file.");
    }
}

//adding document button 
async function uploadDocx() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx';
    input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('docx', file);

        try {
            const res = await fetch('http://127.0.0.1:5000/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            const textArea = document.getElementById('textArea');
            textArea.insertAdjacentHTML('beforeend', data.html_content);
        } catch (err) {
            alert('Error uploading file');
            console.error(err);
        }
    };
    input.click();
}

//adding excel sheet 

// Save the current cursor position
document.getElementById("textArea").addEventListener("mouseup", saveCursor);
document.getElementById("textArea").addEventListener("keyup", saveCursor);

function saveCursor() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0);
    }
}

async function uploadExcel() {
    try {
        const [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'Excel Files',
                accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
            }]
        });

        const file = await fileHandle.getFile();
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        insertExcelAtSavedCursor(data);
    } catch (err) {
        console.error("Error:", err);
        alert("Failed to read Excel file.");
    }
}

function insertExcelAtSavedCursor(data) {
    const resizableDiv = document.createElement("div");
    resizableDiv.setAttribute("style", `
        resize: both;
        overflow: auto;
        border: 2px dashed #ccc;
        width: 600px;
        height: 300px;
        position: relative;
        padding: 0;
        display: inline-block;
        margin: 10px 0;
      `);

    const scaleWrapper = document.createElement("div");
    scaleWrapper.setAttribute("style", `
        transform-origin: top left;
        width: fit-content;
      `);

    const table = document.createElement("table");
    table.setAttribute("style", "border-collapse: collapse;");

    data.forEach(rowData => {
        const row = document.createElement("tr");

        rowData.forEach(cellData => {
            const cell = document.createElement("td");
            cell.contentEditable = "true";
            cell.innerText = cellData ?? '';
            cell.setAttribute("style", `
            border: 1px solid #888;
            padding: 8px;
            min-width: 100px;
            cursor: text;
            word-break: break-word;
          `);
            row.appendChild(cell);
        });

        table.appendChild(row);
    });

    scaleWrapper.appendChild(table);
    resizableDiv.appendChild(scaleWrapper);

    // Insert at saved range
    const selection = window.getSelection();
    if (savedRange) {
        selection.removeAllRanges();
        selection.addRange(savedRange);
        savedRange.deleteContents(); // optional: remove selected text
        savedRange.insertNode(resizableDiv);

        // Create a temporary span as cursor anchor
        const afterSpan = document.createElement("span");
        afterSpan.innerHTML = "<br>"; // Makes sure it's visible in editable div
        resizableDiv.parentNode.insertBefore(afterSpan, resizableDiv.nextSibling);

        // Move the cursor just after the inserted table
        const newRange = document.createRange();
        newRange.setStartAfter(afterSpan);
        newRange.collapse(true);

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(newRange);

        // Save cursor for next insert
        savedRange = newRange;
    } else {
        // fallback: append at end
        document.getElementById("textArea").appendChild(resizableDiv);
    }

    // Resizing logic
    const originalWidth = resizableDiv.offsetWidth;
    const originalHeight = resizableDiv.offsetHeight;

    const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
            const scaleX = entry.contentRect.width / originalWidth;
            const scaleY = entry.contentRect.height / originalHeight;
            const scale = Math.min(scaleX, scaleY);
            scaleWrapper.style.transform = `scale(${scale})`;
        }
    });

    resizeObserver.observe(resizableDiv);
}


//list 
// let currentListType = null;
// let currentListElement = null;

// function toggleList(type) {
//     const textArea = document.getElementById("textArea");
//     textArea.focus();

//     const selection = window.getSelection();
//     if (!selection.rangeCount) return;

//     const range = selection.getRangeAt(0);

//     if (currentListType === type) {
//         const p = document.createElement("p");
//         p.innerHTML = "<br>";
//         currentListElement.parentNode.insertBefore(p, currentListElement.nextSibling);

//         const newRange = document.createRange();
//         newRange.setStart(p, 0);
//         newRange.setEnd(p, 0);
//         selection.removeAllRanges();
//         selection.addRange(newRange);

//         currentListType = null;
//         currentListElement = null;

//         document.getElementById("olBtn").style.backgroundColor = "#ffffff";
//         document.getElementById("olBtn").style.color = "black";
//         document.getElementById("ulBtn").style.backgroundColor = "#ffffff";
//         document.getElementById("ulBtn").style.color = "black";

//         return;
//     }

//     const list = document.createElement(type);
//     const li = document.createElement("li");
//     li.innerHTML = "<br>";
//     list.appendChild(li);
//     if (type === "ul") list.style.listStyleType = "circle";

//     range.deleteContents();
//     range.insertNode(list);

//     const newRange = document.createRange();
//     newRange.setStart(li, 0);
//     newRange.setEnd(li, 0);
//     selection.removeAllRanges();
//     selection.addRange(newRange);

//     currentListType = type;
//     currentListElement = list;

//     if (type === "ol") {
//         document.getElementById("olBtn").style.backgroundColor = "#3b82f6";
//         document.getElementById("olBtn").style.color = "white";
//         document.getElementById("ulBtn").style.backgroundColor = "#ffffff";
//         document.getElementById("ulBtn").style.color = "black";
//     } else {
//         document.getElementById("ulBtn").style.backgroundColor = "#3b82f6";
//         document.getElementById("ulBtn").style.color = "white";
//         document.getElementById("olBtn").style.backgroundColor = "#ffffff";
//         document.getElementById("olBtn").style.color = "black";
//     }
// }
// let currentListType = null;
// let currentListElement = null;

// function toggleList(type) {
//   document.getElementById("listTooltip").style.display = "none";

//   const textArea = document.getElementById("textArea");
//   textArea.focus();

//   const selection = window.getSelection();
//   if (!selection.rangeCount) return;

//   const range = selection.getRangeAt(0);
//   const container = range.startContainer;

//   // Check if inside a list already
//   let li = container;
//   while (li && li.nodeName !== "LI") {
//     li = li.parentNode;
//   }

//   let existingList = null;
//   if (li) {
//     existingList = li.parentNode;
//   }

//   // If the list is already the same type, toggle off
//   if (existingList && existingList.nodeName.toLowerCase() === type) {
//     const spacer = document.createElement("div");
//     spacer.innerHTML = "<br>";
//     spacer.setAttribute("contenteditable", "false");
//     spacer.style.height = "1px";
//     spacer.style.userSelect = "none";

//     existingList.parentNode.insertBefore(spacer, existingList.nextSibling);

//     const p = document.createElement("p");
//     p.innerHTML = "<br>";
//     spacer.parentNode.insertBefore(p, spacer.nextSibling);

//     const newRange = document.createRange();
//     newRange.setStart(p, 0);
//     newRange.setEnd(p, 0);
//     selection.removeAllRanges();
//     selection.addRange(newRange);

//     currentListType = null;
//     currentListElement = null;

//     document.getElementById("olBtn").style.backgroundColor = "#ffffff";
//     document.getElementById("olBtn").style.color = "black";
//     document.getElementById("ulBtn").style.backgroundColor = "#ffffff";
//     document.getElementById("ulBtn").style.color = "black";

//     return;
//   }

//   // If a different list exists, replace it
// // If a different list exists, convert only the current <li>
// if (existingList && existingList.nodeName.toLowerCase() !== type) {
//   const newList = document.createElement(type);
//   if (type === "ul") newList.style.listStyleType = "circle";

//   existingList.insertBefore(newList, li);
//   existingList.removeChild(li);
//   newList.appendChild(li);

//   // Reinsert the new list after the original list if it has other items
//   if (existingList.nextSibling) {
//     existingList.parentNode.insertBefore(newList, existingList.nextSibling);
//   } else {
//     existingList.parentNode.appendChild(newList);
//   }

//   // If original list becomes empty, remove it
//   if (!existingList.hasChildNodes()) {
//     existingList.remove();
//   }

//   currentListType = type;
//   currentListElement = newList;

//   const newRange = document.createRange();
//   newRange.setStart(li, 0);
//   newRange.setEnd(li, 0);
//   selection.removeAllRanges();
//   selection.addRange(newRange);
// }
//   else {
//     // If no existing list, insert new one
//     const list = document.createElement(type);
//     const li = document.createElement("li");
//     li.innerHTML = "<br>";
//     list.appendChild(li);
//     if (type === "ul") list.style.listStyleType = "circle";

//     range.deleteContents();
//     range.insertNode(list);

//     const newRange = document.createRange();
//     newRange.setStart(li, 0);
//     newRange.setEnd(li, 0);
//     selection.removeAllRanges();
//     selection.addRange(newRange);

//     currentListType = type;
//     currentListElement = list;
//   }

// }
// document.getElementById("textArea").addEventListener("keydown", function (e) {
//     const selection = window.getSelection();
//     if (!selection.rangeCount) return;

//     const range = selection.getRangeAt(0);
//     const container = range.startContainer;

//     // Find nearest li element
//     let li = container;
//     while (li && li.nodeName !== "LI") {
//         li = li.parentNode;
//     }

//     // --- CASE 1: Inside a list item ---
//     if (li) {
//         const list = li.parentNode;
//         const grandParent = list.parentNode;

//         // Handle Backspace in empty <li>
//         if (
//             e.key === "Backspace" &&
//             li.textContent.trim() === "" &&
//             range.startOffset === 0
//         ) {
//             e.preventDefault();

//             if (list.children.length === 1) {
//                 const p = document.createElement("p");
//                 p.innerHTML = "<br>";
//                 grandParent.insertBefore(p, list.nextSibling);
//                 list.remove();

//                 const newRange = document.createRange();
//                 newRange.setStart(p, 0);
//                 newRange.setEnd(p, 0);
//                 selection.removeAllRanges();
//                 selection.addRange(newRange);
//             }
//              else {
//                 const prev = li.previousElementSibling;
//                 list.removeChild(li);
//                 if (prev) {
//                     const newRange = document.createRange();
//                     newRange.selectNodeContents(prev);
//                     newRange.collapse(false);
//                     selection.removeAllRanges();
//                     selection.addRange(newRange);
//                 }
//             }
//         }

//         // Handle Tab / Shift+Tab for nesting and outdenting
//         if (e.key === "Tab") {
//             e.preventDefault();

//             const previousLi = li.previousElementSibling;
//             if (e.shiftKey) {
//                 // Shift+Tab → Outdent
//                 if (list.parentNode.nodeName === "LI") {
//                     const parentLi = list.parentNode;
//                     const parentList = parentLi.parentNode;

//                     parentList.insertBefore(li, parentLi.nextSibling);

//                     const newRange = document.createRange();
//                     newRange.setStart(li, 0);
//                     newRange.setEnd(li, 0);
//                     selection.removeAllRanges();
//                     selection.addRange(newRange);
//                 }
//             } else {
//                 // Tab → Indent
//                 if (previousLi) {
//                     let subList = previousLi.querySelector("ol, ul");
//                     if (!subList) {
//                         subList = document.createElement(list.nodeName);
//                         subList.setAttribute("style", "margin-left: 20px;");
//                         previousLi.appendChild(subList);
//                     }
//                     subList.appendChild(li);

//                     const newRange = document.createRange();
//                     newRange.setStart(li, 0);
//                     newRange.setEnd(li, 0);
//                     selection.removeAllRanges();
//                     selection.addRange(newRange);
//                 }
//             }
//         }

//         // --- CASE 2: Not inside a list ---
//     } else if (e.key === "Tab") {
//         e.preventDefault();
//         const tabNode = document.createTextNode("\u00A0\u00A0\u00A0\u00A0"); // 4 non-breaking spaces
//         range.insertNode(tabNode);

//         // Move caret after inserted spaces
//         range.setStartAfter(tabNode);
//         range.setEndAfter(tabNode);
//         selection.removeAllRanges();
//         selection.addRange(range);
//     }
// });
//     const infoBtn = document.getElementById("listInfoBtn");
//     const tooltip = document.getElementById("listTooltip");
//     const instructions = document.getElementById("listInstructions");

//     // Hover tooltip
//     document.getElementById("olBtn").addEventListener("mouseenter", () => {
//       tooltip.style.display = "block";
//     });
//     document.getElementById("olBtn").addEventListener("mouseleave", () => {
//       tooltip.style.display = "none";
//     });
//     document.getElementById("ulBtn").addEventListener("mouseenter", () => {
//       tooltip.style.display = "block";
//     });
//     document.getElementById("ulBtn").addEventListener("mouseleave", () => {
//       tooltip.style.display = "none";
//     });
//     document.addEventListener("selectionchange", () => {
//   const selection = window.getSelection();
//   if (!selection.rangeCount) return;

//   const range = selection.getRangeAt(0);
//   let node = range.startContainer;

//   // Traverse up to check if inside <li>
//   while (node && node.nodeName !== "LI") {
//     node = node.parentNode;
//   }

//   // If inside <li>, set button highlight based on list type
//   if (node) {
//     const parentList = node.parentNode;
//     const listType = parentList.nodeName.toLowerCase();

//     if (listType === "ul") {
//       document.getElementById("ulBtn").style.backgroundColor = "#3b82f6";
//       document.getElementById("ulBtn").style.color = "white";
//       document.getElementById("olBtn").style.backgroundColor = "#ffffff";
//       document.getElementById("olBtn").style.color = "black";
//     } else if (listType === "ol") {
//       document.getElementById("olBtn").style.backgroundColor = "#3b82f6";
//       document.getElementById("olBtn").style.color = "white";
//       document.getElementById("ulBtn").style.backgroundColor = "#ffffff";
//       document.getElementById("ulBtn").style.color = "black";
//     }
//   } else {
//     // Not inside any <li> → reset button styles
//     document.getElementById("olBtn").style.backgroundColor = "#ffffff";
//     document.getElementById("olBtn").style.color = "black";
//     document.getElementById("ulBtn").style.backgroundColor = "#ffffff";
//     document.getElementById("ulBtn").style.color = "black";
//   }
// });










// tablet responsive
// const moreBtn = document.querySelector('.more-btn');
// const toolbars = document.querySelectorAll('.more-option');

// moreBtn.addEventListener('click', () => {
//     toolbars.forEach(toolbar => {
//         const currentDisplay = getComputedStyle(toolbar).display;

//         if (currentDisplay === "none") {
//             toolbar.style.display = "block";
//         } else {
//             toolbar.style.display = "none";
//         }
//     });
// });


