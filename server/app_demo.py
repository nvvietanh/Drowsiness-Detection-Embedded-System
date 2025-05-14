from flask import Flask, Response, render_template_string
import cv2
from face_recognition.FaceRecogniton import FaceRecognition

app = Flask(__name__)
model = FaceRecognition()
camera = cv2.VideoCapture(0)  # Webcam
from model.DriverDatabase import DriverDatabase
driver_db = DriverDatabase()
# HTML nội tuyến
html_template = '''
<!DOCTYPE html>
<html>
<head>
    <title>Face Recognition Stream</title>
</head>
<body>
    <h1>Live Face Detection</h1>
    <img src="{{ url_for('video') }}" width="720px">
</body>
</html>
'''
list_drivers = driver_db.list_drivers()
list_emb = [d['image_emb'][0] for d in list_drivers]
def gen_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            faces = model.detect_face_v1(frame)
            for (x1, y1, x2, y2) in faces:
                face_crop = frame[y1:y2, x1:x2]
                face_embedding = model.get_feature(face_crop)
                score, index = model.compare_encodings_v2(face_embedding, list_emb)
                print("Score: ")
                print(score)

                if score >0.3: 
                    # cv2.imwrite("thang.jpg", face_crop)
                    cv2.rectangle(frame , (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(frame, str(list_drivers[int(index)]["driver_id"]), (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
                else: 
                    cv2.rectangle(frame , (x1, y1), (x2, y2), (0, 0, 255), 2)
                    cv2.putText(frame, "None", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/')
def index():
    return render_template_string(html_template)

@app.route('/video')
def video():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000, debug=True)
