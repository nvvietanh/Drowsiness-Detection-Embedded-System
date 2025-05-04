# mqtt_client.py
import paho.mqtt.client as mqtt
from flask_socketio import SocketIO

from config import MQTT_BROKER, MQTT_PORT

mqtt_client = mqtt.Client()
socketio_instance = None

def connect_mqtt():
    print("Connecting to MQTT broker...")
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT)
    mqtt_client.loop_start()
    print("Connected to MQTT broker")

def publish_detection(message: str):
    mqtt_client.publish("alert/detection", message)

def set_socketio(io):
    global socketio_instance
    socketio_instance = io