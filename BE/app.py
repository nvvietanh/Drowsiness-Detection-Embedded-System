from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Cho phép CORS để frontend có thể truy cập

# Dữ liệu mẫu lưu trong bộ nhớ
attendances = [
    {"driver_id": 1, "vehicle_id": 101, "date": "2025-05-03", "checkin_time": "08:00", "checkout_time": "17:00", "note": "On time"},
    {"driver_id": 2, "vehicle_id": 102, "date": "2025-05-03", "checkin_time": "08:15", "checkout_time": "17:30", "note": "Late 15min"},
    {"driver_id": 3, "vehicle_id": 103, "date": "2025-05-03", "checkin_time": "07:50", "checkout_time": "16:45", "note": "Early leave"},
]

driver_states = [
    {"driver_id": 1, "vehicle_id": 101, "timestamp": "2025-05-03 08:00", "status": "Hoạt động", "note": "Đang giao hàng"},
    {"driver_id": 2, "vehicle_id": 102, "timestamp": "2025-05-03 08:15", "status": "Nghỉ", "note": "Tạm nghỉ 30 phút"},
    {"driver_id": 3, "vehicle_id": 103, "timestamp": "2025-05-03 07:00", "status": "Không hoạt động", "note": "Xe bảo trì"},
]

drivers = [
    {"driver_id": 1, "name": "Nguyễn Văn A", "address": "123 Đường Láng, Hà Nội", "image_url": "url1", "image_emb": [], "phone_number": "0123456789"},
    {"driver_id": 2, "name": "Trần Thị B", "address": "456 Nguyễn Trãi, TP.HCM", "image_url": "url2", "image_emb": [], "phone_number": "0987654321"},
    {"driver_id": 3, "name": "Lê Văn C", "address": "789 Lê Lợi, Đà Nẵng", "image_url": "url3", "image_emb": [], "phone_number": "0912345678"},
]
vehicles = [
    {"vehicle_id": 1, "license_plate": "29A-12345", "vehicle_type": "Xe tải"},
    {"vehicle_id": 2, "license_plate": "51H-67890", "vehicle_type": "Xe khách"},
    {"vehicle_id": 3, "license_plate": "30F-45678", "vehicle_type": "Xe container"},
]

# Endpoint GET để lấy danh sách trạng thái tài xế
@app.route('/api/driver-states', methods=['GET'])
def get_driver_states():
    return jsonify(driver_states)

# Endpoint GET để lấy danh sách chấm công
@app.route('/api/attendances', methods=['GET'])
def get_attendances():
    return jsonify(attendances)

# Endpoint GET để lấy danh sách tài xế
@app.route('/api/drivers', methods=['GET'])
def get_drivers():
    return jsonify(drivers)

# Endpoint POST để thêm tài xế mới
@app.route('/api/drivers', methods=['POST'])
def add_driver():
    new_driver = request.json
    new_driver['driver_id'] = len(drivers) + 1
    new_driver['image_emb'] = []  # Đảm bảo image_emb là mảng rỗng
    drivers.append(new_driver)
    return jsonify(new_driver), 201

# Endpoint PUT để cập nhật tài xế
@app.route('/api/drivers/<int:driver_id>', methods=['PUT'])
def update_driver(driver_id):
    for i, driver in enumerate(drivers):
        if driver['driver_id'] == driver_id:
            drivers[i] = request.json
            drivers[i]['driver_id'] = driver_id  # Giữ nguyên driver_id
            drivers[i]['image_emb'] = []  # Đảm bảo image_emb là mảng rỗng
            return jsonify(drivers[i])
    return jsonify({"error": "Driver not found"}), 404

# Endpoint DELETE để xóa tài xế
@app.route('/api/drivers/<int:driver_id>', methods=['DELETE'])
def delete_driver(driver_id):
    global drivers
    drivers = [driver for driver in drivers if driver['driver_id'] != driver_id]
    return jsonify({"message": "Driver deleted"}), 200

vehicles = [
    {"vehicle_id": 1, "license_plate": "29A-12345", "vehicle_type": "Xe tải"},
    {"vehicle_id": 2, "license_plate": "51H-67890", "vehicle_type": "Xe khách"},
    {"vehicle_id": 3, "license_plate": "30F-45678", "vehicle_type": "Xe container"},
]
# Endpoint GET để lấy danh sách xe
@app.route('/api/vehicles', methods=['GET'])
def get_vehicles():
    return jsonify(vehicles)

# Endpoint POST để thêm xe mới
@app.route('/api/vehicles', methods=['POST'])
def add_vehicle():
    new_vehicle = request.json
    new_vehicle['vehicle_id'] = len(vehicles) + 1
    vehicles.append(new_vehicle)
    return jsonify(new_vehicle), 201

# Endpoint PUT để cập nhật xe
@app.route('/api/vehicles/<int:vehicle_id>', methods=['PUT'])
def update_vehicle(vehicle_id):
    for i, vehicle in enumerate(vehicles):
        if vehicle['vehicle_id'] == vehicle_id:
            vehicles[i] = request.json
            vehicles[i]['vehicle_id'] = vehicle_id  # Giữ nguyên vehicle_id
            return jsonify(vehicles[i])
    return jsonify({"error": "Vehicle not found"}), 404

# Endpoint DELETE để xóa xe
@app.route('/api/vehicles/<int:vehicle_id>', methods=['DELETE'])
def delete_vehicle(vehicle_id):
    global vehicles
    vehicles = [vehicle for vehicle in vehicles if vehicle['vehicle_id'] != vehicle_id]
    return jsonify({"message": "Vehicle deleted"}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)