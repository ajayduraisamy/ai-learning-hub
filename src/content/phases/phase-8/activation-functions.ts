import { registerContent } from '@/content/index'

registerContent('p8-activation-functions', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '40 minutes',
  prerequisites: ['p8-nn-basics', 'p0-calculus'],
  tags: ['Phase 8', 'Deep Learning', 'Activation Functions'],
  objectives: [
    'Understand the role of activation functions in neural networks',
    'Compare sigmoid, tanh, ReLU and their variants mathematically',
    'Implement activation functions in numpy and PyTorch',
    'Explain vanishing gradient and dying ReLU problems',
    'Choose appropriate activation functions for different layers',
  ],
  theory: `# Activation Functions

## Purpose of Activation Functions

Activation functions introduce **non-linearity** into neural networks. Without them, a multi-layer network would collapse into an equivalent single-layer linear transformation, losing all expressive power.

An activation function $\\phi$ is applied to the weighted sum of inputs:

$$ a = \\phi(z) = \\phi(w^T x + b) $$

## Sigmoid

$$ \\sigma(x) = \\frac{1}{1 + e^{-x}} $$

- Output range: $(0, 1)$ — interpretable as probability
- Smooth, differentiable
- **Vanishing gradient**: gradients approach 0 for large $|x|$, slowing learning
- Historically popular, now rarely used in hidden layers

## Tanh (Hyperbolic Tangent)

$$ \\tanh(x) = \\frac{e^x - e^{-x}}{e^x + e^{-x}} = 2\\sigma(2x) - 1 $$

- Output range: $(-1, 1)$ — zero-centered (helps optimization)
- Still suffers from vanishing gradient
- Often used in RNNs and LSTMs

## ReLU (Rectified Linear Unit)

$$ f(x) = \\max(0, x) $$

- Output range: $[0, \\infty)$
- **Computationally efficient**: simple comparison
- **Non-saturating**: no vanishing gradient for positive inputs
- **Sparsity**: activates only a subset of neurons at a time
- **Dying ReLU**: neurons can get stuck outputting 0 for all inputs if gradients push weights into negative territory

## Leaky ReLU

$$ f(x) = \\begin{cases} x & \\text{if } x > 0 \\\\ \\alpha x & \\text{otherwise} \\end{cases} $$

- Small slope $\\alpha$ (typically 0.01) for negative inputs
- Mitigates dying ReLU problem
- **Parametric ReLU (PReLU)** learns $\\alpha$ during training

## ELU (Exponential Linear Unit)

$$ f(x) = \\begin{cases} x & \\text{if } x > 0 \\\\ \\alpha(e^x - 1) & \\text{otherwise} \\end{cases} $$

- Smooth transition near 0 (unlike ReLU/Leaky ReLU)
- Negative values push mean activation toward 0 (faster learning)
- More computationally expensive than ReLU

## GELU (Gaussian Error Linear Unit)

$$ \\text{GELU}(x) = x \\cdot \\Phi(x) $$

Where $\\Phi(x)$ is the CDF of the standard normal distribution. Commonly approximated as:

$$ \\text{GELU}(x) \\approx 0.5x \\left(1 + \\tanh\\left(\\sqrt{\\frac{2}{\\pi}}(x + 0.044715x^3)\\right)\\right) $$

- Used in BERT, GPT, and other transformer models
- Smooth, non-monotonic, probabilistic gating

## Swish / SiLU (Sigmoid Linear Unit)

$$ \\text{Swish}(x) = x \\cdot \\sigma(x) = \\frac{x}{1 + e^{-x}} $$

- Discovered through neural architecture search (Ramachandran et al., 2017)
- Smooth, non-monotonic, unbounded above, bounded below
- Outperforms ReLU on many deep networks

## Output Layer Activations

| Task | Activation | Output Range |
|------|-----------|--------------|
| Binary classification | Sigmoid | $(0, 1)$ |
| Multi-class classification | Softmax | $(0, 1)$, sums to 1 |
| Regression (unbounded) | None / Linear | $(-\\infty, \\infty)$ |
| Regression (positive) | ReLU / Softplus | $(0, \\infty)$ |

**Softmax**: $\\text{softmax}(x_i) = \\frac{e^{x_i}}{\\sum_j e^{x_j}}$ for $i = 1, ..., K$`,
  understanding: {
    analogy: 'Activation functions are like gates that control signal flow through the network. Sigmoid is a gentle dimmer switch, ReLU is a gate that lets positive signals pass fully but blocks negative ones completely, and Leaky ReLU is a gate with a small crack for negative signals. Swish is an adaptive gate that adjusts based on the signal strength.',
    steps: [
      { title: 'Weighted Sum', content: 'Compute $z = w^T x + b$, a linear combination of inputs with learned weights.' },
      { title: 'Apply Activation', content: 'Pass $z$ through $\\phi(z)$ to introduce non-linearity. Different functions produce different transformation shapes.' },
      { title: 'Forward Propagation', content: 'The activated output $a = \\phi(z)$ is passed to the next layer as input.' },
      { title: 'Gradient Flow (Backward)', content: 'During backpropagation, $\\phi\'(z)$ multiplies the gradient. Large or zero derivatives affect learning speed.' },
      { title: 'Output Interpretation', content: 'The final layer\'s activation (softmax, sigmoid, linear) determines how outputs are interpreted as predictions.' },
    ],
    misconceptions: [
      { misconception: 'ReLU is always the best activation function', truth: 'While ReLU is an excellent default, it can cause dead neurons. For very deep networks or specific architectures, GELU, Swish, or ELU may perform better. The choice depends on the task.' },
      { misconception: 'Sigmoid and tanh are interchangeable', truth: 'Tanh is zero-centered (outputs range -1 to 1), while sigmoid outputs 0 to 1. Tanh generally works better in hidden layers because zero-centered activations help mitigate gradient issues.' },
    ],
    comparisons: [
      { label: 'Vanishing gradient risk', methodA: 'Sigmoid/Tanh: High (saturating)', methodB: 'ReLU/Swish: Low (non-saturating)' },
      { label: 'Computational cost', methodA: 'ReLU: Minimal (max op)', methodB: 'Swish/GELU: Higher (exponential/tanh)' },
      { label: 'Zero-centered', methodA: 'Tanh: Yes', methodB: 'ReLU/Sigmoid: No' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def tanh(x):
    return np.tanh(x)

def relu(x):
    return np.maximum(0, x)

def leaky_relu(x, alpha=0.01):
    return np.where(x > 0, x, alpha * x)

# Test on sample input
x = np.array([-3.0, -1.0, 0.0, 1.0, 3.0])
print(f"x:            {x}")
print(f"Sigmoid:      {sigmoid(x).round(4)}")
print(f"Tanh:         {tanh(x).round(4)}")
print(f"ReLU:         {relu(x)}")
print(f"Leaky ReLU:   {leaky_relu(x).round(4)}")`,
      output: `x:            [-3. -1.  0.  1.  3.]
Sigmoid:      [0.0474 0.2689 0.5    0.7311 0.9526]
Tanh:         [-0.9951 -0.7616  0.      0.7616  0.9951]
ReLU:         [0. 0. 0. 1. 3.]
Leaky ReLU:   [-0.03 -0.01  0.    1.    3.  ]`,
      explanation: 'Each activation function transforms the input differently. Sigmoid squashes to (0,1), tanh to (-1,1), ReLU zeros out negatives, and Leaky ReLU lets a small gradient through for negative values.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
import matplotlib.pyplot as plt
import numpy as np

class ActivationPlotter:
    def __init__(self):
        self.x = torch.linspace(-5, 5, 200)

    def plot_activations(self):
        activations = {
            'ReLU': nn.ReLU(),
            'Sigmoid': nn.Sigmoid(),
            'Tanh': nn.Tanh(),
            'LeakyReLU': nn.LeakyReLU(0.01),
        }

        x_np = self.x.numpy()
        fig, axes = plt.subplots(2, 2, figsize=(10, 8))

        for (name, act), ax in zip(activations.items(), axes.flat):
            y = act(self.x).detach().numpy()
            ax.plot(x_np, y, linewidth=2)
            ax.set_title(name)
            ax.grid(True, alpha=0.3)
            ax.axhline(0, color='black', linewidth=0.5)
            ax.axvline(0, color='black', linewidth=0.5)

        plt.tight_layout()
        plt.savefig('activation_functions.png', dpi=150)

# Usage example for nn.ReLU with inplace
x = torch.randn(4, 4)
print("Before ReLU:")
print(x)
relu = nn.ReLU(inplace=True)
relu(x)
print("After inplace ReLU (x modified directly):")
print(x)`,
      output: `Before ReLU:
tensor([[ 0.54, -1.23,  0.87, -0.44],
        [-0.12,  1.34, -0.98,  0.21],
        [ 0.67, -0.33, -1.56,  2.10],
        [-0.78,  0.43,  0.12, -0.65]])
After inplace ReLU (x modified directly):
tensor([[0.54, 0.00, 0.87, 0.00],
        [0.00, 1.34, 0.00, 0.21],
        [0.67, 0.00, 0.00, 2.10],
        [0.00, 0.43, 0.12, 0.00]])`,
      explanation: 'The ActivationPlotter class visualizes activation functions. The inplace=True parameter in nn.ReLU modifies the input tensor directly without allocating new memory, saving GPU memory during training.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

# Custom activation functions
class Swish(nn.Module):
    def forward(self, x):
        return x * torch.sigmoid(x)

class GELU(nn.Module):
    def forward(self, x):
        # Tanh approximation
        return 0.5 * x * (1 + torch.tanh(
            np.sqrt(2 / np.pi) * (x + 0.044715 * x**3)
        ))

class CustomActivation(nn.Module):
    def __init__(self, alpha=1.0, beta=0.5):
        super().__init__()
        self.alpha = nn.Parameter(torch.tensor(alpha))
        self.beta = nn.Parameter(torch.tensor(beta))

    def forward(self, x):
        # Learnable activation: alpha * x * sigmoid(beta * x)
        return self.alpha * x * torch.sigmoid(self.beta * x)

# Test on a simple network
class TestNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(10, 64)
        self.swish = Swish()
        self.fc2 = nn.Linear(64, 32)
        self.gelu = GELU()
        self.fc3 = nn.Linear(32, 1)

    def forward(self, x):
        x = self.swish(self.fc1(x))
        x = self.gelu(self.fc2(x))
        return self.fc3(x)

model = TestNet()
x = torch.randn(16, 10)
out = model(x)
print(f"Output shape: {out.shape}")
print(f"Swish(2.0) = {Swish()(torch.tensor(2.0)):.4f}")
print(f"GELU(2.0) = {GELU()(torch.tensor(2.0)):.4f}")
print(f"ReLU(2.0) = {F.relu(torch.tensor(2.0)):.4f}")`,
      output: `Output shape: torch.Size([16, 1])
Swish(2.0) = 1.7616
GELU(2.0) = 1.9545
ReLU(2.0) = 2.0000`,
      explanation: 'Custom activation functions can be defined as nn.Module subclasses. Swish and GELU combine sigmoid/tanh gating with a linear term. Learnable parameters (alpha, beta) allow the network to adapt the activation shape during training.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Natural Language Processing', description: 'GELU activation is the standard in transformer models like BERT and GPT, where it enables better gradient flow through very deep networks (12-96 layers) compared to ReLU.' },
      { industry: 'Computer Vision', description: 'ReLU and its variants are ubiquitous in CNNs for image classification, object detection, and segmentation. Swish has been adopted in EfficientNet for improved accuracy.' },
      { industry: 'Speech Recognition', description: 'Tanh and sigmoid activations remain common in LSTM-based speech recognition systems for their bounded outputs that stabilize recurrent computations.' },
    ],
    caseStudy: {
      problem: 'A team training a 100-layer ResNet for medical image classification observed that 40% of ReLU neurons became dead after 10 epochs, stagnating validation accuracy at 72%.',
      solution: 'They replaced ReLU with Swish activation, which eliminated dead neurons due to its non-monotonic shape (small negative values for negative inputs). They also added batch normalization before activation.',
      results: 'Dead neuron rate dropped to 2%, validation accuracy improved to 84%, and convergence was 1.7x faster. The model generalized better on out-of-distribution test data.',
    },
    bestPractices: [
      'Use ReLU as the default activation for hidden layers in most architectures',
      'Use Leaky ReLU or ELU when dying ReLU is observed (check neuron activity during training)',
      'Use sigmoid for binary classification output, softmax for multi-class',
      'Avoid sigmoid and tanh in deep networks due to vanishing gradient',
      'Consider Swish/GELU for very deep networks (50+ layers) or transformers',
      'Always use inplace=True for ReLU when memory is constrained',
      'Match activation to the task: tanh for LSTMs, GELU for transformers, ReLU for CNNs',
    ],
    tools: ['PyTorch nn.ReLU / nn.Sigmoid / nn.Tanh', 'PyTorch nn.LeakyReLU / nn.ELU', 'PyTorch nn.GELU (torch >= 1.12)', 'NumPy (implementations)', 'Matplotlib (visualization)', 'TensorBoard (activation histograms)', 'torch.nn.functional (F.relu, F.sigmoid)'],
    jobRoles: ['Deep Learning Engineer', 'AI Research Scientist', 'Model Optimization Engineer', 'ML Infrastructure Engineer'],
    furtherReading: [
      'Nair, V. & Hinton, G. (2010). Rectified Linear Units Improve Restricted Boltzmann Machines',
      'Ramachandran, P. et al. (2017). Searching for Activation Functions (Swish)',
      'Hendrycks, D. & Gimpel, K. (2016). Gaussian Error Linear Units (GELU)',
      'Clevert, D. et al. (2015). Fast and Accurate Deep Network Learning by ELU',
    ],
  },
  quiz: [
    {
      id: 'af-1', type: 'mcq',
      question: 'Which activation function is most susceptible to the vanishing gradient problem?',
      options: [
        'ReLU',
        'Sigmoid',
        'Leaky ReLU',
        'Swish',
      ],
      correctAnswer: 'Sigmoid',
      explanation: 'Sigmoid saturates at both extremes (gradient approaches 0 for large positive or negative values), causing vanishing gradients. ReLU and its variants do not saturate on the positive side.',
    },
    {
      id: 'af-2', type: 'truefalse',
      question: 'The softmax activation function produces outputs that sum to 1 across all classes.',
      correctAnswer: 'True',
      explanation: 'Softmax normalizes the input vector into a probability distribution where each value is between 0 and 1 and all values sum to 1.',
    },
    {
      id: 'af-3', type: 'code',
      question: 'What does the `inplace=True` parameter do in nn.ReLU?',
      code: `relu = nn.ReLU(inplace=True)
x = torch.randn(3, 3)
y = relu(x)
print(x[0, 0].item() > 0 == y[0, 0].item() > 0)`,
      options: [
        'Returns True because inplace modifies x directly, so x and y share memory',
        'Returns False because inplace creates a new tensor',
        'Raises a runtime error',
        'Returns True only for positive values',
      ],
      correctAnswer: 'Returns True because inplace modifies x directly, so x and y share memory',
      explanation: 'When inplace=True, the operation modifies the input tensor directly without allocating new memory. y will be the same tensor as x (or a view of it), so comparisons will show they match.',
    },
    {
      id: 'af-4', type: 'fillblank',
      question: 'The GELU activation function can be approximated using the formula $0.5x(1 + \\tanh(\\sqrt{2/\\pi}(x + 0.044715x^3)))$, where the coefficient 0.044715 is specific to this approximation and ___ approximates the standard normal CDF.',
      correctAnswer: 'tanh',
      explanation: 'The GELU approximation uses tanh to approximate the standard normal CDF $\\Phi(x)$, providing a smooth, computationally efficient alternative to the exact erf-based formulation.',
    },
    {
      id: 'af-5', type: 'match',
      question: 'Match each activation function to its key property:',
      pairs: [
        { left: 'ReLU', right: 'Computationally efficient, sparse activations, can cause dead neurons' },
        { left: 'Sigmoid', right: 'Outputs in (0,1), interpretable as probability, suffers from vanishing gradient' },
        { left: 'Swish', right: 'Non-monotonic, smooth, outperforms ReLU on deep networks' },
        { left: 'Tanh', right: 'Zero-centered output in (-1,1), used in recurrent networks' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each activation function has distinct properties making it suitable for different network architectures and tasks.',
    },
  ],
}))

export {}
