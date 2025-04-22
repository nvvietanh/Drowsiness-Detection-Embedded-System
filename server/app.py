# -----------------------------------
# Import modules, libraries
# -----------------------------------
from flask import Flask, Response
from mqtt_client import connect_mqtt
from yolo_stream import generate_frames

# -----------------------------------
# Global variables declarations
# ----------------------------------- 



# -----------------------------------
# App settings
# -----------------------------------
app = Flask(__name__)

# -----------------------------------
# MQTT settings
# -----------------------------------



# -----------------------------------
# Websocket settings
# -----------------------------------



# -----------------------------------
# Model settings
# -----------------------------------



# -----------------------------------
# APIs
# -----------------------------------
@app.route('/')
def index():
    return "<h1>YOLO Video Stream with MQTT</h1><img src='/video_feed'>"

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    connect_mqtt()
    app.run(host='0.0.0.0', port=5000, debug=True)