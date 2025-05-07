# -----------------------------------
# Import modules, libraries
# -----------------------------------
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import numpy as np
import json
import threading
import time
import cv2
import requests
import os
import copy
from dotenv import load_dotenv

# from multiprocessing import Manager

# manager = Manager()
# coord_data = manager.dict()


load_dotenv()

from coord_handler import get_coord_data
from mqtt_client import connect_mqtt, set_socketio
# from server.stream import generate_frames
from mediapipe_dlib import mediapipe_detector_stream, dlib_detector_stream
from video_aux import capture_frames, generate_stream, send_frame_every_minute, change_mode, detect_drowsiness, start_scheduler, send_drowsiness_detection
# -----------------------------------

# ---------------------------------
# CONSTANTS
# ---------------------------------




SERVER_URL = os.getenv("SERVER_URL")

# -----------------------------------
# Global variables declarations
# ----------------------------------- 
# coord_data = None
coord_data = {}
latest_frame = None
lock = threading.Lock()
lock1 = threading.Lock()

# -----------------------------------
# App settings
# -----------------------------------
app = Flask(__name__)
CORS(app)

# -----------------------------------
# MQTT settings
# -----------------------------------


# -----------------------------------
# Websocket settings
# -----------------------------------
# ... sau khi tạo socketio ...
socketio = SocketIO(app, cors_allowed_origins="*")
set_socketio(socketio)

@socketio.on("connect")
def handle_connect():
    print("Client connected")

# Callback khi nhận alert từ MQTT




# def handle_coordinate_receive(message):
#     global coord_data

#     # Chuyển byte về chuỗi rồi parse JSON
#     # payload_str = message.payload.decode("utf-8")
#     # data = json.loads(payload_str)

#     data = parse_mqtt_json_payload(message.payload)
#     data["vehicle_id"] = os.getenv("VEHICLE_ID")
#     # print(f"[WebSocket Emit] coord: {message}")

#     # if data:
#     #     # print("Dữ liệu hợp lệ:")
#     #     # print("Latitude:", data.get("lat"))
#     #     # print("Longitude:", data.get("lng"))
#     #     # print("Time (UTC):", data.get("time"))
#     # else:
#     #     print("Không thể phân tích payload!")

#     # socketio.emit("coord", {"data" : data})
#     # coord_data.clear()
#     # coord_data.update(data)

#     with lock1:  # Sử dụng khóa để bảo vệ coord_data
#         # coord_data = copy.deepcopy(data)
#         # print(f"coord_data: {coord_data}")
#         coord_data.clear()
#         coord_data.update(data)
#         print(f"coord_data: {coord_data}")

#     # print(f"sent coord: {data}")

# -----------------------------------
# Model settings
# -----------------------------------


# -----------------------------------
# APIs
# -----------------------------------


# -----------------------------------
# Frame settings
# -----------------------------------


@app.route('/coordinate', methods=['GET'])
def get_coordinate():
    # Trả về dữ liệu tọa độ mới nhất
    coord_data = get_coord_data()
    with lock1:  # Sử dụng khóa để bảo vệ coord_data
        if coord_data:
            print(f"Returning coord_data: {coord_data}")
            return jsonify(dict(coord_data)), 200
        else:
            print("No coordinate data available.")
            return jsonify({"message": "No coordinate data available."}), 404

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

# driver for calling api
@app.route('/drowsiness', methods=['POST', 'GET'])
def drowsiness():

    return Response(
        status=200,
        mimetype='application/json',
        headers={'Content-Type': 'application/json'},
        response='{"status": "success", "message": "State saved successfully."}',
    )

# from gevent import monkey
# monkey.patch_all()

if __name__ == '__main__':
    
    connect_mqtt()
    threading.Thread(target=capture_frames, daemon=True).start()
    # start_scheduler()
    threading.Thread(target=detect_drowsiness, daemon=True).start()
    # display_video()
    # threading.Thread(target=send_frame_every_minute, daemon=True).start()
    threading.Thread(target=send_drowsiness_detection, daemon=True).start()
    # capture_frames()
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
    # socketio.run(app, host='0.0.0.0', port=5000, debug=True, use_reloader=False)