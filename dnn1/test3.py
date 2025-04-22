import cv2
import numpy as np
from tensorflow.keras.models import load_model

model = load_model("./my_model.h5")


image_size = (224, 224)  # Như khi huấn luyện

# Mở webcam
cap = cv2.VideoCapture(0)

labels = ['class_0', 'class_1']  # Đặt tên class phù hợp với bài toán của bạn

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Tiền xử lý frame giống như lúc huấn luyện
    img = cv2.resize(frame, image_size)
    img = img / 255.0  # Normalization (nếu đã dùng khi huấn luyện)
    img = np.expand_dims(img, axis=0)  # Thêm batch dimension

    # Dự đoán
    prediction = model.predict(img)
    class_index = np.argmax(prediction)
    class_label = labels[class_index]
    confidence = prediction[0][class_index]

    # Hiển thị kết quả lên frame
    cv2.putText(frame, f"{class_label}: {confidence:.2f}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    # Hiển thị frame
    cv2.imshow("Webcam", frame)

    # Nhấn 'q' để thoát
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
