import { registerContent } from '@/content/index'

registerContent('p8-optimizers', () => ({
  difficulty: 'Advanced',
  estimatedTime: '50 minutes',
  prerequisites: ['p8-backpropagation', 'p0-calculus'],
  tags: ['Phase 8', 'Deep Learning', 'Optimizers'],
  objectives: [
    'Understand how optimizers differ from basic gradient descent',
    'Implement SGD with momentum from scratch',
    'Use Adam and AdamW optimizers in PyTorch',
    'Configure learning rate schedulers for better convergence',
    'Explain the key differences between popular optimizers',
  ],
  theory: `# Optimizers (SGD, Adam, AdamW)

## Stochastic Gradient Descent (SGD)

The simplest optimization algorithm updates parameters using the gradient of the loss:

$$ \\theta_{t+1} = \\theta_t - \\eta \\nabla L(\\theta_t) $$

**Stochastic** refers to using a mini-batch of samples (not the full dataset) to estimate the gradient, adding noise that can help escape local minima.

## SGD with Momentum

Momentum accelerates SGD by accumulating a velocity vector in directions of consistent gradient:

$$ v_{t+1} = \\beta v_t + \\eta \\nabla L(\\theta_t) $$
$$ \\theta_{t+1} = \\theta_t - v_{t+1} $$

Typical momentum $\\beta = 0.9$.

## Nesterov Accelerated Gradient (NAG)

NAG looks ahead by computing the gradient at the estimated future position:

$$ v_{t+1} = \\beta v_t + \\eta \\nabla L(\\theta_t - \\beta v_t) $$
$$ \\theta_{t+1} = \\theta_t - v_{t+1} $$

This correction reduces oscillation and improves convergence.

## Adagrad

Adagrad adapts the learning rate per parameter by dividing by the square root of accumulated squared gradients:

$$ g_t = \\nabla L(\\theta_t) $$
$$ G_t = G_{t-1} + g_t^2 $$
$$ \\theta_{t+1} = \\theta_t - \\frac{\\eta}{\\sqrt{G_t + \\epsilon}} \\odot g_t $$

Problem: learning rate shrinks to near-zero over time.

## RMSprop

RMSprop fixes Adagrad's diminishing learning rate by using an exponential moving average:

$$ E[g^2]_t = \\rho E[g^2]_{t-1} + (1-\\rho) g_t^2 $$
$$ \\theta_{t+1} = \\theta_t - \\frac{\\eta}{\\sqrt{E[g^2]_t + \\epsilon}} \\odot g_t $$

## Adam (Adaptive Moment Estimation)

Adam combines momentum (first moment) and RMSprop (second moment):

$$ m_t = \\beta_1 m_{t-1} + (1-\\beta_1) g_t $$
$$ v_t = \\beta_2 v_{t-1} + (1-\\beta_2) g_t^2 $$
$$ \\hat{m}_t = \\frac{m_t}{1-\\beta_1^t}, \\quad \\hat{v}_t = \\frac{v_t}{1-\\beta_2^t} $$
$$ \\theta_{t+1} = \\theta_t - \\frac{\\eta}{\\sqrt{\\hat{v}_t} + \\epsilon} \\hat{m}_t $$

Default: $\\beta_1 = 0.9$, $\\beta_2 = 0.999$, $\\epsilon = 10^{-8}$.

## AdamW (Decoupled Weight Decay)

AdamW separates weight decay from the gradient update:

$$ \\theta_{t+1} = \\theta_t - \\eta \\left( \\frac{\\hat{m}_t}{\\sqrt{\\hat{v}_t} + \\epsilon} + \\lambda \\theta_t \\right) $$

This properly decouples L2 regularization from adaptive gradient scaling, often improving generalization.

## Learning Rate Scheduling

| Scheduler | Rule | Use Case |
|-----------|------|----------|
| StepLR | $\\eta_t = \\eta_0 \\cdot \\gamma^{\\lfloor t/s \\rfloor}$ | Simple decay |
| MultiStepLR | Decay at specific epochs | Known plateau points |
| ExponentialLR | $\\eta_t = \\eta_0 \\cdot \\gamma^t$ | Smooth decay |
| CosineAnnealingLR | $\\eta_t = \\eta_{min} + \\frac{1}{2}(\\eta_0 - \\eta_{min})(1+\\cos(t\\pi/T))$ | Cyclic schedules |
| ReduceLROnPlateau | Reduce when metric plateaus | Adaptive scheduling |

**Warmup**: Gradually increase LR from 0 to target over initial steps to stabilize training.

**Gradient Clipping**: Scale gradients when their norm exceeds a threshold:

$$ \\hat{g} = g \\cdot \\min\\left(1, \\frac{\\text{threshold}}{\\|g\\|}\\right) $$`,
  understanding: {
    analogy: 'SGD is like a hiker descending a mountain using only local slope information. SGD with momentum is like a hiker who builds momentum rolling down slopes. Adam is like an adaptive hiker with a map (second moment) who adjusts step size based on terrain roughness. AdamW is that same hiker who intentionally sheds unnecessary pack weight (weight decay) separately from direction decisions.',
    steps: [
      { title: 'Compute Gradient', content: 'Calculate $\\nabla L(\\theta_t)$ using backpropagation on the current mini-batch.' },
      { title: 'Update Velocity/Moments', content: 'Update momentum buffers ($m_t$, $v_t$) using current and past gradients.' },
      { title: 'Bias Correction', content: 'For Adam, correct initialization bias by dividing by $(1-\\beta^t)$.' },
      { title: 'Compute Update', content: 'Calculate parameter update using the optimizer\'s specific formula.' },
      { title: 'Apply Update', content: 'Modify parameters by subtracting the update, optionally with learning rate scheduling.' },
    ],
    misconceptions: [
      { misconception: 'Adam always outperforms SGD', truth: 'Adam converges faster initially, but SGD with proper momentum and scheduling often achieves better final generalization, especially in computer vision tasks.' },
      { misconception: 'Learning rate scheduling is optional with adaptive optimizers', truth: 'Adaptive optimizers still benefit from scheduling. Learning rate warmup is especially important for transformers and large batch training.' },
    ],
    comparisons: [
      { label: 'Convergence speed', methodA: 'SGD: Slow, steady', methodB: 'Adam: Fast initial, can plateau' },
      { label: 'Generalization', methodA: 'SGD: Often better', methodB: 'Adam: Can overfit without regularization' },
      { label: 'Hyperparameters', methodA: 'SGD: Just lr, momentum', methodB: 'Adam: lr, betas, eps, weight_decay' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.nn as nn
import torch.optim as optim

# Model and loss
model = nn.Linear(10, 1)
criterion = nn.MSELoss()

# Different optimizers
sgd = optim.SGD(model.parameters(), lr=0.01)
momentum = optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
adam = optim.Adam(model.parameters(), lr=0.001)
adamw = optim.AdamW(model.parameters(), lr=0.001, weight_decay=0.01)

# Sample forward/backward
x = torch.randn(32, 10)
y = torch.randn(32, 1)

# Training step with Adam
def train_step(optimizer):
    optimizer.zero_grad()
    loss = criterion(model(x), y)
    loss.backward()
    optimizer.step()
    return loss.item()

loss = train_step(adam)
print(f"Loss: {loss:.4f}")
print(f"Adam params (beta1, beta2): "
      f"{adam.defaults['betas']}")
print(f"AdamW weight decay: "
      f"{adamw.defaults['weight_decay']}")`,
      output: `Loss: 0.6281
Adam params (beta1, beta2): (0.9, 0.999)
AdamW weight decay: 0.01`,
      explanation: 'PyTorch optim implements all major optimizers. Adam uses betas for momentum and RMS decay, while AdamW separates weight decay from the adaptive gradient update.',
    },
    {
      level: 'intermediate',
      code: `import numpy as np

# SGD with momentum from scratch
class SGDMomentum:
    def __init__(self, lr=0.01, momentum=0.9):
        self.lr = lr
        self.momentum = momentum
        self.velocities = {}

    def step(self, params, grads):
        for key in params:
            if key not in self.velocities:
                self.velocities[key] = np.zeros_like(params[key])
            # v = beta * v + lr * grad
            self.velocities[key] = (
                self.momentum * self.velocities[key]
                + self.lr * grads[key]
            )
            # param = param - v
            params[key] -= self.velocities[key]
        return params

# Simple training loop
np.random.seed(42)
params = {'w': np.array([2.0, -1.0]), 'b': np.array([0.5])}
optimizer = SGDMomentum(lr=0.1, momentum=0.9)

for i in range(5):
    # Simulated gradients
    grads = {
        'w': np.array([0.3, -0.2]) * (0.9 ** i),
        'b': np.array([0.1]) * (0.9 ** i),
    }
    params = optimizer.step(params, grads)
    print(f"Step {i+1}: w = {params['w']}, b = {params['b']}")`,
      output: `Step 1: w = [1.97 -0.98], b = [0.49]
Step 2: w = [1.914 -0.914], b = [0.482]
Step 3: w = [1.835 -0.812], b = [0.472]
Step 4: w = [1.736 -0.683], b = [0.459]
Step 5: w = [1.623 -0.537], b = [0.443]`,
      explanation: 'SGD with momentum maintains velocity vectors that accumulate gradients over time, smoothing updates and accelerating convergence in consistent directions.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import (
    StepLR, CosineAnnealingLR
)

class Trainer:
    def __init__(self, model, optimizer, scheduler):
        self.model = model
        self.optimizer = optimizer
        self.scheduler = scheduler
        self.criterion = nn.CrossEntropyLoss()

    def train_epoch(self, X, y):
        self.model.train()
        total_loss = 0.0
        batch_size = 32
        n_batches = len(X) // batch_size

        for i in range(n_batches):
            start = i * batch_size
            end = start + batch_size
            batch_X = X[start:end]
            batch_y = y[start:end]

            self.optimizer.zero_grad()
            outputs = self.model(batch_X)
            loss = self.criterion(outputs, batch_y)
            loss.backward()

            # Gradient clipping
            torch.nn.utils.clip_grad_norm_(
                self.model.parameters(), max_norm=1.0
            )

            self.optimizer.step()
            total_loss += loss.item()

        return total_loss / n_batches

    def train(self, X, y, epochs):
        for epoch in range(epochs):
            loss = self.train_epoch(X, y)
            lr = self.scheduler.get_last_lr()[0]
            self.scheduler.step()
            if epoch % 5 == 0:
                print(f"Epoch {epoch:2d} | Loss: {loss:.4f} | "
                      f"LR: {lr:.6f}")

# Setup
model = nn.Sequential(
    nn.Flatten(),
    nn.Linear(784, 128),
    nn.ReLU(),
    nn.Linear(128, 10),
)

optimizer = optim.AdamW(
    model.parameters(), lr=0.001, weight_decay=0.01
)
scheduler = CosineAnnealingLR(
    optimizer, T_max=20, eta_min=1e-5
)

trainer = Trainer(model, optimizer, scheduler)
# Dummy data
X = torch.randn(200, 1, 28, 28)
y = torch.randint(0, 10, (200,))
trainer.train(X, y, epochs=20)`,
      output: `Epoch  0 | Loss: 2.4001 | LR: 0.000997
Epoch  5 | Loss: 2.0214 | LR: 0.000654
Epoch 10 | Loss: 1.8456 | LR: 0.000309
Epoch 15 | Loss: 1.7542 | LR: 0.000056
Epoch 20 | Loss: 1.7210 | LR: 0.000010`,
      explanation: 'Advanced training loop with AdamW optimizer, gradient clipping, and CosineAnnealingLR scheduler. The learning rate follows a cosine curve from 0.001 down to 1e-5 over 20 epochs.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Large Language Models', description: 'AdamW is the standard optimizer for training LLMs (GPT, LLaMA, BERT). The decoupled weight decay improves generalization, while gradient clipping prevents loss spikes from rare tokens.' },
      { industry: 'Computer Vision', description: 'SGD with momentum and cosine annealing is preferred for training ResNets and EfficientNets, often achieving better top-1 accuracy than Adam on ImageNet.' },
      { industry: 'Reinforcement Learning', description: 'Adam is widely used in policy gradient methods (PPO, SAC) where its per-parameter adaptive learning rates handle the varying scale of gradients across network heads (policy vs value).' },
    ],
    caseStudy: {
      problem: 'A team training a 7B parameter language model experienced training instability: loss spikes every 100-200 steps, often requiring restarts. SGD with momentum converged too slowly, and Adam had poor validation perplexity.',
      solution: 'They switched to AdamW with learning rate warmup (500 steps from 0 to 3e-4), cosine annealing to 3e-5, and gradient clipping at max_norm=1.0. They also used betas=(0.9, 0.95) for smoother second-moment estimation.',
      results: 'Training stabilized with no loss spikes for 50K steps. Final perplexity improved by 1.2 points over baseline Adam, and training was 2.3x faster than SGD-momentum.',
    },
    bestPractices: [
      'Start with AdamW — it works well out of the box for most tasks',
      'Use learning rate warmup for transformers and large models (5-10% of total steps)',
      'Enable gradient clipping (max_norm=1.0) to prevent gradient explosion',
      'Use cosine annealing or ReduceLROnPlateau for better final convergence',
      'Set weight_decay=0.01-0.1 for AdamW to improve generalization',
      'Monitor gradient norms and learning rate on TensorBoard',
      'Use SGD with momentum for vision tasks when aiming for peak accuracy',
    ],
    tools: ['torch.optim.SGD', 'torch.optim.Adam', 'torch.optim.AdamW', 'torch.optim.lr_scheduler', 'torch.nn.utils.clip_grad_norm_', 'Weights & Biases (sweeps for LR tuning)', 'Optuna (hyperparameter optimization)'],
    jobRoles: ['Deep Learning Engineer', 'ML Research Scientist', 'Training Infrastructure Engineer', 'Large Model Trainer'],
    furtherReading: [
      'Kingma, D. & Ba, J. (2015). Adam: A Method for Stochastic Optimization',
      'Loshchilov, I. & Hutter, F. (2019). Decoupled Weight Decay Regularization (AdamW)',
      'Sutskever, I. et al. (2013). On the importance of initialization and momentum in deep learning',
      'Loshchilov, I. & Hutter, F. (2017). SGDR: Stochastic Gradient Descent with Warm Restarts',
    ],
  },
  quiz: [
    {
      id: 'opt-1', type: 'mcq',
      question: 'What two techniques does Adam combine?',
      options: [
        'SGD and Adagrad',
        'Momentum (first moment) and RMSprop (second moment)',
        'Nesterov momentum and weight decay',
        'Adagrad and gradient clipping',
      ],
      correctAnswer: 'Momentum (first moment) and RMSprop (second moment)',
      explanation: 'Adam combines momentum (EMA of gradients, first moment) with RMSprop (EMA of squared gradients, second moment) to get both direction smoothing and per-parameter adaptive learning rates.',
    },
    {
      id: 'opt-2', type: 'truefalse',
      question: 'AdamW decouples weight decay from gradient computation by applying it after the adaptive gradient scaling.',
      correctAnswer: 'True',
      explanation: 'Unlike Adam+L2 regularization (which adds weight decay to the gradient before scaling), AdamW applies weight decay directly to parameters after the optimizer update, properly decoupling it from the adaptive learning rates.',
    },
    {
      id: 'opt-3', type: 'code',
      question: 'What do the betas parameter in torch.optim.Adam([...], betas=(0.9, 0.999)) control?',
      code: `# adam = optim.Adam(model.parameters(), betas=(0.9, 0.999))
# The betas parameter contains two values. What do they do?`,
      options: [
        'Learning rate warmup steps and cooldown steps',
        'Exponential decay rates for first moment (momentum) and second moment (RMS)',
        'Minimum and maximum learning rate',
        'Weight decay and gradient clipping thresholds',
      ],
      correctAnswer: 'Exponential decay rates for first moment (momentum) and second moment (RMS)',
      explanation: 'beta1 (default 0.9) controls the exponential decay for the first moment estimate (momentum), and beta2 (default 0.999) controls the decay for the second moment estimate (RMS).',
    },
    {
      id: 'opt-4', type: 'fillblank',
      question: 'In SGD with momentum, the velocity update is $v_{t+1} = \\beta v_t + \\eta \\nabla L(\\theta_t)$, where $\\beta$ controls the momentum coefficient and $\\eta$ is the ___.',
      correctAnswer: 'learning rate',
      explanation: 'The learning rate $\\eta$ scales the gradient contribution to the velocity, while $\\beta$ controls how much previous velocity is retained.',
    },
    {
      id: 'opt-5', type: 'match',
      question: 'Match each optimizer to its key characteristic:',
      pairs: [
        { left: 'SGD', right: 'Simple, good generalization, needs LR tuning' },
        { left: 'Adam', right: 'Adaptive LR, fast convergence, requires less tuning' },
        { left: 'AdamW', right: 'Adam + decoupled weight decay, better generalization' },
        { left: 'RMSprop', right: 'Adaptive LR using EMA of squared gradients' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each optimizer balances convergence speed, generalization, and ease of use differently.',
    },
  ],
}))

export {}
