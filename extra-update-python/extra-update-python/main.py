import os
import pandas as pd
from tkinter import Tk, filedialog

class Api:
    def select_excel(self):
        try:
            Tk().withdraw()
            filepath = filedialog.askopenfilename(
                title="Select Excel File",
                filetypes=[("Excel files", "*.xlsx *.xls")]
            )

            if not filepath:
                return {'success': False, 'message': 'No file selected.'}

            ext = os.path.splitext(filepath)[1].lower()

            if ext == '.xlsx':
                df = pd.read_excel(filepath, engine='openpyxl')
            elif ext == '.xls':
                df = pd.read_excel(filepath, engine='xlrd')
            else:
                return {'success': False, 'message': 'Unsupported file format.'}

            html_table = df.to_html(index=False, border=1)
            return {'success': True, 'html': html_table}

        except ImportError as e:
            return {
                'success': False,
                'message': 'Missing Excel engine. Please run: pip install openpyxl xlrd'
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}
