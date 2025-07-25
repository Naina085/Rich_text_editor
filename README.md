# Rich Text Editor – Online Assessment Tool

## Overview
Rich Text Editor is a web-based online assessment platform designed for educators to create, manage, and share interactive assessments with students. The platform supports importing content from PDF, DOC, PPT, and other file formats, enabling students to read, highlight, annotate, and bookmark content for effective learning and review. The project leverages a Python (Flask) backend and a modern HTML/JavaScript frontend.

---

## Features
- **Assessment Creation:** Import PDF, DOC, PPT, and other files to create assessments.
- **Interactive Reading:** Students can read assessments online with a user-friendly interface.
- **Highlighting:** Highlight important text for quick reference.
- **Notes:** Add notes to any line or section for deeper understanding.
- **Bookmarking:** Bookmark lines or sections for easy navigation.
- **Save & Load:** Save progress and reload assessments with all highlights, notes, and bookmarks intact.
- **Modern Web UI:** Responsive and intuitive frontend for both teachers and students.

---

## Folder Structure
```
Rich_text_editor/
│
├── extra-update-python/      # Backend (Flask) – API, file import, processing, storage
│     ├── app.py              # Main Flask application
│     ├── import_api.py       # File import and text extraction logic
│     └── ...
│
├── text-editor-html/         # Frontend (HTML, CSS, JS) – UI, editor, user actions
│     ├── index.html          # Main editor interface
│     ├── editor.js           # Editor logic, API calls
│     └── style.css           # Styles
│
├── start_flask.bat           # Batch file to start backend server (Windows)
├── README.md                 # Project documentation
└── ...
```

---

## Installation
### Backend
1. Ensure Python 3.x is installed.
2. Install dependencies:
   ```bash
   pip install flask PyPDF2 python-docx python-pptx
   ```
3. (Optional) Add more libraries as needed for additional file formats.

### Frontend
- No build step required. All files are static and can be opened directly in a browser.

---

## Usage
### Start the Backend
```bash
start_flask.bat
```
Or manually:
```bash
cd extra-update-python
python app.py
```
The server will run at `http://127.0.0.1:5000` by default.

### Use the Frontend
1. Open `text-editor-html/index.html` in your web browser.
2. Use the interface to import files, highlight, annotate, bookmark, and save/load your work.

---

## API Endpoints
### 1. Import File
- **POST** `/import`
- **Description:** Upload a file (PDF, DOC, PPT, etc.) and extract its text content.
- **Request Example:**
  ```http
  POST /import
  Content-Type: multipart/form-data

  file: <uploaded_file>
  ```
- **Response Example:**
  ```json
  {
    "status": "success",
    "content": "Extracted text content here..."
  }
  ```

### 2. Save Assessment State
- **POST** `/save`
- **Description:** Save the current state (text, highlights, notes, bookmarks).
- **Request Example:**
  ```json
  {
    "assessment_id": "abc123",
    "content": "...",
    "highlights": [...],
    "notes": [...],
    "bookmarks": [...]
  }
  ```
- **Response Example:**
  ```json
  { "status": "saved" }
  ```

### 3. Load Assessment State
- **GET** `/load?assessment_id=abc123`
- **Description:** Load a previously saved assessment with all user data.
- **Response Example:**
  ```json
  {
    "content": "...",
    "highlights": [...],
    "notes": [...],
    "bookmarks": [...]
  }
  ```

### 4. Highlight, Note, Bookmark
- **POST** `/highlight`, `/note`, `/bookmark`
- **Description:** Add or update highlights, notes, or bookmarks.
- **Request Example:**
  ```json
  {
    "assessment_id": "abc123",
    "action": "add",
    "target": "line_42",
    "data": "Important point here."
  }
  ```
- **Response Example:**
  ```json
  { "status": "success" }
  ```

---

## Contribution Guidelines
- Fork the repository and create your branch from `main`.
- Write clear, concise commit messages.
- Ensure code is well-documented and tested.
- Submit a pull request describing your changes.
- For major changes, please open an issue first to discuss what you would like to change.

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact & Support
For questions, suggestions, or support:
- Open an issue on GitHub
- Or contact the maintainer at: [your-email@example.com]

---

## Project Status
- [x] Project structure established (backend, frontend, batch file)
- [x] Detailed documentation provided
- [x] Assessment import, edit, highlight, notes, bookmark, save/load workflow defined
- [x] API endpoints and user features listed
- [ ] Further enhancements and contributions welcome!