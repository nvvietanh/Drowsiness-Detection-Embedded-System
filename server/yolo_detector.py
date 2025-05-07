import queue
import threading
import time
import winsound
import cv2
import numpy as np
from ultralytics import YOLO
import mediapipe as mp
import sys
from PyQt5.QtWidgets import QApplication, QLabel, QMainWindow, QHBoxLayout, QWidget
from PyQt5.QtGui import QImage, QPixmap
from PyQt5.QtCore import Qt

class DrowsinessDetectorYolo():
    def __init__(self):
        super().__init__()

        self.yawn_state = ''
        self.left_eye_state =''
        self.right_eye_state= ''
        self.alert_text = ''

        self.blinks = 0
        self.microsleeps = 0
        self.yawns = 0
        self.yawn_duration = 0 

        self.left_eye_still_closed = False  
        self.right_eye_still_closed = False 
        self.yawn_in_progress = False
        
        self.counter_eye = 0
        self.counter_yawn = 0
        self.CONSEC_FRAMES = 5
        self.is_drowsy = False
        
        self.face_mesh = mp.solutions.face_mesh.FaceMesh(min_detection_confidence=0.5, min_tracking_confidence=0.5)
        self.points_ids = [187, 411, 152, 68, 174, 399, 298]

        # self.detectyawn = YOLO("runs/detectyawn/train/weights/best.pt")
        # self.detecteye = YOLO("runs/detecteye/train/weights/best.pt")

        self.detectyawn = YOLO("./models/yolo_model/real-time-drowsy-driving-detection/runs/detectyawn/train/weights/best.pt")
        self.detecteye = YOLO("./models/yolo_model/real-time-drowsy-driving-detection/runs/detecteye/train/weights/best.pt")
        
        # time.sleep(1.000)

    def predict_eye(self, eye_frame, eye_state):
        results_eye = self.detecteye.predict(eye_frame, verbose=False)
        boxes = results_eye[0].boxes
        if len(boxes) == 0:
            return eye_state

        confidences = boxes.conf.cpu().numpy()  
        class_ids = boxes.cls.cpu().numpy()  
        max_confidence_index = np.argmax(confidences)
        class_id = int(class_ids[max_confidence_index])

        if class_id == 1 :
            eye_state = "Close Eye"
        elif class_id == 0 and confidences[max_confidence_index] > 0.30:
            eye_state = "Open Eye"
                            
        return eye_state

    def predict_yawn(self, yawn_frame):
        results_yawn = self.detectyawn.predict(yawn_frame, verbose=False)
        boxes = results_yawn[0].boxes

        if len(boxes) == 0:
            return self.yawn_state

        confidences = boxes.conf.cpu().numpy()  
        class_ids = boxes.cls.cpu().numpy()  
        max_confidence_index = np.argmax(confidences)
        class_id = int(class_ids[max_confidence_index])

        if class_id == 0:
            self.yawn_state = "Yawn"
        elif class_id == 1 and confidences[max_confidence_index] > 0.50 :
            self.yawn_state = "No Yawn"
                            
    def process_frame(self, frame):
        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(image_rgb)

        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                ih, iw, _ = frame.shape
                points = []

                for point_id in self.points_ids:
                    lm = face_landmarks.landmark[point_id]
                    x, y = int(lm.x * iw), int(lm.y * ih)
                    points.append((x, y))

                if len(points) != 0:
                    x1, y1 = points[0]  
                    x2, _ = points[1]  
                    _, y3 = points[2]  

                    x4, y4 = points[3]  
                    x5, y5 = points[4]  

                    x6, y6 = points[5]  
                    x7, y7 = points[6]  

                    x6, x7 = min(x6, x7), max(x6, x7)
                    y6, y7 = min(y6, y7), max(y6, y7)

                    mouth_roi = frame[y1:y3, x1:x2]
                    right_eye_roi = frame[y4:y5, x4:x5]
                    left_eye_roi = frame[y6:y7, x6:x7]

                    try:
                        self.left_eye_state = self.predict_eye(left_eye_roi, self.left_eye_state)
                        self.right_eye_state = self.predict_eye(right_eye_roi, self.right_eye_state)
                        self.predict_yawn(mouth_roi)

                    except Exception as e:
                        print(f"{e}")

                    if self.left_eye_state == "Close Eye" and self.right_eye_state == "Close Eye":
                        if not self.left_eye_still_closed and not self.right_eye_still_closed:
                            self.left_eye_still_closed, self.right_eye_still_closed = True , True
                            self.blinks += 1
                        self.microsleeps += 45 / 1000
                        self.counter_eye += 1
                        if self.counter_eye >= self.CONSEC_FRAMES:
                            cv2.putText(frame, "BUON NGU!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                            # publish_detection("BUON_NGU")
                            self.is_drowsy = True
                    else:
                        if self.left_eye_still_closed and self.right_eye_still_closed :
                            self.left_eye_still_closed, self.right_eye_still_closed = False , False
                        self.microsleeps = 0
                        self.counter_eye = 0
                        # self.counter_yawn = 0
                        self.is_drowsy = False

                    if self.yawn_state == "Yawn":
                        if not self.yawn_in_progress:
                            self.yawn_in_progress = True
                            # self.yawns += 1
                            return True, frame
                        self.yawn_duration += 45 / 1000
                        self.counter_yawn += 1
                        if self.counter_yawn >= self.CONSEC_FRAMES:
                            cv2.putText(frame, "BUON NGU!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                            # publish_detection("BUON_NGU")
                            self.is_drowsy = True
                            
                    else:
                        if self.yawn_in_progress:
                            self.yawn_in_progress = False
                            self.yawn_duration = 0
                        self.counter_yawn = 0
                        self.is_drowsy = False
                        # self.counter_eye = 0
        return self.is_drowsy, frame

    def display_frame(self, frame):
        rgb_image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        h, w, ch = rgb_image.shape
        bytes_per_line = ch * w
        convert_to_Qt_format = QImage(rgb_image.data, w, h, bytes_per_line, QImage.Format_RGB888)
        p = convert_to_Qt_format.scaled(640, 480, Qt.KeepAspectRatio)
        self.video_label.setPixmap(QPixmap.fromImage(p))

    def play_alert_sound(self):
            frequency = 1000 
            duration = 500  
            winsound.Beep(frequency, duration)

    def play_sound_in_thread(self):
        sound_thread = threading.Thread(target=self.play_alert_sound)
        sound_thread.start()
        
    def show_alert_on_frame(self, frame, text="BUON NGU"):
        font = cv2.FONT_HERSHEY_SIMPLEX
        position = (50, 50)
        font_scale = 1
        font_color = (0, 0, 255) 
        line_type = 2

        cv2.putText(frame, text, position, font, font_scale, font_color, line_type)
