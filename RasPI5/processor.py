import cv2
from ultralytics import YOLO
import numpy as np
import math

# 学習済みモデル
model = YOLO("best (1).pt")

# 色（BGR）と太さ
COLOR_BOX   = (0,   0, 255)   # 赤
COLOR_ARROW = (0, 255, 255)   # 黄
THICK_BOX   = 1
THICK_ARROW = 3
TIP_LEN     = 0.35

def process_frame(frame, frame_id=0, results=None):
    """
    1フレームを受け取り、処理を加えて返す。
    frame_id: フレーム番号（間引き用）
    results: 前回の推論結果（間引き時に使い回す）
    """
    if frame_id % 5 == 0:  # 3フレームに1回だけ推論
        results = model(frame, conf=0.5, imgsz=320)

    vis = frame.copy()
    if results is not None:
        for box in results[0].boxes.xyxy.cpu().numpy():
            x1, y1, x2, y2 = map(int, box)

            cv2.rectangle(vis, (x1, y1), (x2, y2), COLOR_BOX, THICK_BOX)

            roi = frame[y1:y2, x1:x2]
            if roi.size == 0:
                continue

            gray  = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
            gray  = cv2.GaussianBlur(gray, (5, 5), 0)
            edges = cv2.Canny(gray, 50, 150, apertureSize=3)

            lines = cv2.HoughLines(edges, 1, np.pi/180, 50)
            if lines is None:
                continue

            rho, theta = lines[0][0]
            angle_deg = theta * 180 / np.pi
            if angle_deg > 90:
                angle_deg -= 180

            direction = "Right" if angle_deg > 0 else "Left"

            cx = (x1 + x2) // 2
            cy = (y1 + y2) // 2
            dx = int(np.cos(theta) * 60)
            dy = int(np.sin(theta) * 60)

            start = (cx, cy)
            end   = (cx + dx, cy - dy)
            cv2.arrowedLine(vis, start, end, COLOR_ARROW, THICK_ARROW, tipLength=TIP_LEN)

            cv2.putText(vis, f"Fall: {direction}", (x1, max(20, y1 - 10)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, COLOR_ARROW, 2, cv2.LINE_AA)

    return vis, results
