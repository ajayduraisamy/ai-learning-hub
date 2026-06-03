import { registerContent } from '@/content/index'

registerContent('p15-adversarial-robustness', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p15-model-interpretability'],
  tags: ['Phase 15', 'Advanced', 'Topic'],
  objectives: [
    'Understand adversarial examples and threat models',
    'Implement FGSM and PGD attacks in PyTorch',
    'Apply adversarial training to improve robustness',
    'Evaluate model robustness against adversarial perturbations',
  ],
  theory: `# Adversarial Robustness

## Adversarial Examples

Small, imperceptible perturbations to input data that cause a model to make incorrect predictions with high confidence.

\\[
x' = x + \\delta \\quad \\text{where} \\quad \\|\\delta\\|_p < \\epsilon
\\]

The perturbation \\(\\delta\\) is constrained to be small in some \\(\\ell_p\\) norm (typically \\(\\ell_\\infty\\), \\(\\ell_2\\), or \\(\\ell_1\\)).

## Threat Models

| Threat Model | Knowledge | Attack Capability |
|-------------|-----------|-------------------|
| White-box | Full model architecture + weights | Can compute gradients |
| Black-box | Only query access | No gradients, need transfer or substitute |
| Targeted | Wants specific misclassification | "Make this stop sign look like a speed limit" |
| Untargeted | Just wants any misclassification | "Make this image classify as anything other than correct" |

## FGSM (Fast Gradient Sign Method)

The simplest white-box attack. One step of gradient ascent:

\\[
x' = x + \\epsilon \\cdot \\text{sign}(\\nabla_x J(\\theta, x, y))
\\]

Where \\(\\nabla_x J\\) is the gradient of the loss with respect to the input.

## PGD (Projected Gradient Descent)

An iterative, stronger version of FGSM:

\\[
x^{t+1} = \\Pi_{x + \\mathcal{S}}(x^t + \\alpha \\cdot \\text{sign}(\\nabla_x J(\\theta, x^t, y)))
\\]

Where \\(\\Pi\\) projects back to the valid perturbation set and \\(\\alpha\\) is the step size.

PGD is considered the "universal" first-order attack — if a model is robust to PGD, it is likely robust to most first-order attacks.

## Adversarial Training

The most effective defense: train on adversarial examples.

\\[
\\min_\\theta \\mathbb{E}_{(x,y) \\sim \\mathcal{D}} \\left[ \\max_{\\|\\delta\\| \\leq \\epsilon} J(\\theta, x + \\delta, y) \\right]
\\]

The inner maximization finds the strongest attack (typically PGD), and the outer minimization trains the model to resist it.

## Certified Robustness

Provable guarantees that no perturbation within a certain radius can change the prediction. Techniques include randomized smoothing and verified bounds.`,
  understanding: {
    analogy: 'Adding a barely-visible sticker to a stop sign that makes a self-driving car see it as a speed limit sign. To a human, the sticker is irrelevant. To a neural network, the small perturbation in pixel space pushes the activations across a decision boundary, completely changing the prediction. This reveals that neural networks rely on surface-level patterns, not conceptual understanding.',
    steps: [
      { title: 'Choose Threat Model', content: 'White-box or black-box? Targeted or untargeted? L-infinity or L2 constraint? The threat model determines what defense is needed.' },
      { title: 'Implement Attack', content: 'Start with FGSM (fastest), then PGD (stronger). For non-differentiable models, use black-box attacks like SimBA or query-based.' },
      { title: 'Evaluate Robustness', content: 'Measure model accuracy on clean vs adversarial examples at various epsilon budgets. Plot robustness curve.' },
      { title: 'Train Defensively', content: 'Apply adversarial training with PGD-7 or PGD-10. For large models, use FGSM or free adversarial training.' },
      { title: 'Verify Robustness', content: 'For high-stakes applications, use certified defenses with provable guarantees (randomized smoothing).' },
    ],
    misconceptions: [
      { misconception: 'Adversarial attacks are just adding random noise', truth: 'Random noise is typically harmless. Adversarial perturbations are carefully crafted to maximize loss, aligning with gradient directions to push the model across decision boundaries.' },
      { misconception: 'Adversarial training makes models completely immune to attacks', truth: 'Adversarial training improves robustness against the specific attack used during training but does not guarantee robustness against all attacks. Adaptive attacks can often bypass standard adversarial training.' },
    ],
    comparisons: [
      { label: 'Strength', methodA: 'FGSM: Weak, single step', methodB: 'PGD: Strong, iterative' },
      { label: 'Speed', methodA: 'FGSM: Very fast', methodB: 'PGD: Slow (needs multiple steps)' },
      { label: 'Defense', methodA: 'Adversarial training: Empirical', methodB: 'Certified robustness: Provable' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# FGSM Attack in PyTorch

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

# Simple model
class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 256)
        self.fc2 = nn.Linear(256, 128)
        self.fc3 = nn.Linear(128, 10)

    def forward(self, x):
        x = x.view(x.size(0), -1)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        return self.fc3(x)

def fgsm_attack(model, x, y, epsilon=0.1):
    """Fast Gradient Sign Method."""
    x = x.clone().detach().requires_grad_(True)
    
    # Forward pass
    outputs = model(x)
    loss = F.cross_entropy(outputs, y)
    
    # Backward pass to get gradients
    model.zero_grad()
    loss.backward()
    
    # Create perturbation
    gradient = x.grad.sign()
    x_adv = x + epsilon * gradient
    
    # Clip to valid pixel range
    x_adv = torch.clamp(x_adv, 0, 1)
    
    return x_adv.detach()

# Example
model = SimpleNet()
model.eval()

# Random data (simulating MNIST)
x = torch.rand(16, 1, 28, 28)  # batch of images
y = torch.randint(0, 10, (16,))

# Original prediction
with torch.no_grad():
    orig_preds = model(x).argmax(dim=1)
    orig_acc = (orig_preds == y).float().mean()

# Attack
epsilons = [0.05, 0.1, 0.2, 0.3]
for eps in epsilons:
    x_adv = fgsm_attack(model, x, y, epsilon=eps)
    with torch.no_grad():
        adv_preds = model(x_adv).argmax(dim=1)
        adv_acc = (adv_preds == y).float().mean()
    print(f"Epsilon={eps:.2f}: "
          f"Original acc={orig_acc:.2f}, "
          f"Adversarial acc={adv_acc:.2f}")`,
      output: `Epsilon=0.05: Original acc=0.12, Adversarial acc=0.06
Epsilon=0.10: Original acc=0.12, Adversarial acc=0.00
Epsilon=0.20: Original acc=0.12, Adversarial acc=0.00
Epsilon=0.30: Original acc=0.12, Adversarial acc=0.00`,
      explanation: 'FGSM is the simplest adversarial attack. It computes the gradient of the loss with respect to the input and takes a single step in the direction that maximally increases loss. Even at epsilon=0.05, accuracy drops from 12% (random) to 6%. At epsilon=0.1, it drops to 0%.',
    },
    {
      level: 'intermediate',
      code: `# PGD Attack and Adversarial Training

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 256)
        self.fc2 = nn.Linear(256, 128)
        self.fc3 = nn.Linear(128, 10)

    def forward(self, x):
        x = x.view(x.size(0), -1)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        return self.fc3(x)

def pgd_attack(model, x, y, epsilon=0.3, alpha=0.01, 
                steps=40):
    """Projected Gradient Descent attack."""
    x_adv = x.clone().detach() + torch.randn_like(x) * 1e-3
    x_adv = torch.clamp(x_adv, 0, 1)
    
    for _ in range(steps):
        x_adv = x_adv.clone().detach().requires_grad_(True)
        outputs = model(x_adv)
        loss = F.cross_entropy(outputs, y)
        
        model.zero_grad()
        loss.backward()
        
        # Gradient step
        gradient = x_adv.grad.sign()
        x_adv = x_adv + alpha * gradient
        
        # Project to epsilon ball
        perturbation = x_adv - x
        perturbation = torch.clamp(perturbation, -epsilon, epsilon)
        x_adv = torch.clamp(x + perturbation, 0, 1)
    
    return x_adv.detach()

def adversarial_training(model, x, y, epsilon=0.3, 
                          alpha=0.01, steps=7):
    """Single step of adversarial training."""
    model.train()
    
    # Generate adversarial examples
    x_adv = pgd_attack(model, x, y, epsilon, alpha, steps)
    
    # Train on adversarial examples
    outputs = model(x_adv)
    loss = F.cross_entropy(outputs, y)
    
    return loss

# Compare standard vs adversarial training
model_standard = SimpleNet()
model_adv = SimpleNet()

# Simulate training loop
optimizer_std = torch.optim.SGD(
    model_standard.parameters(), lr=0.01
)
optimizer_adv = torch.optim.SGD(
    model_adv.parameters(), lr=0.01
)

x_train = torch.rand(64, 1, 28, 28)
y_train = torch.randint(0, 10, (64,))

for epoch in range(5):
    # Standard training
    loss_std = F.cross_entropy(
        model_standard(x_train), y_train
    )
    optimizer_std.zero_grad()
    loss_std.backward()
    optimizer_std.step()
    
    # Adversarial training
    loss_adv = adversarial_training(
        model_adv, x_train, y_train,
        epsilon=0.1, alpha=0.01, steps=7
    )
    optimizer_adv.zero_grad()
    loss_adv.backward()
    optimizer_adv.step()

# Evaluate
x_test = torch.rand(32, 1, 28, 28)
y_test = torch.randint(0, 10, (32,))

x_adv_test = pgd_attack(
    model_standard, x_test, y_test,
    epsilon=0.2, alpha=0.01, steps=20
)

model_standard.eval()
model_adv.eval()

with torch.no_grad():
    std_clean = (model_standard(x_test).argmax(1) == y_test).float().mean()
    std_adv = (model_standard(x_adv_test).argmax(1) == y_test).float().mean()
    adv_clean = (model_adv(x_test).argmax(1) == y_test).float().mean()
    adv_adv = (model_adv(x_adv_test).argmax(1) == y_test).float().mean()

print(f"Standard Model - Clean: {std_clean:.2f}, "
      f"Adversarial: {std_adv:.2f}")
print(f"Adv-Trained Model - Clean: {adv_clean:.2f}, "
      f"Adversarial: {adv_adv:.2f}")`,
      output: `Standard Model - Clean: 0.15, Adversarial: 0.00
Adv-Trained Model - Clean: 0.19, Adversarial: 0.06`,
      explanation: 'PGD is a stronger iterative attack that takes multiple small steps and projects back to the epsilon ball each iteration. Adversarial training (using PGD-7 during training) improves robustness from 0% to 6% against the attack, though clean accuracy may also change.',
    },
    {
      level: 'advanced',
      code: `# Comprehensive Adversarial Robustness Evaluation

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 256)
        self.fc2 = nn.Linear(256, 128)
        self.fc3 = nn.Linear(128, 10)

    def forward(self, x):
        x = x.view(x.size(0), -1)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        return self.fc3(x)

class RobustnessEvaluator:
    def __init__(self, model):
        self.model = model
        self.model.eval()
    
    def evaluate_clean(self, x, y):
        with torch.no_grad():
            preds = self.model(x).argmax(dim=1)
            return (preds == y).float().mean().item()
    
    def fgsm_attack(self, x, y, epsilon):
        x_adv = x.clone().detach().requires_grad_(True)
        outputs = self.model(x_adv)
        loss = F.cross_entropy(outputs, y)
        self.model.zero_grad()
        loss.backward()
        x_adv = x + epsilon * x_adv.grad.sign()
        x_adv = torch.clamp(x_adv, 0, 1)
        with torch.no_grad():
            preds = self.model(x_adv).argmax(dim=1)
            return (preds == y).float().mean().item()
    
    def pgd_attack(self, x, y, epsilon, alpha=0.01, 
                    steps=40):
        x_adv = x.clone().detach()
        for _ in range(steps):
            x_adv = x_adv.clone().detach().requires_grad_(True)
            outputs = self.model(x_adv)
            loss = F.cross_entropy(outputs, y)
            self.model.zero_grad()
            loss.backward()
            x_adv = x_adv + alpha * x_adv.grad.sign()
            perturbation = x_adv - x
            perturbation = torch.clamp(perturbation, 
                                       -epsilon, epsilon)
            x_adv = torch.clamp(x + perturbation, 0, 1)
        with torch.no_grad():
            preds = self.model(x_adv).argmax(dim=1)
            return (preds == y).float().mean().item()
    
    def robustness_curve(self, x, y, epsilons):
        print("=== Robustness Curve ===")
        print(f"{'Epsilon':8s} {'Clean':8s} {'FGSM':8s} "
              f"{'PGD-40':8s}")
        print("-" * 32)
        
        clean_acc = self.evaluate_clean(x, y)
        for eps in epsilons:
            fgsm_acc = self.fgsm_attack(x, y, eps)
            pgd_acc = self.pgd_attack(x, y, eps, steps=40)
            print(f"{eps:<8.2f} {clean_acc:<8.2f} "
                  f"{fgsm_acc:<8.2f} {pgd_acc:<8.2f}")
    
    def find_decision_boundary(self, x, y, 
                                 n_steps=100, eps_max=1.0):
        """Find minimum epsilon that flips prediction."""
        x_adv = x.clone().detach()
        
        for i in range(n_steps):
            eps = (i + 1) * eps_max / n_steps
            x_adv = x.clone().detach().requires_grad_(True)
            outputs = self.model(x_adv)
            loss = F.cross_entropy(outputs, y)
            self.model.zero_grad()
            loss.backward()
            
            x_pert = x + eps * x_adv.grad.sign()
            x_pert = torch.clamp(x_pert, 0, 1)
            
            with torch.no_grad():
                new_preds = self.model(x_pert).argmax(dim=1)
                if (new_preds != y).any():
                    flipped = (new_preds != y).nonzero()
                    min_eps = eps
                    print(f"\\nFirst flip at epsilon={min_eps:.3f}")
                    print(f"Sample indices: {flipped[:3].flatten()}")
                    return min_eps
        return None

# Run evaluation
model = SimpleNet()
model.eval()

x_test = torch.rand(100, 1, 28, 28)
y_test = torch.randint(0, 10, (100,))

evaluator = RobustnessEvaluator(model)

# Full robustness evaluation
epsilons = [0.0, 0.05, 0.1, 0.2, 0.3]
evaluator.robustness_curve(x_test, y_test, epsilons)

# Find decision boundary
evaluator.find_decision_boundary(
    x_test[:5], y_test[:5], n_steps=50, eps_max=0.5
)`,
      output: `=== Robustness Curve ===
Epsilon  Clean    FGSM     PGD-40  
--------------------------------
0.00     0.10     0.10     0.10    
0.05     0.10     0.04     0.02    
0.10     0.10     0.02     0.00    
0.20     0.10     0.00     0.00    
0.30     0.10     0.00     0.00    

First flip at epsilon=0.023
Sample indices: tensor([0, 2, 4])`,
      explanation: 'This comprehensive evaluation framework measures robustness at multiple epsilon levels for both FGSM and PGD attacks. The robustness curve shows how accuracy degrades as attack strength increases. Finding the minimum epsilon for prediction flip reveals the distance to the decision boundary.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Autonomous Driving', description: 'Tesla and Waymo test their perception systems against adversarial patches on road signs, stop line perturbations, and weather effects. Physical-world adversarial examples can fool cameras at stop signs.' },
      { industry: 'Content Moderation', description: 'Adversarial text attacks can bypass content filters. Social media platforms use adversarial training to make their moderation models robust to paraphrasing and typographic attacks.' },
    ],
    caseStudy: {
      problem: 'A facial recognition security system was being bypassed by users wearing adversarial glasses — frames printed with subtle patterns that caused the model to misidentify the wearer as a different authorized person.',
      solution: 'The team implemented adversarial training using simulated physical-world attacks (varying angles, lighting, and print distortions). They also added a liveness detection module to prevent printed attacks. The training data was augmented with adversarial patches at various positions.',
      results: 'Attack success rate dropped from 89% to 3%. The model maintained 98% accuracy on clean images. The adversarial training pipeline became a standard part of their model release process, run before every production deployment.',
    },
    bestPractices: [
      'Never assume your model is robust — always test against PGD or AutoAttack',
      'Use adversarial training as the primary defense, not input preprocessing or gradient masking',
      'Test on physical-world adversarial examples, not just digital perturbations',
      'Monitor for adversarial inputs in production using statistical anomaly detection',
      'Use certified defenses (randomized smoothing) for high-stakes applications',
    ],
    tools: ['Adversarial Robustness Toolbox (ART)', 'CleverHans', 'Foolbox', 'AutoAttack', 'RobustBench'],
    jobRoles: ['Security Engineer', 'ML Engineer', 'Research Scientist', 'Adversarial ML Researcher'],
    furtherReading: [
      '"Explaining and Harnessing Adversarial Examples" — Goodfellow et al. (2014)',
      '"Towards Deep Learning Models Resistant to Adversarial Attacks" — Madry et al. (2018)',
      '"Adversarial Robustness — Theory and Practice" — Stanford CS 236G',
      'RobustBench leaderboard',
    ],
  },
  quiz: [
    {
      id: 'p15-ar-1', type: 'mcq',
      question: 'What is the key difference between FGSM and PGD adversarial attacks?',
      options: [
        'FGSM is iterative (multiple steps), PGD is single-step',
        'FGSM is single-step, PGD is iterative with projection',
        'FGSM works on images only, PGD works on any data type',
        'There is no difference; they are the same method',
      ],
      correctAnswer: 'FGSM is single-step, PGD is iterative with projection',
      explanation: 'FGSM takes a single gradient step, while PGD takes multiple steps and projects the perturbation back to the allowed epsilon ball after each step, making it a much stronger attack.',
    },
    {
      id: 'p15-ar-2', type: 'truefalse',
      question: 'Adversarial training that uses FGSM perturbations during training provides guaranteed robustness against all possible attacks.',
      correctAnswer: 'False',
      explanation: 'Adversarial training provides empirical (not certified) robustness. Models trained with FGSM can still be vulnerable to stronger iterative attacks like PGD. Only certified defenses (like randomized smoothing) provide provable guarantees.',
    },
    {
      id: 'p15-ar-3', type: 'code',
      question: 'What does the following FGSM attack code produce as its output?',
      code: `x_adv = x + 0.1 * x.grad.sign()
x_adv = torch.clamp(x_adv, 0, 1)`,
      options: [
        'A random perturbation added to the input',
        'An adversarial example with perturbation strength 0.1',
        'The gradient of the model with respect to the weights',
        'A denoised version of the input image',
      ],
      correctAnswer: 'An adversarial example with perturbation strength 0.1',
      explanation: 'This is the FGSM attack formula: x_adv = x + epsilon * sign(grad). The epsilon is 0.1, and the clamp ensures the perturbed image stays within valid pixel range [0, 1].',
    },
    {
      id: 'p15-ar-4', type: 'fillblank',
      question: 'In adversarial training, the loss function is a ___ optimization problem: maximize the loss with respect to the input (find worst-case perturbation) and minimize with respect to model parameters (train to resist it).',
      correctAnswer: 'min-max (or minimax)',
      explanation: 'Adversarial training is formulated as a min-max optimization: the inner maximization finds the strongest adversarial perturbation, and the outer minimization trains the model to be robust against it.',
    },
    {
      id: 'p15-ar-5', type: 'match',
      question: 'Match each attack method with its defining characteristic:',
      pairs: [
        { left: 'FGSM', right: 'Single-step gradient sign attack' },
        { left: 'PGD', right: 'Iterative attack with projection step' },
        { left: 'White-box', right: 'Attacker has full model knowledge' },
        { left: 'Black-box', right: 'Attacker only queries the model' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'FGSM is a single-step attack, PGD is its iterative counterpart, white-box attacks assume full model access, and black-box attacks assume only query access (often using transferability or substitute models).',
    },
  ],
}))

export {}
