import threading
from app import app as app1
from app2 import app as app2

def run_app1():
    app1.run(port=5000)

def run_app2():
    app2.run(port=5001)

threading.Thread(target=run_app1).start()
threading.Thread(target=run_app2).start()
