import paho.mqtt.client as mqtt
import json
import random
import time
from datetime import datetime

# Cấu hình MQTT
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "gps/coordinates"

# Tọa độ gốc (ví dụ Hà Nội)
BASE_LAT = 21.0285
BASE_LNG = 105.8542

def generate_nearby_coordinates(base_lat, base_lng, delta=0.001):
    """Tạo tọa độ ngẫu nhiên gần vị trí gốc."""
    lat = base_lat + random.uniform(-delta, delta)
    lng = base_lng + random.uniform(-delta, delta)
    return round(lat, 6), round(lng, 6)

def generate_fake_gps_data():
    """Sinh dữ liệu GPS mô phỏng giống Arduino."""
    lat, lng = generate_nearby_coordinates(BASE_LAT, BASE_LNG)
    data = {
        "fix": 1,
        "time": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "lat": lat,
        "lng": lng,
        "alt": round(random.uniform(5, 50), 2),
        "speed": round(random.uniform(0, 80), 2),
        "course": round(random.uniform(0, 360), 2),
        "sats": random.randint(3, 12),
        "hdop": round(random.uniform(0.5, 2.0), 2),
        "pdop": round(random.uniform(1.0, 3.0), 2),
        "vdop": round(random.uniform(0.8, 2.5), 2)
    }
    return data

def publish_fake_gps():
    client = mqtt.Client()
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    
    while True:
        gps_data = generate_fake_gps_data()
        payload = json.dumps(gps_data)
        client.publish(MQTT_TOPIC, payload)
        print("Đã gửi:", payload)
        time.sleep(2)  # Gửi mỗi 2 giây

if __name__ == "__main__":
    publish_fake_gps()
