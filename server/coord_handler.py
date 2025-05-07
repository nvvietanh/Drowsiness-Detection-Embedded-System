import os
import threading
import json
coord_data = {}
lock1 = threading.Lock()

def parse_mqtt_json_payload(payload_bytes):
    """
    Chuyển dữ liệu MQTT từ bytes -> string -> dict JSON.
    Trả về None nếu lỗi JSON.
    """
    try:
        payload_str = payload_bytes.decode('utf-8')
        data = json.loads(payload_str)
        return data
    except UnicodeDecodeError as ude:
        print("Lỗi giải mã UTF-8:", ude)
    except json.JSONDecodeError as jde:
        print("Lỗi JSON không hợp lệ:", jde)
    return None

def handle_coordinate_receive(message):
    global coord_data

    data = parse_mqtt_json_payload(message.payload)
    data["vehicle_id"] = os.getenv("VEHICLE_ID")

    with lock1:
        coord_data.clear()
        coord_data.update(data)
        print(f"coord_data: {coord_data}")

def get_coord_data():
    with lock1:
        return dict(coord_data)
