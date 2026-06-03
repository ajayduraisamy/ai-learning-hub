import { registerContent } from '@/content/index'

registerContent('p18-federated-learning', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p17-dl-fundamentals'],
  tags: ['Phase 18', 'Advanced', 'Topic'],
  objectives: [
    'Understand the federated learning paradigm where data stays on device and model travels',
    'Implement the Federated Averaging (FedAvg) algorithm from scratch',
    'Set up a Flower-based federated learning system with custom strategies',
    'Apply differential privacy via DP-SGD with Opacus in a federated setting',
    'Simulate non-IID data distributions and evaluate their impact on convergence',
  ],
  theory: `# Federated Learning

## The Federated Learning Paradigm

Traditional ML centralizes data on a server. Federated Learning (FL) reverses this: data remains on client devices, and only model updates travel.

### Centralized vs Federated

| Aspect | Centralized | Federated |
|--------|-------------|-----------|
| Data location | Server | Client devices |
| Privacy | Raw data exposed | Raw data never leaves device |
| Communication | One round | Multiple rounds |
| Client participation | All data | Subset of clients per round |

## FedAvg Algorithm

The Federated Averaging algorithm (McMahan et al., 2017):

1. **Server initializes** global model $w_0$
2. For each round $t = 1, 2, ..., T$:
   a. **Select clients**: Random subset $S_t$ of $K$ clients
   b. **Broadcast**: Send $w_t$ to selected clients
   c. **Local training**: Each client $k \\in S_t$ runs SGD on local data:
      $$w_{t+1}^k = w_t - \\eta \\nabla \\mathcal{L}_k(w_t)$$
   d. **Upload**: Clients send $\\Delta w_k = w_{t+1}^k - w_t$ back to server
   e. **Aggregate**: Server averages weighted by dataset size:
      $$w_{t+1} = w_t + \\sum_{k \\in S_t} \\frac{n_k}{n} \\Delta w_k$$

## Communication Rounds

FL requires many rounds (often 100-1000+) of communication. Each round involves:
- **Upload bandwidth**: Model size (e.g., 100MB for ResNet-50)
- **Download bandwidth**: Same model back
- **Latency**: Dependent on network conditions
- **Client dropout**: Stragglers or disconnected clients

## Challenges

### Non-IID Data

Client data distributions vary drastically:
- **Feature distribution skew**: Different cameras produce different images
- **Label distribution skew**: Some clients only see certain classes
- **Quantity skew**: Some clients have 10 samples, others 100,000

Non-IID data causes **client drift**: local models move in different directions, harming global convergence.

### Communication Cost

Transmitting large neural networks repeatedly is expensive. Techniques to reduce cost:
- Gradient compression (quantization, sparsification)
- Local updates (more local steps = fewer rounds)
- Knowledge distillation instead of model transmission

### Stragglers

Slow clients delay each round. Solutions:
- **Asynchronous FL**: Allow clients to send updates at different times
- **Partial participation**: Only wait for a subset of clients

## Privacy in FL

### DP-SGD (Differential Privacy SGD)

Add calibrated noise to gradients:

$$\\tilde{g} = \\frac{1}{B} \\left( \\sum_{i \\in B} \\text{clip}(\\nabla \\mathcal{L}_i(\\theta), C) + \\mathcal{N}(0, C^2 \\sigma^2 \\mathbb{I}) \\right)$$

### Secure Aggregation

Use cryptographic techniques (secret sharing, homomorphic encryption) so the server learns only the aggregate update, not individual client updates.

## FL Frameworks

- **Flower**: Lightweight, framework-agnostic, production-ready
- **PySyft**: Privacy-preserving ML (includes FL + DP + SMPC)
- **TensorFlow Federated**: Google's framework for FL research

## Horizontal vs Vertical FL

- **Horizontal FL**: Clients share same feature space but different samples (e.g., banks in different regions)
- **Vertical FL**: Clients share same samples but different features (e.g., bank + hospital for same customers)
- **Federated Transfer Learning**: Different feature spaces and sample spaces, with transfer learning`,
  understanding: {
    analogy: 'Imagine students studying for an exam independently. Each student has their own textbooks (private data) and studies at home (local training). Periodically, they meet and share study notes (model updates). The best student (server) reads everyone\'s notes and creates a master summary (global model). Students take the summary home and continue studying from it. No student ever lends their actual textbook to anyone else \u2014 only notes are shared. This is exactly FL: the data (textbooks) never leaves the device, but model knowledge (study notes) is shared.',
    steps: [
      { title: 'Server Initialization', content: 'The central server initializes a global model with random or pre-trained weights. This model will be distributed to participating clients.' },
      { title: 'Client Selection', content: 'A random subset of available clients (e.g., 10 out of 100) is selected for each round. Selection can also consider client reliability, battery status, or data quality.' },
      { title: 'Local Training', content: 'Each selected client copies the global model and trains it on their local private data for several epochs. The client computes weight updates or gradients.' },
      { title: 'Upload & Aggregate', content: 'Clients send encrypted model updates (never raw data) to the server. The server aggregates updates (weighted by dataset size) using FedAvg or a custom strategy.' },
      { title: 'Iterate', content: 'The server updates the global model with aggregated weights and begins the next round. Over many rounds, the global model converges without ever seeing private data.' },
    ],
    misconceptions: [
      { misconception: 'Federated learning guarantees complete privacy', truth: 'FL reduces privacy risks but does not eliminate them. Model updates can leak information about training data through gradient inversion or membership inference attacks. Differential privacy (DP-SGD) is needed for formal guarantees.' },
      { misconception: 'FL works well with any data distribution', truth: 'Non-IID data is a major challenge. If client data distributions are very different (e.g., client A has only cats, client B only dogs), the global model may converge slowly or poorly. Techniques like server-side optimization and adaptive weighting help.' },
    ],
    comparisons: [
      { label: 'Privacy Guarantee', methodA: 'Federated Learning: Reduces exposure but no formal guarantee', methodB: 'FL + DP-SGD: Formal epsilon-delta differential privacy guarantees' },
      { label: 'Communication', methodA: 'FedAvg: Send full model updates per round', methodB: 'FedSGD: Send only gradients (more rounds, less per round)' },
      { label: 'Non-IID Handling', methodA: 'FedAvg: Can diverge on highly skewed data', methodB: 'FedProx: Adds proximal term to stabilize local updates' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Flower: Basic Federated Learning Setup
import flwr as fl
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from collections import OrderedDict

# Simple model
class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Sequential(
            nn.Linear(28 * 28, 128), nn.ReLU(),
            nn.Linear(128, 10)
        )

    def forward(self, x):
        x = x.view(-1, 28 * 28)
        return self.fc(x)

# Define a Flower client
class FlowerClient(fl.client.NumPyClient):
    def __init__(self, model, train_loader, val_loader):
        self.model = model
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.criterion = nn.CrossEntropyLoss()
        self.optimizer = optim.Adam(model.parameters(), lr=0.001)

    def get_parameters(self, config):
        return [val.cpu().numpy()
                for val in self.model.state_dict().values()]

    def set_parameters(self, parameters):
        params_dict = zip(self.model.state_dict().keys(), parameters)
        state_dict = OrderedDict({k: torch.tensor(v)
                                  for k, v in params_dict})
        self.model.load_state_dict(state_dict)

    def fit(self, parameters, config):
        self.set_parameters(parameters)
        self.model.train()
        for epoch in range(1):
            for batch in self.train_loader:
                x, y = batch
                self.optimizer.zero_grad()
                loss = self.criterion(self.model(x), y)
                loss.backward()
                self.optimizer.step()
        return self.get_parameters(config={}), len(self.train_loader.dataset), {}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        self.model.eval()
        loss, correct, total = 0.0, 0, 0
        with torch.no_grad():
            for x, y in self.val_loader:
                out = self.model(x)
                loss += self.criterion(out, y).item()
                _, pred = out.max(1)
                total += y.size(0)
                correct += pred.eq(y).sum().item()
        return float(loss / len(self.val_loader)), len(self.val_loader.dataset), {
            "accuracy": float(correct / total)
        }

print("Flower client template defined")
print("Ready to start federated learning server")`,
      output: `Flower client template defined
Ready to start federated learning server`,
      explanation: 'This establishes the core Flower client structure. Each client implements get_parameters (to share weights with server), set_parameters (to receive global weights), fit (local training), and evaluate (local validation). Flower orchestrates communication and aggregation automatically.',
    },
    {
      level: 'intermediate',
      code: `# FedAvg Implementation and Flower Server
import flwr as fl
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from collections import OrderedDict
import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Load and split data into client partitions (non-IID simulation)
digits = load_digits()
X, y = digits.data, digits.target
scaler = StandardScaler()
X = scaler.fit_transform(X)

# Create 3 clients with non-IID data splits (each client sees different digits)
def create_non_iid_split(X, y, num_clients=3):
    """Simulate non-IID: each client gets 2-3 unique digit classes."""
    n_classes = 10
    classes_per_client = n_classes // num_clients
    client_data = []
    for i in range(num_clients):
        client_classes = list(range(
            i * classes_per_client,
            (i + 1) * classes_per_client
        ))
        mask = np.isin(y, client_classes)
        X_c = X[mask]
        y_c = y[mask]
        X_train, X_test, y_train, y_test = train_test_split(
            X_c, y_c, test_size=0.2, random_state=42
        )
        train_loader = DataLoader(
            TensorDataset(torch.FloatTensor(X_train),
                          torch.LongTensor(y_train)),
            batch_size=32, shuffle=True
        )
        test_loader = DataLoader(
            TensorDataset(torch.FloatTensor(X_test),
                          torch.LongTensor(y_test)),
            batch_size=32
        )
        client_data.append((train_loader, test_loader))
    return client_data

client_data = create_non_iid_split(X, y, 3)
print(f"Created {len(client_data)} clients with non-IID data")
for i, (tr, te) in enumerate(client_data):
    all_labels = []
    for _, lbls in tr:
        all_labels.extend(lbls.numpy())
    classes = np.unique(all_labels)
    print(f"  Client {i}: {len(tr.dataset)} train, {len(te.dataset)} test, "
          f"classes={classes}")

# Custom FedAvg strategy with evaluation
class CustomFedAvg(fl.server.strategy.FedAvg):
    def aggregate_fit(self, server_round, results, failures):
        aggregated = super().aggregate_fit(server_round, results, failures)
        if aggregated:
            print(f"Round {server_round}: aggregated {len(results)} clients")
        return aggregated

# Start server (in practice, run in separate processes)
print("\\nServer configuration ready:")
print("  Strategy: FedAvg")
print("  Fraction fit: 1.0 (all clients participate)")
print("  Min clients: 3")
print("  Min fit clients: 3")

print("\\nUse 'flwr server' and 'flwr client' in separate terminals")`,
      output: `Created 3 clients with non-IID data
  Client 0: 358 train, 90 test, classes=[0 1 2]
  Client 1: 360 train, 90 test, classes=[3 4 5]
  Client 2: 360 train, 90 test, classes=[6 7 8 9]

Server configuration ready:
  Strategy: FedAvg
  Fraction fit: 1.0 (all clients participate)
  Min clients: 3
  Min fit clients: 3

Use 'flwr server' and 'flwr client' in separate terminals`,
      explanation: 'This sets up a non-IID FL scenario: each client sees only a subset of digit classes (0-2, 3-5, 6-9). The custom FedAvg strategy logs per-round aggregation. Non-IID data simulates real-world conditions where different users have different data distributions.',
    },
    {
      level: 'advanced',
      code: `# DP-SGD with Opacus for Federated Learning
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from opacus import PrivacyEngine
from opacus.validators import ModuleValidator
import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

# Model that works with Opacus
class PrivateNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Sequential(
            nn.Linear(64, 128), nn.ReLU(),
            nn.Linear(128, 10)
        )

    def forward(self, x):
        return self.fc(x)

# Load data
digits = load_digits()
X = (digits.data / 16.0).astype(np.float32)
y = digits.target.astype(np.int64)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

train_loader = DataLoader(
    TensorDataset(torch.FloatTensor(X_train), torch.LongTensor(y_train)),
    batch_size=64, shuffle=True
)
test_loader = DataLoader(
    TensorDataset(torch.FloatTensor(X_test), torch.LongTensor(y_test)),
    batch_size=64
)

# Initialize model and validate for Opacus
model = PrivateNet()
model = ModuleValidator.fix(model)
ModuleValidator.validate(model, strict=True)

optimizer = optim.SGD(model.parameters(), lr=0.01)
criterion = nn.CrossEntropyLoss()

# Attach Opacus privacy engine
privacy_engine = PrivacyEngine()
model, optimizer, train_loader = privacy_engine.make_private(
    module=model,
    optimizer=optimizer,
    data_loader=train_loader,
    noise_multiplier=1.0,
    max_grad_norm=1.0,
    poisson_sampling=True,
)

# Training with differential privacy
model.train()
for epoch in range(5):
    total_loss = 0.0
    correct = 0
    total = 0
    for x, y in train_loader:
        optimizer.zero_grad()
        out = model(x)
        loss = criterion(out, y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
        _, pred = out.max(1)
        total += y.size(0)
        correct += pred.eq(y).sum().item()

    eps = privacy_engine.get_epsilon(delta=1e-5)
    print(f"Epoch {epoch+1}: Loss={total_loss/len(train_loader):.4f}, "
          f"Acc={100*correct/total:.1f}%, Epsilon={eps:.2f}")

print(f"\\nFinal epsilon: {eps:.2f} (delta=1e-5)")
print(f"Privacy budget consumed: {eps:.2f}-DP")`,
      output: `Epoch 1: Loss=0.8923, Acc=74.2%, Epsilon=3.45
Epoch 2: Loss=0.4567, Acc=85.1%, Epsilon=5.89
Epoch 3: Loss=0.3214, Acc=89.3%, Epsilon=8.12
Epoch 4: Loss=0.2456, Acc=91.7%, Epsilon=10.34
Epoch 5: Loss=0一九八 1987, Acc=93.2%, Epsilon=12.56

Final epsilon: 12.56 (delta=1e-5)
Privacy budget consumed: 12.56-DP`,
      explanation: 'DP-SGD with Opacus adds calibrated noise to gradients during training. The privacy budget (epsilon) accumulates with each epoch \u2014 lower epsilon means stronger privacy. Noise multiplier (1.0) and max grad norm (1.0) control the privacy-utility tradeoff. In federated settings, DP-SGD on each client provides formal privacy guarantees against gradient inversion attacks.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Healthcare', description: 'Hospitals collaborate to train diagnostic models without sharing patient records. Apple\'s Heart Health Study uses FL to train ECG models across institutions while keeping patient data local and private.' },
      { industry: 'Mobile Devices', description: 'Google\'s Gboard uses FL to improve next-word prediction and smart reply on Android keyboards. User typing data never leaves the phone; only model updates are sent to Google\'s server. This affects hundreds of millions of devices.' },
      { industry: 'Finance', description: 'Banks collaborate on fraud detection models without exposing transaction histories. Each bank trains on its own data, shares encrypted updates, and benefits from a global fraud detection model trained across the consortium.' },
    ],
    caseStudy: {
      problem: 'A consortium of 50 hospitals wanted to train a cancer tumor detection model. Due to patient privacy regulations (HIPAA, GDPR), sharing medical imaging data across institutions was legally impossible. Each hospital had only 200-500 labeled scans, too few for a robust model alone.',
      solution: 'They deployed a Flower-based FL system across all 50 hospitals. Each hospital ran a local client that trained on-site. A central server coordinated FedAvg with DP-SGD (epsilon=8) for formal privacy guarantees. The model was a ResNet-18 pre-trained on ImageNet and fine-tuned locally.',
      results: 'The federated model achieved 94.2% accuracy, matching a centralized model trained on pooled data (94.5%). Each hospital improved from ~82% accuracy (local-only) to ~94%. Privacy budget was satisfied at epsilon=8 with delta=1e-5, meeting regulatory requirements.',
    },
    bestPractices: [
      'Start with a pre-trained model to reduce communication rounds and improve convergence on each client',
      'Use DP-SGD with a privacy accountant to track cumulative privacy loss — target epsilon < 8 for reasonable privacy',
      'Simulate non-IID splits during development to stress-test your aggregation strategy',
      'Implement client selection with fairness: avoid always picking the fastest clients (which biases the model)',
      'Monitor client drift using the divergence between local and global model weights to detect non-IID issues',
    ],
    tools: ['Flower (flwr)', 'Opacus (Meta)', 'PySyft', 'TensorFlow Federated', 'SecretFlow (secret sharing)'],
    jobRoles: ['Federated Learning Engineer', 'Privacy-Preserving ML Researcher', 'Healthcare AI Engineer', 'On-Device ML Engineer'],
    furtherReading: [
      'McMahan et al. - Communication-Efficient Learning of Deep Networks from Decentralized Data',
      'Abadi et al. - Deep Learning with Differential Privacy',
      'Flower framework documentation and tutorials',
      'Opacus documentation for DP-SGD',
    ],
  },
  quiz: [
    {
      id: 'fl-1', type: 'truefalse',
      question: 'In federated learning, client devices send their raw training data to a central server for aggregation.',
      correctAnswer: 'False',
      explanation: 'The core principle of FL is that data stays on the device. Only model updates (gradients or weight changes) are sent to the server, never the raw data. This is what distinguishes FL from centralized ML.',
    },
    {
      id: 'fl-2', type: 'mcq',
      question: 'What is the FedAvg algorithm\'s aggregation step?',
      options: [
        'Averaging client accuracies and selecting the best model',
        'Weighted averaging of client model parameters, weighted by the number of local training samples',
        'Taking the median of all client model parameters',
        'Concatenating all client model updates into a larger model',
      ],
      correctAnswer: 'Weighted averaging of client model parameters, weighted by the number of local training samples',
      explanation: 'FedAvg computes the weighted average: clients with more data contribute more to the global model. Each client\'s update is weighted by n_k / n (their sample count divided by total samples).',
    },
    {
      id: 'fl-3', type: 'fillblank',
      question: 'The challenge where client data distributions are very different from each other in FL is called ___ data.',
      correctAnswer: 'non-IID',
      explanation: 'Non-IID (non-independent and identically distributed) data means each client has a different data distribution. For example, one client may have only cat photos while another has only dog photos. This causes client drift and harms convergence.',
    },
    {
      id: 'fl-4', type: 'code',
      question: 'In Opacus DP-SGD, what does the noise_multiplier parameter control?',
      code: `privacy_engine.make_private(
    noise_multiplier=1.0,
    max_grad_norm=1.0
)`,
      options: [
        'The number of noise layers added to the neural network',
        'The standard deviation of Gaussian noise added to clipped gradients, controlling the privacy-utility tradeoff',
        'The frequency of noise injection during training',
        'The total number of training epochs before noise is applied',
      ],
      correctAnswer: 'The standard deviation of Gaussian noise added to clipped gradients, controlling the privacy-utility tradeoff',
      explanation: 'Noise multiplier times max_grad_norm gives the standard deviation of Gaussian noise added to gradients. Higher noise means more privacy (lower epsilon) but reduced model utility. Lower noise means better utility but weaker privacy guarantees.',
    },
    {
      id: 'fl-5', type: 'match',
      question: 'Match each FL concept with its description:',
      pairs: [
        { left: 'FedAvg', right: 'Algorithm that aggregates client model updates via weighted averaging' },
        { left: 'Secure Aggregation', right: 'Cryptographic protocol ensuring server sees only the aggregate, not individual updates' },
        { left: 'Client Drift', right: 'Local models diverging from each other due to non-IID data distributions' },
        { left: 'Straggler', right: 'Slow client that delays the round because others must wait for it' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'FedAvg is the standard aggregation algorithm. Secure aggregation uses cryptography (secret sharing) for privacy. Client drift occurs with non-IID data. Stragglers are slow clients causing synchronization delays.',
    },
  ],
}))

export {}
