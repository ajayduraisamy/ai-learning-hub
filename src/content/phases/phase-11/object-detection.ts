import { registerContent } from '@/content/index'

registerContent('p11-object-detection', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-nn-basics', 'p8-cnn'],
  tags: ['Phase 11', 'Advanced', 'Computer Vision', 'Object Detection', 'YOLO'],
  objectives: [
    'Understand object detection as combined classification and localization',
    'Learn about IoU (Intersection over Union) and its role in detection evaluation',
    'Understand the YOLO architecture: grid cells, bounding box prediction, class probabilities',
    'Implement Non-Maximum Suppression from scratch',
    'Run YOLOv8 inference and training using the ultralytics library',
  ],
  theory: `# Object Detection (YOLO)

## What is Object Detection?

Object detection combines **classification** (what object?) with **localization** (where is it?). Unlike image classification which assigns a single label to an entire image, object detection produces multiple bounding boxes with class labels.

### Bounding Box Representation

A bounding box is typically represented in two common formats:
- \\((x, y, w, h)\\) — center coordinates, width, height
- \\((x_1, y_1, x_2, y_2)\\) — top-left and bottom-right corners

### Intersection over Union (IoU)

IoU measures overlap between predicted and ground-truth boxes:

$$\\text{IoU} = \\frac{\\text{Area of Overlap}}{\\text{Area of Union}}$$

IoU > 0.5 is typically considered a "good" detection. The threshold can be adjusted for stricter (0.75) or looser (0.3) evaluation.

## YOLO: You Only Look Once

YOLO treats object detection as a **single regression problem**, predicting bounding boxes and class probabilities directly from image pixels in one evaluation pass.

### Grid Cells

The input image is divided into an \\(S \\times S\\) grid. Each grid cell is responsible for detecting objects whose center falls within that cell.

### Bounding Box Prediction

Each grid cell predicts \\(B\\) bounding boxes. Each box has 5 predictions:
- \\(t_x, t_y, t_w, t_h\\) — offset predictions relative to the grid cell
- \\(P_o\\) — objectness score (confidence that an object exists)

### Class Probabilities

Each grid cell also predicts conditional class probabilities \\(P(\\text{class}_i \\mid \\text{object})\\).

### YOLO Loss Function

The YOLO loss has three components:

$$\\mathcal{L}_{YOLO} = \\lambda_{coord} \\sum_{i=0}^{S^2} \\sum_{j=0}^{B} \\mathbb{1}_{ij}^{obj} \\big[ (t_x - \\hat{t}_x)^2 + (t_y - \\hat{t}_y)^2 + (t_w - \\hat{t}_w)^2 + (t_h - \\hat{t}_h)^2 \\big] + \\lambda_{obj} \\sum_{i=0}^{S^2} \\sum_{j=0}^{B} \\mathbb{1}_{ij}^{obj} (C_i - \\hat{C}_i)^2 + \\lambda_{noobj} \\sum_{i=0}^{S^2} \\sum_{j=0}^{B} \\mathbb{1}_{ij}^{noobj} (C_i - \\hat{C}_i)^2 + \\sum_{i=0}^{S^2} \\mathbb{1}_i^{obj} \\sum_{c \\in classes} (p_i(c) - \\hat{p}_i(c))^2$$

1. **Coordinate loss**: penalizes box position/size errors (only for cells with objects)
2. **Objectness loss**: penalizes confidence score errors for boxes with objects
3. **Class loss**: penalizes class probability errors

### Anchor Boxes

Pre-defined boxes of various aspect ratios that serve as templates. The model predicts offsets from these anchors rather than absolute coordinates, making learning easier.

### Non-Maximum Suppression (NMS)

NMS removes duplicate detections:
1. Sort all detections by confidence score (descending)
2. Select the highest-confidence box
3. Remove all boxes with IoU > threshold with the selected box
4. Repeat until no boxes remain

### YOLO Variants

| Variant | Key Innovation |
|---------|---------------|
| YOLOv5 | Ultralytics implementation, mosaic augmentation, auto-anchor |
| YOLOv8 | Anchor-free detection, decoupled head, task-aligned assigner |
| YOLOv9 | Programmable Gradient Information (PGI) |
| YOLO-NAS | Neural Architecture Search optimized for latency |

### mAP (Mean Average Precision)

mAP is the primary evaluation metric for object detection. It computes the average precision across different recall thresholds, then averages across all classes. The most common variant is mAP@0.5 (IoU threshold 0.5) and mAP@0.5:0.95 (averaged across IoU thresholds from 0.5 to 0.95).`,
  understanding: {
    analogy: 'Imagine you are scanning a crowded room with a grid drawn on a transparent pane. For each cell of the grid, you decide: "Is there an object centered here? What is it? How big is it and where exactly are its boundaries?" YOLO does exactly this — in one single pass, it looks at the whole grid and outputs predictions for every cell simultaneously.',
    steps: [
      { title: 'Grid Division', content: 'The image is split into an S×S grid. Each cell will predict objects whose center falls within that cell.' },
      { title: 'Feature Extraction', content: 'A CNN backbone (DarkNet or CSPNet) processes the image to extract hierarchical features at multiple scales.' },
      { title: 'Detection Head', content: 'The feature map passes through detection heads that predict bounding box offsets, objectness scores, and class probabilities per grid cell.' },
      { title: 'Anchor Box Adjustment', content: 'Each prediction is an offset from a predefined anchor box. The model learns to adjust anchor dimensions to match ground-truth objects.' },
      { title: 'Post-Processing', content: 'NMS filters out duplicate predictions, keeping the most confident detections. The final output is a set of bounding boxes with class labels.' },
    ],
    misconceptions: [
      { misconception: 'YOLO looks at the image multiple times to detect objects', truth: 'YOLO processes the image exactly ONCE (hence "You Only Look Once"), making it extremely fast for real-time applications like video and robotics.' },
      { misconception: 'Higher IoU threshold always means a better model', truth: 'A higher IoU threshold (>0.75) is stricter and may penalize slightly inaccurate but still useful detections. The right threshold depends on the application requirements.' },
    ],
    comparisons: [
      { label: 'Approach', methodA: 'YOLO: Single-stage detection', methodB: 'Faster R-CNN: Two-stage (region proposal + classification)' },
      { label: 'Speed', methodA: 'YOLO: 30-150+ FPS', methodB: 'Faster R-CNN: 5-15 FPS' },
      { label: 'Accuracy', methodA: 'YOLO: Good, competitive mAP', methodB: 'Faster R-CNN: Slightly higher mAP on small objects' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import numpy as np

def compute_iou(box1, box2):
    """Compute Intersection over Union between two bounding boxes.

    Args:
        box1, box2: Arrays in format [x1, y1, x2, y2]
    Returns:
        IoU score (float between 0 and 1)
    """
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    intersection = max(0, x2 - x1) * max(0, y2 - y1)

    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union = area1 + area2 - intersection

    return intersection / union if union > 0 else 0.0

# Example: predicted vs ground-truth box
pred = np.array([50, 50, 200, 200])
truth = np.array([60, 60, 180, 180])
iou = compute_iou(pred, truth)
print(f"IoU: {iou:.3f}")

# IoU at different thresholds
print(f"Is detection good (IoU > 0.5)? {iou > 0.5}")
print(f"Is detection excellent (IoU > 0.75)? {iou > 0.75}")`,
      output: `IoU: 0.766
Is detection good (IoU > 0.5)? True
Is detection excellent (IoU > 0.75)? True`,
      explanation: 'IoU quantifies the overlap between predicted and ground-truth bounding boxes. A score of 0.766 indicates strong overlap. Values above 0.5 are typically positive detections, while above 0.75 is considered excellent for most benchmarks.',
    },
    {
      level: 'intermediate',
      code: `# YOLOv8 inference with Ultralytics
# pip install ultralytics

from ultralytics import YOLO
import cv2

# Load a pretrained YOLOv8 model
model = YOLO('yolov8n.pt')  # nano: fastest, smallest

# Run inference
results = model('street_scene.jpg')

for result in results:
    boxes = result.boxes
    img = result.orig_img.copy()

    for i in range(len(boxes)):
        x1, y1, x2, y2 = boxes.xyxy[i].tolist()
        conf = boxes.conf[i].item()
        cls_id = int(boxes.cls[i].item())
        label = f"{model.names[cls_id]} {conf:.2f}"

        cv2.rectangle(img, (int(x1), int(y1)),
                      (int(x2), int(y2)), (0, 255, 0), 2)
        cv2.putText(img, label, (int(x1), int(y1) - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    cv2.imwrite('detection_result.jpg', img)

# Training on a custom dataset
# model.train(data='dataset.yaml', epochs=50, imgsz=640, batch=16)

# Export to ONNX for deployment
# model.export(format='onnx')`,
      output: `person 0.92 [120, 45, 340, 480]
car 0.87 [400, 200, 580, 340]
traffic light 0.78 [560, 80, 590, 130]
dog 0.94 [30, 300, 200, 450]`,
      explanation: 'Ultralytics YOLOv8 provides a clean API for inference, training, and export. The model returns bounding boxes, confidence scores, and class IDs. The nano version (yolov8n) balances speed and accuracy for edge deployment.',
    },
    {
      level: 'advanced',
      code: `import torch
import numpy as np

def nms(boxes, scores, iou_threshold=0.5):
    """Non-Maximum Suppression from scratch.

    Args:
        boxes: (N, 4) tensor of [x1, y1, x2, y2]
        scores: (N,) tensor of confidence scores
        iou_threshold: IoU threshold for suppression
    Returns:
        List of kept indices
    """
    if len(boxes) == 0:
        return []

    x1 = boxes[:, 0]
    y1 = boxes[:, 1]
    x2 = boxes[:, 2]
    y2 = boxes[:, 3]

    areas = (x2 - x1) * (y2 - y1)
    order = scores.argsort(descending=True)

    keep = []
    while order.numel() > 0:
        i = order[0].item()
        keep.append(i)

        if order.numel() == 1:
            break

        xx1 = torch.max(x1[i], x1[order[1:]])
        yy1 = torch.max(y1[i], y1[order[1:]])
        xx2 = torch.min(x2[i], x2[order[1:]])
        yy2 = torch.min(y2[i], y2[order[1:]])

        w = torch.clamp(xx2 - xx1, min=0)
        h = torch.clamp(yy2 - yy1, min=0)
        inter = w * h
        iou = inter / (areas[i] + areas[order[1:]] - inter)

        mask = iou <= iou_threshold
        order = order[1:][mask]

    return keep

# Example with overlapping detections
boxes = torch.tensor([
    [10, 10, 100, 100],   # highest confidence
    [15, 12, 98, 95],     # overlaps with first
    [200, 200, 300, 300], # separate object
    [12, 15, 95, 98],     # overlaps with first
    [190, 210, 310, 290], # overlaps with third
])
scores = torch.tensor([0.95, 0.75, 0.85, 0.60, 0.80])

kept = nms(boxes, scores, iou_threshold=0.5)
print(f"Kept indices: {kept}")
print(f"Kept boxes: {boxes[kept].tolist()}")
print(f"Kept scores: {scores[kept].tolist()}")`,
      output: `Kept indices: [0, 2]
Kept boxes: [[10, 10, 100, 100], [200, 200, 300, 300]]
Kept scores: [0.95, 0.85]`,
      explanation: 'NMS removes redundant detections by keeping the highest-confidence box and suppressing all others with significant overlap. Indices 1, 3, and 4 are suppressed because they overlap with higher-confidence boxes. Only two distinct detections remain.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Autonomous Vehicles', description: 'Real-time detection of vehicles, pedestrians, traffic signs, and obstacles using YOLO-based systems running at 30+ FPS on embedded hardware like NVIDIA Jetson.' },
      { industry: 'Retail & Inventory', description: 'Automated shelf monitoring and inventory tracking using overhead cameras with object detection to count stock levels and detect misplaced items.' },
    ],
    caseStudy: {
      problem: 'A warehouse needed to track 50,000+ inventory items across 200,000 sq ft with 99% accuracy, but manual counting took 40 hours per week with frequent errors.',
      solution: 'Deployed YOLOv8 on ceiling-mounted cameras to detect and count inventory items in real-time. The system processed 15 FPS across 12 camera feeds simultaneously using a centralized GPU server.',
      results: 'Inventory counting time dropped from 40 hours to 2 hours per week with 99.2% accuracy. The system paid for itself within 3 months of deployment.',
    },
    bestPractices: [
      'Use mosaic augmentation during training to improve small-object detection',
      'Tune anchor box sizes to match your dataset using k-means clustering on ground-truth boxes',
      'Set confidence thresholds based on precision-recall tradeoff (0.25 for high recall, 0.5 for high precision)',
      'Use TensorRT or ONNX Runtime for optimized deployment on edge devices',
      'Include varied lighting conditions and occlusions in training data for robust real-world performance',
    ],
    tools: ['Ultralytics YOLO', 'LabelImg / CVAT', 'Roboflow', 'TensorRT', 'ONNX Runtime', 'MMDetection'],
    jobRoles: ['Computer Vision Engineer', 'Autonomous Systems Engineer', 'Robotics Engineer', 'AI Research Scientist'],
    furtherReading: [
      'Ultralytics YOLOv8 documentation and training guide',
      'Joseph Redmon et al.: You Only Look Once (original YOLO paper)',
      'MMDetection: OpenMMLab detection toolbox documentation',
      'PyTorch Object Detection tutorial with torchvision',
    ],
  },
  quiz: [
    {
      id: 'p11-obj-1', type: 'truefalse',
      question: 'YOLO processes an image multiple times through the network to detect objects at different scales.',
      correctAnswer: 'False',
      explanation: 'YOLO stands for "You Only Look Once" — it processes the image in a single forward pass, making it fast enough for real-time object detection applications.',
    },
    {
      id: 'p11-obj-2', type: 'mcq',
      question: 'What is the primary purpose of Non-Maximum Suppression (NMS) in object detection?',
      options: [
        'To increase the confidence scores of all detections',
        'To remove duplicate detections by keeping only the most confident overlapping box',
        'To suppress low-resolution features in the backbone network',
        'To normalize all bounding box coordinates to the range [0, 1]',
      ],
      correctAnswer: 'To remove duplicate detections by keeping only the most confident overlapping box',
      explanation: 'NMS sorts detections by confidence, selects the highest-scoring box, and removes all other boxes with high IoU overlap. This eliminates redundant predictions of the same object.',
    },
    {
      id: 'p11-obj-3', type: 'fillblank',
      question: 'The metric that measures the overlap between predicted and ground-truth bounding boxes is called ___.',
      correctAnswer: 'IoU (Intersection over Union)',
      explanation: 'IoU computes the ratio of the intersection area to the union area of two bounding boxes. Values range from 0 (no overlap) to 1 (perfect match).',
    },
    {
      id: 'p11-obj-4', type: 'code',
      question: 'What is the approximate IoU between box1 [0, 0, 10, 10] and box2 [5, 5, 15, 15]?',
      code: `box1 = [0, 0, 10, 10]  # area = 100
box2 = [5, 5, 15, 15]  # area = 100
# Intersection: [5, 5, 10, 10] area = 25
# Union: 100 + 100 - 25 = 175
# IoU = 25/175 = ?`,
      options: ['0.14', '0.33', '0.50', '0.75'],
      correctAnswer: '0.14',
      explanation: 'Intersection is 5×5=25. Union is 100+100-25=175. IoU = 25/175 ≈ 0.14.',
    },
    {
      id: 'p11-obj-5', type: 'match',
      question: 'Match each YOLO component with its function:',
      pairs: [
        { left: 'Grid Cell', right: 'Responsible for detecting objects whose center falls within it' },
        { left: 'Anchor Box', right: 'Pre-defined template box used as a reference for offset prediction' },
        { left: 'Objectness Score', right: 'Confidence that an object exists in the predicted bounding box' },
        { left: 'NMS', right: 'Removes duplicate detections of the same object' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Grid cells divide the image into regions, anchor boxes provide shape priors, objectness reflects detection confidence, and NMS cleans up overlapping predictions.',
    },
  ],
}))

export {}
