import os
import cv2
import numpy as np
import random
from tensorflow.keras.models import load_model

# Tải mô hình h5 đã huấn luyện
model = load_model('./saved_models/ddd_cnnlstm.h5')

# Đường dẫn đến thư mục chứa ảnh
image_dir = './Driver Drowsiness Dataset (DDD)/splitted_Data/test/Non Drowsy'

# Lấy danh sách tất cả các ảnh trong thư mục
image_files = [f for f in os.listdir(image_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]

# Chọn ngẫu nhiên 5 ảnh từ danh sách
random_images = random.sample(image_files, 5)

# Hàm tiền xử lý ảnh
def preprocess_image(image_path):
    # Đọc ảnh
    img = cv2.imread(image_path)
    # Resize ảnh theo kích thước mà mô hình yêu cầu
    img = cv2.resize(img, (128, 128))
    # Chuẩn hóa ảnh về [0, 1] nếu mô hình đã được huấn luyện như vậy
    img = img / 255.0
    return img

# Danh sách để lưu các ảnh tiền xử lý
images = []

# Tiền xử lý ảnh và thêm vào list
for img_file in random_images:
    img_path = os.path.join(image_dir, img_file)
    
    # Tiền xử lý ảnh
    img = preprocess_image(img_path)
    
    # Thêm ảnh vào danh sách
    images.append(img)

# Chuyển đổi danh sách thành một numpy array có hình dạng (batch_size, 5, 128, 128, 3)
# Đảm bảo batch_images có đúng hình dạng (1, 5, 128, 128, 3)
batch_images = np.array([images])  # Chuyển thành batch với 5 ảnh

# Dự đoán với mô hình
prediction = model.predict(batch_images)

# In kết quả dự đoán
for i, pred in enumerate(prediction):
    print(f'Prediction for image {random_images[i]}: {pred}')
