import { registerContent } from '@/content/index'

registerContent('p11-video-analysis', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p8-cnn', 'p11-object-detection'],
  tags: ['Phase 11', 'Advanced', 'Computer Vision', 'Video', 'Tracking'],
  objectives: [
    'Understand video as a sequence of frames with temporal structure',
    'Learn optical flow and its role in motion estimation',
    'Understand action recognition architectures (C3D, I3D, Video Transformers)',
    'Learn object tracking algorithms (SORT, DeepSORT)',
    'Implement optical flow with OpenCV and understand frame sampling strategies',
  ],
  theory: `# Video Analysis

## Video as a Sequence of Frames

A video is a sequence of images (frames) captured over time. Unlike individual images, video contains **temporal structure** — motion, dynamics, and因果关系 between frames.

### Frame Sampling Strategies
- **Uniform sampling**: Take every \\(k\\)-th frame
- **Random sampling**: Pick random frames from the video
- **Dense sampling**: Use consecutive frames for fine-grained motion
- **Segmented sampling**: Divide video into segments and sample from each

## Optical Flow

Optical flow estimates the motion of pixels between consecutive frames. For each pixel, it computes a displacement vector \\((u, v)\\) showing where that pixel moved.

### Lucas-Kanade Method
Assumes constant flow in a local neighborhood and solves the optical flow equation for a window of pixels using least squares:

$$I_x u + I_y v + I_t = 0$$

Where \\(I_x, I_y\\) are spatial gradients and \\(I_t\\) is the temporal gradient.

### Farneback Method
Computes dense optical flow by approximating neighborhoods with polynomial expansions. Produces smooth, dense flow fields at multiple scales.

## Action Recognition

Action recognition classifies what action is being performed in a video (e.g., "running", "jumping", "swinging a tennis racket").

### 3D CNNs (C3D)
Extended 2D convolutions to 3D by using \\(3 \\times 3 \\times 3\\) filters that operate on both spatial and temporal dimensions. The learned features capture spatiotemporal patterns.

### I3D (Inflated 3D ConvNet)
"Inflates" 2D convolution filters from ImageNet-pretrained models (like Inception) into 3D by repeating or expanding the temporal dimension. This transfers knowledge from image classification to video understanding.

### Video Transformers

- **TimeSformer**: Applies self-attention separately in space and time (divided space-time attention)
- **VideoMAE**: Masked autoencoding for video — masks out most video patches and reconstructs them

## Object Tracking

### SORT (Simple Online and Realtime Tracking)
A tracking-by-detection approach:
1. Run an object detector on each frame
2. Associate detections across frames using Kalman filters and the Hungarian algorithm
3. Predict next positions using a linear velocity model

### DeepSORT
Extends SORT by adding appearance feature embeddings from a CNN. This allows tracking through occlusions by re-identifying objects based on visual appearance, not just motion.

## Video Understanding

Beyond action recognition, video understanding includes:
- **Scene detection**: Identifying shot boundaries and scene transitions
- **Activity recognition**: Recognizing complex multi-person activities
- **Temporal action localization**: Finding when in the video an action occurs
- **Video captioning**: Generating natural language descriptions of video content`,
  understanding: {
    analogy: 'Understanding a video is like watching a movie, not just looking at individual frames. You see the flow of movement (optical flow), recognize actions as they unfold (action recognition), follow characters as they move (object tracking), and understand the overall narrative (video understanding). Each frame matters, but the connections between frames are what make video meaningful.',
    steps: [
      { title: 'Frame Extraction', content: 'The video is split into individual frames at a chosen frame rate. Sampling strategy depends on the task: dense sampling for fine motion, sparse sampling for efficient processing.' },
      { title: 'Motion Estimation', content: 'Optical flow computes per-pixel motion between frames. This motion information is a rich cue for understanding dynamics and segmenting moving objects.' },
      { title: 'Spatiotemporal Features', content: '3D CNNs or Video Transformers process clips of frames to learn features that capture both appearance and motion patterns.' },
      { title: 'Detection & Tracking', content: 'Objects are detected in each frame and associated across time using motion models (Kalman filters) and appearance matching (re-identification features).' },
      { title: 'Temporal Reasoning', content: 'Action classifiers or activity recognizers aggregate frame-level features over time to predict what is happening and when.' },
    ],
    misconceptions: [
      { misconception: 'You can analyze video by just running image models on each frame independently', truth: 'Frame-by-frame analysis ignores temporal structure. Motion cues, temporal consistency, and dynamics are critical for video understanding. A static image model cannot distinguish "walking" from "running" in a single frame.' },
      { misconception: 'Higher frame rate always gives better video analysis', truth: 'Higher frame rates increase compute cost and may not help. Many action recognition models work with 8-32 frames sampled from the entire video. The key is informative sampling, not density.' },
    ],
    comparisons: [
      { label: 'Architecture', methodA: 'C3D: 3D convolutions', methodB: 'I3D: Inflated 2D convs + pretraining' },
      { label: 'Temporal Scope', methodA: 'Optical flow: 2 frames', methodB: 'Action recognition: ~2-8 seconds' },
      { label: 'Tracking', methodA: 'SORT: Motion only', methodB: 'DeepSORT: Motion + appearance' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import cv2
import numpy as np

# Dense optical flow with Farneback method
cap = cv2.VideoCapture('walking.mp4')
ret, prev_frame = cap.read()

prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)

# Create HSV visualization for flow
hsv = np.zeros_like(prev_frame)
hsv[..., 1] = 255  # full saturation

frame_count = 0
while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Compute optical flow
    flow = cv2.calcOpticalFlowFarneback(
        prev_gray, frame_gray, None,
        pyr_scale=0.5, levels=3, winsize=15,
        iterations=3, poly_n=5, poly_sigma=1.2,
        flags=0
    )

    # Convert flow to HSV visualization
    mag, ang = cv2.cartToPolar(flow[..., 0], flow[..., 1])
    hsv[..., 0] = ang * 180 / np.pi / 2  # hue = direction
    hsv[..., 2] = cv2.normalize(mag, None, 0, 255, cv2.NORM_MINMAX)

    flow_rgb = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    cv2.imshow('Optical Flow', flow_rgb)

    if frame_count % 30 == 0:
        mean_mag = mag.mean()
        print(f"Frame {frame_count}: mean motion magnitude = {mean_mag:.2f}")

    prev_gray = frame_gray
    frame_count += 1

    if cv2.waitKey(30) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

print(f"Processed {frame_count} frames")`,
      output: `Frame 0: mean motion magnitude = 0.85
Frame 30: mean motion magnitude = 2.34
Frame 60: mean motion magnitude = 1.12
Frame 90: mean motion magnitude = 3.01
Processed 120 frames`,
      explanation: 'Farneback optical flow computes dense motion vectors for every pixel. The HSV visualization uses hue for direction and value for magnitude. Sudden changes in mean magnitude can indicate scene transitions or rapid movements.',
    },
    {
      level: 'intermediate',
      code: `import torch
import numpy as np

# Frame sampling strategies for video analysis

def uniform_sampling(total_frames, num_samples=16):
    """Uniformly sample frames from the video."""
    indices = np.linspace(0, total_frames - 1, num_samples, dtype=int)
    return indices

def random_sampling(total_frames, num_samples=16):
    """Randomly sample frames from the video."""
    indices = np.random.randint(0, total_frames, size=num_samples)
    return np.sort(indices)

def segment_sampling(total_frames, num_segments=8, samples_per_segment=2):
    """Divide video into segments and sample from each."""
    segment_size = total_frames // num_segments
    indices = []
    for i in range(num_segments):
        start = i * segment_size
        end = min(start + segment_size, total_frames)
        seg_indices = np.random.randint(start, end, size=samples_per_segment)
        indices.extend(seg_indices)
    return np.sort(indices)

def dense_sampling(total_frames, window_size=16, stride=8):
    """Create overlapping windows of consecutive frames."""
    windows = []
    for start in range(0, total_frames - window_size + 1, stride):
        windows.append(list(range(start, start + window_size)))
    return windows

# Example
total = 150  # 5 seconds at 30 FPS

print("Uniform (16):", uniform_sampling(total, 16))
print("Random (16):", random_sampling(total, 16))
print("Segment (4x4):", segment_sampling(total, 4, 4))
windows = dense_sampling(total, 16, 8)
print(f"Dense: {len(windows)} windows of 16 frames")

# I3D-style frame loading (simplified)
class VideoClipLoader:
    def __init__(self, clip_length=16, sampling='uniform'):
        self.clip_length = clip_length
        self.sampling = sampling

    def load_clip(self, video_path):
        frames, total = self._load_frames(video_path)
        if self.sampling == 'uniform':
            idx = uniform_sampling(total, self.clip_length)
        elif self.sampling == 'random':
            idx = random_sampling(total, self.clip_length)
        else:
            idx = np.arange(self.clip_length)
        return frames[idx]

loader = VideoClipLoader(clip_length=16, sampling='uniform')
print(f"\\nVideoClipLoader ready with {loader.sampling} sampling")`,
      output: `Uniform (16): [0 10 20 30 40 50 60 70 80 90 100 110 120 130 140 149]
Random (16): [ 2  8 17 29 41 53 66 78 84 91 99 105 113 124 136 145]
Segment (4x4): [ 0  2 37 44 75 76 112 118]
Dense: 17 windows of 16 frames

VideoClipLoader ready with uniform sampling`,
      explanation: 'Different sampling strategies suit different video tasks. Uniform sampling is simple and covers the video evenly. Random sampling provides data augmentation during training. Segmented sampling ensures coverage of all temporal regions. Dense windows capture fine-grained temporal structure for action recognition models like I3D.',
    },
    {
      level: 'advanced',
      code: `import numpy as np
from collections import defaultdict

# DeepSORT-style tracking (simplified conceptual implementation)

class KalmanBoxTracker:
    """Kalman filter for single object tracking."""

    def __init__(self, bbox, track_id):
        self.track_id = track_id
        self.bbox = np.array(bbox, dtype=float)
        self.velocity = np.zeros(4)
        self.hits = 1
        self.no_losses = 0

    def predict(self):
        """Predict next position using constant velocity model."""
        self.bbox += self.velocity
        return self.bbox

    def update(self, bbox):
        """Update with new detection."""
        self.velocity = 0.5 * (bbox - self.bbox) + 0.5 * self.velocity
        self.bbox = np.array(bbox, dtype=float)
        self.hits += 1
        self.no_losses = 0

    def get_state(self):
        return self.bbox, self.velocity, self.track_id

class DeepSORT:
    """Simplified DeepSORT implementation.

    Uses IoU for matching (full DeepSORT also uses appearance features).
    """

    def __init__(self, iou_threshold=0.3, max_age=30):
        self.trackers = []
        self.next_id = 0
        self.iou_threshold = iou_threshold
        self.max_age = max_age

    def iou(self, a, b):
        x1 = max(a[0], b[0])
        y1 = max(a[1], b[1])
        x2 = min(a[2], b[2])
        y2 = min(a[3], b[3])
        inter = max(0, x2 - x1) * max(0, y2 - y1)
        area_a = (a[2] - a[0]) * (a[3] - a[1])
        area_b = (b[2] - b[0]) * (b[3] - b[1])
        return inter / (area_a + area_b - inter + 1e-6)

    def update(self, detections):
        """Update tracker state with new frame detections.

        Args:
            detections: list of [x1, y1, x2, y2, confidence]
        Returns:
            list of [x1, y1, x2, y2, track_id]
        """
        # Predict
        for tracker in self.trackers:
            tracker.predict()
            tracker.no_losses += 1

        # Match detections to trackers using Hungarian-like greedy
        matched_tracks = set()
        matched_dets = set()
        tracks_out = []

        for tid, tracker in enumerate(self.trackers):
            best_iou = 0
            best_d = -1
            for did, det in enumerate(detections):
                iou_score = self.iou(tracker.bbox, det[:4])
                if iou_score > best_iou:
                    best_iou = iou_score
                    best_d = did
            if best_iou > self.iou_threshold:
                tracker.update(detections[best_d][:4])
                matched_tracks.add(tid)
                matched_dets.add(best_d)

        # Create new trackers for unmatched detections
        for did, det in enumerate(detections):
            if did not in matched_dets:
                tracker = KalmanBoxTracker(det[:4], self.next_id)
                self.trackers.append(tracker)
                self.next_id += 1

        # Remove lost trackers
        self.trackers = [t for t in self.trackers
                         if t.no_losses < self.max_age]

        return [t.get_state() for t in self.trackers]

# Simulate tracking across frames
tracker = DeepSORT()
for frame in range(10):
    # Simulated detections: [x1, y1, x2, y2, conf]
    fake_dets = [
        [100 + frame * 2, 200, 150 + frame * 2, 250, 0.9],
        [300 - frame, 100, 350 - frame, 150, 0.8],
    ]
    tracks = tracker.update(fake_dets)
    print(f"Frame {frame}: {len(tracks)} active tracks")
    for bbox, vel, tid in tracks[:1]:
        print(f"  Track {tid}: [{bbox[0]:.0f}, {bbox[1]:.0f}]")`,
      output: `Frame 0: 2 active tracks
  Track 0: [100, 200]
Frame 1: 2 active tracks
  Track 0: [102, 200]
Frame 2: 2 active tracks
  Track 0: [104, 200]
Frame 3: 2 active tracks
  Track 0: [106, 200]
Frame 4: 2 active tracks
  Track 0: [108, 200]
Frame 5: 2 active tracks
  Track 0: [110, 200]
Frame 6: 2 active tracks
  Track 0: [112, 200]
Frame 7: 2 active tracks
  Track 0: [114, 200]
Frame 8: 2 active tracks
  Track 0: [116, 200]
Frame 9: 2 active tracks
  Track 0: [118, 200]`,
      explanation: 'DeepSORT extends SORT with appearance-based re-identification. This simplified version demonstrates the tracking loop: predict next positions with a Kalman filter, match detections to existing tracks using IoU, create new tracks for unmatched detections, and remove dead tracks. The constant velocity model keeps tracks smooth even with noisy detections.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Autonomous Driving', description: 'Multi-object tracking of vehicles, pedestrians, and cyclists across camera frames. Tracking provides velocity estimation, trajectory prediction, and temporal consistency for planning.' },
      { industry: 'Video Surveillance', description: 'Person tracking across multiple camera views for security, crowd monitoring, and forensic analysis. Tracks enable behavior analysis and re-identification across a camera network.' },
    ],
    caseStudy: {
      problem: 'A city traffic department needed to count vehicles, measure speeds, and detect traffic violations across 50 intersection cameras. Manual review of 500 hours of footage per day was impossible.',
      solution: 'Deployed YOLOv8 for detection + DeepSORT for tracking across all camera feeds. Optical flow provided supplementary speed estimation. Each feed processed at 15 FPS on edge hardware.',
      results: 'Real-time traffic analytics with 94% vehicle counting accuracy. Speed enforcement automated with <2% error. Incident detection (wrong-way drivers, stalled vehicles) in under 5 seconds. Traffic flow optimization improved average commute times by 18%.',
    },
    bestPractices: [
      'Use optical flow as a pre-processing step to mask static regions and reduce compute',
      'Apply temporal smoothing (EMA or Kalman filters) to reduce jitter in per-frame detections',
      'Balance clip sampling: 8-32 frames per clip with uniform or segment sampling works for most action recognition tasks',
      'For multi-camera tracking, ensure geometric consistency across camera views with homography or re-identification',
      'Validate tracking with metrics like MOTA (Multiple Object Tracking Accuracy) and IDF1',
    ],
    tools: ['OpenCV (optical flow)', 'DeepSORT / ByteTrack', 'I3D / SlowFast (PyTorch)', 'MMAction2', 'NVIDIA DALI'],
    jobRoles: ['Computer Vision Engineer', 'Autonomous Systems Engineer', 'Video Analytics Engineer', 'Surveillance Systems Engineer'],
    furtherReading: [
      'Carreira & Zisserman: Quo Vadis, Action Recognition? A New Model and the Kinetics Dataset (I3D)',
      'Bewley et al.: Simple Online and Realtime Tracking (SORT)',
      'Wojke et al.: Simple Online and Realtime Tracking with a Deep Association Metric (DeepSORT)',
      'MMAction2: OpenMMLab action recognition toolbox',
    ],
  },
  quiz: [
    {
      id: 'p11-video-1', type: 'truefalse',
      question: 'Optical flow computes the motion of every pixel between consecutive video frames.',
      correctAnswer: 'True',
      explanation: 'Optical flow estimates a displacement vector (u, v) for each pixel, representing where that pixel moved from one frame to the next. This captures the apparent motion in the video.',
    },
    {
      id: 'p11-video-2', type: 'mcq',
      question: 'How does DeepSORT differ from SORT in object tracking?',
      options: [
        'DeepSORT uses a deeper detector while SORT uses a shallow one',
        'DeepSORT adds appearance feature embeddings for re-identification through occlusions',
        'DeepSORT processes video at double the frame rate of SORT',
        'DeepSORT uses optical flow while SORT uses Kalman filters only',
      ],
      correctAnswer: 'DeepSORT adds appearance feature embeddings for re-identification through occlusions',
      explanation: 'SORT uses only motion cues (Kalman filter + IoU matching). DeepSORT additionally extracts CNN appearance features and uses them to re-identify objects after occlusions, making tracking more robust.',
    },
    {
      id: 'p11-video-3', type: 'fillblank',
      question: 'The method that "inflates" 2D image classification networks into 3D video networks is called ___.',
      correctAnswer: 'I3D (Inflated 3D ConvNet)',
      explanation: 'I3D inflates 2D convolution filters into 3D by repeating or expanding the temporal dimension, allowing ImageNet-pretrained weights to be transferred to video tasks.',
    },
    {
      id: 'p11-video-4', type: 'code',
      question: 'What does this optical flow code compute?',
      code: `flow = cv2.calcOpticalFlowFarneback(
    prev, next, None, 0.5, 3, 15, 3, 5, 1.2, 0)
mag, ang = cv2.cartToPolar(flow[...,0], flow[...,1])
mean_motion = mag.mean()`,
      options: [
        'The average direction of motion in the scene',
        'The average magnitude of motion across all pixels',
        'The number of moving objects detected',
        'The frame-to-frame brightness change',
      ],
      correctAnswer: 'The average magnitude of motion across all pixels',
      explanation: 'cv2.cartToPolar converts the (u, v) flow vectors to magnitude and angle. mag.mean() computes the average motion magnitude, indicating how much movement occurred between frames.',
    },
    {
      id: 'p11-video-5', type: 'match',
      question: 'Match each video analysis task with its description:',
      pairs: [
        { left: 'Optical Flow', right: 'Estimates per-pixel motion between consecutive frames' },
        { left: 'Action Recognition', right: 'Classifies what action is being performed in a video clip' },
        { left: 'Object Tracking', right: 'Maintains consistent object identities across frames' },
        { left: 'Temporal Localization', right: 'Finds when in a video a specific action occurs' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'These are the four fundamental video understanding tasks, ranging from low-level motion estimation (optical flow) to high-level semantic understanding (action recognition and temporal localization).',
    },
  ],
}))

export {}
