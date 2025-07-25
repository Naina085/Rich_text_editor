from flask import Flask, request, jsonify
import pdfplumber
import fitz  # PyMuPDF
import base64
import os


app = Flask(__name__)

@app.route("/upload", methods=["POST"])
def upload_pdf():
    file = request.files['file']
    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Invalid file type'}), 400

    pdf_text = ""
    images_html = ""

    # Extract text
    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            pdf_text += page.extract_text() + "\n"

    # Reset file stream for image processing
    file.stream.seek(0)
    doc = fitz.open(stream=file.read(), filetype="pdf")

    # Extract images
    for page_index in range(len(doc)):
        page = doc[page_index]
        images = page.get_images(full=True)
        for img_index, img in enumerate(images):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            encoded_image = base64.b64encode(image_bytes).decode()
            images_html += f'<img src="data:image/{image_ext};base64,{encoded_image}" style="max-width:100%;"><br>'

    final_html = f"<div>{images_html}<p>{pdf_text}</p></div>"

    return jsonify({'html': final_html})

if __name__ == "__main__":
    app.run(debug=True)
