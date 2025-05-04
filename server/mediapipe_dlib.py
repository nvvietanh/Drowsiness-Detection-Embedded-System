import cv2
import time
import argparse
import numpy as np
from mqtt_client import publish_detection


# EAR calculation
from scipy.spatial import distance as dist

def eye_aspect_ratio(eye):
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

# ========================= DLIB MODULE ================================
def dlib_detector():
    import dlib
    from imutils import face_utils

    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

    (lStart, lEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
    (rStart, rEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]

    EAR_THRESHOLD = 0.25
    CONSEC_FRAMES = 30
    COUNTER = 0

    cap = cv2.VideoCapture(0)
    print("[INFO] Dlib mode started...")

    while True:
        ret, frame = cap.read()
        if not ret: break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detector(gray)

        for face in faces:
            shape = predictor(gray, face)
            shape = face_utils.shape_to_np(shape)

            leftEye = shape[lStart:lEnd]
            rightEye = shape[rStart:rEnd]
            ear = (eye_aspect_ratio(leftEye) + eye_aspect_ratio(rightEye)) / 2.0

            cv2.drawContours(frame, [cv2.convexHull(leftEye)], -1, (0,255,0), 1)
            cv2.drawContours(frame, [cv2.convexHull(rightEye)], -1, (0,255,0), 1)

            if ear < EAR_THRESHOLD:
                COUNTER += 1
                if COUNTER >= CONSEC_FRAMES:
                    cv2.putText(frame, "BUON NGU!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    
            else:
                COUNTER = 0

            

            cv2.putText(frame, f"EAR: {ear:.2f}", (300, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 1)

        cv2.imshow("Drowsiness Detector - Dlib", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    cap.release()
    cv2.destroyAllWindows()

def dlib_detector_stream(video_src):
    import dlib
    from imutils import face_utils

    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

    (lStart, lEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
    (rStart, rEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]

    EAR_THRESHOLD = 0.25
    CONSEC_FRAMES = 30
    COUNTER = 0

    cap = cv2.VideoCapture(video_src)
    print("[INFO] Dlib mode started...")

    while True:
        ret, frame = cap.read()
        if not ret: break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detector(gray)

        for face in faces:
            shape = predictor(gray, face)
            shape = face_utils.shape_to_np(shape)

            leftEye = shape[lStart:lEnd]
            rightEye = shape[rStart:rEnd]
            ear = (eye_aspect_ratio(leftEye) + eye_aspect_ratio(rightEye)) / 2.0

            cv2.drawContours(frame, [cv2.convexHull(leftEye)], -1, (0,255,0), 1)
            cv2.drawContours(frame, [cv2.convexHull(rightEye)], -1, (0,255,0), 1)

            if ear < EAR_THRESHOLD:
                COUNTER += 1
                if COUNTER >= CONSEC_FRAMES:
                    cv2.putText(frame, "BUON NGU!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    publish_detection("BUON_NGU")

            else:
                COUNTER = 0


            cv2.putText(frame, f"EAR: {ear:.2f}", (300, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 1)

        # Encode frame thành JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        # Yield frame theo chuẩn multipart/x-mixed-replace
        yield (b'--frame\r\n'
            b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
def dlib_detector_frame(frame):
    import dlib
    from imutils import face_utils

    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

    (lStart, lEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
    (rStart, rEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]

    EAR_THRESHOLD = 0.25
    CONSEC_FRAMES = 30
    COUNTER = 0

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector(gray)

    for face in faces:
        shape = predictor(gray, face)
        shape = face_utils.shape_to_np(shape)

        leftEye = shape[lStart:lEnd]
        rightEye = shape[rStart:rEnd]
        ear = (eye_aspect_ratio(leftEye) + eye_aspect_ratio(rightEye)) / 2.0

        cv2.drawContours(frame, [cv2.convexHull(leftEye)], -1, (0,255,0), 1)
        cv2.drawContours(frame, [cv2.convexHull(rightEye)], -1, (0,255,0), 1)

        if ear < EAR_THRESHOLD:
            COUNTER += 1
            if COUNTER >= CONSEC_FRAMES:
                cv2.putText(frame, "BUON NGU!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                publish_detection("BUON_NGU")

        else:
            COUNTER = 0


        cv2.putText(frame, f"EAR: {ear:.2f}", (300, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 1)

    return frame

import dlib
import cv2
from imutils import face_utils

class DrowsinessDetectorDlib:
    def __init__(self, predictor_path="./models/shape_predictor_68_face_landmarks.dat", ear_threshold=0.25, consec_frames=30):
        self.detector = dlib.get_frontal_face_detector()
        self.predictor = dlib.shape_predictor(predictor_path)
        self.lStart, self.lEnd = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
        self.rStart, self.rEnd = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]
        self.EAR_THRESHOLD = ear_threshold
        self.CONSEC_FRAMES = consec_frames
        self.counter = 0

    def process_frame(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.detector(gray)

        for face in faces:
            shape = self.predictor(gray, face)
            shape = face_utils.shape_to_np(shape)

            left_eye = shape[self.lStart:self.lEnd]
            right_eye = shape[self.rStart:self.rEnd]
            ear = (eye_aspect_ratio(left_eye) + eye_aspect_ratio(right_eye)) / 2.0

            cv2.drawContours(frame, [cv2.convexHull(left_eye)], -1, (0, 255, 0), 1)
            cv2.drawContours(frame, [cv2.convexHull(right_eye)], -1, (0, 255, 0), 1)

            if ear < self.EAR_THRESHOLD:
                self.counter += 1
                if self.counter >= self.CONSEC_FRAMES:
                    cv2.putText(frame, "BUON NGU!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    publish_detection("BUON_NGU")
            else:
                self.counter = 0

            cv2.putText(frame, f"EAR: {ear:.2f}", (300, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 1)

        return frame


# ========================= MEDIAPIPE MODULE ================================
def mediapipe_detector():
    import mediapipe as mp

    mp_face_mesh = mp.solutions.face_mesh
    EAR_THRESHOLD = 0.25
    CONSEC_FRAMES = 30
    COUNTER = 0

    # Các điểm landmark mắt theo mediapipe
    LEFT_EYE_IDX = [362, 385, 387, 263, 373, 380]
    RIGHT_EYE_IDX = [33, 160, 158, 133, 153, 144]

    cap = cv2.VideoCapture(0)
    face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True)

    while True:
        ret, frame = cap.read()
        if not ret: break

        h, w = frame.shape[:2]
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb)

        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                left_eye = []
                right_eye = []

                for idx in LEFT_EYE_IDX:
                    pt = face_landmarks.landmark[idx]
                    left_eye.append((int(pt.x * w), int(pt.y * h)))

                for idx in RIGHT_EYE_IDX:
                    pt = face_landmarks.landmark[idx]
                    right_eye.append((int(pt.x * w), int(pt.y * h)))

                ear = (eye_aspect_ratio(left_eye) + eye_aspect_ratio(right_eye)) / 2.0

                if ear < EAR_THRESHOLD:
                    COUNTER += 1
                    if COUNTER >= CONSEC_FRAMES:
                        cv2.putText(frame, "BUON NGU!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                else:
                    COUNTER = 0

                cv2.putText(frame, f"EAR: {ear:.2f}", (300, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 1)

                # Vẽ mắt
                for (x, y) in left_eye + right_eye:
                    cv2.circle(frame, (x, y), 2, (0, 255, 0), -1)

        cv2.imshow("Drowsiness Detector - MediaPipe", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    cap.release()
    cv2.destroyAllWindows()

def mediapipe_detector_stream(video_src):
    import mediapipe as mp

    mp_face_mesh = mp.solutions.face_mesh
    EAR_THRESHOLD = 0.25
    CONSEC_FRAMES = 30
    COUNTER = 0

    # Các điểm landmark mắt theo mediapipe
    LEFT_EYE_IDX = [362, 385, 387, 263, 373, 380]
    RIGHT_EYE_IDX = [33, 160, 158, 133, 153, 144]

    cap = cv2.VideoCapture(video_src)
    face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True)

    print("[INFO] MediaPipe mode started...")

    while True:
        ret, frame = cap.read()
        if not ret: break

        h, w = frame.shape[:2]
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb)

        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                left_eye = []
                right_eye = []

                for idx in LEFT_EYE_IDX:
                    pt = face_landmarks.landmark[idx]
                    left_eye.append((int(pt.x * w), int(pt.y * h)))

                for idx in RIGHT_EYE_IDX:
                    pt = face_landmarks.landmark[idx]
                    right_eye.append((int(pt.x * w), int(pt.y * h)))

                ear = (eye_aspect_ratio(left_eye) + eye_aspect_ratio(right_eye)) / 2.0

                if ear < EAR_THRESHOLD:
                    COUNTER += 1
                    if COUNTER >= CONSEC_FRAMES:
                        cv2.putText(frame, "BUON NGU!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                        publish_detection("BUON_NGU")
                else:
                    COUNTER = 0

                cv2.putText(frame, f"EAR: {ear:.2f}", (300, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 1)

                # Vẽ mắt
                for (x, y) in left_eye + right_eye:
                    cv2.circle(frame, (x, y), 2, (0, 255, 0), -1)

    # Encode frame thành JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        # Yield frame theo chuẩn multipart/x-mixed-replace
        yield (b'--frame\r\n'
            b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
COUNTER = 0

class DrowsinessDetectorMediapipe:
    def __init__(self):
        import mediapipe as mp
        self.face_mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True)
        self.EAR_THRESHOLD = 0.25
        self.CONSEC_FRAMES = 30
        self.counter = 0
        self.LEFT_EYE_IDX = [362, 385, 387, 263, 373, 380]
        self.RIGHT_EYE_IDX = [33, 160, 158, 133, 153, 144]

    def process_frame(self, frame):
        h, w = frame.shape[:2]
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb)

        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                left_eye = [(int(face_landmarks.landmark[idx].x * w), int(face_landmarks.landmark[idx].y * h)) for idx in self.LEFT_EYE_IDX]
                right_eye = [(int(face_landmarks.landmark[idx].x * w), int(face_landmarks.landmark[idx].y * h)) for idx in self.RIGHT_EYE_IDX]
                
                ear = (eye_aspect_ratio(left_eye) + eye_aspect_ratio(right_eye)) / 2.0

                if ear < self.EAR_THRESHOLD:
                    self.counter += 1
                    if self.counter >= self.CONSEC_FRAMES:
                        cv2.putText(frame, "BUON NGU!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                        publish_detection("BUON_NGU")
                else:
                    self.counter = 0

                cv2.putText(frame, f"EAR: {ear:.2f}", (300, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 1)
                for (x, y) in left_eye + right_eye:
                    cv2.circle(frame, (x, y), 2, (0, 255, 0), -1)
        return frame

        
def mediapipe_detector_frame(frame):
    global COUNTER
    import mediapipe as mp

    mp_face_mesh = mp.solutions.face_mesh
    EAR_THRESHOLD = 0.25
    CONSEC_FRAMES = 30
    # COUNTER = 0

    # Các điểm landmark mắt theo mediapipe
    LEFT_EYE_IDX = [362, 385, 387, 263, 373, 380]
    RIGHT_EYE_IDX = [33, 160, 158, 133, 153, 144]

    face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True)

    # print("[INFO] MediaPipe mode started...")

    h, w = frame.shape[:2]
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            left_eye = []
            right_eye = []

            for idx in LEFT_EYE_IDX:
                pt = face_landmarks.landmark[idx]
                left_eye.append((int(pt.x * w), int(pt.y * h)))

            for idx in RIGHT_EYE_IDX:
                pt = face_landmarks.landmark[idx]
                right_eye.append((int(pt.x * w), int(pt.y * h)))

            ear = (eye_aspect_ratio(left_eye) + eye_aspect_ratio(right_eye)) / 2.0

            if ear < EAR_THRESHOLD:
                    COUNTER += 1
                    if COUNTER >= CONSEC_FRAMES:
                        cv2.putText(frame, "BUON NGU!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                        publish_detection("BUON_NGU")
            else:
                COUNTER = 0

            cv2.putText(frame, f"EAR: {ear:.2f}", (300, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 1)

            # Vẽ mắt
            for (x, y) in left_eye + right_eye:
                cv2.circle(frame, (x, y), 2, (0, 255, 0), -1)
    return frame


# ========================= MAIN CONTROLLER ================================
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Drowsiness Detection")
    parser.add_argument("--mode", choices=["dlib", "mediapipe"], required=True, help="Chọn mode: dlib hoặc mediapipe")
    args = parser.parse_args()

    if args.mode == "dlib":
        dlib_detector()
    elif args.mode == "mediapipe":
        mediapipe_detector()
