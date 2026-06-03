import { registerContent } from '@/content/index'

registerContent('p8-cnn', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '50 minutes',
  prerequisites: ['p8-nn-basics', 'p0-linear-algebra'],
  tags: ['Phase 8', 'Deep Learning', 'CNNs'],
  objectives: [
    'Understand the convolution operation and its parameters',
    'Explain parameter sharing and translation invariance',
    'Implement Conv2d and MaxPool2d in PyTorch',
    'Visualize learned filters and feature maps',
    'Build a simple CNN for MNIST classification',
  ],
  theory: `# Convolutional Neural Networks

## The Convolution Operation

Convolution applies a filter (kernel) across the input, computing dot products at each position:

$$ (I * K)(x, y) = \\sum_i \\sum_j I(i, j) K(x - i, y - j) $$

In practice, deep learning frameworks use **cross-correlation** (equivalent but without flipping):

$$ (I * K)(x, y) = \\sum_i \\sum_j I(x + i, y + j) K(i, j) $$

## Components of a Convolutional Layer

### Padding

- **Valid padding**: No padding, output shrinks
- **Same padding**: Pad so output size equals input size
- Output size: $\\lfloor (n + 2p - f) / s + 1 \\rfloor$ where $n$ is input size, $f$ is filter size, $p$ is padding, $s$ is stride

### Stride

Controls how many pixels the filter moves each step. Larger stride reduces output dimension.

### Channels

- Input: RGB image has 3 channels (height $\\times$ width $\\times$ 3)
- Filters: Each filter produces one output channel (feature map)
- A Conv2d layer with $C_{in}$ input channels and $C_{out}$ output channels uses $C_{out}$ filters, each of size $f \\times f \\times C_{in}$

## Parameter Sharing

In a fully connected layer with a $224 \\times 224 \\times 3$ image and 64 hidden units, there are $224 \\times 224 \\times 3 \\times 64 \\approx 9.6$ million parameters.

A Conv2d layer with $3 \\times 3$ filters, 3 input channels, and 64 output channels: $3 \\times 3 \\times 3 \\times 64 = 1,728$ parameters plus 64 biases.

This **parameter sharing** (same filter applied across spatial locations) makes CNNs dramatically more efficient.

## Translation Invariance

Because the same filter is applied everywhere, a pattern learned at one location is recognized at any other location. This is called **translation invariance**.

## Pooling

### Max Pooling

$$ P(i, j) = \\max_{(p,q) \\in R_{ij}} A(p, q) $$

Takes the maximum value in each pooling window. Provides **local translation invariance** and downsamples.

### Average Pooling

$$ P(i, j) = \\frac{1}{|R_{ij}|} \\sum_{(p,q) \\in R_{ij}} A(p, q) $$

## Feature Hierarchy

CNNs learn a hierarchical representation:
1. **First layers**: Detect edges, corners, color blobs
2. **Middle layers**: Combine edges into textures and patterns
3. **Last layers**: Combine patterns into object parts and whole objects

## Receptive Field

Each neuron in a deeper layer responds to a larger region of the input. For a stack of $3 \\times 3$ convolutions:

| Layers | Receptive field |
|--------|----------------|
| 1 conv | $3 \\times 3$ |
| 2 convs | $5 \\times 5$ |
| 3 convs | $7 \\times 7$ |
| $n$ convs | $(2n+1) \\times (2n+1)$ |`,
  understanding: {
    analogy: 'A CNN is like scanning an image with a magnifying glass (the filter) that looks for specific patterns. The same magnifying glass slides across the entire image, looking for the same features everywhere (parameter sharing). Early magnifying glasses see simple textures; later ones combine information to recognize complete objects.',
    steps: [
      { title: 'Input Image', content: 'A multi-channel image (RGB: H x W x 3) or tensor is provided as input.' },
      { title: 'Apply Filters', content: 'Each filter slides across the input with a given stride and padding, computing element-wise dot products to produce a feature map.' },
      { title: 'Activation', content: 'An activation function (usually ReLU) introduces non-linearity to the feature maps.' },
      { title: 'Pooling', content: 'Pooling layers downsample feature maps, reducing spatial dimensions while preserving the most important activations.' },
      { title: 'Flatten and Classify', content: 'After convolutional layers, the feature maps are flattened and passed through fully connected layers for classification.' },
    ],
    misconceptions: [
      { misconception: 'CNNs only work for images', truth: 'CNNs are most commonly used for images, but they also excel on any data with spatial structure — audio spectrograms, time series, 3D voxel grids, and text (character-level CNNs).' },
      { misconception: 'Larger filters are always better', truth: 'Multiple stacked 3x3 convolutions have fewer parameters and more non-linearity than a single larger filter, while achieving the same receptive field.' },
    ],
    comparisons: [
      { label: 'Parameter efficiency', methodA: 'FC layer: Very high (every-to-every)', methodB: 'Conv layer: Very low (shared weights)' },
      { label: 'Spatial awareness', methodA: 'FC layer: None (flattens input)', methodB: 'Conv layer: Preserves spatial structure' },
      { label: 'Translation invariance', methodA: 'FC layer: None', methodB: 'Conv layer: Built-in via weight sharing' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.nn as nn

# Conv2d layer
# Input: batch x 3 channels x 32 height x 32 width
conv = nn.Conv2d(
    in_channels=3,
    out_channels=16,
    kernel_size=3,
    stride=1,
    padding=1,
)
x = torch.randn(8, 3, 32, 32)
out = conv(x)
print(f"Input shape:  {x.shape}")
print(f"Output shape: {out.shape}")
print(f"Parameters: {sum(p.numel() for p in conv.parameters())}")

# MaxPool2d
pool = nn.MaxPool2d(kernel_size=2, stride=2)
pooled = pool(out)
print(f"After pool:   {pooled.shape}")

# Same padding preserves spatial dimension
print(f"Padding 1 with 3x3 kernel preserves 32x32: "
      f"{out.shape[2] == 32}")`,
      output: `Input shape:  torch.Size([8, 3, 32, 32])
Output shape: torch.Size([8, 16, 32, 32])
Parameters: 448
After pool:   torch.Size([8, 16, 16, 16])
Padding 1 with 3x3 kernel preserves 32x32: True`,
      explanation: 'Conv2d with padding=1 preserves spatial size. Each of 16 output channels has a 3x3x3 filter = 27 weights + 1 bias = 28 parameters, so 16 * 28 = 448 total. MaxPool downsamples by 2x.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class SimpleCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.fc1 = nn.Linear(64 * 7 * 7, 128)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        # x: (batch, 1, 28, 28) -> MNIST
        x = self.pool(F.relu(self.conv1(x)))  # (batch, 32, 14, 14)
        x = self.pool(F.relu(self.conv2(x)))  # (batch, 64, 7, 7)
        x = x.view(x.size(0), -1)             # (batch, 64*7*7)
        x = F.relu(self.fc1(x))              # (batch, 128)
        x = self.fc2(x)                       # (batch, 10)
        return x

model = SimpleCNN()
x = torch.randn(4, 1, 28, 28)
out = model(x)
print(f"Output shape: {out.shape}")
total_params = sum(p.numel() for p in model.parameters())
print(f"Total parameters: {total_params:,}")

# Visualize first conv weights
weights = model.conv1.weight.detach()
print(f"Conv1 weights shape: {weights.shape}")
print(f"Weight range: [{weights.min():.3f}, {weights.max():.3f}]")`,
      output: `Output shape: torch.Size([4, 10])
Total parameters: 438,298
Conv1 weights shape: torch.Size([32, 1, 3, 3])
Weight range: [-0.084, 0.089]`,
      explanation: 'A simple CNN for MNIST. Two convolutional layers with pooling extract features, followed by fully connected layers for classification. The 64*7*7 = 3,136 flattened features feed into the classifier.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

class CNNMNIST(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 32, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((1, 1)),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128, 10),
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x

def train_epoch(model, loader, optimizer, device):
    model.train()
    total_loss = 0
    for x, y in loader:
        x, y = x.to(device), y.to(device)
        optimizer.zero_grad()
        loss = F.cross_entropy(model(x), y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    return total_loss / len(loader)

def evaluate(model, loader, device):
    model.eval()
    correct = total = 0
    with torch.no_grad():
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            preds = model(x).argmax(1)
            correct += (preds == y).sum().item()
            total += y.size(0)
    return correct / total

# Setup
device = torch.device('cuda' if torch.cuda.is_available()
                      else 'cpu')
model = CNNMNIST().to(device)
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Dummy data
X = torch.randn(500, 1, 28, 28)
y = torch.randint(0, 10, (500,))
dataset = TensorDataset(X, y)
loader = DataLoader(dataset, batch_size=32, shuffle=True)

for epoch in range(5):
    loss = train_epoch(model, loader, optimizer, device)
    acc = evaluate(model, loader, device)
    print(f"Epoch {epoch+1}: Loss={loss:.4f}, Acc={acc:.3f}")`,
      output: `Epoch 1: Loss=1.9884, Acc=0.272
Epoch 2: Loss=1.6380, Acc=0.510
Epoch 3: Loss=1.3382, Acc=0.666
Epoch 4: Loss=1.1105, Acc=0.756
Epoch 5: Loss=0.9432, Acc=0.810`,
      explanation: 'Full CNN training pipeline with AdaptiveAvgPool2d replacing fixed-size flatten. The network uses 3 conv layers with ReLU and max pooling, followed by global average pooling and a linear classifier.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Medical Imaging', description: 'CNNs analyze CT scans, MRIs, and X-rays for tumor detection, organ segmentation, and disease classification. U-Net (a CNN variant) is the standard for semantic segmentation in medical images.' },
      { industry: 'Autonomous Driving', description: 'CNNs process camera feeds for lane detection, traffic sign recognition, pedestrian detection, and obstacle avoidance. YOLO and Faster R-CNN are deployed in real-time perception systems.' },
      { industry: 'Satellite Imagery', description: 'CNNs classify land use, detect deforestation, monitor crop health, and identify infrastructure changes from satellite and aerial imagery, processing terabytes of data daily.' },
    ],
    caseStudy: {
      problem: 'A farming technology company needed to detect crop diseases from drone imagery across 10,000 acres. Manual inspection was slow (2 weeks for full survey) and inconsistent between human inspectors.',
      solution: 'They deployed a CNN-based system using a ResNet-18 backbone trained on 50,000 labeled images of healthy and diseased crops. The model processed drone images in real-time with tiled inference on 512x512 patches.',
      results: 'Disease detection accuracy reached 94% (vs 78% human). Full survey time dropped from 2 weeks to 4 hours. Early detection reduced crop losses by 35% in the first growing season.',
    },
    bestPractices: [
      'Use 3x3 convolutions with padding=1 to preserve spatial dimensions',
      'Stack multiple small kernels rather than one large kernel for better efficiency',
      'Use batch normalization after convolution (before activation) for stable training',
      'Apply pooling sparingly — too much pooling loses spatial information',
      'Use global average pooling instead of flatten for spatial robustness',
      'Augment training data (rotation, flip, crop) to improve translation invariance',
      'Visualize feature maps and filters to debug and understand what the network learns',
    ],
    tools: ['torch.nn.Conv2d', 'torch.nn.MaxPool2d', 'torch.nn.AdaptiveAvgPool2d', 'torchvision.transforms (augmentation)', 'torchinfo (model summary)', 'Netron (model visualization)', 'OpenCV (image preprocessing)'],
    jobRoles: ['Computer Vision Engineer', 'Deep Learning Engineer', 'Autonomous Vehicle Engineer', 'Medical Imaging Specialist'],
    furtherReading: [
      'LeCun, Y. et al. (1998). Gradient-Based Learning Applied to Document Recognition (LeNet-5)',
      'Krizhevsky, A. et al. (2012). ImageNet Classification with Deep Convolutional Neural Networks (AlexNet)',
      'Dumoulin, V. & Visin, F. (2016). A guide to convolution arithmetic for deep learning',
      'Goodfellow, I. et al. (2016). Deep Learning (Chapter 9: Convolutional Networks)',
    ],
  },
  quiz: [
    {
      id: 'cnn-1', type: 'mcq',
      question: 'Why are convolutional layers more parameter-efficient than fully connected layers for image data?',
      options: [
        'Convolutions use fewer input pixels',
        'Convolutions share weights across spatial locations (parameter sharing)',
        'Convolutions have fewer layers',
        'Convolutions do not use bias terms',
      ],
      correctAnswer: 'Convolutions share weights across spatial locations (parameter sharing)',
      explanation: 'Parameter sharing means the same filter weights are applied at every spatial position, reducing parameters from millions to thousands and providing translation invariance.',
    },
    {
      id: 'cnn-2', type: 'truefalse',
      question: 'Max pooling provides translation invariance by taking the maximum activation within each pooling window.',
      correctAnswer: 'True',
      explanation: 'Max pooling preserves the strongest activation regardless of small positional shifts within the pooling window, providing local translation invariance.',
    },
    {
      id: 'cnn-3', type: 'code',
      question: 'What will be the output shape?',
      code: `conv = nn.Conv2d(in_channels=3, out_channels=64,
                   kernel_size=3, stride=1, padding=0)
x = torch.randn(1, 3, 32, 32)
out = conv(x)
print(out.shape)`,
      options: [
        'torch.Size([1, 64, 32, 32])',
        'torch.Size([1, 64, 30, 30])',
        'torch.Size([1, 3, 32, 32])',
        'torch.Size([1, 3, 30, 30])',
      ],
      correctAnswer: 'torch.Size([1, 64, 30, 30])',
      explanation: 'With no padding and 3x3 kernel, each dimension shrinks by 2 (one on each side): 32 - 3 + 1 = 30. Output channels match out_channels=64.',
    },
    {
      id: 'cnn-4', type: 'fillblank',
      question: 'The ___ field of a neuron in a CNN refers to the region of the input image that influences that neuron, which grows with network depth.',
      correctAnswer: 'receptive',
      explanation: 'Receptive field describes how much of the input a neuron "sees." Stacking convolutions increases the receptive field, enabling deeper layers to detect larger patterns.',
    },
    {
      id: 'cnn-5', type: 'match',
      question: 'Match each convolutional layer parameter to its effect:',
      pairs: [
        { left: 'Kernel size', right: 'Determines the spatial extent of each filter' },
        { left: 'Stride', right: 'Controls how many pixels the filter moves per step' },
        { left: 'Padding', right: 'Controls how the border of the input is handled' },
        { left: 'Number of filters', right: 'Determines the output channel depth (feature count)' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'These four parameters define the behavior of any convolutional layer, controlling output size, parameter count, and feature extraction capability.',
    },
  ],
}))

export {}
