import { registerContent } from '@/content/index'

registerContent('p8-cnn-architectures', () => ({
  difficulty: 'Advanced',
  estimatedTime: '50 minutes',
  prerequisites: ['p8-cnn', 'p8-nn-basics'],
  tags: ['Phase 8', 'Deep Learning', 'CNN Architectures'],
  objectives: [
    'Trace the evolution of CNN architectures from LeNet to EfficientNet',
    'Understand residual connections and why they enable very deep networks',
    'Implement a ResNet block in PyTorch',
    'Use torchvision.models for pretrained models',
    'Explain EfficientNet compound scaling',
  ],
  theory: `# CNN Architectures (VGG, ResNet, EfficientNet)

## LeNet-5 (LeCun, 1998)

The first successful CNN architecture for handwritten digit recognition:

- 2 convolutional layers (5x5 filters)
- 2 subsampling (average pooling) layers
- 3 fully connected layers
- 60,000 parameters
- Achieved <1% error on MNIST

## AlexNet (Krizhevsky, 2012)

Breakthrough architecture that won ImageNet 2012 by a large margin:

- 5 convolutional layers + 3 fully connected
- 11x11, 5x5, and 3x3 filters
- ReLU activation (first major use)
- Local response normalization
- Overlapping max pooling
- 60 million parameters
- Trained on 2 GPUs for 5-6 days

## VGG (Simonyan & Zisserman, 2014)

VGG demonstrated the power of simplicity: deep stacks of **3x3 convolutions**.

VGG-16: 16 weight layers (13 conv + 3 FC), 138M parameters.
VGG-19: 19 weight layers (16 conv + 3 FC), 144M parameters.

Key insight: two 3x3 conv layers have the same receptive field as one 5x5 layer but with fewer parameters ($2 \\times 3^2 \\times C^2 = 18C^2$ vs $5^2 \\times C^2 = 25C^2$) and more non-linearity.

## ResNet (He et al., 2015)

ResNet (Residual Network) introduced **residual connections** (skip connections):

$$ y = F(x) + x $$

Where $F(x)$ is a stack of convolutional layers and $x$ is the input. This allows gradients to flow directly through skip connections, enabling networks with 50, 101, and even 152 layers.

### ResNet Block Types

**Basic Block** (ResNet-18/34):
$$ F(x) = \\text{Conv3x3} \\to \\text{BN} \\to \\text{ReLU} \\to \\text{Conv3x3} \\to \\text{BN} $$

**Bottleneck Block** (ResNet-50/101/152):
$$ F(x) = \\text{Conv1x1} \\to \\text{BN} \\to \\text{ReLU} \\to \\text{Conv3x3} \\to \\text{BN} \\to \\text{ReLU} \\to \\text{Conv1x1} \\to \\text{BN} $$

The 1x1 convolutions reduce and restore channels, making bottleneck blocks computationally efficient.

## EfficientNet (Tan & Le, 2019)

EfficientNet introduced **compound scaling** — uniformly scaling all dimensions (depth, width, resolution) using a compound coefficient:

$$ \\text{depth: } d = \\alpha^\\phi, \\quad \\text{width: } w = \\beta^\\phi, \\quad \\text{resolution: } r = \\gamma^\\phi $$

Subject to $\\alpha \\cdot \\beta^2 \\cdot \\gamma^2 \\approx 2$ (computational budget constraint).

### MBConv (Mobile Inverted Bottleneck)

MBConv is the building block of EfficientNet:
1. **Expansion**: 1x1 conv expands channels (e.g., 4x)
2. **Depthwise Conv**: 3x3 or 5x5 depthwise separable convolution
3. **Squeeze-and-Excitation**: Channel attention
4. **Projection**: 1x1 conv reduces channels back

### Depthwise Separable Convolutions

Standard conv: $k \\times k \\times C_{in} \\times C_{out}$ parameters
Depthwise separable: $k \\times k \\times C_{in} + C_{in} \\times C_{out}$

For $k=3, C_{in}=64, C_{out}=128$: standard = 73,728, separable = 576 + 8,192 = 8,768 (8.4x fewer).

## Batch Normalization

$$ \\hat{x} = \\frac{x - \\mu_B}{\\sqrt{\\sigma_B^2 + \\epsilon}} \\cdot \\gamma + \\beta $$

Normalizes layer inputs to reduce internal covariate shift, allowing higher learning rates and reducing the need for careful initialization.`,
  understanding: {
    analogy: 'CNN architecture evolution is like building taller skyscrapers. VGG was a simple brick wall (stack 3x3 blocks). ResNet added support beams (skip connections) allowing much taller buildings. EfficientNet is a modern architect who optimally scales height, width, and foundation strength together — all dimensions matter.',
    steps: [
      { title: 'Input to Conv Block', content: 'Image passes through the initial convolutional stem (usually 7x7 conv + max pool).' },
      { title: 'Feature Extraction Stages', content: 'Multiple stages each reduce spatial dimensions (2x) while increasing channels (2x). Each stage has multiple blocks.' },
      { title: 'Residual Connection', content: 'In ResNet, the input $x$ is added to the block output $F(x)$, enabling gradient flow around the block.' },
      { title: 'Global Pooling', content: 'After all conv stages, global average pooling collapses spatial dimensions to 1x1 per channel.' },
      { title: 'Classification Head', content: 'A single fully connected layer maps pooled features to class logits.' },
    ],
    misconceptions: [
      { misconception: 'All CNN architectures are interchangeable', truth: 'Architecture design matters significantly. ResNet-50 has 26M params, VGG-16 has 138M — yet ResNet achieves higher accuracy. Architecture efficiency directly impacts training cost and inference speed.' },
      { misconception: 'Deeper is always better', truth: 'Without residual connections, very deep networks perform worse than shallower ones due to vanishing gradients. ResNet\'s innovation was enabling depth, not just adding it.' },
    ],
    comparisons: [
      { label: 'Parameter count (ImageNet)', methodA: 'VGG-16: 138M', methodB: 'ResNet-50: 26M, EfficientNet-B0: 5.3M' },
      { label: 'Top-1 accuracy (ImageNet)', methodA: 'VGG-16: 71.6%', methodB: 'ResNet-50: 76.2%, EfficientNet-B7: 84.4%' },
      { label: 'Key innovation', methodA: 'VGG: Simplicity (all 3x3)', methodB: 'ResNet: Skip connections, EfficientNet: Compound scaling' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.nn as nn

class BasicBlock(nn.Module):
    """ResNet basic block for ResNet-18/34."""
    expansion = 1

    def __init__(self, in_channels, out_channels, stride=1):
        super().__init__()
        self.conv1 = nn.Conv2d(
            in_channels, out_channels, 3,
            stride=stride, padding=1, bias=False
        )
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(
            out_channels, out_channels, 3,
            stride=1, padding=1, bias=False
        )
        self.bn2 = nn.BatchNorm2d(out_channels)

        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 1,
                          stride=stride, bias=False),
                nn.BatchNorm2d(out_channels),
            )

    def forward(self, x):
        out = torch.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += self.shortcut(x)
        return torch.relu(out)

# Test
block = BasicBlock(64, 128, stride=2)
x = torch.randn(1, 64, 32, 32)
print(f"Output shape: {block(x).shape}")`,
      output: `Output shape: torch.Size([1, 128, 16, 16])`,
      explanation: 'A BasicBlock doubles channels (64->128) and halves spatial size (32->16 due to stride=2). The shortcut connection ensures gradients can flow directly through the skip connection.',
    },
    {
      level: 'intermediate',
      code: `import torch.nn as nn

class Bottleneck(nn.Module):
    """ResNet bottleneck block for ResNet-50/101/152."""
    expansion = 4

    def __init__(self, in_channels, out_channels, stride=1):
        super().__init__()
        self.conv1 = nn.Conv2d(
            in_channels, out_channels, 1, bias=False
        )
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(
            out_channels, out_channels, 3,
            stride=stride, padding=1, bias=False
        )
        self.bn2 = nn.BatchNorm2d(out_channels)
        self.conv3 = nn.Conv2d(
            out_channels, out_channels * 4, 1, bias=False
        )
        self.bn3 = nn.BatchNorm2d(out_channels * 4)

        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels * 4:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels * 4, 1,
                          stride=stride, bias=False),
                nn.BatchNorm2d(out_channels * 4),
            )

    def forward(self, x):
        identity = x
        x = torch.relu(self.bn1(self.conv1(x)))
        x = torch.relu(self.bn2(self.conv2(x)))
        x = self.bn3(self.conv3(x))
        x += self.shortcut(identity)
        return torch.relu(x)

# ResNet-50: [3, 4, 6, 3] bottleneck blocks
# ResNet-101: [3, 4, 23, 3] bottleneck blocks`,
      output: '',
      explanation: 'The bottleneck block uses a 1x1-3x3-1x1 sandwich to reduce then expand channels efficiently. The expansion factor of 4 means input 64 -> bottleneck 64 -> output 256 channels.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torchvision.models as models

# Load pretrained models
resnet18 = models.resnet18(weights='IMAGENET1K_V1')
resnet50 = models.resnet50(weights='IMAGENET1K_V1')
vgg16 = models.vgg16(weights='IMAGENET1K_V1')

# Model summaries
def count_params(model):
    return sum(p.numel() for p in model.parameters())

print(f"ResNet-18: {count_params(resnet18):,} params")
print(f"ResNet-50: {count_params(resnet50):,} params")
print(f"VGG-16:    {count_params(vgg16):,} params")

# Forward pass
x = torch.randn(2, 3, 224, 224)
out_r18 = resnet18(x)
out_r50 = resnet50(x)
out_vgg = vgg16(x)

print(f"ResNet-18 output: {out_r18.shape}")
print(f"ResNet-50 output: {out_r50.shape}")
print(f"VGG-16 output:    {out_vgg.shape}")

# Remove classifier for feature extraction
resnet18.fc = nn.Identity()
features = resnet18(x)
print(f"ResNet-18 features: {features.shape}")`,
      output: `ResNet-18: 11,689,512 params
ResNet-50: 25,557,032 params
VGG-16:    138,357,544 params
ResNet-18 output: torch.Size([2, 1000])
ResNet-50 output: torch.Size([2, 1000])
VGG-16 output:    torch.Size([2, 1000])
ResNet-18 features: torch.Size([2, 512])`,
      explanation: 'torchvision provides pretrained models with ImageNet weights. Note the dramatic parameter count difference: VGG-16 has 12x more parameters than ResNet-18 but lower accuracy. Replacing the classifier head with Identity enables feature extraction.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Medical Imaging', description: 'ResNet-50/101 are the backbone of most medical image analysis systems — from chest X-ray classification to retinal scan analysis. Their skip connections enable training on limited medical datasets.' },
      { industry: 'Mobile Applications', description: 'EfficientNet-B0 through B7 are deployed on mobile devices via TensorFlow Lite and Core ML. Compound scaling produces models optimized for the compute and memory constraints of phones.' },
      { industry: 'E-commerce', description: 'VGG and ResNet power visual search systems where users upload images to find similar products. Feature embeddings from the final pooling layer are indexed for similarity search.' },
    ],
    caseStudy: {
      problem: 'A self-driving car company needed a real-time object detection system running at 30 FPS on embedded hardware (NVIDIA Jetson). ResNet-152 was too slow (5 FPS), and VGG-16 was too large for the memory budget.',
      solution: 'They deployed EfficientNet-B3 as the backbone, which achieved comparable accuracy to ResNet-101 with 4x fewer FLOPs. They also replaced the classification head with a detection-specific neck (FPN + detection heads).',
      results: 'The system achieved 28 FPS on the Jetson with 78% mAP (vs 80% mAP at 5 FPS for ResNet-152). Power consumption dropped from 30W to 12W, meeting the thermal budget.',
    },
    bestPractices: [
      'Start with a pretrained model (torchvision.models) — training from scratch is rarely needed',
      'Use ResNet-50 as the default backbone — good balance of accuracy and speed',
      'Choose EfficientNet for resource-constrained deployment (mobile, edge)',
      'Use VGG only for small-scale tasks where simplicity is valued over efficiency',
      'Replace the final fully connected layer when fine-tuning on custom datasets',
      'Use depthwise separable convolutions for efficient model design',
      'Profile with torchinfo to understand FLOPs, not just parameter count',
    ],
    tools: ['torchvision.models', 'torchinfo (parameter/FLOP analysis)', 'Netron (architecture visualization)', 'NVIDIA TensorRT (optimization)', 'ONNX (model export)', 'PyTorch Quantization (int8)', 'Hugging Face timm (PyTorch Image Models)'],
    jobRoles: ['Computer Vision Engineer', 'Model Optimization Engineer', 'Edge AI Engineer', 'Autonomous Vehicle Engineer'],
    furtherReading: [
      'Krizhevsky, A. et al. (2012). ImageNet Classification with Deep Convolutional Neural Networks (AlexNet)',
      'Simonyan, K. & Zisserman, A. (2014). Very Deep Convolutional Networks for Large-Scale Image Recognition (VGG)',
      'He, K. et al. (2015). Deep Residual Learning for Image Recognition (ResNet)',
      'Tan, M. & Le, Q. (2019). EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks',
    ],
  },
  quiz: [
    {
      id: 'cnna-1', type: 'mcq',
      question: 'How do residual connections (skip connections) help train very deep networks?',
      options: [
        'They reduce the number of parameters by half',
        'They provide a direct gradient path to earlier layers, mitigating vanishing gradients',
        'They double the computation per layer',
        'They replace batch normalization',
      ],
      correctAnswer: 'They provide a direct gradient path to earlier layers, mitigating vanishing gradients',
      explanation: 'Skip connections allow gradients to bypass convolutional layers and flow directly back to earlier layers, preventing them from vanishing in very deep (50-152 layer) networks.',
    },
    {
      id: 'cnna-2', type: 'truefalse',
      question: 'VGG architectures primarily use large 7x7 and 11x11 convolutional filters.',
      correctAnswer: 'False',
      explanation: 'VGG uses only 3x3 convolutional filters throughout the network. The key insight is that stacking multiple 3x3 layers achieves the same receptive field as larger filters with fewer parameters.',
    },
    {
      id: 'cnna-3', type: 'code',
      question: 'What does torchvision.models.resnet18(weights="IMAGENET1K_V1") return?',
      code: `import torchvision.models as models
model = models.resnet18(weights='IMAGENET1K_V1')`,
      options: [
        'A randomly initialized ResNet-18 model',
        'A ResNet-18 model pretrained on ImageNet',
        'A ResNet-18 architecture definition with no weights',
        'A training script for ResNet-18',
      ],
      correctAnswer: 'A ResNet-18 model pretrained on ImageNet',
      explanation: 'The weights="IMAGENET1K_V1" argument loads pretrained weights from ImageNet classification. This is the standard way to load pretrained models for transfer learning.',
    },
    {
      id: 'cnna-4', type: 'fillblank',
      question: 'EfficientNet uses ___ scaling, where depth, width, and resolution are scaled together using a compound coefficient.',
      correctAnswer: 'compound',
      explanation: 'Compound scaling uniformly scales all three dimensions (depth, width, resolution) with coefficients alpha, beta, gamma constrained by alpha * beta^2 * gamma^2 ≈ 2 to maintain compute efficiency.',
    },
    {
      id: 'cnna-5', type: 'match',
      question: 'Match each architecture to its key innovation:',
      pairs: [
        { left: 'AlexNet', right: 'First major CNN breakthrough on ImageNet, popularized ReLU and GPU training' },
        { left: 'VGG', right: 'Demonstrated simple deep stacks of 3x3 convolutions' },
        { left: 'ResNet', right: 'Introduced skip connections enabling very deep networks' },
        { left: 'EfficientNet', right: 'Compound scaling and MBConv for optimal efficiency' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each architecture marked a milestone in CNN evolution, introducing innovations that advanced the state of the art.',
    },
  ],
}))

export {}
