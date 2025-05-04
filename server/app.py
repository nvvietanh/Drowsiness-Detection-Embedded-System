# -----------------------------------
# Import modules, libraries
# -----------------------------------
from flask import Flask, Response, request, jsonify
from flask_socketio import SocketIO, emit
import numpy as np
import json
import threading
import time
import cv2
import requests
import os
from dotenv import load_dotenv

load_dotenv()

from mqtt_client import connect_mqtt, set_socketio
# from server.stream import generate_frames
from mediapipe_dlib import mediapipe_detector_stream, dlib_detector_stream
from video_aux import capture_frames, generate_stream, send_frame_every_minute, change_mode
# -----------------------------------

# ---------------------------------
# CONSTANTS
# ---------------------------------


SERVER_URL = os.getenv("SERVER_URL")
ii = 0

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
# ... sau khi tạo socketio ...
socketio = SocketIO(app, cors_allowed_origins="*")
set_socketio(socketio)

# -----------------------------------
# Model settings
# -----------------------------------


# -----------------------------------
# APIs
# -----------------------------------


# -----------------------------------
# Frame settings
# -----------------------------------
latest_frame = None
lock = threading.Lock()



@app.route('/')
def index():
    return "<h1>YOLO Video Stream with MQTT</h1><img src='/video_feed'>"

mode_gl = 0

@app.route('/video_feed')
def video_feed():
    global mode_gl
    return Response(
        # generate_frames(0),
        # mediapipe_detector_stream(0),
        generate_stream(),
        mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/change_mode/<int:mode>', methods=['GET', 'POST'])
def video_feed_mode(mode):
    # global mode_gl
    # mode_gl = mode
    change_mode(mode)
    print(f"Mode changed to {mode_gl}")
    return Response(
        response={
            "mode": mode_gl,
            "message": "Mode changed successfully."
        }
    )

# driver for calling attendance api
@app.route('/attendance', methods=['POST'])
def attendance():

    # Nhận file từ client
    file = request.files.get("file")
    message = request.form.get("id")

    # Đọc file ảnh vào dạng numpy array
    file_bytes = file.read()
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)  # Đọc ảnh từ bytes

    if img is not None:
        # # Hiển thị ảnh trong 2 giây
        # cv2.imshow('Received Image', img)
        # cv2.waitKey(2000)  # Chờ 2 giây (2000 ms)
        # cv2.destroyAllWindows()  # Đóng cửa sổ ảnh
        # # return "Image displayed for 2 seconds."

        # Xử lý frame nhận đc...
        pass
    else:
        return Response(
            status=400,
            mimetype='application/json',
            headers={'Content-Type': 'application/json'},
            response='{"status": "failed", "message": "Failed to decode image."}',
        )
    return Response(
        status=200,
        mimetype='application/json',
        headers={'Content-Type': 'application/json'},
        response='{"status": "success", "message": "Attendance recorded successfully."}',
    )

if __name__ == '__main__':
    connect_mqtt()
    threading.Thread(target=capture_frames, daemon=True).start()
    # display_video()
    threading.Thread(target=send_frame_every_minute, daemon=True).start()
    # capture_frames()
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)