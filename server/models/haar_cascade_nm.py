import cv2
import time
import argparse
import numpy as np

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

# ========================= MAIN CONTROLLER ================================
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Drowsiness Detection")
    parser.add_argument("--mode", choices=["dlib", "mediapipe"], required=True, help="Chọn mode: dlib hoặc mediapipe")
    args = parser.parse_args()

    if args.mode == "dlib":
        dlib_detector()
    elif args.mode == "mediapipe":
        mediapipe_detector()
