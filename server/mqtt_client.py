# mqtt_client.py
import paho.mqtt.client as mqtt
from flask_socketio import SocketIO

from config import MQTT_BROKER, MQTT_PORT
from coord_handler import handle_coordinate_receive

mqtt_client = mqtt.Client()
socketio_instance = None

def connect_mqtt():
    print("Connecting to MQTT broker...")

    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT broker")
            client.subscribe("alert/detection")
            client.subscribe("coord")
        else:
            print(f"Failed to connect, return code {rc}")

    # from app import handle_coordinate_receive
    def on_message(client, userdata, msg):
        if msg.topic == "coord" :
            handle_coordinate_receive(msg)

    mqtt_client.on_connect = on_connect
    mqtt_client.on_message = on_message

    mqtt_client.connect(MQTT_BROKER, MQTT_PORT)
    mqtt_client.loop_start()
    print("Connected to MQTT broker")

def publish_detection(message: str):
    mqtt_client.publish("alert/detection", message)

def set_socketio(io):
    global socketio_instance
    socketio_instance = io