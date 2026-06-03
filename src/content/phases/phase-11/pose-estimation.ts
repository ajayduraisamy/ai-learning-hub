import { registerContent } from '@/content/index'

registerContent('p11-pose-estimation', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p8-cnn', 'p11-object-detection'],
  tags: ['Phase 11', 'Advanced', 'Computer Vision', 'Pose Estimation', 'OpenPose'],
  objectives: [
    'Understand 2D and 3D pose estimation and keypoint detection',
    'Learn about heatmap regression for keypoint localization',
    'Distinguish top-down vs bottom-up pose estimation approaches',
    'Understand Part Affinity Fields (PAFs) in OpenPose',
    'Implement keypoint visualization and the OKS evaluation metric',
  ],
  theory: `# Pose Estimation

## What is Pose Estimation?

Pose estimation is the task of detecting the spatial positions of body **keypoints** (joints or landmarks) from an image or video. It answers: "Where are the person's shoulders, elbows, wrists, hips, knees, and ankles?"

### 2D vs 3D Pose Estimation

- **2D Pose**: Predicts (x, y) pixel coordinates for each keypoint
- **3D Pose**: Predicts (x, y, z) coordinates, typically in camera-centric or world coordinates

## Keypoint Detection via Heatmap Regression

Most modern pose estimators use **heatmap regression**:

For each keypoint \\(k\\), the model predicts a 2D heatmap \\(H_k \\in \\mathbb{R}^{H \\times W}\\) where each pixel value represents the probability that keypoint \\(k\\) is located at that position. The final keypoint location is the pixel with maximum heatmap value:

$$\\hat{p}_k = \\underset{x, y}{\\arg\\max} \\; H_k(x, y)$$

Heatmaps are trained with MSE loss against Gaussian "blobs" centered at ground-truth keypoint locations.

## Top-Down vs Bottom-Up Approaches

### Top-Down
1. Run an object detector to find person bounding boxes
2. For each detected person, run a single-person pose estimator
3. Accuracy scales with detector quality
4. Speed is proportional to the number of people in the image

### Bottom-Up
1. Detect all body parts (keypoints) in the image simultaneously
2. Associate parts to individual people using grouping algorithms
3. Runtime is independent of the number of people
4. More challenging but potentially faster for crowded scenes

## OpenPose and Part Affinity Fields (PAFs)

OpenPose is a popular bottom-up approach. Its key innovation is **Part Affinity Fields** (PAFs):

- PAFs are 2D vector fields that encode the direction and orientation of limbs
- For each limb type (e.g., forearm from elbow to wrist), the PAF stores a unit vector pointing from one joint to the other
- During inference, the model predicts both keypoint heatmaps and PAFs
- A bipartite matching algorithm uses PAF scores to associate keypoints into skeletons

## HRNet

HRNet (High-Resolution Network) maintains high-resolution feature maps throughout the network by connecting multi-resolution subnetworks in parallel. Unlike hourglass or encoder-decoder architectures, HRNet never fully downsamples, preserving spatial detail for precise keypoint localization.

## COCO Keypoint Format

The COCO dataset defines 17 keypoints:
\\[\\text{ nose, l_eye, r_eye, l_ear, r_ear, l_shoulder, r_shoulder, l_elbow, r_elbow, }\\]
\\[\\text{ l_wrist, r_wrist, l_hip, r_hip, l_knee, r_knee, l_ankle, r_ankle }\\]

Each keypoint is annotated as \\((x, y, visibility)\\) where visibility is:
- 0: not labeled
- 1: labeled but occluded
- 2: labeled and visible

## OKS — Object Keypoint Similarity

OKS is the evaluation metric for pose estimation, analogous to IoU:

$$\\text{OKS} = \\frac{\\sum_i \\exp\\left( -\\frac{d_i^2}{2 s^2 k_i^2} \\right) \\cdot \\mathbb{1}(v_i > 0)}{\\sum_i \\mathbb{1}(v_i > 0)}$$

Where \\(d_i\\) is Euclidean distance between predicted and ground-truth keypoint \\(i\\), \\(s\\) is the object scale, and \\(k_i\\) is a per-keypoint constant controlling tolerance.`,
  understanding: {
    analogy: 'Pose estimation is like connecting the dots on a person\'s body. First you find all the joints (dots), then you figure out which dots belong to which person and connect them in the right order. The result is a "stick figure" that captures the person\'s posture and movement.',
    steps: [
      { title: 'Keypoint Detection', content: 'The model predicts heatmaps for each keypoint type (shoulder, elbow, wrist, etc.). Each heatmap peaks at the most likely location of that keypoint.' },
      { title: 'Part Association', content: 'In bottom-up approaches, PAFs or similar mechanisms determine which keypoints belong together. The vector field between two connected keypoints should align with the limb direction.' },
      { title: 'Skeleton Assembly', content: 'Based on keypoint locations and association scores, the algorithm constructs full skeletons by connecting compatible keypoints into the predefined kinematic tree.' },
      { title: 'Multi-Person Parsing', content: 'For multiple people, the algorithm must disambiguate overlapping poses. Bottom-up methods handle this naturally by associating parts; top-down methods rely on detection masks.' },
      { title: 'Refinement', content: 'Post-processing steps like temporal smoothing (for video), keypoint confidence filtering, and pose tracking across frames improve the final output.' },
    ],
    misconceptions: [
      { misconception: 'Top-down pose estimation is always better than bottom-up', truth: 'Top-down methods have an advantage in accuracy but scale poorly with the number of people. Bottom-up methods handle crowded scenes better and have constant runtime regardless of person count.' },
      { misconception: 'Pose estimation works perfectly on any image', truth: 'Occlusions, unusual poses, low resolution, and heavy clothing can all cause failures. Synthetic data and domain-specific augmentation help improve robustness.' },
    ],
    comparisons: [
      { label: 'Approach', methodA: 'Top-Down: detect + estimate', methodB: 'Bottom-Up: detect all parts + group' },
      { label: 'Speed Scaling', methodA: 'Linear with number of people', methodB: 'Constant (independent of people)' },
      { label: 'Crowded Scenes', methodA: 'Struggles with occlusion', methodB: 'Better handling of overlaps' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import numpy as np

def compute_oks(pred_kpts, gt_kpts, visibility, scale, sigmas):
    """Compute Object Keypoint Similarity (OKS).

    Args:
        pred_kpts: (K, 2) predicted (x, y) keypoints
        gt_kpts: (K, 2) ground truth (x, y) keypoints
        visibility: (K,) visibility flags (0=unlabeled, 1=occluded, 2=visible)
        scale: object scale (sqrt of bounding box area)
        sigmas: (K,) per-keypoint sigma constants
    Returns:
        OKS score (float between 0 and 1)
    """
    k = len(pred_kpts)
    distances = np.sqrt(np.sum((pred_kpts - gt_kpts) ** 2, axis=1))
    exponents = np.exp(-(distances ** 2) / (2 * scale ** 2 * sigmas ** 2))
    visible = visibility > 0

    if visible.sum() == 0:
        return 1.0  # no visible keypoints

    return float((exponents * visible).sum() / visible.sum())

# COCO keypoint sigmas (normalized)
coco_sigmas = np.array([
    0.026, 0.025, 0.025, 0.035, 0.035,  # nose, l_eye, r_eye, l_ear, r_ear
    0.079, 0.079, 0.072, 0.072,         # shoulders, elbows
    0.062, 0.062, 0.107, 0.107,         # wrists, hips
    0.087, 0.087, 0.089, 0.089,         # knees, ankles
]) * 10

# Example: one person
pred = np.random.randn(17, 2) * 5 + 100
gt = np.random.randn(17, 2) * 3 + 100
vis = np.ones(17) * 2
oks = compute_oks(pred, gt, vis, scale=150, sigmas=coco_sigmas)
print(f"OKS: {oks:.3f}")`,
      output: `OKS: 0.923`,
      explanation: 'OKS measures keypoint similarity accounting for object scale. Each keypoint has a per-part sigma that determines how strictly it is evaluated (tight for eyes, looser for hips). OKS is the standard evaluation metric for pose estimation.',
    },
    {
      level: 'intermediate',
      code: `# MMPose inference for 2D pose estimation
# pip install mmpose mmdet

from mmpose.apis import MMPoseInferencer
import cv2

# Initialize the inferencer
inferencer = MMPoseInferencer(
    pose2d='humanwhole',  # whole-body pose model
    device='cpu',         # or 'cuda:0'
)

# Run inference on an image
results = inferencer('group_photo.jpg')

for result in results:
    # Predicted keypoints
    keypoints = result['predictions'][0][0]['keypoints']
    scores = result['predictions'][0][0]['keypoint_scores']

    print(f"Detected {len(keypoints)} keypoints")
    print(f"Mean confidence: {scores.mean():.2f}")

    # Draw on image
    img = cv2.imread('group_photo.jpg')
    for kp, score in zip(keypoints, scores):
        if score > 0.5:
            x, y = int(kp[0]), int(kp[1])
            cv2.circle(img, (x, y), 4, (0, 255, 0), -1)

    cv2.imwrite('pose_result.jpg', img)
    print("Saved pose_result.jpg")

# COCO keypoint skeleton connections
skeleton = [
    (0, 1), (0, 2), (1, 3), (2, 4),       # face
    (5, 6), (5, 7), (7, 9), (6, 8), (8, 10), # arms
    (5, 11), (6, 12), (11, 12),            # torso
    (11, 13), (13, 15), (12, 14), (14, 16), # legs
]`,
      output: `Detected 17 keypoints
Mean confidence: 0.87
Saved pose_result.jpg`,
      explanation: 'MMPose provides a unified inference API for multiple pose estimation models. The whole-body model detects 17 COCO keypoints plus face/hand keypoints. Keypoints below a confidence threshold can be filtered out.',
    },
    {
      level: 'advanced',
      code: `import cv2
import numpy as np
import torch

# Simplified top-down pose estimation pipeline
# Uses a person detector + single-person pose estimator

def get_person_detections(image, detector):
    """Run object detector to get person bounding boxes."""
    results = detector(image)
    boxes = []
    for det in results[0].boxes:
        if int(det.cls) == 0:  # COCO class 0 = person
            x1, y1, x2, y2 = map(int, det.xyxy[0].tolist())
            score = det.conf.item()
            if score > 0.5:
                boxes.append([x1, y1, x2, y2, score])
    return boxes

def estimate_single_pose(image, bbox, pose_model):
    """Estimate keypoints for one person within a bounding box."""
    x1, y1, x2, y2, _ = bbox
    # Expand box by 20% for context
    h, w = image.shape[:2]
    margin_x = int((x2 - x1) * 0.2)
    margin_y = int((y2 - y1) * 0.2)
    x1 = max(0, x1 - margin_x)
    y1 = max(0, y1 - margin_y)
    x2 = min(w, x2 + margin_x)
    y2 = min(h, y2 + margin_y)

    # Crop and resize
    crop = image[y1:y2, x1:x2]
    crop_resized = cv2.resize(crop, (256, 256))
    crop_tensor = torch.from_numpy(
        crop_resized.transpose(2, 0, 1)
    ).float().unsqueeze(0) / 255.0

    # Forward pass
    heatmaps = pose_model(crop_tensor)[0].detach().numpy()

    # Extract keypoints from heatmap peaks
    keypoints = []
    for hm in heatmaps:
        hm_resized = cv2.resize(hm, (crop.shape[1], crop.shape[0]))
        y, x = np.unravel_index(hm_resized.argmax(), hm_resized.shape)
        confidence = hm_resized[y, x]
        keypoints.append([x + x1, y + y1, confidence])

    return np.array(keypoints)

def draw_skeleton(image, keypoints, skeleton, threshold=0.3):
    """Draw pose skeleton on image."""
    for i, (a, b) in enumerate(skeleton):
        if (keypoints[a][2] > threshold and
            keypoints[b][2] > threshold):
            pt1 = (int(keypoints[a][0]), int(keypoints[a][1]))
            pt2 = (int(keypoints[b][0]), int(keypoints[b][1]))
            cv2.line(image, pt1, pt2, (0, 255, 0), 2)

    for kp in keypoints:
        if kp[2] > threshold:
            cv2.circle(image, (int(kp[0]), int(kp[1])), 3, (0, 0, 255), -1)

    return image

# Simplified skeleton for upper body
skeleton = [(0, 1), (1, 2), (1, 3), (2, 4), (4, 6), (3, 5)]

print("Top-down pose estimation pipeline ready")
print("Steps: detect persons -> crop -> heatmap regression -> keypoints")`,
      output: `Top-down pose estimation pipeline ready
Steps: detect persons -> crop -> heatmap regression -> keypoints`,
      explanation: 'A top-down pipeline first detects all people in the image, then runs a pose estimator on each cropped person. The heatmap contains per-pixel confidence for each keypoint. Expanding the bounding box by 20% ensures the full body is captured.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Sports Analytics', description: 'Athlete pose tracking for performance analysis, injury prevention, and referee assistance. Systems analyze joint angles and movement patterns in real-time.' },
      { industry: 'Healthcare & Rehabilitation', description: 'Patient movement tracking during physical therapy. Pose estimation provides quantitative feedback on exercise form, range of motion, and progress over time.' },
    ],
    caseStudy: {
      problem: 'A physical therapy clinic relied on therapist observation to assess patient exercises. Assessment was subjective, inconsistent between therapists, and could not track fine-grained progress.',
      solution: 'A pose estimation system (HRNet-based) was deployed on tablet cameras to track 25 body keypoints during exercises. Joint angles, symmetry scores, and range of motion were computed automatically and compared to prescribed targets.',
      results: 'Objective measurements replaced subjective assessment. Patient compliance improved 40% with real-time feedback. Therapists could review 3× more patients per day using automated reports.',
    },
    bestPractices: [
      'Use temporal smoothing (e.g., Kalman filters or moving averages) for video pose estimation to reduce jitter',
      'Apply keypoint confidence thresholds (typically 0.3-0.5) to filter unreliable detections',
      'Use person tracking (not just detection) across video frames for consistent person IDs',
      'Augment training data with occlusions, varied lighting, and unusual poses',
      'For 3D pose, use multi-view camera setups or temporal cues from monocular video',
    ],
    tools: ['MMPose (OpenMMLab)', 'OpenPose', 'HRNet', 'Detectron2', 'MediaPipe Pose'],
    jobRoles: ['Computer Vision Engineer', 'Sports Technologist', 'Biomechanics Researcher', 'AR/VR Engineer'],
    furtherReading: [
      'Cao et al.: OpenPose — Realtime Multi-Person 2D Pose Estimation using Part Affinity Fields',
      'Sun et al.: Deep High-Resolution Representation Learning for Human Pose Estimation (HRNet)',
      'MMPose documentation and model zoo',
      'MediaPipe Pose: on-device real-time pose tracking',
    ],
  },
  quiz: [
    {
      id: 'p11-pose-1', type: 'truefalse',
      question: 'In bottom-up pose estimation, the runtime depends linearly on the number of people in the image.',
      correctAnswer: 'False',
      explanation: 'Bottom-up approaches detect all keypoints simultaneously and group them afterward. Runtime is independent of the number of people, making them efficient for crowded scenes.',
    },
    {
      id: 'p11-pose-2', type: 'mcq',
      question: 'What is the role of Part Affinity Fields (PAFs) in OpenPose?',
      options: [
        'They define the affinity between different image regions for better feature extraction',
        'They encode the direction and orientation of limbs to associate keypoints into skeletons',
        'They compute the probability that a pixel belongs to a person vs background',
        'They generate 3D depth information from 2D keypoint heatmaps',
      ],
      correctAnswer: 'They encode the direction and orientation of limbs to associate keypoints into skeletons',
      explanation: 'PAFs are 2D vector fields that point from one joint to the connected joint along the limb. A bipartite matching algorithm uses PAF consistency scores to determine which keypoints belong to the same person.',
    },
    {
      id: 'p11-pose-3', type: 'fillblank',
      question: 'The evaluation metric for pose estimation that accounts for keypoint distance scaled by object size and keypoint-specific tolerance is called ___.',
      correctAnswer: 'OKS (Object Keypoint Similarity)',
      explanation: 'OKS is the standard metric for pose estimation, analogous to IoU for object detection. It computes per-keypoint Gaussian similarity weighted by visibility and averaged over visible keypoints.',
    },
    {
      id: 'p11-pose-4', type: 'code',
      question: 'What does the following keypoint extraction code return?',
      code: `heatmap = np.random.rand(64, 48)
y, x = np.unravel_index(heatmap.argmax(), heatmap.shape)
print(f"({x}, {y})")`,
      options: [
        'A random keypoint location',
        'The coordinates of the maximum value in the heatmap',
        'The center of the heatmap',
        'The average of all keypoint locations',
      ],
      correctAnswer: 'The coordinates of the maximum value in the heatmap',
      explanation: 'np.unravel_index finds the 2D coordinates of the maximum value in the heatmap. This is the standard method for extracting keypoint locations from heatmap predictions.',
    },
    {
      id: 'p11-pose-5', type: 'match',
      question: 'Match each approach with its characteristic:',
      pairs: [
        { left: 'Top-Down', right: 'Detect person boxes first, then estimate pose per person' },
        { left: 'Bottom-Up', right: 'Detect all keypoints, then associate into skeletons' },
        { left: 'Heatmap', right: 'Probability map where peak indicates keypoint location' },
        { left: 'PAF', right: 'Vector field encoding limb direction for keypoint association' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Top-down and bottom-up are two strategies for multi-person pose estimation. Heatmaps localize keypoints, and PAFs (Part Affinity Fields) associate them into coherent skeletons.',
    },
  ],
}))

export {}
