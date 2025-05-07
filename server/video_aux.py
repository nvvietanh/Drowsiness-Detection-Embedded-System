import cv2
import threading
import requests
import os
import time
from datetime import datetime

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
from yolo_detector import DrowsinessDetectorYolo
from coord_handler import get_coord_data

SERVER_URL = os.getenv("SERVER_URL")
VEHICLE_ID = int(os.getenv("VEHICLE_ID"))
DRIVER_ID = None

mode_gll = 1

latest_frame = None
latest_detection_frame = None
is_drowsy_gl = False
lock = threading.Lock()

def capture_frames(video_src=0):
    # global isinstance
    print("Capture frames thread")
    # ii += 1
    global latest_frame
    cap = cv2.VideoCapture(video_src, cv2.CAP_DSHOW)
    if not cap.isOpened():
        print("Không mở được webcam.")

    ret, frame = cap.read()
        
    if not ret:
        print("Không đọc được frame từ webcam. (not ret)")

    # Gán frame hiện tại vào biến toàn cục
    with lock:
        latest_frame = frame.copy()
    
    start_scheduler()

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
    global is_drowsy_gl
    mediapipe_detector = DrowsinessDetectorMediapipe()
    dlib_detector = DrowsinessDetectorDlib()
    yolo_detector = DrowsinessDetectorYolo()
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
        elif (mode_gll == 3) :
            is_drowsy, frame = yolo_detector.process_frame(frame)

        latest_detection_frame = frame.copy()

        cv2.imshow("Drowsiness Detection", frame)
        # Thoát nếu nhấn 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            cv2.destroyWindow("Drowsiness Detection")

        if is_drowsy == True and is_drowsy_prev == False:
            is_drowsy_prev = True
            # Gửi thông báo đến MQTT broker
            publish_detection("BUON NGU!")
            # send_drowsiness_detection(is_drowsy)
            with lock:
                is_drowsy_gl = True
            print("BUON NGU!")
        elif is_drowsy == False and is_drowsy_prev == True:
            is_drowsy_prev = False
            publish_detection("KHONG BUON NGU!")
            # send_drowsiness_detection(is_drowsy)
            with lock:
                is_drowsy_gl = False
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
        

def send_drowsiness_detection():
    # Gửi POST request đến API

    global latest_detection_frame
    global is_drowsy_gl
    is_drowsy = False
    # with lock:
    #     is_drowsy = is_drowsy_gl
    #     if latest_detection_frame is None:
    #         print("Không có frame để gửi.")
    #         return
    #     frame = latest_detection_frame.copy()

    while True :
        time.sleep(3)
        with lock:
            is_drowsy = is_drowsy_gl

        if is_drowsy == True:
            frame = None
            with lock:
                if latest_detection_frame is None:
                    print("Không có frame để gửi.")
                    continue
                frame = latest_detection_frame.copy()
            if frame is None:
                print("Không có frame để gửi.")
                continue
            
            # Encode thành JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                print("Failed to encode frame.")
                continue

            frame_bytes = buffer.tobytes()

            try :
                response = requests.post(
                    f"{SERVER_URL}/driver_states/add",
                    files={"image": ("frame.jpg", frame_bytes, "image/jpeg")},
                    # json={
                    #     "driver_id": DRIVER_ID if DRIVER_ID is not None else 0,
                    #     "vehicle_id": VEHICLE_ID,
                    #     "status": "BUỒN NGỦ"
                    # }
                    data={
                        "driver_id": DRIVER_ID if DRIVER_ID is not None else "0",
                        "vehicle_id": VEHICLE_ID,
                        "timestamp": datetime.now().isoformat(),
                        "status": "BUỒN NGỦ",
                        "note": "Tài xế buồn ngủ",
                    }
                )
                # print({
                #         "driver_id": DRIVER_ID if DRIVER_ID is not None else "0",
                #         "vehicle_id": VEHICLE_ID,
                #         "status": "BUỒN NGỦ",
                #         "note": "Tài xế buồn ngủ" if is_drowsy else "Tài xế không buồn ngủ",
                #     })
                print("Sent drowsiness detection, HTTP status:", response.status_code)
                print("Response:", response.text)
            except requests.exceptions.RequestException as e:
                print(f"Error sending drowsiness detection: {e}")
                
    
def get_driver_id():
    global DRIVER_ID
    global latest_frame
    frame = None
    with lock:
        if latest_frame is None:
            print("Không có frame để gửi.")
            return
        frame = latest_frame.copy()

    if frame is None:
        print("Không có frame để gửi.")
        return
    # Encode frame sang JPEG
    ret, buffer = cv2.imencode('.jpg', frame)
    if not ret:
        print("Không thể mã hóa frame")
        DRIVER_ID = None
        
    # Gửi frame dưới dạng file ảnh
    files = {'image': ('frame.jpg', buffer.tobytes(), 'image/jpeg')}
    try:
        response = requests.post(f'{SERVER_URL}/get_driver_id', files=files)
        data = response.json()
        if response.status_code == 200 and 'driver_id' in data:
            DRIVER_ID = data['driver_id']
    except Exception as e:
        print("Lỗi khi gửi ảnh:", e)
        DRIVER_ID = None
    DRIVER_ID = None
# def get_vehicle_id():
#     global VEHICLE_ID
#     from mqtt import get_vehicle_id
#     VEHICLE_ID = get_vehicle_id()

from apscheduler.schedulers.background import BackgroundScheduler
def reset_attendance_id():
    global ATTENDANCE_ID
    ATTENDANCE_ID = None

# Hàm để thêm điểm danh
def add_attendance(driver_id, vehicle_id, date):
    checkin_time = datetime.now().time().isoformat()
    attendance_data = {
        "driver_id": driver_id,
        "vehicle_id": vehicle_id,
        "note": "Điểm danh mới",
        "checkin_time": checkin_time,
        "checkout_time": None
    }
    response = requests.post(f"{SERVER_URL}/attendances/add", json=attendance_data)
    
    if response.status_code == 200:
        print("Thêm điểm danh thành công.")
    else:
        print(f"Lỗi khi thêm điểm danh: {response.status_code}, {response.text}")

# Hàm để cập nhật điểm danh
def update_attendance(attendance_id, driver_id, vehicle_id, checkin_time, checkout_time, note):
    update_data = {
        "attendance_id": attendance_id,
        "driver_id": driver_id,
        "vehicle_id": vehicle_id,
        "checkin_time": checkin_time,
        "checkout_time": checkout_time,
        "note": note
    }
    response = requests.post(f"{SERVER_URL}/attendances/update", json=update_data)
    
    if response.status_code == 200:
        print("Cập nhật điểm danh thành công.")
    else:
        print(f"Lỗi khi cập nhật điểm danh: {response.status_code}, {response.text}")
# HÀM GỌI API
def save_infor():
    global DRIVER_ID
    global VEHICLE_ID
    get_driver_id()
    if DRIVER_ID is None:
        print("❌ Không thể điểm danh")
    else: 
        from datetime import datetime
        date = datetime.now().date().isoformat()
        ATTENDANCE_API_URL = f"{SERVER_URL}/attendances/search"  # Địa chỉ API điểm danh
        # Gọi API tìm điểm danh của tài xế và xe theo driver_id, vehicle_id, và date
        response = requests.post(ATTENDANCE_API_URL, json={
            "driver_id": DRIVER_ID,
            "vehicle_id": VEHICLE_ID,
            "date": date
        })
        # Nếu điểm danh không có (404), thực hiện thêm điểm danh mới
        if response.status_code == 404:
            print("Không tìm thấy điểm danh, thêm mới.")
            add_attendance(DRIVER_ID, VEHICLE_ID, date)
        elif response.status_code == 200:
            # Nếu điểm danh đã có, cập nhật thời gian checkout
            attendance = response.json()
            print("Điểm danh đã có, cập nhật checkout_time.")
            update_attendance(attendance['attendance_id'], DRIVER_ID, VEHICLE_ID, attendance['checkin_time'], datetime.now().time().isoformat(), attendance['note'])
        else:
            print(f"Lỗi khi gọi API điểm danh: {response.status_code}, {response.text}")
        
    
    # try:
    #     print("Đang gọi API...")
    #     response = requests.get(f"{SERVER_URL}/my-task")  # đổi URL phù hợp
    #     print("Phản hồi:", response.status_code, response.text)
    # except Exception as e:
    #     print("Lỗi:", e)

def location_update() :
    # while True:
        # time.sleep(10)
    coord_data = get_coord_data()
    lat, long = coord_data.get("lat"), coord_data.get("lng")
    if lat is None or long is None:
        print("Không có tọa độ GPS để gửi.")
        return
    location_data = {
            'driver_id': DRIVER_ID if DRIVER_ID is not None else 0,
            'vehicle_id': VEHICLE_ID,
            'latitude': lat,
            'longitude': long,
            'timestamp': datetime.now().isoformat()
        }
    url = f'{SERVER_URL}/driver_locations/add'
    try:
        response = requests.post(url, json=location_data)
        if response.status_code == 200:
            print("Vị trí tài xế đã được thêm thành công.")
        else:
            print(f"Lỗi khi thêm vị trí tài xế: {response.status_code}, {response.text}")
    except Exception as e:
        print("Lỗi khi gọi API:", e)

def start_scheduler():
    # TẠO LỊCH GỌI ĐỊNH KỲ
    save_infor()
    scheduler = BackgroundScheduler()
    scheduler.add_job(save_infor, 'interval', minutes = 2)  # Gọi hàm mỗi 5 giây
    scheduler.add_job(func=reset_attendance_id, trigger="cron", hour=0, minute=0)
    scheduler.add_job(func=location_update, trigger="interval", seconds=10)

    scheduler.start()
    print("Scheduler started.")