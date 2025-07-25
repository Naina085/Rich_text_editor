import fitz  # PyMuPDF
import base64
from io import BytesIO
from PIL import Image

pdf_path = "file.pdf"
output_html = "output_rendered_images.html"

doc = fitz.open(pdf_path)
image_tags = []

for page_num in range(len(doc)):
    # Render the page as a pixmap (image)
    pix = doc[page_num].get_pixmap(dpi=150)  # use dpi=150+ for better quality
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

    # Save image to memory
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    encoded_img = base64.b64encode(buffer.getvalue()).decode("utf-8")

    # Embed in HTML
    img_tag = f'<img src="data:image/png;base64,{encoded_img}" width="800"><br>'
    image_tags.append(img_tag)

# Write to HTML
with open(output_html, "w", encoding="utf-8") as f:
    f.write("<!DOCTYPE html>\n<html>\n<head><title>Rendered PDF Pages</title></head><body>\n")
    f.write("<h2>Rendered Pages from PDF (No White Lines)</h2>\n")
    for tag in image_tags:
        f.write(tag + "\n")
    f.write("</body></html>")

print(f"✅ HTML file created with clean images: {output_html}")
