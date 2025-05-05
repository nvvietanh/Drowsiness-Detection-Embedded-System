import cv2
import threading
import requests
import os
import time

from mqtt_client import publish_detection
# from app import publish_detection
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
latest_detection_frame = None
lock = threading.Lock()

def capture_frames(video_src=0):
    # global isinstance
    print("Capture frames thread")
    # ii += 1
    global latest_frame
    cap = cv2.VideoCapture(video_src, cv2.CAP_DSHOW)
    if not cap.isOpened():
        print("Không mở được webcam.")
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

def detect_drowsiness():
    global mode_gll
    global latest_frame
    global latest_detection_frame
    mediapipe_detector = DrowsinessDetectorMediapipe()
    dlib_detector = DrowsinessDetectorDlib()
    is_drowsy = False
    is_drowsy_prev = False
    while True:
        with lock:
            # global latest_frame
            if latest_frame is None:
                continue
            frame = latest_frame.copy()

        # print(mode_gll, end=" ")
        if (mode_gll == 1) :
            is_drowsy, frame = mediapipe_detector.process_frame(frame)
        elif (mode_gll == 2) :
            is_drowsy, frame = dlib_detector.process_frame(frame)

        latest_detection_frame = frame.copy()

        cv2.imshow("Drowsiness Detection", frame)
        # Thoát nếu nhấn 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            cv2.destroyWindow("Drowsiness Detection")

        if is_drowsy == True and is_drowsy_prev == False:
            is_drowsy_prev = True
            # Gửi thông báo đến MQTT broker
            publish_detection("BUON NGU!")
            send_drowsiness_detection(is_drowsy)
            print("BUON NGU!")
        elif is_drowsy == False and is_drowsy_prev == True:
            is_drowsy_prev = False
            publish_detection("KHONG BUON NGU!")
            send_drowsiness_detection(is_drowsy)
            print("KHONG BUON NGU!")

def generate_stream():
    global latest_detection_frame
    frame = None
    while True:

        with lock:
            if latest_detection_frame is None:
                continue
            frame = latest_detection_frame.copy()

        # Encode thành JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            print("Failed to encode frame.")
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
        
            # Gửi POST request đến API điểm danh
        try :
            buffer = None
            with lock:
                if latest_frame is not None:
                    _, buffer = cv2.imencode('.jpg', latest_frame)
            if buffer is None:
                print("No frame to send.")
                continue
            response = requests.post(
                f"{SERVER_URL}/attendance",
                files={"file": ("frame.jpg", buffer.tobytes(), "image/jpeg")},
                data={ "vehicle_id" : VEHICLE_ID }
            )
            print("Sent frame, HTTP status:", response.status_code)
            print("Response:", response.text)
        except requests.exceptions.RequestException as e:
            print(f"Error sending frame: {e}")
            # return
        

def send_drowsiness_detection(is_drowsy):
    # Gửi POST request đến API điểm danh
    try :
        response = requests.post(
            f"{SERVER_URL}/drowsiness",
            json={
                "vehicle_id": VEHICLE_ID,
                "is_drowsy": is_drowsy
            }
        )
        print("Sent drowsiness detection, HTTP status:", response.status_code)
        print("Response:", response.text)
    except requests.exceptions.RequestException as e:
        print(f"Error sending drowsiness detection: {e}")
        return
    