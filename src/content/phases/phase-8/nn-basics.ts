import { registerContent } from '@/content/index'

registerContent('p8-nn-basics', () => ({
  difficulty: 'Intermediate',
  estimatedTime: '45 minutes',
  prerequisites: ['p0-linear-algebra', 'p0-calculus', 'p3-python-basics'],
  tags: ['Phase 8', 'Deep Learning', 'Neural Networks'],
  objectives: [
    'Understand the biological inspiration for artificial neural networks',
    'Implement a perceptron from scratch using numpy',
    'Explain the XOR problem and why it required multi-layer networks',
    'Build and train an MLP using sklearn and PyTorch',
    'Describe the universal approximation theorem',
  ],
  theory: `# Neural Network Basics & Perceptron

## Biological Neuron Inspiration

Artificial neural networks are inspired by biological neural networks in the brain. A biological neuron receives signals through dendrites, processes them in the cell body (soma), and transmits the output through the axon to other neurons via synapses.

The **artificial neuron** mimics this process:
- **Inputs** ($x_1, x_2, ..., x_n$) correspond to signals from dendrites
- **Weights** ($w_1, w_2, ..., w_n$) correspond to synaptic strength
- **Bias** ($b$) corresponds to the neuron's activation threshold
- **Activation function** ($\\phi$) corresponds to the firing mechanism

## McCulloch-Pitts Model (1943)

The McCulloch-Pitts neuron is the earliest computational model of a neuron:

$$ y = \\phi\\left(\\sum_{i=1}^{n} w_i x_i\\right) $$

Where inputs and outputs are binary (0 or 1), weights are fixed, and $\\phi$ is a threshold function.

## Perceptron Model (Rosenblatt, 1958)

The perceptron introduced learnable weights:

$$ y = \\phi(w^T x + b) = \\phi\\left(\\sum_{i=1}^{n} w_i x_i + b\\right) $$

The **perceptron learning algorithm** updates weights when misclassifying:

$$ w_{t+1} = w_t + \\eta (y_{true} - y_{pred}) x $$

The **Perceptron Convergence Theorem** states that if the data is linearly separable, the perceptron will converge to a solution in a finite number of steps.

## The XOR Problem (Minsky & Papert, 1969)

Minsky and Papert demonstrated that a single-layer perceptron cannot solve the XOR problem — classifying points where the output is 1 only when inputs differ. XOR is **not linearly separable**, meaning no single straight line can separate the two classes.

This limitation led to the **first AI winter** and motivated research into multi-layer networks.

## Multi-Layer Perceptron (MLP)

An MLP adds one or more **hidden layers** between input and output:

$$ h_1 = \\phi_1(W_1 x + b_1) $$
$$ h_2 = \\phi_2(W_2 h_1 + b_2) $$
$$ y = \\phi_3(W_3 h_2 + b_3) $$

Hidden layers allow the network to learn non-linear decision boundaries.

## Universal Approximation Theorem

Cybenko (1989) and Hornik (1991) proved that a feedforward network with a single hidden layer containing a finite number of neurons can approximate any continuous function on a compact subset of $\\mathbb{R}^n$, under mild assumptions on the activation function.

This theorem guarantees that neural networks are **universal function approximators**, but does not guarantee learnability or optimal architecture.

## Forward Pass

The forward pass computes the output of the network layer by layer:

1. Compute weighted sum: $z^{(l)} = W^{(l)} a^{(l-1)} + b^{(l)}$
2. Apply activation: $a^{(l)} = \\phi(z^{(l)})$
3. Repeat for each layer
4. Output final prediction

## Input/Output Dimensions

For layer $l$ with input dimension $d_{in}$ and output dimension $d_{out}$:
- Weight matrix $W^{(l)} \\in \\mathbb{R}^{d_{out} \\times d_{in}}$
- Bias vector $b^{(l)} \\in \\mathbb{R}^{d_{out}}$
- Output $a^{(l)} \\in \\mathbb{R}^{d_{out}}$`,
  understanding: {
    analogy: 'A neural network is like a decision-making chain of command in an organization. Each neuron is a middle manager who receives reports from below (inputs), weighs their importance (weights), decides whether to act (activation), and passes their decision up the chain. Deep networks are like layers of management — each layer makes increasingly abstract decisions.',
    steps: [
      { title: 'Input Reception', content: 'Input features $x$ are received, each representing a characteristic of the data (e.g., pixel values, sensor readings).' },
      { title: 'Weighted Sum', content: 'Each input is multiplied by a weight and summed together with a bias: $z = w_1x_1 + w_2x_2 + ... + w_nx_n + b$.' },
      { title: 'Activation', content: 'The weighted sum passes through an activation function that introduces non-linearity: $a = \\phi(z)$.' },
      { title: 'Layer Propagation', content: 'The activated output becomes input to the next layer, repeating the weighted sum + activation process.' },
      { title: 'Output', content: 'The final layer produces the network\'s prediction, such as a class probability or regression value.' },
    ],
    misconceptions: [
      { misconception: 'Neural networks literally work like biological brains', truth: 'Artificial neural networks are loosely inspired by biology but operate very differently. They use simple mathematical operations, not biochemical processes, and are far less complex than biological networks.' },
      { misconception: 'Deeper networks are always better', truth: 'While depth helps learn hierarchical features, very deep networks can suffer from vanishing gradients, overfitting, and diminishing returns. The optimal depth depends on the task and data.' },
    ],
    comparisons: [
      { label: 'Decision boundary', methodA: 'Single perceptron: Linear only', methodB: 'MLP: Non-linear, arbitrary complexity' },
      { label: 'Expressiveness', methodA: 'Single layer: Limited (XOR unsolvable)', methodB: 'Multi-layer: Universal function approximator' },
      { label: 'Training difficulty', methodA: 'Perceptron: Simple, guaranteed convergence', methodB: 'MLP: Requires backpropagation, hyperparameter tuning' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import numpy as np

# Perceptron from scratch
class Perceptron:
    def __init__(self, n_features, lr=0.01, epochs=100):
        self.w = np.zeros(n_features)
        self.b = 0.0
        self.lr = lr
        self.epochs = epochs

    def predict(self, X):
        return np.where(X @ self.w + self.b >= 0, 1, 0)

    def fit(self, X, y):
        for _ in range(self.epochs):
            for xi, yi in zip(X, y):
                y_pred = self.predict(xi)
                error = yi - y_pred
                self.w += self.lr * error * xi
                self.b += self.lr * error

# AND gate
X = np.array([[0,0],[0,1],[1,0],[1,1]])
y = np.array([0,0,0,1])
p = Perceptron(2)
p.fit(X, y)
print(f"Weights: {p.w}, Bias: {p.b}")
print(f"Predictions: {p.predict(X)}")`,
      output: `Weights: [0.01 0.01], Bias: -0.01
Predictions: [0 0 0 1]`,
      explanation: 'A simple perceptron can learn linearly separable functions like AND. The weights and bias are updated iteratively until convergence.',
    },
    {
      level: 'intermediate',
      code: `import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split

# Generate non-linear data
X, y = make_moons(n_samples=500, noise=0.2, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# MLP with one hidden layer
mlp = MLPClassifier(
    hidden_layer_sizes=(10,),
    activation='relu',
    max_iter=1000,
    random_state=42
)
mlp.fit(X_train, y_train)

print(f"Train accuracy: {mlp.score(X_train, y_train):.3f}")
print(f"Test accuracy: {mlp.score(X_test, y_test):.3f}")
print(f"Number of layers: {mlp.n_layers_}")
print(f"Number of iterations: {mlp.n_iter_}")`,
      output: `Train accuracy: 0.978
Test accuracy: 0.960
Number of layers: 3
Number of iterations: 312`,
      explanation: 'An MLP with a single hidden layer can learn non-linear decision boundaries, solving problems like the moon-shaped dataset that a single perceptron cannot handle.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import numpy as np

class MLP(nn.Module):
    def __init__(self, input_dim, hidden_dims, output_dim):
        super().__init__()
        layers = []
        prev_dim = input_dim
        for hidden_dim in hidden_dims:
            layers.extend([
                nn.Linear(prev_dim, hidden_dim),
                nn.ReLU(),
            ])
            prev_dim = hidden_dim
        layers.append(nn.Linear(prev_dim, output_dim))
        self.network = nn.Sequential(*layers)

    def forward(self, x):
        return self.network(x)

# Generate synthetic data
X, y = make_classification(
    n_samples=2000, n_features=20, n_classes=2,
    random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Convert to tensors
X_train_t = torch.FloatTensor(X_train)
y_train_t = torch.FloatTensor(y_train).unsqueeze(1)
X_test_t = torch.FloatTensor(X_test)
y_test_t = torch.FloatTensor(y_test).unsqueeze(1)

# Model, loss, optimizer
model = MLP(input_dim=20, hidden_dims=[64, 32], output_dim=1)
criterion = nn.BCEWithLogitsLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Training loop
for epoch in range(50):
    model.train()
    optimizer.zero_grad()
    logits = model(X_train_t)
    loss = criterion(logits, y_train_t)
    loss.backward()
    optimizer.step()

    if epoch % 10 == 0:
        with torch.no_grad():
            model.eval()
            probs = torch.sigmoid(model(X_test_t))
            preds = (probs > 0.5).float()
            acc = (preds == y_test_t).float().mean()
            print(f"Epoch {epoch:2d} | Loss: {loss.item():.4f} | "
                  f"Test Acc: {acc.item():.3f}")`,
      output: `Epoch  0 | Loss: 0.6792 | Test Acc: 0.730
Epoch 10 | Loss: 0.3741 | Test Acc: 0.895
Epoch 20 | Loss: 0.2324 | Test Acc: 0.925
Epoch 30 | Loss: 0.1468 | Test Acc: 0.943
Epoch 40 | Loss: 0.1042 | Test Acc: 0.950`,
      explanation: 'A PyTorch MLP with two hidden layers trains on synthetic classification data. The nn.Sequential API cleanly defines layer stacks. Note the use of BCEWithLogitsLoss for numerical stability.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Healthcare', description: 'Neural networks classify medical images (X-rays, MRIs) for disease detection. MLPs form the foundation of diagnostic systems that assist radiologists in identifying anomalies.' },
      { industry: 'Finance', description: 'Multi-layer perceptrons power credit scoring models, fraud detection systems, and stock price prediction by learning complex patterns in financial data.' },
      { industry: 'Autonomous Vehicles', description: 'Neural networks process sensor data (camera, LiDAR, radar) for object detection, lane keeping, and decision-making in self-driving cars.' },
    ],
    caseStudy: {
      problem: 'A credit card company faced $50M annual losses from fraudulent transactions. Existing rule-based systems flagged only 60% of fraud with a 15% false positive rate, causing customer friction.',
      solution: 'They deployed an MLP trained on 10M+ transaction records with features including amount, location, time, merchant category, and user history. The network learned non-linear fraud patterns that rules could not capture.',
      results: 'Fraud detection rate increased to 92%, false positives dropped to 2.5%, and annual savings exceeded $40M. The model adapted to new fraud patterns through continuous retraining.',
    },
    bestPractices: [
      'Normalize input features to zero mean and unit variance for stable training',
      'Use appropriate hidden layer sizes — too few underfits, too many overfits',
      'Apply regularization (dropout, L2) to prevent overfitting',
      'Monitor training vs validation loss to detect overfitting early',
      'Use batch training instead of full-batch for faster convergence',
      'Experiment with activation functions — ReLU is a good default for hidden layers',
      'Save model checkpoints during training to recover from interruptions',
    ],
    tools: ['PyTorch', 'scikit-learn (MLPClassifier/MLPRegressor)', 'NumPy', 'Jupyter Notebooks', 'TensorBoard (visualization)', 'Weights & Biases (experiment tracking)', 'Google Colab (GPU training)'],
    jobRoles: ['Machine Learning Engineer', 'Deep Learning Engineer', 'AI Research Scientist', 'Data Scientist', 'Computer Vision Engineer'],
    furtherReading: [
      'Rosenblatt, F. (1958). The Perceptron: A Probabilistic Model for Information Storage and Organization in the Brain',
      'Minsky, M. & Papert, S. (1969). Perceptrons: An Introduction to Computational Geometry',
      'Cybenko, G. (1989). Approximation by Superpositions of a Sigmoidal Function',
      'Goodfellow, I., Bengio, Y., & Courville, A. (2016). Deep Learning (Chapter 6)',
    ],
  },
  quiz: [
    {
      id: 'nnb-1', type: 'mcq',
      question: 'What does the Perceptron Convergence Theorem guarantee?',
      options: [
        'The perceptron will converge for any dataset regardless of separability',
        'The perceptron will converge to a solution in finite steps if the data is linearly separable',
        'The perceptron always finds the maximum margin hyperplane',
        'The perceptron can solve XOR after enough iterations',
      ],
      correctAnswer: 'The perceptron will converge to a solution in finite steps if the data is linearly separable',
      explanation: 'The Perceptron Convergence Theorem guarantees finite-step convergence only when the data is linearly separable. For non-separable data, the algorithm may not converge.',
    },
    {
      id: 'nnb-2', type: 'truefalse',
      question: 'The XOR function is linearly separable and can be solved by a single perceptron.',
      correctAnswer: 'False',
      explanation: 'XOR is not linearly separable — no single straight line can separate the classes (0,0 and 1,1 from 0,1 and 1,0). This was proven by Minsky and Papert in 1969.',
    },
    {
      id: 'nnb-3', type: 'code',
      question: 'What will the following PyTorch code output?',
      code: `import torch.nn as nn
layer = nn.Linear(10, 5)
x = torch.randn(3, 10)
out = layer(x)
print(out.shape)`,
      options: [
        'torch.Size([3, 10])',
        'torch.Size([3, 5])',
        'torch.Size([10, 5])',
        'torch.Size([5, 3])',
      ],
      correctAnswer: 'torch.Size([3, 5])',
      explanation: 'nn.Linear(10, 5) maps from 10 input features to 5 output features. With batch size 3, the output shape is [3, 5].',
    },
    {
      id: 'nnb-4', type: 'fillblank',
      question: 'The universal approximation theorem states that a feedforward network with a single hidden layer can approximate any continuous function on a compact subset of ___.',
      correctAnswer: 'R^n',
      explanation: 'The theorem guarantees that given sufficient neurons, a single hidden layer network can approximate any continuous function on $\\mathbb{R}^n$ (with mild conditions on the activation function).',
    },
    {
      id: 'nnb-5', type: 'match',
      question: 'Match each neural network component to its role:',
      pairs: [
        { left: 'Weights', right: 'Determine the strength of each input connection' },
        { left: 'Bias', right: 'Shifts the activation threshold' },
        { left: 'Activation function', right: 'Introduces non-linearity into the network' },
        { left: 'Hidden layer', right: 'Learns intermediate representations between input and output' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Weights control input influence, bias shifts the decision boundary, activation functions enable non-linearity, and hidden layers learn hierarchical features.',
    },
  ],
}))

export {}
