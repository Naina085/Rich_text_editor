from flask import Flask, request, jsonify, send_from_directory
from docx import Document
import os
import base64
from werkzeug.utils import secure_filename

# ✅ Define the app
app = Flask(__name__)

# ✅ Setup upload folder
UPLOAD_FOLDER = "uploads"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ✅ Serve index.html from current directory
@app.route('/')
def index():
    return send_from_directory('', 'index.html')

# ✅ Function to extract text and images from Word file
def extract_docx_content(file_path):
    doc = Document(file_path)
    html_content = ""

    for para in doc.paragraphs:
        html_content += f"<p>{para.text}</p>"

    # Extract images from the document
    rels = doc.part._rels
    for rel in rels:
        rel = rels[rel]
        if "image" in rel.target_ref:
            image_data = rel.target_part.blob
            ext = rel.target_part.content_type.split("/")[-1]
            base64_data = base64.b64encode(image_data).decode("utf-8")
            html_content += f'<img src="data:image/{ext};base64,{base64_data}" style="max-width:100%;"/><br>'

    return html_content

# ✅ Upload route
@app.route('/upload', methods=['POST'])
def upload_docx():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    html_content = extract_docx_content(file_path)
    return jsonify({'html': html_content})

# ✅ Run Flask app
if __name__ == '__main__':
    app.run(debug=True)
