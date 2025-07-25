import PyPDF2
import os
from datetime import datetime

def extract_text_from_pdf(pdf_file: str) -> list[str]:
    with open(pdf_file, "rb") as pdf:
        reader = PyPDF2.PdfReader(pdf, strict=False)
        pdf_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pdf_text.append(text)
        return pdf_text

def generate_styled_html(text_lines: list[str]) -> str:
    html_lines = ['<html>', '<head>', '<style>',
                  'body { font-family: Arial, sans-serif; padding: 20px; }',
                  'h1, h2 { color: #2c3e50; margin-bottom: 10px; }',
                  'p { color: #333; line-height: 1.6; margin-bottom: 10px; }',
                  '</style>', '</head>', '<body>']

    for idx, page_text in enumerate(text_lines):
        for line in page_text.split('\n'):
            line = line.strip()
            if not line:
                continue
            elif idx == 0:
                html_lines.append(f"<h1>{line}</h1>")
            elif line.isupper() and len(line.split()) <= 10:
                html_lines.append(f"<h2>{line}</h2>")
            else:
                html_lines.append(f"<p>{line}</p>")

    html_lines.append('</body></html>')
    return '\n'.join(html_lines)

if __name__ == "__main__":
    # Input PDF path
    pdf_path = "C:/beautifulsoup/text_editor_naina/Revised_Final_Date_Sheet-June_2025_TEE.pdf"

    # Create unique filename using timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = "C:/beautifulsoup"
    output_html_path = os.path.join(output_dir, f"output_{timestamp}.html")

    # Make sure directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Extract and save
    extracted_text = extract_text_from_pdf(pdf_path)
    styled_html = generate_styled_html(extracted_text)

    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(styled_html)

    print(f"✅ HTML file saved as: {output_html_path}")
