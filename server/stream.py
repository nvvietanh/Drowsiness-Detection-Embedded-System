# yolo_stream.py
import cv2
from ultralytics import YOLO
from mqtt_client import publish_detection
from config import VIDEO_URL

model = YOLO("yolov8n.pt")  # hoặc .yaml nếu bạn có custom


def yolo_stream(video_src=VIDEO_URL):
    
    cap = cv2.VideoCapture(video_src)

    while True:
        success, frame = cap.read()
        if not success:
            break

        results = model(frame)[0]
        
        for box in results.boxes:
            cls = int(box.cls[0])
            label = model.names[cls]
            conf = float(box.conf[0])

            # publish_to_MQTT broker
            if label in ['person', 'car']:  # ví dụ lọc nhãn phù hợp
                publish_detection(f"Detected {label} with confidence {conf:.2f}")

            # Vẽ bounding box
            xyxy = box.xyxy[0].cpu().numpy().astype(int)
            cv2.rectangle(frame, (xyxy[0], xyxy[1]), (xyxy[2], xyxy[3]), (0, 255, 0), 2)
            cv2.putText(frame, f"{label} {conf:.2f}", (xyxy[0], xyxy[1] - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        # Encode frame thành JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        # Yield frame theo chuẩn multipart/x-mixed-replace
        yield (b'--frame\r\n'
            b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
