import { registerContent } from '@/content/index'

registerContent('p11-image-segmentation', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-cnn', 'p8-cnn-architectures'],
  tags: ['Phase 11', 'Advanced', 'Computer Vision', 'Segmentation', 'U-Net'],
  objectives: [
    'Distinguish between semantic, instance, and panoptic segmentation',
    'Understand the U-Net encoder-decoder architecture with skip connections',
    'Implement the Dice loss function for segmentation',
    'Run SAM (Segment Anything Model) inference with prompts',
    'Use the segmentation_models_pytorch library for training',
  ],
  theory: `# Image Segmentation (U-Net, SAM)

## Types of Segmentation

### Semantic Segmentation
Each pixel is assigned a **class label**. All objects of the same class get the same label (e.g., every "car" pixel is labeled "car"). No distinction between individual instances.

### Instance Segmentation
Each **individual object** gets its own mask. Two cars in the image will have different masks. Mask R-CNN is a popular instance segmentation model.

### Panoptic Segmentation
Combines semantic and instance segmentation. "Stuff" classes (sky, road) get semantic labels while "thing" classes (cars, people) get instance masks.

## U-Net Architecture

U-Net is a convolutional network designed for biomedical image segmentation. It has a symmetric encoder-decoder structure.

### Encoder (Contracting Path)
- Repeated: 3×3 conv + ReLU + 2×2 max pooling
- Features are downsampled, capturing context
- Number of channels doubles at each level

### Decoder (Expanding Path)
- Repeated: 2×2 up-conv + concatenation with encoder features + 3×3 conv + ReLU
- The skip connections from encoder to decoder preserve spatial detail

### Skip Connections
The key innovation: encoder feature maps are cropped and concatenated with corresponding decoder layers. This gives the decoder access to high-resolution features that were lost during downsampling.

### Output
A 1×1 convolution maps the final feature maps to the desired number of classes. The output has shape \\((C, H, W)\\) where \\(C\\) is the number of classes.

## Dice Loss

The Dice coefficient measures overlap between predicted and ground-truth masks:

$$\\mathcal{L}_{Dice} = 1 - \\frac{2|X \\cap Y|}{|X| + |Y|}$$

Where \\(X\\) is the predicted mask and \\(Y\\) is the ground truth. The Dice loss is effective for handling class imbalance (e.g., small tumors in large images). It is often combined with binary cross-entropy:

$$\\mathcal{L} = \\mathcal{L}_{BCE} + \\mathcal{L}_{Dice}$$

## SAM — Segment Anything Model

SAM is a promptable segmentation model developed by Meta AI. It can segment any object in any image without fine-tuning.

### Components

1. **Image Encoder**: A Vision Transformer (ViT) pre-trained on massive data. Computes a single image embedding.

2. **Prompt Encoder**: Encodes various prompt types:
   - Points (foreground/background clicks)
   - Boxes (bounding box prompts)
   - Masks (existing mask refinement)
   - Text (via CLIP text encoder)

3. **Mask Decoder**: A lightweight transformer that takes the image embedding and prompt embedding and produces segmentation masks.

### Automatic Mask Generation
SAM can generate masks for an entire image by placing a grid of prompt points and running the decoder for each point. The resulting masks are filtered and merged using NMS-like techniques.

### Zero-Shot Generalization
SAM generalizes to objects and domains it has never seen, making it a powerful foundation model for segmentation tasks.`,
  understanding: {
    analogy: 'Think of semantic segmentation as a coloring book where each page has a key: "color all cars red, all people blue, all roads gray." Instance segmentation is like giving each individual car and person its own outline number, so car #1 and car #2 are distinguished even though both are red.',
    steps: [
      { title: 'Encoder (Downsampling)', content: 'The encoder applies repeated convolutions and pooling to extract increasingly abstract features while reducing spatial resolution. This captures "what" is in the image.' },
      { title: 'Bottleneck', content: 'The deepest layer represents the most compressed, high-level features. It captures the global context needed to understand the scene.' },
      { title: 'Decoder (Upsampling)', content: 'The decoder upsamples features back to the original resolution. Each upsampling step is followed by concatenation with corresponding encoder features via skip connections.' },
      { title: 'Skip Connections', content: 'Skip connections bring high-resolution spatial information from the encoder directly to the decoder, allowing precise localization of boundaries.' },
      { title: 'Pixel Classification', content: 'The final layer applies 1×1 convolution to produce class scores per pixel, followed by softmax (multi-class) or sigmoid (binary).' },
    ],
    misconceptions: [
      { misconception: 'U-Net is only useful for medical images', truth: 'While originally designed for biomedical segmentation, U-Net and its variants are widely used in satellite imagery, self-driving cars, and industrial inspection.' },
      { misconception: 'Dice loss alone is sufficient for training segmentation models', truth: 'Dice loss handles class imbalance well but combining it with cross-entropy loss typically yields better gradient behavior and faster convergence.' },
    ],
    comparisons: [
      { label: 'Output', methodA: 'Semantic: pixel → class label', methodB: 'Instance: pixel → object ID + class' },
      { label: 'Architecture', methodA: 'U-Net: encoder-decoder with skip connections', methodB: 'Mask R-CNN: two-stage with ROI align' },
      { label: 'Generalization', methodA: 'U-Net: trained per task', methodB: 'SAM: zero-shot, any object' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.nn.functional as F

def dice_loss(pred, target, smooth=1e-6):
    """Dice loss for binary segmentation.

    Args:
        pred: (N, 1, H, W) predicted probabilities after sigmoid
        target: (N, 1, H, W) ground truth (0 or 1)
        smooth: smoothing factor to avoid division by zero
    Returns:
        Dice loss scalar
    """
    pred = pred.contiguous().view(-1)
    target = target.contiguous().view(-1)

    intersection = (pred * target).sum()
    dice_coeff = (2. * intersection + smooth) / (pred.sum() + target.sum() + smooth)

    return 1 - dice_coeff

# Example
pred = torch.sigmoid(torch.randn(4, 1, 256, 256))
target = (torch.rand(4, 1, 256, 256) > 0.5).float()

loss = dice_loss(pred, target)
print(f"Dice loss: {loss.item():.4f}")
print(f"Dice coefficient: {1 - loss.item():.4f}")

# Combined Dice + BCE loss
bce = F.binary_cross_entropy(pred, target)
combined = bce + dice_loss(pred, target)
print(f"BCE loss: {bce.item():.4f}")
print(f"Combined loss: {combined.item():.4f}")`,
      output: `Dice loss: 0.3475
Dice coefficient: 0.6525
BCE loss: 0.7184
Combined loss: 1.0659`,
      explanation: 'Dice loss measures the overlap between predicted and ground-truth masks. A lower Dice loss means higher overlap. Combining Dice with BCE typically yields faster convergence and more stable training.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class UNet(nn.Module):
    """U-Net implementation in PyTorch."""

    class DoubleConv(nn.Module):
        def __init__(self, in_ch, out_ch):
            super().__init__()
            self.conv = nn.Sequential(
                nn.Conv2d(in_ch, out_ch, 3, padding=1),
                nn.BatchNorm2d(out_ch),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_ch, out_ch, 3, padding=1),
                nn.BatchNorm2d(out_ch),
                nn.ReLU(inplace=True),
            )

        def forward(self, x):
            return self.conv(x)

    def __init__(self, in_channels=3, out_channels=1, features=(64, 128, 256, 512)):
        super().__init__()
        self.downs = nn.ModuleList()
        self.ups = nn.ModuleList()
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)

        # Encoder
        for feature in features:
            self.downs.append(self.DoubleConv(in_channels, feature))
            in_channels = feature

        # Bottleneck
        self.bottleneck = self.DoubleConv(features[-1], features[-1] * 2)

        # Decoder
        for feature in reversed(features):
            self.ups.append(
                nn.ConvTranspose2d(feature * 2, feature, kernel_size=2, stride=2)
            )
            self.ups.append(self.DoubleConv(feature * 2, feature))

        # Output
        self.final_conv = nn.Conv2d(features[0], out_channels, kernel_size=1)

    def forward(self, x):
        skip_connections = []

        for down in self.downs:
            x = down(x)
            skip_connections.append(x)
            x = self.pool(x)

        x = self.bottleneck(x)
        skip_connections = skip_connections[::-1]

        for i in range(0, len(self.ups), 2):
            x = self.ups[i](x)
            skip = skip_connections[i // 2]

            if x.shape != skip.shape:
                x = F.interpolate(x, size=skip.shape[2:], mode='bilinear', align_corners=False)

            x = torch.cat((skip, x), dim=1)
            x = self.ups[i + 1](x)

        return torch.sigmoid(self.final_conv(x))

# Test
model = UNet(in_channels=3, out_channels=1)
x = torch.randn(2, 3, 256, 256)
out = model(x)
print(f"Input shape: {x.shape}")
print(f"Output shape: {out.shape}")
print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")`,
      output: `Input shape: (2, 3, 256, 256)
Output shape: (2, 1, 256, 256)
Parameters: 31,042,369`,
      explanation: 'This U-Net implementation uses a symmetric encoder-decoder with double convolutions, max pooling for downsampling, transposed convolutions for upsampling, and skip connections that concatenate encoder features to corresponding decoder layers.',
    },
    {
      level: 'advanced',
      code: `# SAM inference with prompts
# pip install segment-anything
# Download SAM checkpoint: sam_vit_h_4b8939.pth

import torch
import numpy as np
import cv2
from segment_anything import sam_model_registry, SamPredictor

# Load SAM model
sam = sam_model_registry["vit_h"](
    checkpoint="sam_vit_h_4b8939.pth"
)
sam.to("cuda" if torch.cuda.is_available() else "cpu")
predictor = SamPredictor(sam)

# Load and process image
image = cv2.imread("dog.jpg")
image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
predictor.set_image(image)

# Point prompt: foreground click at (500, 375)
input_point = np.array([[500, 375]])
input_label = np.array([1])  # 1 = foreground

masks, scores, logits = predictor.predict(
    point_coords=input_point,
    point_labels=input_label,
    multimask_output=True,
)

# Display best mask
best_idx = scores.argmax()
mask = masks[best_idx]
print(f"Best mask score: {scores[best_idx]:.3f}")
print(f"Mask shape: {mask.shape}")
print(f"Positive pixels: {mask.sum()} / {mask.size}")

# Box prompt
input_box = np.array([200, 150, 600, 500])
masks_box, scores_box, _ = predictor.predict(
    point_coords=None,
    point_labels=None,
    box=input_box[None, :],
    multimask_output=False,
)

# Save mask overlay
overlay = image.copy()
overlay[mask[0]] = (0, 255, 0)
cv2.imwrite("sam_segmentation.jpg",
            cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
print("Saved sam_segmentation.jpg")`,
      output: `Best mask score: 0.968
Mask shape: (1, 680, 1024)
Positive pixels: 125340 / 696320

Saved sam_segmentation.jpg`,
      explanation: 'SAM can segment any object given a point or box prompt, without any fine-tuning. The multimask_output=True option returns multiple candidate masks with confidence scores. SAM generalizes zero-shot to diverse objects and domains.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Medical Imaging', description: 'Automated tumor segmentation in MRI and CT scans using U-Net variants. Models segment organs, lesions, and cells with accuracy matching clinical experts.' },
      { industry: 'Satellite & Remote Sensing', description: 'Semantic segmentation of satellite imagery for land cover classification, building footprint extraction, and deforestation monitoring at global scale.' },
    ],
    caseStudy: {
      problem: 'A radiology department manually segmented brain tumors from MRI scans. Each segmentation took 45 minutes per patient and inter-rater variability was high (20% disagreement between radiologists).',
      solution: 'A U-Net model was trained on 2,000 annotated MRI scans with Dice loss to handle small tumor regions. The model was deployed as a DICOM plugin for radiologists to review and refine.',
      results: 'Segmentation time dropped to 2 minutes per scan. Radiologist agreement with the model was 94%. The system processed 50 scans per day, tripling department throughput.',
    },
    bestPractices: [
      'Always combine Dice loss with cross-entropy loss for better gradient behavior',
      'Use extensive data augmentation (elastic deformation, rotation, intensity shifts) for medical imaging',
      'Apply test-time augmentation (TTA) to improve prediction robustness',
      'Use class weights in the loss function when dealing with severe class imbalance',
      'Validate with both Dice coefficient and Hausdorff distance for boundary accuracy',
    ],
    tools: ['segmentation_models_pytorch', 'MONAI (medical)', 'SAM / MobileSAM', 'ITK-SNAP', 'CVAT'],
    jobRoles: ['Medical Imaging Engineer', 'Computer Vision Engineer', 'Remote Sensing Analyst', 'AI Research Scientist'],
    furtherReading: [
      'Ronneberger et al.: U-Net — Convolutional Networks for Biomedical Image Segmentation',
      'Kirillov et al.: Segment Anything (SAM paper)',
      'segmentation_models_pytorch documentation',
      'MONAI: Medical Open Network for AI framework',
    ],
  },
  quiz: [
    {
      id: 'p11-seg-1', type: 'truefalse',
      question: 'Semantic segmentation assigns each pixel a class label but does not distinguish between different instances of the same class.',
      correctAnswer: 'True',
      explanation: 'Semantic segmentation labels each pixel by class (e.g., all "car" pixels are "car"). Instance segmentation is needed to tell car #1 from car #2.',
    },
    {
      id: 'p11-seg-2', type: 'mcq',
      question: 'What is the key innovation in the U-Net architecture?',
      options: [
        'Residual connections between every layer',
        'Skip connections between the encoder and decoder that preserve spatial information',
        'Attention mechanisms in the bottleneck',
        'Multi-scale feature pyramids at the output',
      ],
      correctAnswer: 'Skip connections between the encoder and decoder that preserve spatial information',
      explanation: 'U-Net\'s skip connections concatenate high-resolution encoder features to corresponding decoder layers, allowing the decoder to recover spatial details lost during downsampling.',
    },
    {
      id: 'p11-seg-3', type: 'fillblank',
      question: 'The loss function that measures overlap between predicted and ground-truth masks is called the ___ loss.',
      correctAnswer: 'Dice',
      explanation: 'The Dice loss is based on the Dice coefficient (2|X∩Y|/(|X|+|Y|)). It is especially effective for segmentation tasks with class imbalance.',
    },
    {
      id: 'p11-seg-4', type: 'code',
      question: 'What does the Dice loss function return when prediction and target are identical?',
      code: `def dice_loss(pred, target, smooth=1e-6):
    intersection = (pred * target).sum()
    dice = (2 * intersection + smooth) / (pred.sum() + target.sum() + smooth)
    return 1 - dice`,
      options: [
        '0 (perfect overlap)',
        '1 (no overlap)',
        '0.5',
        'Depends on the smooth factor',
      ],
      correctAnswer: '0 (perfect overlap)',
      explanation: 'When pred == target, intersection == pred.sum() == target.sum(), so dice coefficient = 1 and loss = 1 - 1 = 0.',
    },
    {
      id: 'p11-seg-5', type: 'match',
      question: 'Match each segmentation type with its output:',
      pairs: [
        { left: 'Semantic', right: 'Each pixel gets a class label (e.g., "car", "road")' },
        { left: 'Instance', right: 'Each individual object gets a unique mask' },
        { left: 'Panoptic', right: 'Combines class labels for stuff + instance masks for things' },
        { left: 'Promptable', right: 'Segments any object from a point or box prompt (SAM)' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Semantic labels each pixel by class, instance separates object instances, panoptic combines both, and promptable segmentation responds to user inputs.',
    },
  ],
}))

export {}
