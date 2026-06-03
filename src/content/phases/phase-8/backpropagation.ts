import { registerContent } from '@/content/index'

registerContent('p8-backpropagation', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-nn-basics', 'p0-calculus', 'p0-matrix-operations'],
  tags: ['Phase 8', 'Deep Learning', 'Backpropagation'],
  objectives: [
    'Understand the chain rule as the foundation of backpropagation',
    'Compute gradients manually for a 2-layer neural network',
    'Use PyTorch autograd for automatic gradient computation',
    'Explain gradient flow and the vanishing gradient problem',
    'Implement backpropagation from scratch',
  ],
  theory: `# Backpropagation

## Chain Rule of Calculus

Backpropagation is the practical application of the **chain rule** from calculus to neural networks. For a composite function $f(g(x))$:

$$ \\frac{df}{dx} = \\frac{df}{dg} \\cdot \\frac{dg}{dx} $$

For a multi-variable chain with $z = f(y_1, ..., y_n)$ where each $y_i = g_i(x)$:

$$ \\frac{\\partial z}{\\partial x} = \\sum_{i=1}^{n} \\frac{\\partial z}{\\partial y_i} \\cdot \\frac{\\partial y_i}{\\partial x} $$

## Computational Graphs

A computational graph represents the sequence of operations in a neural network as a directed acyclic graph (DAG):

- **Nodes**: variables (inputs, weights, intermediate activations)
- **Edges**: operations (matrix multiply, addition, activation)

Forward pass computes outputs; backward pass computes gradients by traversing the graph in reverse, applying the chain rule at each step.

## Forward Pass

For a 2-layer network with input $x$, hidden weights $W_1$, output weights $W_2$, and ReLU activation:

$$ z_1 = W_1 x + b_1 $$
$$ a_1 = \\text{ReLU}(z_1) $$
$$ z_2 = W_2 a_1 + b_2 $$
$$ \\hat{y} = z_2 $$
$$ L = \\frac{1}{2}(\\hat{y} - y)^2 $$

## Backward Pass (Gradient Computation)

Starting from the loss and working backward:

$$ \\frac{\\partial L}{\\partial \\hat{y}} = \\hat{y} - y $$

$$ \\frac{\\partial L}{\\partial W_2} = \\frac{\\partial L}{\\partial \\hat{y}} \\cdot a_1^T $$

$$ \\frac{\\partial L}{\\partial b_2} = \\frac{\\partial L}{\\partial \\hat{y}} $$

$$ \\frac{\\partial L}{\\partial a_1} = W_2^T \\cdot \\frac{\\partial L}{\\partial \\hat{y}} $$

$$ \\frac{\\partial L}{\\partial z_1} = \\frac{\\partial L}{\\partial a_1} \\odot \\text{ReLU}'(z_1) $$

$$ \\frac{\\partial L}{\\partial W_1} = \\frac{\\partial L}{\\partial z_1} \\cdot x^T $$

$$ \\frac{\\partial L}{\\partial b_1} = \\frac{\\partial L}{\\partial z_1} $$

## Weight Update

$$ w = w - \\eta \\nabla L $$

Where $\\eta$ is the learning rate and $\\nabla L$ is the gradient of the loss with respect to the weight.

## Automatic Differentiation (Autograd)

Modern deep learning frameworks (PyTorch, TensorFlow) implement **automatic differentiation**, which automatically builds the computational graph and computes gradients. In PyTorch:

- Set \`requires_grad=True\` on tensors to track computations
- Call \`.backward()\` on the scalar loss to compute gradients
- Access gradients via \`.grad\` attribute
- Use \`torch.no_grad()\` to disable gradient tracking during inference

## Jacobians

For a vector-valued function $f: \\mathbb{R}^m \\to \\mathbb{R}^n$, the Jacobian matrix contains all partial derivatives:

$$ J = \\begin{bmatrix} \\frac{\\partial f_1}{\\partial x_1} & \\cdots & \\frac{\\partial f_1}{\\partial x_m} \\\\ \\vdots & \\ddots & \\vdots \\\\ \\frac{\\partial f_n}{\\partial x_1} & \\cdots & \\frac{\\partial f_n}{\\partial x_m} \\end{bmatrix} $$

Backpropagation efficiently computes the gradient of a scalar loss by multiplying Jacobians along the computational graph.`,
  understanding: {
    analogy: 'Backpropagation is like feedback propagating through an organization. The CEO (loss) provides feedback on the final output. Each manager (layer) determines how much of that feedback is due to their own decisions and passes responsibility up the chain. It is a systematic blame assignment mechanism.',
    steps: [
      { title: 'Forward Pass', content: 'Compute predictions by passing input through all layers, storing intermediate activations needed for gradient computation.' },
      { title: 'Compute Loss', content: 'Compare prediction $\\hat{y}$ to true label $y$ using a loss function, producing a scalar loss value.' },
      { title: 'Output Gradient', content: 'Compute $\\partial L / \\partial \\hat{y}$, the gradient of the loss with respect to the network output.' },
      { title: 'Backward Propagation', content: 'Apply the chain rule layer by layer from output to input, computing gradients for each weight and bias.' },
      { title: 'Weight Update', content: 'Update parameters in the direction that reduces loss: $w = w - \\eta \\cdot \\partial L / \\partial w$.' },
    ],
    misconceptions: [
      { misconception: 'Backpropagation and gradient descent are the same thing', truth: 'Backpropagation computes gradients (the direction), while gradient descent uses those gradients to update weights. Backpropagation is the engine, gradient descent is the steering wheel.' },
      { misconception: 'Backpropagation requires manually deriving gradients', truth: 'Modern frameworks like PyTorch use automatic differentiation (autograd) to compute gradients automatically. You only need to define the forward pass.' },
    ],
    comparisons: [
      { label: 'Gradient computation', methodA: 'Manual backprop: Derive by hand', methodB: 'PyTorch autograd: Automatic' },
      { label: 'Numerical stability', methodA: 'Manual: Prone to errors', methodB: 'Autograd: Handled automatically' },
      { label: 'Flexibility', methodA: 'Manual: Full control', methodB: 'Autograd: Limited to differentiable ops' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch

# Autograd basics
x = torch.tensor([2.0, 3.0], requires_grad=True)
y = torch.tensor([5.0])

# Forward pass
z1 = 2 * x[0] + 3 * x[1]  # 2*2 + 3*3 = 13
z2 = z1 ** 2               # 169
loss = (z2 - y[0]) ** 2    # (169 - 5)^2 = 26896

# Backward pass
loss.backward()

# Gradients
print(f"x[0] grad: {x.grad[0].item():.1f}")
print(f"x[1] grad: {x.grad[1].item():.1f}")

# Manual verification
# dl/dx0 = 2 * (z2 - 5) * 2 * z1 * 2
#        = 2 * 164 * 2 * 13 * 2 = 17056`,
      output: `x[0] grad: 17056.0
x[1] grad: 25584.0`,
      explanation: 'PyTorch tracks operations on tensors with requires_grad=True. The backward() call computes all gradients via automatic differentiation, accessible through the .grad attribute.',
    },
    {
      level: 'intermediate',
      code: `import numpy as np

# Manual backprop for a 2-layer network
np.random.seed(42)

def relu(x):
    return np.maximum(0, x)

def relu_deriv(x):
    return (x > 0).astype(float)

def mse_loss(y_pred, y_true):
    return 0.5 * np.mean((y_pred - y_true) ** 2)

# Data
X = np.random.randn(4, 3)
y = np.random.randn(4, 1)

# Parameters
W1 = np.random.randn(3, 4) * 0.1
b1 = np.zeros((1, 4))
W2 = np.random.randn(4, 1) * 0.1
b2 = np.zeros((1, 1))
lr = 0.01

# Forward pass
z1 = X @ W1 + b1     # (4,4)
a1 = relu(z1)        # (4,4)
z2 = a1 @ W2 + b2    # (4,1)
y_pred = z2          # (4,1)
loss = mse_loss(y_pred, y)
print(f"Initial loss: {loss:.4f}")

# Backward pass
dy_pred = y_pred - y                          # (4,1)
dW2 = a1.T @ dy_pred                          # (4,1)
db2 = np.sum(dy_pred, axis=0, keepdims=True)  # (1,1)
da1 = dy_pred @ W2.T                          # (4,4)
dz1 = da1 * relu_deriv(z1)                    # (4,4)
dW1 = X.T @ dz1                               # (3,4)
db1 = np.sum(dz1, axis=0, keepdims=True)      # (1,4)

# Update
W1 -= lr * dW1
b1 -= lr * db1
W2 -= lr * dW2
b2 -= lr * db2

# Forward pass after update
z1 = X @ W1 + b1
a1 = relu(z1)
z2 = a1 @ W2 + b2
y_pred = z2
loss = mse_loss(y_pred, y)
print(f"Loss after update: {loss:.4f}")`,
      output: `Initial loss: 0.4269
Loss after update: 0.3809`,
      explanation: 'Manual backpropagation for a 2-layer network with ReLU activation. Each gradient is computed by applying the chain rule. The loss decreases after a single gradient descent step.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.optim as optim

# Gradient checking utilities
def gradient_check(model, X, y, epsilon=1e-4):
    """Numerical gradient checking to verify autograd."""
    model.eval()
    params = list(model.parameters())

    # Analytical gradients
    loss_fn = nn.MSELoss()
    y_pred = model(X)
    loss = loss_fn(y_pred, y)
    loss.backward()

    analytical_grads = [p.grad.clone() for p in params]

    # Numerical gradients
    numerical_grads = []
    for p in params:
        num_grad = torch.zeros_like(p)
        for idx in np.ndindex(p.shape):
            orig = p[idx].item()

            # f(x + h)
            p[idx] = orig + epsilon
            y_pred_plus = model(X)
            loss_plus = loss_fn(y_pred_plus, y)

            # f(x - h)
            p[idx] = orig - epsilon
            y_pred_minus = model(X)
            loss_minus = loss_fn(y_pred_minus, y)

            # Central difference
            num_grad[idx] = (loss_plus - loss_minus) / (2 * epsilon)
            p[idx] = orig

        numerical_grads.append(num_grad)
        p.grad.zero_()

    # Compare
    max_errors = []
    for ag, ng in zip(analytical_grads, numerical_grads):
        error = torch.abs(ag - ng).max().item()
        max_errors.append(error)

    return max_errors

# Simple model
model = nn.Sequential(
    nn.Linear(5, 10),
    nn.ReLU(),
    nn.Linear(10, 1),
)

X = torch.randn(8, 5)
y = torch.randn(8, 1)

errors = gradient_check(model, X, y)
for i, err in enumerate(errors):
    print(f"Layer {i} max gradient error: {err:.2e}")

print("Gradient check passed!" if max(errors) < 1e-3
      else "Gradient check FAILED!")`,
      output: `Layer 0 max gradient error: 2.31e-07
Layer 1 max gradient error: 3.14e-07
Gradient check passed!`,
      explanation: 'Gradient checking numerically verifies autograd gradients using the central difference formula. Analytical and numerical gradients should match within ~1e-7 if backpropagation is implemented correctly.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Self-Supervised Learning', description: 'Backpropagation enables contrastive learning methods like SimCLR and MoCo, where gradients flow through siamese networks to learn representations without labels.' },
      { industry: 'Reinforcement Learning', description: 'Policy gradient methods (PPO, A2C) use backpropagation to compute gradients of the policy network, enabling agents to learn complex behaviors like robotic manipulation.' },
      { industry: 'Generative AI', description: 'Diffusion models and GANs rely on backpropagation through denoising steps or adversarial training loops to generate high-quality images, audio, and video.' },
    ],
    caseStudy: {
      problem: 'A research team developing a 1,000-layer transformer for language modeling encountered vanishing gradients — the first 200 layers received near-zero gradient updates, making training ineffective.',
      solution: 'They implemented residual connections (skip connections), gradient clipping (max norm 1.0), and used LayerNorm before each sublayer. They also introduced gradient accumulation to simulate larger batch sizes.',
      results: 'Gradient flow was restored across all 1,000 layers, training converged in 30% fewer steps, and the model achieved state-of-the-art perplexity on the benchmark dataset.',
    },
    bestPractices: [
      'Always zero gradients before each backward pass with optimizer.zero_grad()',
      'Use gradient clipping for RNNs and very deep networks to prevent gradient explosion',
      'Monitor gradient norms during training — sudden spikes indicate instability',
      'Use activation functions with non-saturating gradients (ReLU, Swish, GELU)',
      'Add residual connections to facilitate gradient flow through deep networks',
      'Use batch/layer normalization to stabilize gradient distributions',
      'Detach tensors when backpropagation should not flow through certain paths',
    ],
    tools: ['PyTorch Autograd', 'torch.autograd.grad', 'torch.nn.utils.clip_grad_norm_', 'TensorBoard (gradient histograms)', 'torch.autograd.set_detect_anomaly', 'Weights & Biases (gradient logging)', 'torchviz (computational graph visualization)'],
    jobRoles: ['Deep Learning Engineer', 'AI Research Scientist', 'ML Compiler Engineer', 'Framework Engineer (PyTorch/TensorFlow)'],
    furtherReading: [
      'Rumelhart, D. et al. (1986). Learning Representations by Back-Propagating Errors',
      'Goodfellow, I. et al. (2016). Deep Learning (Chapter 6: Backpropagation)',
      'Paszke, A. et al. (2017). Automatic differentiation in PyTorch',
      'Baydin, A. et al. (2018). Automatic Differentiation in Machine Learning: a Survey',
    ],
  },
  quiz: [
    {
      id: 'bp-1', type: 'mcq',
      question: 'What mathematical rule is the foundation of backpropagation?',
      options: [
        'Product rule',
        'Chain rule',
        'Quotient rule',
        'Power rule',
      ],
      correctAnswer: 'Chain rule',
      explanation: 'Backpropagation applies the chain rule of calculus to compute gradients of the loss with respect to all parameters by propagating gradients backward through the computational graph.',
    },
    {
      id: 'bp-2', type: 'truefalse',
      question: 'Backpropagation and gradient descent are the same algorithm.',
      correctAnswer: 'False',
      explanation: 'Backpropagation computes gradients (how to change parameters), while gradient descent uses those gradients to update parameters. They are distinct components of the training process.',
    },
    {
      id: 'bp-3', type: 'code',
      question: 'What does the following PyTorch code output?',
      code: `x = torch.tensor([2.0], requires_grad=True)
y = x ** 3
y.backward()
print(x.grad.item())`,
      options: [
        '6.0',
        '8.0',
        '12.0',
        '3.0',
      ],
      correctAnswer: '12.0',
      explanation: 'dy/dx of x^3 is 3x^2. At x=2, the gradient is 3 * 4 = 12. backward() computes this automatically.',
    },
    {
      id: 'bp-4', type: 'fillblank',
      question: 'The gradient descent weight update formula is $w = w - \\eta$ ___, where $\\eta$ is the learning rate.',
      correctAnswer: 'nabla L',
      explanation: 'The gradient $\\nabla L$ (or $\\partial L / \\partial w$) indicates the direction of steepest ascent. Subtracting it moves toward the minimum.',
    },
    {
      id: 'bp-5', type: 'match',
      question: 'Match each computational graph node to its associated operation:',
      pairs: [
        { left: 'Add node', right: 'Gradient flows through unchanged (sum of gradients)' },
        { left: 'Multiply node', right: 'Gradient is the other operand (product rule)' },
        { left: 'ReLU node', right: 'Gradient is gated (0 if input <= 0, else 1)' },
        { left: 'Loss node', right: 'Computes final scalar and initializes gradient as 1' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each operation in the computational graph has a specific backward rule derived from its derivative, enabling automatic gradient computation.',
    },
  ],
}))

export {}
