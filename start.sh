#!/bin/bash
source venv/bin/activate  # if using virtualenv
export FLASK_APP=app.py
export FLASK_ENV=production
python app.py
