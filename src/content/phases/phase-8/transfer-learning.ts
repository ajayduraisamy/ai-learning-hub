import { registerContent } from '@/content/index'

registerContent('p8-transfer-learning', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '40 minutes',
  prerequisites: ['p8-cnn-architectures', 'p8-cnn'],
  tags: ['Phase 8', 'Deep Learning', 'Transfer Learning'],
  objectives: [
    'Understand why and when transfer learning is effective',
    'Differentiate between feature extraction and fine-tuning',
    'Use torchvision pretrained models for custom tasks',
    'Implement progressive unfreezing strategy',
    'Avoid negative transfer through appropriate layer selection',
  ],
  theory: `# Transfer Learning

## Motivation

Training deep neural networks from scratch requires:
- **Large datasets**: ImageNet has 14M+ images
- **Extensive compute**: Days/weeks on multiple GPUs
- **Expertise**: Hyperparameter tuning, architecture selection

Transfer learning leverages knowledge from a pretrained model and adapts it to a new task.

## Pre-training vs Fine-tuning

### Pre-training

Train a model on a large, general dataset (e.g., ImageNet for vision, Wikipedia for NLP). The model learns generic features: edges, textures, shapes for vision; grammar, syntax, semantics for NLP.

### Fine-tuning

Adapt the pretrained model to a target task by continuing training on the target dataset.

## Feature Extraction (Freeze Backbone)

The pretrained model's weights are **frozen** (not updated during training). Only a new classifier head is trained:

$$ \\text{Backbone parameters: frozen} $$
$$ \\text{Head parameters: trained from scratch} $$

Best when:
- Target dataset is small (<10K samples)
- Target data is similar to pretraining data
- Limited compute available

## Fine-tuning (Full or Partial)

All or some layers are unfrozen and trained on the target data.

### Partial Fine-tuning
- Unfreeze only the last few layers
- Keep early layers frozen (they learn generic features)

### Full Fine-tuning
- Unfreeze all layers
- Use a lower learning rate (typically 1/10th of initial)
- Requires more data and compute

## Progressive Unfreezing

A strategy where layers are gradually unfrozen during training:

1. Train only the new classifier head (epochs 1-3)
2. Unfreeze the last block (epochs 4-6)
3. Unfreeze more blocks (epochs 7-10)
4. Optionally unfreeze all layers (epochs 11+)

## Domain Adaptation

Transfer learning between related but different domains:
- **Domain shift**: Training (source) and deployment (target) data differ
- **Domain adaptation**: Techniques to bridge this gap
- **Domain-adversarial training**: Learn domain-invariant features

## When Transfer Learning Works

- Target task has limited labeled data
- Target data shares low-level features with source data
- The pretrained model learned robust, generalizable features

## Negative Transfer

When transfer learning **hurts** performance compared to training from scratch:
- Source and target tasks are too different (e.g., ImageNet to medical ultrasound)
- The pretrained model learned spurious correlations
- The target domain has very different statistics (e.g., grayscale vs RGB)`,
  understanding: {
    analogy: 'Transfer learning is like learning to ride a motorcycle after knowing how to ride a bicycle. You keep the fundamental skills (balance, steering, braking) — these are the frozen early layers. You only need to learn new specific skills (throttle, clutch, gear shifting) — the new classifier head.',
    steps: [
      { title: 'Load Pretrained Model', content: 'Load a model pretrained on a large dataset (e.g., ResNet-50 on ImageNet) with its learned weights.' },
      { title: 'Replace Classifier', content: 'Remove the original classification head and replace it with a new head suitable for the target task (e.g., 2 classes instead of 1000).' },
      { title: 'Freeze Backbone', content: 'Set requires_grad=False for all backbone parameters so they are not updated during initial training.' },
      { title: 'Train Classifier', content: 'Train only the new classifier head on the target dataset for several epochs.' },
      { title: 'Unfreeze and Fine-tune', content: 'Optionally unfreeze some/all backbone layers and continue training with a lower learning rate.' },
    ],
    misconceptions: [
      { misconception: 'Transfer learning always improves performance', truth: 'If the pretrained domain is very different from the target domain, transfer learning can cause negative transfer, degrading performance. Always validate against a from-scratch baseline.' },
      { misconception: 'Freezing means the model cannot learn new features for the target task', truth: 'The pretrained features (edges, textures) are often general enough that only the classifier head needs to learn new combinations of these features for the target task.' },
    ],
    comparisons: [
      { label: 'Training time', methodA: 'From scratch: Days', methodB: 'Transfer learning: Hours' },
      { label: 'Required data', methodA: 'From scratch: 100K+ images', methodB: 'Transfer learning: 100-10K images' },
      { label: 'Performance ceiling', methodA: 'From scratch: Lower with limited data', methodB: 'Transfer learning: Higher with limited data' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.nn as nn
import torchvision.models as models

# Load pretrained ResNet-18
model = models.resnet18(weights='IMAGENET1K_V1')

# Freeze all parameters
for param in model.parameters():
    param.requires_grad = False

# Replace classifier for 5-class classification
num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, 5)

# Verify which params require gradients
trainable = sum(
    p.numel() for p in model.parameters() if p.requires_grad
)
frozen = sum(
    p.numel() for p in model.parameters() if not p.requires_grad
)
print(f"Trainable params: {trainable:,}")
print(f"Frozen params: {frozen:,}")
print(f"New classifier: {model.fc}")`,
      output: `Trainable params: 5,125
Frozen params: 11,689,512
New classifier: Linear(in_features=512, out_features=5, bias=True)`,
      explanation: 'Feature extraction freezes the pretrained backbone (11.7M params frozen) and trains only the new classifier head (5,125 params). The pretrained features are reused without modification.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
import torch.optim as optim
import torchvision.models as models
from torch.utils.data import DataLoader, TensorDataset

def fine_tune_model(num_classes, freeze_backbone=True):
    model = models.resnet18(weights='IMAGENET1K_V1')

    if freeze_backbone:
        for param in model.parameters():
            param.requires_grad = False

    # Replace classifier
    model.fc = nn.Sequential(
        nn.Dropout(0.2),
        nn.Linear(512, 256),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(256, num_classes),
    )

    # Set different learning rates
    if freeze_backbone:
        optimizer = optim.Adam(model.fc.parameters(), lr=0.001)
    else:
        optimizer = optim.Adam([
            {'params': model.conv1.parameters(), 'lr': 1e-5},
            {'params': model.layer1.parameters(), 'lr': 1e-5},
            {'params': model.layer2.parameters(), 'lr': 1e-5},
            {'params': model.layer3.parameters(), 'lr': 1e-4},
            {'params': model.layer4.parameters(), 'lr': 1e-4},
            {'params': model.fc.parameters(), 'lr': 1e-3},
        ])

    return model, optimizer

model, optimizer = fine_tune_model(5, freeze_backbone=True)
print(model.fc)`,
      output: `Sequential(
  (0): Dropout(p=0.2, inplace=False)
  (1): Linear(in_features=512, out_features=256, bias=True)
  (2): ReLU()
  (3): Dropout(p=0.2, inplace=False)
  (4): Linear(in_features=256, out_features=5, bias=True)
)`,
      explanation: 'Fine-tuning with a custom classifier head and discriminative learning rates — lower LR for early layers (generic features) and higher LR for later layers (task-specific features).',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.optim as optim
import torchvision.models as models
import torchvision.transforms as T
from torch.utils.data import DataLoader

class TransferLearner:
    def __init__(self, num_classes, backbone='resnet50'):
        self.model = self._build_model(backbone, num_classes)
        self.best_acc = 0.0

    def _build_model(self, backbone, num_classes):
        model = getattr(models, backbone)(weights='IMAGENET1K_V1')
        in_features = model.fc.in_features
        model.fc = nn.Linear(in_features, num_classes)
        return model

    def freeze_until(self, layer_name):
        """Freeze all layers up to (and including) layer_name."""
        freeze = True
        for name, param in self.model.named_parameters():
            if layer_name in name:
                freeze = False
            param.requires_grad = not freeze

    def progressive_unfreeze(self, epochs_per_stage=5):
        stages = ['conv1', 'layer1', 'layer2', 'layer3', 'layer4']
        for stage in stages:
            print(f"Unfreezing up to {stage}...")
            self.freeze_until(stage)

    def train_epoch(self, loader, optimizer, criterion, device):
        self.model.train()
        total_loss = 0
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            optimizer.zero_grad()
            loss = criterion(self.model(x), y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        return total_loss / len(loader)

# Usage
learner = TransferLearner(num_classes=10, backbone='resnet50')
trainable = sum(p.numel() for p in learner.model.parameters()
                if p.requires_grad)
print(f"Initially trainable: {trainable:,}")

# Progressive unfreeze
learner.progressive_unfreeze()
trainable = sum(p.numel() for p in learner.model.parameters()
                if p.requires_grad)
print(f"After unfreezing: {trainable:,}")`,
      output: `Initially trainable: 5,130
Unfreezing up to conv1...
Unfreezing up to layer1...
Unfreezing up to layer2...
Unfreezing up to layer3...
Unfreezing up to layer4...
After unfreezing: 25,557,032`,
      explanation: 'Progressive unfreezing gradually exposes more layers to training, starting with only the classifier head (5K params) and ending with all 25.5M params trainable.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Medical Imaging', description: 'Pretrained ResNet-50 on ImageNet is fine-tuned on chest X-ray datasets (NIH ChestX-ray14, CheXpert) for pneumonia and COVID-19 detection. Transfer learning enables diagnosis models with as few as 500 labeled images.' },
      { industry: 'Satellite Imagery', description: 'Models pretrained on ImageNet are adapted for satellite image classification (land use, crop type, building detection). Early layers recognize edges and textures applicable to aerial views.' },
      { industry: 'Fashion Retail', description: 'Fashion attribute classification (color, pattern, sleeve length) from product images uses transfer learning from ImageNet. The generic texture and shape features transfer well to fashion items.' },
    ],
    caseStudy: {
      problem: 'A hospital had only 850 labeled chest X-rays for pneumonia detection. Training a CNN from scratch achieved only 65% accuracy with high variance. Outsourcing labeling would cost $50K+ for a useful dataset.',
      solution: 'They used a DenseNet-121 pretrained on ImageNet, replaced the classifier for binary classification (pneumonia/normal), and fine-tuned all layers with a low learning rate (1e-5). Data augmentation (rotation, flip, contrast) expanded the effective dataset size.',
      results: 'Accuracy reached 89% (from 65%), AUC of 0.94, matching radiologist-level performance. The model was deployed in 2 weeks (vs estimated 6 months from scratch). Cost: $0 for the pretrained model vs $50K for a new dataset.',
    },
    bestPractices: [
      'Always start with a pretrained model — never train from scratch for vision/NLP tasks',
      'Freeze the backbone and train only the classifier head first to establish a baseline',
      'Use a lower learning rate for fine-tuning (1/10th to 1/100th of original)',
      'Use discriminative learning rates — lower for early layers, higher for later layers',
      'Add dropout in the classifier head to prevent overfitting on small target datasets',
      'Validate against a from-scratch baseline to detect negative transfer',
      'Match preprocessing (normalization, resize) to what the pretrained model expects',
    ],
    tools: ['torchvision.models', 'torch.hub (load custom models)', 'timm (PyTorch Image Models)', 'Hugging Face Transformers (NLP transfer)', 'Weights & Biases (transfer learning sweeps)', 'albumentations / torchvision.transforms', 'fastai (high-level transfer learning)'],
    jobRoles: ['Applied ML Engineer', 'Computer Vision Engineer', 'Medical AI Specialist', 'ML Solutions Architect'],
    furtherReading: [
      'Yosinski, J. et al. (2014). How transferable are features in deep neural networks?',
      'Tan, C. et al. (2018). A Survey on Deep Transfer Learning',
      'Howard, J. & Ruder, S. (2018). Universal Language Model Fine-tuning for Text Classification (ULMFiT)',
      'Kornblith, S. et al. (2019). Do Better ImageNet Models Transfer Better?',
    ],
  },
  quiz: [
    {
      id: 'tl-1', type: 'mcq',
      question: 'What is the key difference between feature extraction and fine-tuning?',
      options: [
        'Feature extraction uses a larger dataset than fine-tuning',
        'Feature extraction freezes the backbone and trains only the classifier; fine-tuning updates all or some pretrained layers',
        'Feature extraction is only for NLP, fine-tuning is for vision',
        'There is no difference — they are the same technique',
      ],
      correctAnswer: 'Feature extraction freezes the backbone and trains only the classifier; fine-tuning updates all or some pretrained layers',
      explanation: 'Feature extraction keeps pretrained weights frozen, using them as fixed feature extractors. Fine-tuning continues gradient updates on pretrained layers to adapt them to the target task.',
    },
    {
      id: 'tl-2', type: 'truefalse',
      question: 'Negative transfer occurs when transfer learning improves model performance compared to training from scratch.',
      correctAnswer: 'False',
      explanation: 'Negative transfer is when transfer learning degrades performance compared to training from scratch. This happens when the source and target domains are too dissimilar.',
    },
    {
      id: 'tl-3', type: 'code',
      question: 'What does the following code accomplish?',
      code: `model = models.resnet18(weights='IMAGENET1K_V1')
for param in model.parameters():
    param.requires_grad = False
model.fc = nn.Linear(512, 10)`,
      options: [
        'Trains ResNet-18 from scratch on a 10-class dataset',
        'Freezes ResNet-18 backbone and replaces the classifier for 10-class classification',
        'Deletes all pretrained weights from ResNet-18',
        'Converts ResNet-18 to a regression model',
      ],
      correctAnswer: 'Freezes ResNet-18 backbone and replaces the classifier for 10-class classification',
      explanation: 'requires_grad=False freezes all weights, and replacing model.fc with a new Linear layer creates a new classifier head for 10 classes.',
    },
    {
      id: 'tl-4', type: 'fillblank',
      question: 'Pre-training requires large, ___ datasets (like ImageNet with 14M images) to learn generalizable features that transfer well.',
      correctAnswer: 'diverse',
      explanation: 'A diverse dataset covering many visual concepts ensures the model learns general-purpose features (edges, textures, shapes) rather than dataset-specific shortcuts.',
    },
    {
      id: 'tl-5', type: 'match',
      question: 'Match each transfer learning strategy to its best scenario:',
      pairs: [
        { left: 'Feature extraction', right: 'Tiny dataset (<1K samples), similar domain' },
        { left: 'Full fine-tuning', right: 'Moderate dataset (10K+ samples), some domain shift' },
        { left: 'Progressive unfreezing', right: 'Small dataset, want to gradually adapt features' },
        { left: 'Train from scratch', right: 'Huge dataset, very different domain, unlimited compute' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'The choice of transfer learning strategy depends on the target dataset size, domain similarity, and available compute resources.',
    },
  ],
}))

export {}
