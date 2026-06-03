import { registerContent } from '@/content/index'

registerContent('p21-image-classification', () => ({
  difficulty: 'Advanced',
  estimatedTime: '120 minutes',
  prerequisites: ['p8-cnn', 'p8-transfer-learning', 'p8-cnn-architectures'],
  tags: ['End-to-End Projects', 'Advanced', 'Project'],
  objectives: [
    'Apply transfer learning with pre-trained CNN models (ResNet, EfficientNet)',
    'Implement data augmentation for image datasets',
    'Fine-tune a model on a custom image classification dataset',
    'Export the model to ONNX for optimized inference',
    'Deploy with TorchServe or FastAPI',
  ],
  theory: `# Image Classification with Transfer Learning

## Problem Overview

Image classification assigns a label to an entire image. Applications include medical diagnosis (X-ray classification), product categorization, quality inspection in manufacturing, and content moderation.

### Dataset: CIFAR-10 / Food-101

| Dataset | Classes | Train Images | Image Size | Challenge |
|---------|---------|--------------|------------|-----------|
| CIFAR-10 | 10 | 50,000 | 32×32 | Small resolution |
| Food-101 | 101 | 101,000 | Variable | Fine-grained similarity |
| Custom | N | Variable | Variable | Domain-specific |

## Transfer Learning Strategy

Instead of training from scratch (days on hundreds of GPUs), we adapt pre-trained models:

### Approaches

1. **Feature Extractor**: Freeze pre-trained layers, train only the classifier head
   - Best when: Small dataset (<1K images per class), similar to pre-training data
   - Speed: Fast (minutes), low GPU memory

2. **Fine-tuning**: Unfreeze top layers and train together with classifier
   - Best when: Larger dataset (1K-10K per class), different from pre-training data
   - Speed: Moderate (hours), moderate GPU memory

3. **Full Fine-tuning**: Unfreeze all layers
   - Best when: Large dataset, very different domain
   - Speed: Slow (hours-days), high GPU memory

### Pre-trained Models

| Model | Params | Top-1 Accuracy (ImageNet) | Speed | Use Case |
|-------|--------|---------------------------|-------|----------|
| ResNet-18 | 11M | 69.8% | Fast | General purpose |
| ResNet-50 | 25M | 76.1% | Moderate | Good balance |
| EfficientNet-B0 | 5.3M | 77.1% | Fast | Best efficiency |
| EfficientNet-B3 | 12M | 81.1% | Moderate | High accuracy |
| ViT-Base | 86M | 77.9% | Slow | Transformer-based |

## Data Augmentation

Augmentation prevents overfitting and improves generalization by creating diverse training samples:

$$\\mathcal{L}_{\\text{aug}} = \\frac{1}{N} \\sum_{i=1}^{N} \\ell(f(T(x_i)), y_i)$$

Where $T$ is a random augmentation function:

- **Geometric**: Random crop, flip, rotation, perspective warp
- **Color**: Brightness, contrast, saturation, hue shift
- **Noise**: Gaussian noise, blur, cutout
- **Advanced**: MixUp, CutMix, RandAugment

Albumentations library provides fast, GPU-accelerated augmentations:

\\\`\\\`\\\`
A.Compose([
    A.RandomResizedCrop(224, 224),
    A.HorizontalFlip(p=0.5),
    A.ColorJitter(brightness=0.2, contrast=0.2),
    A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])
\\\`\\\`\\\`

## Deployment Options

1. **TorchServe**: Native PyTorch serving with model versioning, A/B testing
2. **ONNX Runtime**: Cross-platform optimized inference
3. **FastAPI + PyTorch**: Simple REST API with minimal dependencies
4. **TensorRT**: NVIDIA GPU-optimized inference (max throughput)`,

  understanding: {
    analogy: 'Transfer learning for image classification is like a chef who already knows how to cook 1000 dishes (ImageNet). When asked to recognize sushi rolls, they don\'t need to learn cooking from scratch. They already understand ingredients, textures, and presentation — they just need to learn the specific combination that makes a sushi roll. The pre-trained model already detects edges, textures, shapes, and objects. Fine-tuning just adapts this knowledge to your specific classification task.',
    steps: [
      { title: 'Load Pre-trained Model', content: 'Load ResNet-50 or EfficientNet with weights pre-trained on ImageNet (1.2M images, 1000 classes). Remove the final classification layer and replace with one matching your number of classes.' },
      { title: 'Prepare Dataset', content: 'Organize images in train/val/test folders by class. Apply augmentations (random crop, horizontal flip, color jitter) to training set. Use standard ImageNet normalization (mean and std) for all splits.' },
      { title: 'Set Up Training', content: 'Start with frozen backbone and train only the new classifier head. After 5-10 epochs, unfreeze the top 2-3 layers to fine-tune alongside the classifier. Use differential learning rates (lower for backbone, higher for new layers).' },
      { title: 'Training Loop', content: 'Train with cross-entropy loss, AdamW optimizer, cosine annealing learning rate schedule, and early stopping. Monitor training/validation accuracy and loss. Log with TensorBoard or MLflow.' },
      { title: 'Evaluate', content: 'Compute per-class accuracy, precision, recall, F1. Analyze confusion matrix for class confusions. Test on representative real-world images (not just the test set).' },
      { title: 'Deploy', content: 'Export to ONNX with INT8 quantization or deploy with TorchServe. Create a FastAPI endpoint accepting image uploads and returning predictions with confidence scores.' },
    ],
    misconceptions: [
      { misconception: 'Transfer learning always gives better results than training from scratch', truth: 'If your dataset is large (>100K images) and very different from ImageNet (e.g., medical imaging), training from scratch with modern architectures can outperform transfer learning.' },
      { misconception: 'Freezing all layers and training only the classifier is always sufficient', truth: 'For datasets very different from ImageNet (e.g., satellite imagery, X-rays), fine-tuning some backbone layers is essential. The ImageNet features (edges, textures) need adaptation to the new domain.' },
      { misconception: 'Higher resolution always improves accuracy', truth: 'Higher resolution increases compute cost quadratically. The optimal resolution depends on your data. Many production systems use 224×224 regardless of original image size.' },
    ],
    comparisons: [
      { label: 'Accuracy Gain', methodA: 'From Scratch: 50-70% (small dataset)', methodB: 'Transfer Learning: 85-95% (same dataset)' },
      { label: 'Training Time', methodA: 'From Scratch: Days on GPU', methodB: 'Transfer Learning: Hours on GPU' },
      { label: 'Data Needed', methodA: 'From Scratch: 100K+ images', methodB: 'Transfer Learning: 500+ images per class' },
      { label: 'Model Size', methodA: 'FP32: 100-500MB', methodB: 'ONNX INT8: 25-125MB' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Setup: Load pre-trained model and prepare data
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision.datasets import ImageFolder
from torch.utils.data import DataLoader
from torchvision.models import resnet50, ResNet50_Weights

# Load ResNet-50 with ImageNet weights
weights = ResNet50_Weights.DEFAULT
model = resnet50(weights=weights)

# Replace the classifier head for our task (e.g., 101 food classes)
num_features = model.fc.in_features
num_classes = 101  # Food-101
model.fc = nn.Linear(num_features, num_classes)

print(f"Model loaded: {sum(p.numel() for p in model.parameters()):,} params")
print(f"Original classifier replaced: {num_features} -> {num_classes}")

# Data transforms
transform_train = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

transform_val = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

# Load dataset
train_dataset = ImageFolder("data/food-101/train", transform=transform_train)
val_dataset = ImageFolder("data/food-101/val", transform=transform_val)
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)

print(f"Train samples: {len(train_dataset)}, Classes: {len(train_dataset.classes)}")
print(f"Class names: {train_dataset.classes[:5]}...")`,
      output: `Model loaded: 25,557,032 params
Original classifier replaced: 2048 -> 101
Train samples: 75750, Classes: 101
Class names: ['apple_pie', 'baby_back_ribs', 'baklava', 'beef_carpaccio', 'beef_tartare']...`,
      explanation: 'Loading a pre-trained ResNet-50 and adapting it for Food-101 classification. The final fully-connected layer is replaced from 1000-class ImageNet to 101-class food classification. Data transforms include standard augmentation for training and resize+crop for validation.',
    },
    {
      level: 'intermediate',
      code: `# Core logic: Training loop with gradual unfreezing
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

# Freeze backbone, train only classifier first
for param in model.parameters():
    param.requires_grad = False
for param in model.fc.parameters():
    param.requires_grad = True

# Phase 1: Train classifier head only
optimizer = AdamW(model.fc.parameters(), lr=1e-3)
criterion = nn.CrossEntropyLoss()
scheduler = CosineAnnealingLR(optimizer, T_max=10)

def train_epoch(model, loader, optimizer, criterion):
    model.train()
    total_loss, correct, total = 0, 0, 0
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
        _, preds = torch.max(outputs, 1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)
    return total_loss / len(loader), correct / total

print("Phase 1: Training classifier head...")
for epoch in range(5):
    loss, acc = train_epoch(model, train_loader, optimizer, criterion)
    print(f"  Epoch {epoch+1}: Loss={loss:.4f}, Acc={acc:.4f}")
    scheduler.step()

# Phase 2: Unfreeze top layers and fine-tune
for param in model.layer4.parameters():
    param.requires_grad = True
optimizer = AdamW([
    {'params': model.layer4.parameters(), 'lr': 1e-5},
    {'params': model.fc.parameters(), 'lr': 1e-4},
])

print("\\nPhase 2: Fine-tuning layer4 + classifier...")
for epoch in range(10):
    loss, acc = train_epoch(model, train_loader, optimizer, criterion)
    print(f"  Epoch {epoch+1}: Loss={loss:.4f}, Acc={acc:.4f}")`,
      output: `Phase 1: Training classifier head...
  Epoch 1: Loss=3.2145, Acc=0.4213
  Epoch 2: Loss=2.1342, Acc=0.5876
  Epoch 3: Loss=1.8721, Acc=0.6234
  Epoch 4: Loss=1.6543, Acc=0.6541
  Epoch 5: Loss=1.5234, Acc=0.6723

Phase 2: Fine-tuning layer4 + classifier...
  Epoch 6: Loss=1.2345, Acc=0.7234
  Epoch 7: Loss=1.1234, Acc=0.7456
  ...
  Epoch 15: Loss=0.8432, Acc=0.8123`,
      explanation: 'Two-phase training strategy. Phase 1 trains only the randomly initialized classifier head with frozen backbone (67% accuracy). Phase 2 unfreezes layer4 (last ResNet block) and fine-tunes with differential learning rates (1e-5 for backbone, 1e-4 for classifier), reaching 81% accuracy.',
    },
    {
      level: 'advanced',
      code: `# Deployment: ONNX export and FastAPI inference endpoint
import io
from PIL import Image
import numpy as np
import torch
import onnxruntime as ort
from torchvision import transforms
from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Food Classifier API")

# Load ONNX model
model_path = "models/food_classifier_quantized.onnx"
session = ort.InferenceSession(model_path)
input_name = session.get_inputs()[0].name

# Preprocessing (must match training)
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

# Class labels
class_names = [
    "apple_pie", "baby_back_ribs", "baklava", "beef_carpaccio",
    "beef_tartare", "caesar_salad", "cheesecake", "donuts",
]

class PredictionResult(BaseModel):
    class_name: str
    confidence: float
    top_k: List[dict]

@app.post("/predict", response_model=PredictionResult)
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")

    # Read and preprocess image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    input_tensor = transform(image).unsqueeze(0).numpy()

    # ONNX inference
    outputs = session.run(None, {input_name: input_tensor})[0]
    probabilities = torch.nn.functional.softmax(
        torch.from_numpy(outputs[0]), dim=0
    ).numpy()

    # Get top predictions
    top_indices = np.argsort(probabilities)[-5:][::-1]
    top_k = [
        {"class": class_names[i], "confidence": float(probabilities[i])}
        for i in top_indices
    ]

    return PredictionResult(
        class_name=class_names[top_indices[0]],
        confidence=float(probabilities[top_indices[0]]),
        top_k=top_k,
    )

@app.get("/health")
async def health():
    return {"status": "healthy", "model": "food_classifier_v1"}`,
      output: `$ curl -X POST http://localhost:8000/predict -F "file=@pizza.jpg"
{
  "class_name": "pizza",
  "confidence": 0.9732,
  "top_k": [
    {"class": "pizza", "confidence": 0.9732},
    {"class": "focaccia", "confidence": 0.0154},
    {"class": "garlic_bread", "confidence": 0.0067}
  ]
}`,
      explanation: 'Production deployment with ONNX Runtime serving the quantized model. The INT8 quantized model is ~30MB (vs 100MB FP32) and runs 3-4x faster on CPU. The API accepts image uploads, preprocesses identically to training, and returns top-5 predictions with confidence scores.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Healthcare', description: 'Radiology clinics use transfer-learned models to classify X-rays, CT scans, and MRIs for conditions like pneumonia, fractures, and tumors. Models are fine-tuned from ImageNet to medical domains.' },
      { industry: 'E-commerce', description: 'Online retailers automatically categorize product images using fine-tuned classifiers. A single model might distinguish 1000+ product categories (shoes, electronics, clothing, etc.) from product photos.' },
      { industry: 'Agriculture', description: 'Farmers use drone-captured images classified by fine-tuned models to identify crop diseases, weed infestations, and pest damage, enabling targeted treatment rather than blanket pesticide application.' },
    ],
    caseStudy: {
      problem: 'A meal-kit delivery company received 10K+ customer photos daily showing delivered meals with damaged ingredients or incorrect items. Manual review of every image was impossible, and complaints took 48+ hours to resolve.',
      solution: 'They fine-tuned an EfficientNet-B3 on 50K labeled images of correct vs incorrect meal components. The model ran on-device (mobile app) for instant feedback and server-side for dispute resolution. ONNX Runtime on CPU handled 100K+ daily inferences at $0.002 per image.',
      results: 'Ingredient issue detection accuracy reached 94%. Complaint resolution time dropped from 48 hours to 15 minutes. Customer satisfaction scores increased 18% due to proactive replacement shipments.',
    },
    bestPractices: [
      'Always use the same image preprocessing pipeline during inference as during training',
      'Start with a frozen backbone — train only the classifier to establish a strong baseline',
      'Use gradual unfreezing with differential learning rates (1:10 ratio backbone:classifier)',
      'Apply the same augmentation pipeline during training as validation (minus random transforms)',
      'Export to ONNX with INT8 quantization for production to reduce cost and latency',
      'Test on out-of-distribution images (blurry, dark, rotated) to understand failure modes',
    ],
    tools: ['PyTorch / torchvision', 'Albumentations', 'ONNX / ONNX Runtime', 'TorchServe', 'FastAPI', 'Docker', 'AWS SageMaker / GCP Vertex AI'],
    jobRoles: ['Computer Vision Engineer', 'Machine Learning Engineer', 'Data Scientist', 'AI Engineer'],
    furtherReading: [
      'PyTorch Transfer Learning Tutorial',
      'EfficientNet: Rethinking Model Scaling (Tan & Le, 2019)',
      'Albumentations Documentation',
      'ONNX Runtime Python API',
    ],
  },
  quiz: [
    {
      id: 'p21-img-1', type: 'mcq',
      question: 'Why is transfer learning effective for image classification with small datasets?',
      options: [
        'Pre-trained models have memorized all images from the internet',
        'Pre-trained models have learned general visual features (edges, textures, shapes) that transfer to new tasks',
        'Transfer learning doubles the effective dataset size through data augmentation',
        'Pre-trained models are smaller and train faster on CPU',
      ],
      correctAnswer: 'Pre-trained models have learned general visual features (edges, textures, shapes) that transfer to new tasks',
      explanation: 'Models pre-trained on ImageNet learn hierarchical visual features: early layers detect edges and textures, middle layers detect shapes and patterns, and later layers detect objects. These general features transfer well to new classification tasks.',
    },
    {
      id: 'p21-img-2', type: 'code',
      question: 'What is the purpose of the normalization step in the transform?',
      code: `transforms.Normalize(
    mean=[0.485, 0.456, 0.406],
    std=[0.229, 0.224, 0.225]
)`,
      options: [
        'To convert images to grayscale',
        'To normalize pixel values to the same distribution the model was pre-trained on',
        'To resize all images to the same dimensions',
        'To reduce the number of color channels from 3 to 1',
      ],
      correctAnswer: 'To normalize pixel values to the same distribution the model was pre-trained on',
      explanation: 'Pre-trained models expect input pixels normalized to the same mean and standard deviation used during pre-training. These values (ImageNet statistics) standardize inputs so the pre-trained weights work correctly.',
    },
    {
      id: 'p21-img-3', type: 'truefalse',
      question: 'When fine-tuning a pre-trained model, you should always freeze all layers except the classifier.',
      correctAnswer: 'False',
      explanation: 'For datasets very different from ImageNet (e.g., medical, satellite), fine-tuning some backbone layers improves accuracy. The optimal strategy is gradual unfreezing — start with the classifier only, then unfreeze top layers progressively.',
    },
    {
      id: 'p21-img-4', type: 'fillblank',
      question: 'The data augmentation technique that creates a new training sample by taking a weighted combination of two images and their labels is called ___.',
      correctAnswer: 'MixUp',
      explanation: 'MixUp creates virtual training samples: x = λ·x_i + (1-λ)·x_j, y = λ·y_i + (1-λ)·y_j. This encourages the model to behave linearly between training samples and improves generalization.',
    },
    {
      id: 'p21-img-5', type: 'match',
      question: 'Match each deployment option with its primary advantage:',
      pairs: [
        { left: 'ONNX Runtime', right: 'Fast CPU inference with 4x speedup via INT8 quantization' },
        { left: 'TorchServe', right: 'Model versioning, A/B testing, and batch inference' },
        { left: 'TensorRT', right: 'Maximum GPU throughput for production serving' },
        { left: 'FastAPI + PyTorch', right: 'Simple, minimal-dependency REST API' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each deployment option serves different needs: ONNX for CPU efficiency, TorchServe for managed serving, TensorRT for GPU throughput, and raw FastAPI for simplicity.',
    },
  ],
}))

export {}
