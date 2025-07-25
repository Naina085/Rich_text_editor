import pandas as pd

# Set the path to your Excel file
excel_path = "input_file.xlsx"

# Load the Excel file
xls = pd.ExcelFile(excel_path)

# Create an HTML string to store all sheets
html_content = "<html><head><title>Excel to HTML</title></head><body>"

# Loop through each sheet in the Excel file
for sheet_name in xls.sheet_names:
    df = pd.read_excel(xls, sheet_name=sheet_name)
    html_content += f"<h2>Sheet: {sheet_name}</h2>"
    html_content += df.to_html(index=False, border=1)

# Close the HTML structure
html_content += "</body></html>"

# Save to an HTML file
with open("output_file.html", "w", encoding="utf-8") as f:
    f.write(html_content)

print("Excel content successfully saved to 'output_file4.html'")
