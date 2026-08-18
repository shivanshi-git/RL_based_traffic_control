# Implementation Plan - YOLO Car Detection & RL Traffic Control Integration

Create a Jupyter Notebook (`yolo_car_detection.ipynb`) and integration module connecting YOLOv8 car object detection with the existing Q-Learning Reinforcement Learning traffic signal control system (`rl_model/app.py`).

## End-to-End System Architecture

```
+------------------------------------+
|  Intersection Traffic Camera Feed  |
+------------------------------------+
                  |
                  v
+------------------------------------+
|   YOLO Car Object Detection        |  <-- yolo_car_detection.ipynb / yolo_detector.py
|  (Bounding Boxes & Car Counts)     |
+------------------------------------+
                  |
                  | Returns vehicle counts per lane: [N, S, E, W]
                  v
+------------------------------------+
|  RL State Vector Construction      |  <-- rl_model/q_learning.py
+------------------------------------+
                  |
                  v
+------------------------------------+
|   Q-Learning RL Signal Controller  |  <-- rl_model/app.py (/get_signal)
|  (Action: NS_GREEN vs EW_GREEN)    |
+------------------------------------+
```

---

## Proposed Changes & Enhancements

### 1. YOLO Car Detection Jupyter Notebook ([yolo_car_detection.ipynb](file:///e:/Capstone_project/Capstone_project/yolo_car_detection.ipynb))
The notebook will contain 7 structured sections:
1. **Environment Setup**: Installing dependencies (`ultralytics`, `opencv-python`, `torch`, `matplotlib`, `requests`).
2. **COCO Dataset Car Selection**: Filtering COCO class 2 (`car`) and setting up dataset annotations & bounding box standards.
3. **YOLO Model Training**: Training YOLOv8 model for car detection.
4. **Bounding Box Visualization**: Custom OpenCV/Matplotlib function to render detected cars with bounding boxes and confidence scores.
5. **Lane ROI (Region of Interest) Multi-Lane Vehicle Counter**: Defining 4 lane zones (North, South, East, West) and counting detected cars per zone.
6. **RL Integration Bridge**: Sending the YOLO-detected lane counts `[N_count, S_count, E_count, W_count]` directly to the Flask RL backend (`http://localhost:8000/get_signal`).
7. **Interactive Demo / Simulation**: Simulating a live camera frame feed, detecting cars via YOLO, updating the RL state, and receiving the optimal signal decision (`NS_GREEN` / `EW_GREEN`).

---

### 2. Flask RL Backend Enhancement ([rl_model/app.py](file:///e:/Capstone_project/Capstone_project/rl_model/app.py))

#### [MODIFY] [rl_model/app.py](file:///e:/Capstone_project/Capstone_project/rl_model/app.py)
- Add a dedicated endpoint `/predict_signal_from_yolo` that accepts image/frame data or detected bounding box vehicle counts `[N, S, E, W]` to return the RL signal recommendation (`NS_GREEN` / `EW_GREEN`).

---

## User Review Required

> [!TIP]
> - **End-to-End Pipeline**: Connecting YOLO with your RL model turns your capstone project into a complete **Computer Vision + AI Traffic Control System** (Camera Feed -> Bounding Box Car Detection -> Multi-Lane Vehicle Counting -> Q-Learning Signal Optimization).
> - **Interactive Notebook**: The notebook will allow running live inference on test traffic images/videos and directly trigger signal actions from your RL model.

---

## Verification Plan

### Automated Verification
- Execute python nbformat validation to verify `.ipynb` cell integrity.
- Run test payload assertions verifying YOLO lane counts translate correctly to RL Q-Learning state vectors.

### Manual Verification
- Test Flask server (`rl_model/app.py`) on port 8000 while executing the notebook's RL integration cell to verify live communication between YOLO detection and Q-Learning signal optimization.
