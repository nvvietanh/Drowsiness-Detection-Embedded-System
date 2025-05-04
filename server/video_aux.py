import cv2
import threading
import requests
import os
import time

from mediapipe_dlib import (
    mediapipe_detector_stream,
    dlib_detector_stream, 
    mediapipe_detector_frame,
    dlib_detector_frame,
    DrowsinessDetectorMediapipe,
    DrowsinessDetectorDlib
)

SERVER_URL = os.getenv("SERVER_URL")
VEHICLE_ID = os.getenv("VEHICLE_ID")

mode_gll = 1

latest_frame = None
lock = threading.Lock()

def capture_frames(video_src=0):
    # global isinstance
    print("Capture frames thread")
    # ii += 1
    global latest_frame
    cap = cv2.VideoCapture(video_src, cv2.CAP_DSHOW)
    if not cap.isOpened():
        print("❌ Không mở được webcam.")
    while True:
        ret, frame = cap.read()
        
        if not ret:
            print("Không đọc được frame từ webcam. (not ret)")
            break

        # Gán frame hiện tại vào biến toàn cục
        with lock:
            latest_frame = frame.copy()

        # Hiển thị camera trong cửa sổ
        cv2.imshow("Camera Live", frame)

        # Thoát nếu nhấn 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

        # time.sleep(0.03)  # khoảng ~30 fpsx

def change_mode(mode):
    global mode_gll
    mode_gll = mode
    print(f"Mode changed to {mode_gll}")

def generate_stream():
    global mode_gll
    global latest_frame
    mediapipe_detector = DrowsinessDetectorMediapipe()
    dlib_detector = DrowsinessDetectorDlib()
    while True:
        with lock:
            # global latest_frame
            if latest_frame is None:
                continue
            frame = latest_frame.copy()

        # print(mode_gll, end=" ")
        if (mode_gll == 1) :
            frame = mediapipe_detector.process_frame(frame)
        elif (mode_gll == 2) :
            frame = dlib_detector.process_frame(frame)

        # Encode thành JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            print("⚠️ Failed to encode frame.")
            continue

        frame_bytes = buffer.tobytes()

        # Yield frame theo chuẩn multipart/x-mixed-replace
        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        # time.sleep(0.03)  # khoảng ~30 fps

# Mỗi interval lại gửi frame đến API điểm danh
def send_frame_every_minute():
    global latest_frame
    while True:
        time.sleep(5) # interval, giây
        with lock:
            if latest_frame is not None:
                _, buffer = cv2.imencode('.jpg', latest_frame)
        # Gửi POST request đến API điểm danh
        response = requests.post(
            f"{SERVER_URL}/attendance",
            files={"file": ("frame.jpg", buffer.tobytes(), "image/jpeg")},
            data={ "id" : VEHICLE_ID }
        )
        print("Sent frame, HTTP status:", response.status_code)
        print("Response:", response.text)