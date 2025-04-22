import cv2
import numpy as np
from tensorflow.keras.models import load_model
from collections import deque
import time

# Tải mô hình
model = load_model("./saved_models/ddd_cnnlstm.h5")

# Cài đặt
sequence_length = 5
image_size = (128, 128)

# Bộ đệm lưu ảnh
frame_queue = deque(maxlen=sequence_length)

# Mở webcam
cap = cv2.VideoCapture(0)  # Có thể thay 0 bằng đường dẫn file video nếu cần

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Resize và chuẩn hóa ảnh
    resized = cv2.resize(frame, image_size)
    normalized = resized / 255.0
    frame_queue.append(normalized)

    # Nếu đã đủ ảnh cho một chuỗi
    if len(frame_queue) == sequence_length:
        # Tạo input có shape (1, 5, 128, 128, 3)
        input_sequence = np.array(frame_queue)
        input_sequence = np.expand_dims(input_sequence, axis=0)

        # Dự đoán
        prediction = model.predict(input_sequence)[0][0]  # sigmoid → giá trị từ 0 đến 1
        label = "Drowsy" if prediction > 0.5 else "Alert"

        # Hiển thị kết quả
        cv2.putText(frame, f"{label} ({prediction:.2f})", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 
                    1, (0, 255, 0) if label == "Alert" else (0, 0, 255), 2)

    # Hiển thị webcam
    cv2.imshow("Webcam - Drowsiness Detection", frame)

    # Thoát nếu bấm 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Giải phóng
cap.release()
cv2.destroyAllWindows()
