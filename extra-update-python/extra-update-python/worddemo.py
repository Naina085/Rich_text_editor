from flask import Flask, request, jsonify, render_template, send_from_directory
from docx import Document
import zipfile
import os
import base64
from io import BytesIO

app = Flask(__name__)
UPLOAD_FOLDER = "static/images"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_word():
    file = request.files['file']
    if not file.filename.endswith(".docx"):
        return jsonify({'error': 'Invalid file type'}), 400

    document = Document(file)
    html = """
    <style>
      body { font-family: Arial, sans-serif; padding: 10px; }
      p { margin-bottom: 10px; line-height: 1.6; }
      img { max-width: 100%; margin: 10px 0; }
    </style>
    """

    # Process text
    for para in document.paragraphs:
        text = para.text.strip()
        if not text:
            continue
        style = para.style.name.lower()
        if "heading 1" in style:
            html += f"<h1>{text}</h1>\n"
        elif "heading 2" in style:
            html += f"<h2>{text}</h2>\n"
        elif "heading 3" in style:
            html += f"<h3>{text}</h3>\n"
        elif "heading 4" in style:
            html += f"<h4>{text}</h4>\n"
        elif "heading 5" in style:
            html += f"<h5>{text}</h5>\n"
        elif "heading 6" in style:
            html += f"<h6>{text}</h6>\n"
        else:
            html += f"<p>{text}</p>\n"

    # Save file temporarily to extract images
    temp_path = os.path.join(UPLOAD_FOLDER, "temp.docx")
    file.seek(0)
    file.save(temp_path)

    # Extract images from .docx (zip format)
    with zipfile.ZipFile(temp_path, "r") as docx_zip:
        for item in docx_zip.namelist():
            if item.startswith("word/media/"):
                img_data = docx_zip.read(item)
                img_name = os.path.basename(item)
                img_path = os.path.join(UPLOAD_FOLDER, img_name)
                with open(img_path, "wb") as f:
                    f.write(img_data)
                # Embed image
                html += f'<img src="/static/images/{img_name}">\n'

    os.remove(temp_path)  # Clean up
    return jsonify({'html': html})

if __name__ == "__main__":
    app.run(debug=True)
