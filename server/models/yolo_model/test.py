import cv2
from ultralytics import YOLO

# Load mô hình YOLO (bạn có thể dùng yolov8n.pt, yolov8s.pt, yolov8m.pt...)
model = YOLO("best.pt")  # hoặc đường dẫn tới model đã huấn luyện

# Mở webcam (0 = webcam mặc định)
cap = cv2.VideoCapture(0)

# Kiểm tra mở được chưa
if not cap.isOpened():
    print("Không thể mở webcam")
    exit()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Dò vật thể trong frame
    results = model.predict(source=frame, conf=0.4, verbose=False)

    # Lấy ảnh đã có vẽ box
    annotated_frame = results[0].plot()

    # Hiển thị kết quả
    cv2.imshow("YOLOv8 - Webcam Detection", annotated_frame)

    # Nhấn 'q' để thoát
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# Giải phóng
cap.release()
cv2.destroyAllWindows()
