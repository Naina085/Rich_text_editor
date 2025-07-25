from docx import Document

# Load the Word document
doc_path = "ifda_website_temp.docx"  # Replace with your Word file path
doc = Document(doc_path)

# Start HTML with basic styling
html_content = """
<html>
<head>
    <title>Word to HTML</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1, h2, h3, h4, h5, h6 { color: #2c3e50; margin-top: 20px; }
        p { color: #333; line-height: 1.6; margin-bottom: 10px; }
    </style>
</head>
<body>
"""

# Process each paragraph with style
for para in doc.paragraphs:
    text = para.text.strip()
    if not text:
        continue

    style_name = para.style.name.lower()
    if "heading 1" in style_name:
        html_content += f"<h1>{text}</h1>\n"
    elif "heading 2" in style_name:
        html_content += f"<h2>{text}</h2>\n"
    elif "heading 3" in style_name:
        html_content += f"<h3>{text}</h3>\n"
    elif "heading 4" in style_name:
        html_content += f"<h4>{text}</h4>\n"
    elif "heading 5" in style_name:
        html_content += f"<h5>{text}</h5>\n"
    elif "heading 6" in style_name:
        html_content += f"<h6>{text}</h6>\n"
    else:
        html_content += f"<p>{text}</p>\n"

html_content += "</body></html>"

# Save to an HTML file
output_file = "output_file_word_styled.html"
with open(output_file, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"✅ Word content successfully saved to '{output_file}' with styling and headings.")
