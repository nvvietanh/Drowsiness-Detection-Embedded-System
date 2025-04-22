# mqtt_client.py
import paho.mqtt.client as mqtt
from config import MQTT_BROKER, MQTT_PORT

mqtt_client = mqtt.Client()

def connect_mqtt():
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT)
    mqtt_client.loop_start()

def publish_detection(message: str):
    mqtt_client.publish("alert/detection", message)
