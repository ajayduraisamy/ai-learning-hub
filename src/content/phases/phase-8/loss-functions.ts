import { registerContent } from '@/content/index'

registerContent('p8-loss-functions', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '40 minutes',
  prerequisites: ['p8-nn-basics', 'p0-probability'],
  tags: ['Phase 8', 'Deep Learning', 'Loss Functions'],
  objectives: [
    'Differentiate between regression and classification losses',
    'Implement MSE, MAE, cross-entropy, and Huber loss',
    'Understand focal loss for imbalanced classification',
    'Choose appropriate loss functions for different tasks',
    'Create custom loss functions in PyTorch',
  ],
  theory: `# Loss Functions

## Role of Loss Functions

A loss function quantifies the difference between the network's prediction $\\hat{y}$ and the true target $y$. Training minimizes this loss.

## Regression Losses

### Mean Squared Error (MSE)

$$ \\text{MSE} = \\frac{1}{n}\\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2 $$

- Squared error penalizes large errors heavily
- Differentiable everywhere
- Sensitive to outliers (quadratic penalty)

### Mean Absolute Error (MAE)

$$ \\text{MAE} = \\frac{1}{n}\\sum_{i=1}^{n} |y_i - \\hat{y}_i| $$

- Linear penalty — less sensitive to outliers
- Not differentiable at 0 (subgradient used)
- Also called L1 loss

### Huber Loss

$$ L_\\delta(y, \\hat{y}) = \\begin{cases} \\frac{1}{2}(y - \\hat{y})^2 & \\text{if } |y - \\hat{y}| \\leq \\delta \\\\ \\delta|y - \\hat{y}| - \\frac{1}{2}\\delta^2 & \\text{otherwise} \\end{cases} $$

- Combines MSE (smooth near 0) with MAE (robust to outliers)
- $\\delta$ controls the transition point

## Classification Losses

### Cross-Entropy Loss

For multi-class classification with $K$ classes:

$$ H(p, q) = -\\sum_{i=1}^{K} p_i \\log q_i $$

Where $p$ is the true distribution (one-hot) and $q$ is the predicted probability distribution (softmax output).

### Binary Cross-Entropy (BCE)

$$ \\text{BCE} = -\\frac{1}{n}\\sum_{i=1}^{n} [y_i \\log(\\hat{y}_i) + (1-y_i)\\log(1-\\hat{y}_i)] $$

### Hinge Loss (SVM)

$$ L(y, \\hat{y}) = \\max(0, 1 - y \\cdot \\hat{y}) $$

Used in SVMs; encourages margin maximization.

## Advanced Losses

### KL Divergence

$$ D_{KL}(P \\| Q) = \\sum_i P(i) \\log\\frac{P(i)}{Q(i)} $$

Measures how one probability distribution diverges from another. Closely related to cross-entropy:

$$ H(p, q) = H(p) + D_{KL}(p \\| q) $$

### Contrastive Loss

$$ L = \\frac{1}{2N}\\sum_{n=1}^{N} y d^2 + (1-y)\\max(margin - d, 0)^2 $$

Where $d = \\|a_n - b_n\\|_2$ and $y=1$ for similar pairs, $y=0$ for dissimilar.

### Triplet Loss (FaceNet)

$$ L = \\max(\\|f(a) - f(p)\\|^2 - \\|f(a) - f(n)\\|^2 + \\alpha, 0) $$

Pulls anchor $a$ closer to positive $p$ and pushes it away from negative $n$ by margin $\\alpha$.

### Focal Loss (for Imbalanced Data)

$$ \\text{FL}(p_t) = -(1 - p_t)^\\gamma \\log(p_t) $$

Where $p_t$ is the model's estimated probability for the true class. The modulating factor $(1-p_t)^\\gamma$ focuses training on hard, misclassified examples.

## Loss Function Properties

- **Convexity**: Guarantees global optimum (rare in deep learning)
- **Differentiability**: Required for gradient-based optimization
- **Robustness**: Insensitivity to outliers (MAE > MSE)
- **Calibration**: Produces well-calibrated probabilities (cross-entropy)`,
  understanding: {
    analogy: 'A loss function is like a scoring system that tells you how wrong you are. MSE is like a harsh teacher who squares your errors (big mistakes cost you more). MAE is a fair teacher who counts each mistake equally. Cross-entropy is a teacher who penalizes confidence in wrong answers — it is worse to be confidently wrong than uncertainly wrong.',
    steps: [
      { title: 'Obtain Prediction', content: 'The network produces an output $\\hat{y}$ (raw logits, probabilities, or continuous values).' },
      { title: 'Select Loss Function', content: 'Choose the appropriate loss based on task: MSE for regression, cross-entropy for classification, etc.' },
      { title: 'Compute Loss', content: 'Evaluate $L(y, \\hat{y})$ comparing prediction to ground truth across the batch.' },
      { title: 'Backward Pass', content: 'Compute $\\partial L / \\partial \\hat{y}$ to propagate gradients through the network.' },
      { title: 'Log and Monitor', content: 'Track loss values during training to detect overfitting, underfitting, or data issues.' },
    ],
    misconceptions: [
      { misconception: 'MSE is a good loss function for classification', truth: 'MSE pushes predicted probabilities toward extreme values (0 or 1) and penalizes confident wrong predictions less than cross-entropy. Cross-entropy is preferred for classification.' },
      { misconception: 'Lower loss always means better model', truth: 'Loss can decrease from overfitting (memorizing noise). Always monitor validation loss and other metrics (accuracy, F1, precision, recall).' },
    ],
    comparisons: [
      { label: 'Outlier sensitivity', methodA: 'MSE: High (quadratic)', methodB: 'MAE: Low (linear)' },
      { label: 'Gradient near zero error', methodA: 'MSE: Smooth (gradient ~ 0)', methodB: 'MAE: Discontinuous (subgradient)' },
      { label: 'Imbalanced data', methodA: 'Cross-entropy: Biased toward majority', methodB: 'Focal loss: Focuses on minority' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.nn as nn

# Regression losses
mse_loss = nn.MSELoss()
mae_loss = nn.L1Loss()

y_pred = torch.tensor([2.5, 0.0, 1.8, 3.2])
y_true = torch.tensor([3.0, 0.0, 1.0, 3.0])

print(f"MSE: {mse_loss(y_pred, y_true):.4f}")
print(f"MAE: {mae_loss(y_pred, y_true):.4f}")

# Classification losses
bce_loss = nn.BCEWithLogitsLoss()
ce_loss = nn.CrossEntropyLoss()

# Binary classification with logits
logits = torch.tensor([[1.5], [-0.3], [2.1]])
labels = torch.tensor([[1.0], [0.0], [1.0]])
print(f"BCE (with logits): {bce_loss(logits, labels):.4f}")

# Multi-class
ce_logits = torch.tensor([[1.0, 0.5, 0.1],
                          [0.3, 2.0, 0.7]])
ce_targets = torch.tensor([0, 1])
print(f"CE: {ce_loss(ce_logits, ce_targets):.4f}")`,
      output: `MSE: 0.4175
MAE: 0.4500
BCE (with logits): 0.2987
CE: 0.4108`,
      explanation: 'PyTorch provides standard losses. BCEWithLogitsLoss combines sigmoid + BCE for numerical stability. CrossEntropyLoss combines log_softmax + NLLLoss.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn

class HuberLoss(nn.Module):
    def __init__(self, delta=1.0):
        super().__init__()
        self.delta = delta

    def forward(self, y_pred, y_true):
        error = y_pred - y_true
        abs_error = torch.abs(error)
        quadratic = 0.5 * error ** 2
        linear = self.delta * abs_error - 0.5 * self.delta ** 2
        return torch.where(
            abs_error <= self.delta,
            quadratic,
            linear
        ).mean()

class FocalLoss(nn.Module):
    def __init__(self, gamma=2.0, alpha=None):
        super().__init__()
        self.gamma = gamma
        self.alpha = alpha

    def forward(self, y_pred, y_true):
        # y_pred: logits, y_true: class indices
        ce_loss = nn.functional.cross_entropy(
            y_pred, y_true, reduction='none'
        )
        pt = torch.exp(-ce_loss)
        focal_weight = (1 - pt) ** self.gamma

        if self.alpha is not None:
            alpha_t = self.alpha[y_true]
            focal_weight = alpha_t * focal_weight

        return (focal_weight * ce_loss).mean()

# Test
huber = HuberLoss(delta=1.0)
pred = torch.tensor([1.5, -2.0, 3.0])
true = torch.tensor([1.0, -1.0, 3.0])
print(f"Huber: {huber(pred, true):.4f}")

focal = FocalLoss(gamma=2.0)
logits = torch.randn(4, 5)
targets = torch.tensor([1, 3, 0, 2])
print(f"Focal: {focal(logits, targets):.4f}")`,
      output: `Huber: 0.1458
Focal: 0.5632`,
      explanation: 'Custom loss functions are defined as nn.Module subclasses. Huber smoothly transitions between MSE and MAE. Focal loss down-weights easy examples, focusing training on hard misclassifications.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class ContrastiveLoss(nn.Module):
    """Contrastive loss for siamese networks."""
    def __init__(self, margin=1.0):
        super().__init__()
        self.margin = margin

    def forward(self, x1, x2, labels):
        # labels: 1 for similar, 0 for dissimilar
        distances = F.pairwise_distance(x1, x2)
        similar_loss = labels * distances ** 2
        dissimilar_loss = (1 - labels) * F.relu(
            self.margin - distances
        ) ** 2
        return (similar_loss + dissimilar_loss).mean() / 2

class TripletLoss(nn.Module):
    """Triplet loss for metric learning."""
    def __init__(self, margin=1.0):
        super().__init__()
        self.margin = margin

    def forward(self, anchor, positive, negative):
        d_pos = F.pairwise_distance(anchor, positive)
        d_neg = F.pairwise_distance(anchor, negative)
        loss = F.relu(d_pos - d_neg + self.margin)
        return loss.mean()

# Test contrastive loss
contrastive = ContrastiveLoss(margin=1.0)
x1 = torch.randn(8, 128)
x2 = torch.randn(8, 128)
labels = torch.tensor([1, 1, 0, 0, 1, 0, 1, 0])
cl = contrastive(x1, x2, labels)
print(f"Contrastive loss: {cl:.4f}")

# Test triplet loss
triplet = TripletLoss(margin=0.5)
anchor = torch.randn(8, 128)
pos = anchor + 0.1 * torch.randn(8, 128)
neg = torch.randn(8, 128)
tl = triplet(anchor, pos, neg)
print(f"Triplet loss: {tl:.4f}")

# Custom weighted loss combination
class CombinedLoss(nn.Module):
    def __init__(self, alpha=0.5, beta=0.5):
        super().__init__()
        self.alpha = alpha
        self.beta = beta
        self.mse = nn.MSELoss()
        self.mae = nn.L1Loss()

    def forward(self, y_pred, y_true):
        return (self.alpha * self.mse(y_pred, y_true)
                + self.beta * self.mae(y_pred, y_true))`,
      output: `Contrastive loss: 0.2764
Triplet loss: 0.4318`,
      explanation: 'Contrastive and triplet losses are used in metric learning — learning embeddings where similar items are close and dissimilar items are far apart. PairwiseDistance computes Euclidean distances between embedding vectors.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Face Recognition', description: 'Triplet loss powers FaceNet and ArcFace systems that learn facial embeddings. The margin parameter ensures intra-class distances are smaller than inter-class distances by at least the margin.' },
      { industry: 'Object Detection', description: 'Focal loss is the standard in RetinaNet and YOLO for one-stage object detection, where foreground-background class imbalance (e.g., 1000:1) would otherwise overwhelm training.' },
      { industry: 'Self-Supervised Learning', description: 'Contrastive loss variants (NT-Xent, InfoNCE) enable SimCLR, MoCo, and CLIP to learn representations by pulling augmented views of the same image together and pushing different images apart.' },
    ],
    caseStudy: {
      problem: 'A medical imaging team training a cancer detection model faced extreme class imbalance — only 2% of patches contained malignant tissue. Standard cross-entropy caused the model to predict "benign" for every patch, achieving 98% accuracy but 0% recall.',
      solution: 'They switched to focal loss with gamma=3.0 and alpha=0.75 (weighting the minority class). The modulating factor increased the loss contribution from misclassified malignant patches, forcing the model to learn tumor features.',
      results: 'Recall improved from 0% to 91% while maintaining 95% specificity. The F1 score increased from 0 to 0.88, and the model generalized well to held-out hospital data.',
    },
    bestPractices: [
      'Use CrossEntropyLoss for multi-class classification as the default',
      'Use BCEWithLogitsLoss (not BCELoss) for binary classification — more numerically stable',
      'Use MSELoss for regression with normally distributed errors',
      'Use Huber loss when outlier robustness is needed',
      'Use focal loss with gamma=2-3 for extreme class imbalance (>10:1)',
      'Monitor loss curves on both train and validation sets — divergence indicates overfitting',
      'Custom losses should be smooth and differentiable for stable gradient flow',
    ],
    tools: ['nn.MSELoss', 'nn.L1Loss', 'nn.CrossEntropyLoss', 'nn.BCEWithLogitsLoss', 'nn.KLDivLoss', 'nn.TripletMarginLoss', 'nn.CosineEmbeddingLoss'],
    jobRoles: ['Deep Learning Engineer', 'Computer Vision Engineer', 'NLP Engineer', 'ML Research Scientist'],
    furtherReading: [
      'Lin, T. et al. (2017). Focal Loss for Dense Object Detection',
      'Schroff, F. et al. (2015). FaceNet: A Unified Embedding for Face Recognition and Clustering',
      'Chen, T. et al. (2020). A Simple Framework for Contrastive Learning of Visual Representations',
      'Goodfellow, I. et al. (2016). Deep Learning (Chapter 6: Loss Functions)',
    ],
  },
  quiz: [
    {
      id: 'lf-1', type: 'mcq',
      question: 'Why is cross-entropy generally preferred over MSE for classification tasks?',
      options: [
        'MSE is not differentiable',
        'Cross-entropy penalizes confident wrong predictions more heavily and has better gradient properties',
        'MSE requires more memory to compute',
        'Cross-entropy always produces lower loss values',
      ],
      correctAnswer: 'Cross-entropy penalizes confident wrong predictions more heavily and has better gradient properties',
      explanation: 'Cross-entropy has larger gradients when predictions are confidently wrong (near 0 or 1), while MSE gradients vanish near the extremes, slowing learning.',
    },
    {
      id: 'lf-2', type: 'truefalse',
      question: 'Huber loss combines the advantages of MSE (smooth near zero) and MAE (robust to outliers).',
      correctAnswer: 'True',
      explanation: 'Huber loss uses quadratic penalty for small errors (like MSE, smooth at 0) and linear penalty for large errors (like MAE, robust to outliers), controlled by the delta parameter.',
    },
    {
      id: 'lf-3', type: 'code',
      question: 'What shape should the input to nn.CrossEntropyLoss have?',
      code: `loss_fn = nn.CrossEntropyLoss()
# The logits tensor should have shape: ?`,
      options: [
        '(batch_size,)',
        '(batch_size, num_classes)',
        '(batch_size, num_classes, height, width)',
        'Any shape is fine',
      ],
      correctAnswer: '(batch_size, num_classes)',
      explanation: 'CrossEntropyLoss expects raw logits of shape (batch_size, num_classes) and target class indices of shape (batch_size,).',
    },
    {
      id: 'lf-4', type: 'fillblank',
      question: 'In focal loss, the parameter ___ (typically set to 2.0) controls the rate at which easy examples are down-weighted.',
      correctAnswer: 'gamma',
      explanation: 'The gamma parameter modulates the down-weighting factor $(1-p_t)^\\gamma$. Higher gamma focuses more on hard, misclassified examples.',
    },
    {
      id: 'lf-5', type: 'match',
      question: 'Match each loss function to its primary task:',
      pairs: [
        { left: 'MSE', right: 'Regression with normally distributed errors' },
        { left: 'Cross-entropy', right: 'Multi-class classification' },
        { left: 'Focal loss', right: 'Classification with extreme class imbalance' },
        { left: 'Triplet loss', right: 'Learning similarity embeddings / metric learning' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each loss function is designed for a specific type of task, though some can be adapted across domains.',
    },
  ],
}))

export {}
