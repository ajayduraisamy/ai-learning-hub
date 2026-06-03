import { registerContent } from '@/content/index'

registerContent('p21-object-detection', () => ({
  difficulty: 'Advanced',
  estimatedTime: '120 minutes',
  prerequisites: ['p11-object-detection', 'p8-cnn'],
  tags: ['End-to-End Projects', 'Advanced', 'Project'],
  objectives: [
    'Understand YOLO architecture for real-time object detection',
    'Prepare a custom dataset with COCO-format annotations',
    'Train YOLOv8 on a custom dataset',
    'Build a real-time inference pipeline with visualization',
    'Deploy with FastAPI + WebSocket streaming and Docker',
  ],
  theory: `# Object Detection System with YOLOv8

## Problem Overview

Object detection identifies and localizes multiple objects in an image. Unlike classification (one label per image), detection produces bounding boxes with class labels for each object instance.

### YOLO Architecture

YOLO (You Only Look Once) treats detection as a single regression problem, predicting bounding boxes and class probabilities directly from pixels in one forward pass.

### YOLOv8 Key Innovations

1. **C2f Module**: Cross-stage partial connections with 2 convolutions — improves gradient flow
2. **Decoupled Head**: Separate classification and regression heads
3. **Anchor-Free Detection**: Predicts object center directly, no anchor boxes
4. **Task-Aligned Assigner**: Matches predictions to ground truth based on classification + IoU score

### Architecture

\\\`\\\`\\\`
Input Image (640×640×3)
  → Backbone (CSPDarknet)
    → Neck (PAN-FPN for multi-scale features)
      → Head (Decoupled: cls + reg branches)
        → Output (84 × N predictions per scale: 4 bbox + 80 class scores)
\\\`\\\`\\\`

### Loss Function

$$\\mathcal{L} = \\lambda_{\\text{box}} \\mathcal{L}_{\\text{CIoU}} + \\lambda_{\\text{cls}} \\mathcal{L}_{\\text{BCE}} + \\lambda_{\\text{dfl}} \\mathcal{L}_{\\text{DFL}}$$

- **CIoU Loss**: Complete IoU — accounts for overlap, center distance, aspect ratio
- **BCE Loss**: Binary cross-entropy for multi-label classification
- **DFL Loss**: Distribution Focal Loss — learns bounding box distributions

## Dataset Preparation (COCO Format)

\\\`\\\`\\\`
dataset/
  train/
    images/    (JPEG/PNG images)
    labels/    (TXT files: class x_center y_center width height)
  val/
    images/
    labels/
  data.yaml    (class names and paths)
\\\`\\\`\\\`

Label format (normalized 0-1):
\\\`\\\`
<class_id> <x_center> <y_center> <width> <height>
\\\`\\\`

## Model Sizes

| Model | Params | mAP@50 | Speed (CPU) | Use Case |
|-------|--------|--------|-------------|----------|
| YOLOv8n | 3.2M | 37.3% | Fastest | Edge/mobile |
| YOLOv8s | 11.2M | 44.9% | Fast | CPU real-time |
| YOLOv8m | 25.9M | 50.2% | Moderate | GPU real-time |
| YOLOv8l | 43.7M | 52.9% | Slow | High accuracy |
| YOLOv8x | 68.2M | 53.9% | Slowest | Max accuracy |

## Deployment Architecture

- **FastAPI**: REST endpoint for single image inference
- **WebSocket**: Real-time video stream processing
- **Docker**: Containerized deployment with GPU support
- **Monitoring**: Track inference latency, detection counts, confidence distribution`,

  understanding: {
    analogy: 'YOLO object detection is like a security guard scanning a crowd. Instead of examining each person carefully one by one (sliding window approach), the guard takes one quick glance across the entire scene and immediately identifies where people are and who they are. YOLO divides the image into a grid, and each grid cell predicts objects whose center falls in that cell. One forward pass through the neural network produces all detections simultaneously — hence "You Only Look Once."',
    steps: [
      { title: 'Dataset Preparation', content: 'Collect and annotate images in COCO format. Use LabelImg or Roboflow for bounding box annotation. Split into train/val sets. Create data.yaml with class names and paths.' },
      { title: 'Data Augmentation', content: 'YOLOv8 applies built-in augmentations: mosaic (combine 4 images into 1), mixup, random perspective, HSV jitter, and flips. These significantly improve generalization with minimal code.' },
      { title: 'Model Training', content: 'Train YOLOv8 using the Ultralytics package. Choose the model size based on speed/accuracy requirements. Use pre-trained weights for faster convergence. Monitor mAP@50 and mAP@50:95.' },
      { title: 'Validation & Tuning', content: 'Evaluate on validation set. Analyze confusion matrix and per-class AP. Tune hyperparameters (learning rate, mosaic probability, NMS IoU threshold) based on results.' },
      { title: 'Inference Pipeline', content: 'Build an inference module that loads the trained model, processes images, runs NMS (Non-Maximum Suppression) to remove duplicate detections, and draws bounding boxes with labels and confidence scores.' },
      { title: 'Deployment', content: 'Deploy with FastAPI REST endpoint + WebSocket for streaming video. Optimize with ONNX or TensorRT for production. Containerize with Docker and deploy with GPU support.' },
    ],
    misconceptions: [
      { misconception: 'YOLO always detects all objects in an image', truth: 'YOLO may miss small objects, heavily occluded objects, or objects in unusual poses. The model outputs a confidence score — low-confidence detections are suppressed but may represent missed objects.' },
      { misconception: 'Higher mAP always means better production performance', truth: 'mAP measures average precision across IoU thresholds. In production, you care about specific objects, confidence calibration, and speed. A slightly lower mAP model that runs 2x faster is often preferable.' },
      { misconception: 'Object detection requires enormous datasets', truth: 'YOLOv8 can transfer learn effectively with as few as 100-500 annotated images per class, especially when starting from COCO pre-trained weights. Quality of annotations matters more than quantity.' },
    ],
    comparisons: [
      { label: 'Speed', methodA: 'YOLOv8 — Single-shot, very fast (2-10ms on GPU)', methodB: 'Faster R-CNN — Two-stage, slower (50-200ms on GPU)' },
      { label: 'Small Object Detection', methodA: 'YOLOv8 — Good but can miss small objects', methodB: 'Faster R-CNN — Better due to region proposal stage' },
      { label: 'Training Complexity', methodA: 'YOLOv8 — Simple, single-stage training', methodB: 'Faster R-CNN — Complex, multiple loss terms' },
      { label: 'Ecosystem', methodA: 'YOLOv8 — Ultralytics (comprehensive)', methodB: 'Detectron2 — Facebook AI (research-focused)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Setup: Train YOLOv8 on custom dataset
from ultralytics import YOLO

# Load a pre-trained YOLOv8 model (small version)
model = YOLO("yolov8s.pt")  # 11.2M params

# Train on custom dataset
results = model.train(
    data="dataset/data.yaml",    # Dataset configuration
    epochs=100,                   # Training epochs
    imgsz=640,                    # Input image size
    batch=16,                     # Batch size (adjust for GPU memory)
    patience=20,                  # Early stopping patience
    lr0=0.01,                    # Initial learning rate
    augment=True,                 # Use built-in augmentations
    device="cuda",                # GPU training
    project="runs/train",
    name="custom_yolov8s",
    exist_ok=True,
)

# Validate
metrics = model.val()
print(f"mAP@50: {metrics.box.map50:.4f}")
print(f"mAP@50:95: {metrics.box.map:.4f}")

# Predict on test images
test_results = model.predict(
    source="dataset/test/images",
    conf=0.25,    # Confidence threshold
    iou=0.45,     # NMS IoU threshold
    save=True,    # Save annotated images
    save_txt=True, # Save labels as text files
)`,
      output: `Ultralytics YOLOv8s summary:
  Model parameters: 11.2M
  Model GFLOPs: 28.5

Training started...
Epoch 1/100: mAP@50=0.1523, mAP@50:95=0.0876, loss=2.3451
Epoch 10/100: mAP@50=0.5234, mAP@50:95=0.3124, loss=1.2345
Epoch 25/100: mAP@50=0.7123, mAP@50:95=0.4567, loss=0.8765
Epoch 50/100: mAP@50=0.7891, mAP@50:95=0.5234, loss=0.6543
Epoch 75/100: mAP@50=0.8345, mAP@50:95=0.5678, loss=0.5432
Epoch 100/100: mAP@50=0.8523, mAP@50:95=0.5891, loss=0.4987

Validation: mAP@50=0.8523, mAP@50:95=0.5891`,
      explanation: 'Training YOLOv8s on a custom dataset using Ultralytics. The model starts from COCO pre-trained weights and adapts to custom classes. After 100 epochs with early stopping, it achieves 85% mAP@50. The built-in augmentation (mosaic, mixup) significantly boosts performance without extra code.',
    },
    {
      level: 'intermediate',
      code: `# Core logic: Inference pipeline with post-processing and visualization
from ultralytics import YOLO
import cv2
import numpy as np
from typing import List, Dict, Tuple

class ObjectDetector:
    def __init__(self, model_path: str, conf_threshold: float = 0.25, iou_threshold: float = 0.45):
        self.model = YOLO(model_path)
        self.conf_threshold = conf_threshold
        self.iou_threshold = iou_threshold
        self.class_names = self.model.names

    def predict(self, image: np.ndarray) -> List[Dict]:
        """Run inference and return detections."""
        results = self.model(
            image,
            conf=self.conf_threshold,
            iou=self.iou_threshold,
            verbose=False,
        )[0]

        detections = []
        if results.boxes is not None:
            for box, cls, conf in zip(
                results.boxes.xyxy.cpu().numpy(),
                results.boxes.cls.cpu().numpy(),
                results.boxes.conf.cpu().numpy(),
            ):
                detections.append({
                    "bbox": box.tolist(),  # [x1, y1, x2, y2]
                    "class_id": int(cls),
                    "class_name": self.class_names[int(cls)],
                    "confidence": float(conf),
                })
        return detections

    def draw_detections(self, image: np.ndarray, detections: List[Dict]) -> np.ndarray:
        """Draw bounding boxes and labels on the image."""
        colors = np.random.randint(0, 255, size=(80, 3), dtype=np.uint8)
        output = image.copy()

        for det in detections:
            x1, y1, x2, y2 = map(int, det["bbox"])
            color = colors[det["class_id"] % 80].tolist()
            label = f"{det['class_name']}: {det['confidence']:.2f}"

            cv2.rectangle(output, (x1, y1), (x2, y2), color, 2)
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(output, (x1, y1 - th - 5), (x1 + tw, y1), color, -1)
            cv2.putText(output, label, (x1, y1 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        return output

# Usage
detector = ObjectDetector("runs/train/custom_yolov8s/weights/best.pt")
image = cv2.imread("test.jpg")
detections = detector.predict(image)
print(f"Found {len(detections)} objects:")
for d in detections:
    print(f"  {d['class_name']}: {d['confidence']:.2f} at {d['bbox']}")
output = detector.draw_detections(image, detections)`,
      output: `Found 4 objects:
  person: 0.95 at [120, 45, 380, 420]
  bicycle: 0.87 at [450, 320, 600, 450]
  car: 0.92 at [50, 180, 220, 350]
  dog: 0.78 at [300, 400, 420, 520]`,
      explanation: 'Inference pipeline class that encapsulates model loading, prediction, NMS post-processing, and detection visualization. The predict method returns structured detections (bounding boxes, class labels, confidence scores). The draw method adds professional bounding box visualizations.',
    },
    {
      level: 'advanced',
      code: `# Deployment: FastAPI + WebSocket for real-time streaming
from fastapi import FastAPI, WebSocket, File, UploadFile
from fastapi.responses import StreamingResponse
import cv2
import numpy as np
import asyncio
import json
from typing import List

app = FastAPI(title="YOLOv8 Detection API")
detector = ObjectDetector("models/best.pt")

@app.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    """Single image object detection."""
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    detections = detector.predict(image)
    return {"detections": detections, "count": len(detections)}

@app.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    """Real-time video stream via WebSocket."""
    await websocket.accept()
    try:
        while True:
            # Receive frame as bytes
            data = await websocket.receive_bytes()
            nparr = np.frombuffer(data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            # Run detection
            detections = detector.predict(frame)
            annotated = detector.draw_detections(frame, detections)

            # Encode and send back
            _, buffer = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 85])
            await websocket.send_bytes(buffer.tobytes())
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

# Dockerfile for deployment
DOCKERFILE = """
FROM ultralytics/ultralytics:latest
WORKDIR /app
COPY requirements.txt .
RUN pip install fastapi uvicorn python-multipart
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
"""

# docker build -t yolov8-api .
# docker run --gpus all -p 8000:8000 yolov8-api`,
      output: `# Client: Python WebSocket stream viewer
import cv2, asyncio, websockets
async def stream_video():
    async with websockets.connect("ws://localhost:8000/ws/stream") as ws:
        cap = cv2.VideoCapture(0)  # Webcam
        while cap.isOpened():
            ret, frame = cap.read()
            _, buffer = cv2.imencode(".jpg", frame)
            await ws.send(buffer.tobytes())
            result = await ws.recv()
            display = cv2.imdecode(np.frombuffer(result, np.uint8), cv2.IMREAD_COLOR)
            cv2.imshow("Detection", display)
            if cv2.waitKey(1) & 0xFF == ord("q"): break
        cap.release()
        cv2.destroyAllWindows()`,
      explanation: 'Production deployment with WebSocket streaming for real-time video. The FastAPI server accepts both REST (single image) and WebSocket (video stream) connections. The Dockerfile uses Ultralytics GPU image for hardware acceleration. The WebSocket approach enables sub-100ms end-to-end latency.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Manufacturing', description: 'Quality inspection systems use YOLO to detect defects, missing components, or assembly errors on production lines in real-time, achieving 99%+ defect detection at 60+ FPS.' },
      { industry: 'Autonomous Vehicles', description: 'Self-driving cars use object detection for pedestrians, vehicles, traffic signs, and obstacles. YOLO\'s speed makes it suitable for real-time decision making at highway speeds.' },
      { industry: 'Retail', description: 'Smart checkout systems use object detection to identify products placed in shopping carts, enabling Amazon Go-style walk-out shopping experiences.' },
    ],
    caseStudy: {
      problem: 'A warehouse logistics company manually inspected package sorting quality by sampling 1% of sorted packages. This missed 12% of mis-sorted packages, causing delivery delays and customer complaints.',
      solution: 'They installed overhead cameras at sorting stations running YOLOv8x on an NVIDIA Jetson Orin (edge device). The model detected package labels, compared them against the expected destination, and triggered alerts on mismatches within 200ms.',
      results: 'Sorting accuracy improved from 88% to 99.5%. Real-time detection replaced manual sampling at 1/10th the cost. The edge deployment eliminated cloud latency and data transfer costs. $2.5M annual savings in mis-sort penalties.',
    },
    bestPractices: [
      'Use transfer learning from COCO pre-trained weights — training from scratch requires massive datasets',
      'Apply mosaic augmentation during training for better small object detection',
      'Use ONNX or TensorRT export for 2-3x inference speedup in production',
      'Tune the confidence and IoU thresholds based on precision-recall curves on your validation set',
    ],
    tools: ['Ultralytics YOLOv8', 'OpenCV', 'ONNX / TensorRT', 'FastAPI', 'WebSocket', 'Docker', 'NVIDIA Jetson / T4 / A100'],
    jobRoles: ['Computer Vision Engineer', 'ML Engineer', 'Robotics Engineer', 'Edge AI Engineer'],
    furtherReading: [
      'Ultralytics YOLOv8 Documentation',
      'YOLOv8: Real-Time Object Detection (Jocher et al., 2023)',
      'COCO Dataset Format',
      'NVIDIA TensorRT Deployment',
    ],
  },
  quiz: [
    {
      id: 'p21-od-1', type: 'mcq',
      question: 'Why is YOLO called a "single-shot" detector?',
      options: [
        'It processes every pixel in the image exactly once',
        'It performs detection and classification in a single forward pass through the neural network',
        'It only detects one object per image',
        'It requires only one training epoch to converge',
      ],
      correctAnswer: 'It performs detection and classification in a single forward pass through the neural network',
      explanation: 'Unlike two-stage detectors (Faster R-CNN) that first propose regions then classify them, YOLO simultaneously predicts bounding boxes and class probabilities in one network evaluation, making it very fast.',
    },
    {
      id: 'p21-od-2', type: 'code',
      question: 'What does NMS (Non-Maximum Suppression) do?',
      code: `# NMS removes duplicate detections
# Input: multiple overlapping boxes for the same object
# Output: only the highest-confidence box per object`,
      options: [
        'Keeps all detections regardless of overlap',
        'Removes detections with low confidence, keeping only the highest-confidence box per overlapping group',
        'Merges all overlapping boxes into a single averaged box',
        'Increases the confidence score of overlapping detections',
      ],
      correctAnswer: 'Removes detections with low confidence, keeping only the highest-confidence box per overlapping group',
      explanation: 'NMS groups overlapping detections (based on IoU threshold) and keeps only the detection with the highest confidence score in each group. This eliminates the multiple redundant boxes that the model predicts around each object.',
    },
    {
      id: 'p21-od-3', type: 'truefalse',
      question: 'YOLOv8 requires anchor boxes for object detection.',
      correctAnswer: 'False',
      explanation: 'YOLOv8 is anchor-free — it predicts object centers directly rather than refining pre-defined anchor boxes. This simplifies the architecture and improves generalization to objects with unusual aspect ratios.',
    },
    {
      id: 'p21-od-4', type: 'fillblank',
      question: 'The metric mAP@50 measures average precision at an IoU threshold of ___.',
      correctAnswer: '0.50 (or 50%)',
      explanation: 'mAP@50 considers a detection correct if the IoU between the predicted and ground truth bounding box is at least 0.50. mAP@50:95 averages across thresholds from 0.50 to 0.95 in 0.05 increments (stricter evaluation).',
    },
    {
      id: 'p21-od-5', type: 'match',
      question: 'Match each YOLOv8 component with its function:',
      pairs: [
        { left: 'Backbone (CSPDarknet)', right: 'Extracts hierarchical image features' },
        { left: 'Neck (PAN-FPN)', right: 'Fuses multi-scale features for detecting different-sized objects' },
        { left: 'Decoupled Head', right: 'Separate branches for classification and bounding box regression' },
        { left: 'NMS', right: 'Removes duplicate detections per object' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'The backbone extracts features, the neck (PAN-FPN) creates multi-scale feature pyramids for detecting objects of different sizes, the decoupled head predicts classes and boxes separately, and NMS eliminates redundant predictions.',
    },
  ],
}))

export {}
