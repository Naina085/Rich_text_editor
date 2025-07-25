# Rich_text_editor

## Project Description
Rich_text_editor ek web-based online assessment tool hai. Iska use teachers apne students ke liye assessment banane, share karne, aur students ko padhne, highlight karne, notes banane, ya kisi bhi line par bookmark lagane ke liye kar sakte hain. Yeh tool PDF, DOC, PPT, ya kisi bhi file ko import karne, edit karne, aur interactive assessment banane ki suvidha deta hai. Backend Python (Flask expected) aur frontend HTML/JavaScript par based hai.

## Folder & File Details

- **extra-update-python/**
  - Backend Python code (Flask server expected)
  - File import, conversion, text extraction, save/load logic, assessment management, user actions (highlight, notes, bookmark) yahan hota hai
  - Example files: `app.py`, `import_api.py`, etc.

- **text-editor-html/**
  - Frontend code (HTML, CSS, JavaScript)
  - Assessment editor UI, file upload/import interface, highlighting, notes, bookmarking tools
  - Example files: `index.html`, `editor.js`, `style.css`

- **start_flask.bat**
  - Windows batch file to start Flask backend server

- **README.md**
  - Project documentation (yeh file)

## Features (User Kya Kar Sakta Hai)
- Teachers assessment bana sakte hain (PDF, DOC, PPT, ya kisi bhi supported file import karke)
- Students assessment padh sakte hain
- Text ko highlight kar sakte hain
- Notes bana sakte hain (kisi bhi line par)
- Kisi bhi line ya section par bookmark laga sakte hain
- Edited content ko save/load kar sakte hain
- User-friendly web interface

## Backend & Frontend Interaction
- Frontend user se file upload, highlight, notes, bookmark actions leta hai aur backend ko bhejta hai (APIs ke through)
- Backend file ko process karta hai, text extract karta hai, user actions ko store karta hai, aur frontend ko data bhejta hai
- Save/load ke liye backend APIs ka use hota hai

## Possible API Endpoints
- `POST /import` : File upload karne ke liye (PDF, DOC, PPT, etc.), backend text extract karke return karta hai
- `POST /save` : Edited content, highlights, notes, bookmarks ko backend par save karne ke liye
- `GET /load` : Pehle se saved assessment, highlights, notes, bookmarks ko load karne ke liye
- `POST /highlight` : Text highlight karne ke liye
- `POST /note` : Note add/edit karne ke liye
- `POST /bookmark` : Bookmark add/remove karne ke liye

## Step-by-Step Usage

1. **Backend Start Karein:**
   - Python aur Flask install karein (agar nahi hai toh):
     ```
     pip install flask
     ```
   - `start_flask.bat` file ko double-click ya command prompt se run karein:
     ```
     start_flask.bat
     ```
   - Flask server start ho jayega (default: http://127.0.0.1:5000)

2. **Frontend Use Karein:**
   - `text-editor-html` folder me jaakar `index.html` file ko browser me open karein
   - Assessment editor UI khul jayega, jahan aap file import, highlight, notes, bookmark, edit, save/load kar sakte hain

3. **Assessment Workflow:**
   - "Import" button se assessment file select karein
   - File backend par upload hogi, text extract hoke editor me dikhai dega
   - Text ko highlight karein, notes banayein, bookmark lagayein
   - "Save" button se sab kuch backend par save ho jayega
   - "Load" button se pehle se saved assessment, highlights, notes, bookmarks wapas aa jayenge

## Example Workflow
1. Flask server start karein
2. Browser me editor open karein
3. Assessment file import karein (PDF/DOC/PPT)
4. Text highlight karein, notes banayein, bookmark lagayein
5. Save button dabayein (sab kuch backend par save ho jayega)
6. Load button dabayein (saved assessment, highlights, notes, bookmarks wapas aa jayenge)

## Requirements
- Python 3.x
- Flask (backend ke liye)
- File processing libraries (jaise: PyPDF2, python-docx, python-pptx, etc.)
- Modern web browser (frontend ke liye)

## Author & Contribution
- Is project ko aap modify ya improve kar sakte hain. Suggestions aur pull requests welcome hain!

---

## DONE (Ab Tak Kya Ho Gaya)
- Project ka structure set ho gaya hai (backend, frontend, batch file)
- README me detailed documentation likh di gayi hai
- Assessment import, edit, highlight, notes, bookmark, save/load ka workflow define ho gaya hai
- Possible API endpoints aur user features list kar diye gaye hain