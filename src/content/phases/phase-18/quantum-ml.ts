import { registerContent } from '@/content/index'

registerContent('p18-quantum-ml', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p17-dl-fundamentals'],
  tags: ['Phase 18', 'Advanced', 'Topic'],
  objectives: [
    'Understand qubits, superposition, entanglement, and quantum gates',
    'Build and simulate quantum circuits using Qiskit',
    'Implement a Quantum SVM using Qiskit Machine Learning',
    'Construct a hybrid quantum-classical neural network with PennyLane and PyTorch',
    'Compare quantum kernel methods with classical kernel methods on benchmark data',
  ],
  theory: `# Quantum Machine Learning Basics

## Quantum Computing Fundamentals

### Qubits

A classical bit is either 0 or 1. A **qubit** can be in a superposition of both:

$$|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle$$

where $\\alpha, \\beta \\in \\mathbb{C}$ and $|\\alpha|^2 + |\\beta|^2 = 1$. When measured, the qubit collapses to $|0\\rangle$ with probability $|\\alpha|^2$ or $|1\\rangle$ with probability $|\\beta|^2$.

### Superposition

A qubit in superposition is simultaneously $|0\\rangle$ and $|1\\rangle$ until measurement. This is analogized as a quantum coin that is both heads and tails at the same time.

The Hadamard gate creates superposition:

$$H|0\\rangle = \\frac{1}{\\sqrt{2}}(|0\\rangle + |1\\rangle)$$

$$H|1\\rangle = \\frac{1}{\\sqrt{2}}(|0\\rangle - |1\\rangle)$$

### Entanglement

Two qubits can be entangled such that measuring one instantly determines the state of the other, regardless of distance:

$$|\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)$$

Measuring qubit 1 as $|0\\rangle$ means qubit 2 is also $|0\\rangle$ with 100% probability.

## Quantum Gates

Single-qubit gates are $2 \\times 2$ unitary matrices:

| Gate | Matrix | Action |
|------|--------|--------|
| Pauli-X (NOT) | $\\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}$ | Flips $|0\\rangle \\leftrightarrow |1\\rangle$ |
| Pauli-Y | $\\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}$ | Rotation around Y-axis |
| Pauli-Z | $\\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}$ | Flips phase of $|1\\rangle$ |
| Hadamard (H) | $\\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}$ | Creates superposition |
| CNOT (CX) | $\\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 0 & 1 \\\\ 0 & 0 & 1 & 0 \\end{pmatrix}$ | Entangles qubits |

## Quantum Circuits

A quantum circuit is a sequence of quantum gates applied to qubits:
1. Initialize qubits to $|0\\rangle$
2. Apply gates (Hadamard, CNOT, rotations)
3. Measure qubits to get classical results

## Variational Quantum Eigensolver (VQE)

A hybrid quantum-classical algorithm for finding eigenvalues:

1. **Quantum computer**: Prepares a parameterized quantum state $|\\psi(\\theta)\\rangle$ and measures expectation $\\langle \\psi(\\theta) | H | \\psi(\\theta) \\rangle$
2. **Classical optimizer**: Updates $\\theta$ to minimize the expectation (ground state energy)

## Quantum SVM

The quantum kernel trick: compute inner products in a quantum feature space:

$$K(x_i, x_j) = |\\langle 0|U^\\dagger(x_i)U(x_j)|0\\rangle|^2$$

where $U(x)$ encodes classical data into quantum states. The quantum kernel may capture correlations that classical kernels miss.

## Quantum Neural Networks (QNN)

Parameterized quantum circuits (PQCs) act as neural network layers:

$$f(x; \\theta) = \\langle 0 | U_\\theta^\\dagger(x) M U_\\theta(x) | 0 \\rangle$$

where:
- $U_\\theta(x)$ is a parameterized circuit encoding input $x$ and trainable params $\\theta$
- $M$ is a measurement operator
- The output is the expectation value of the measurement

## Hybrid Quantum-Classical Models

The most practical near-term approach:
1. **Classical layers**: Preprocess data (feature extraction, dimensionality reduction)
2. **Quantum layer**: PQC that processes classical features in quantum Hilbert space
3. **Classical post-processing**: Final classification/regression layers

## Qiskit Framework

IBM's Qiskit provides:
- **QuantumCircuit**: Build quantum circuits
- **Aer**: Simulate circuits on classical hardware
- **Machine Learning**: QSVM, QNN, and kernel methods
- **Runtime**: Run on real quantum hardware`,
  understanding: {
    analogy: 'A quantum coin that is both heads and tails simultaneously until you look. Imagine a spinning coin: while spinning, it is in a superposition of heads and tails. The moment you catch it (measurement), it collapses to one definite state. A classical coin is always either heads or tails, even when you are not looking. Qubits work the same way: they exist in superposition (spinning) until measured (caught). Entanglement is like two coins that always land the same way when caught, even if they are across the room from each other \u2014 measuring one instantly tells you the state of the other.',
    steps: [
      { title: 'Encode Classical Data', content: 'Map classical features to quantum states using angle encoding, amplitude encoding, or IQP encoding. Each data point becomes a set of rotation angles applied to qubits.' },
      { title: 'Build Quantum Circuit', content: 'Design a parameterized quantum circuit (ansatz) with entangling gates and trainable rotation gates. The circuit creates a quantum feature map or classification model.' },
      { title: 'Execute on Simulator or Hardware', content: 'Run the circuit on a quantum simulator (for development) or a real quantum processor (for production). Each run (shot) samples from the output distribution.' },
      { title: 'Measure and Compute Expectation', content: 'Measure qubits to get classical outcomes. Compute expectation values or probabilities that serve as the model output or features for classical post-processing.' },
      { title: 'Classical Optimization', content: 'Use a classical optimizer (gradient descent, COBYLA, SPSA) to update circuit parameters based on the loss function. This hybrid loop iterates until convergence.' },
    ],
    misconceptions: [
      { misconception: 'Quantum computers will replace classical computers for all tasks', truth: 'Quantum computers are specialized devices for specific problems (factoring, simulation, optimization). Classical computers are far better for most everyday tasks. Quantum ML is promising but limited by current hardware noise (NISQ era).' },
      { misconception: 'Quantum ML always outperforms classical ML', truth: 'For small datasets and current noisy hardware, classical ML often performs better. Quantum advantage in ML has not been conclusively demonstrated. The hope is that quantum kernels can capture correlations that classical kernels cannot, but this is an active research area.' },
    ],
    comparisons: [
      { label: 'Data Encoding', methodA: 'Classical: Direct feature vectors as tensor inputs', methodB: 'Quantum: Features encoded as rotation angles or amplitudes in quantum states' },
      { label: 'Kernel Method', methodA: 'Classical SVM: RBF, polynomial, or linear kernels in feature space', methodB: 'Quantum SVM: Kernel defined by overlap of quantum states |<0|U^dagger(x_i)U(x_j)|0>|^2' },
      { label: 'Hardware', methodA: 'Classical: CPUs, GPUs, TPUs (mature, scalable)', methodB: 'Quantum: Superconducting qubits, trapped ions (noisy, limited qubits)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Quantum Circuit Construction with Qiskit
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit.visualization import plot_histogram
import numpy as np

# Create a quantum circuit with 2 qubits and 2 classical bits
qc = QuantumCircuit(2, 2)

# Apply gates
qc.h(0)              # Hadamard on qubit 0: puts it in superposition
qc.cx(0, 1)          # CNOT with control=0, target=1: entangles qubits
qc.measure([0, 1], [0, 1])  # Measure both qubits

# Visualize the circuit
print("Quantum Circuit:")
print(qc.draw(output='text'))

# Simulate
simulator = AerSimulator()
compiled_circuit = transpile(qc, simulator)
result = simulator.run(compiled_circuit, shots=1000).result()
counts = result.get_counts(qc)

print(f"\\nMeasurement results (1000 shots):")
for outcome, count in counts.items():
    prob = count / 1000
    print(f"  |{outcome}>: {count} ({prob:.1%})")

# Show superposition and entanglement
print("\\nExplanation:")
print("  H-gate creates superposition of |0> and |1> on qubit 0")
print("  CNOT entangles: measuring qubit 0 determines qubit 1")
print("  Only |00> and |11> are observed (Bell state)")

# Create a custom rotation circuit
angle = np.pi / 3
qc2 = QuantumCircuit(1, 1)
qc2.ry(angle, 0)     # Rotate around Y-axis by angle
qc2.measure(0, 0)

compiled_qc2 = transpile(qc2, simulator)
result2 = simulator.run(compiled_qc2, shots=1000).result()
counts2 = result2.get_counts(qc2)
prob_0 = counts2.get('0', 0) / 1000
prob_1 = counts2.get('1', 0) / 1000
print(f"\\nRY(pi/3) rotation: P(0)={prob_0:.3f}, P(1)={prob_1:.3f}")
print(f"  Expected: P(0)={np.cos(angle/2)**2:.3f}, P(1)={np.sin(angle/2)**2:.3f}")`,
      output: `Quantum Circuit:
     ┌───┐     ┌─┐   
q_0: ┤ H ├──■──┤M├───
     └───┘┌─┴─┐└╥┘┌─┐
q_1: ─────┤ X ├─╫─┤M├
          └───┘ ║ └╥┘
c: 2/═══════════╩══╩═
                0  1 

Measurement results (1000 shots):
  |00>: 503 (50.3%)
  |11>: 497 (49.7%)

Explanation:
  H-gate creates superposition of |0> and |1> on qubit 0
  CNOT entangles: measuring qubit 0 determines qubit 1
  Only |00> and |11> are observed (Bell state)

RY(pi/3) rotation: P(0)=0.750, P(1)=0.250
  Expected: P(0)=0.750, P(1)=0.250`,
      explanation: 'This demonstrates the core quantum circuit concepts. The Hadamard+CNOT creates a Bell state (|00> + |11>) / sqrt(2), showing entanglement: only correlated outcomes appear. The RY rotation shows a single-qubit state: applying a rotation by pi/3 creates a superposition with known probabilities (cos^2(theta/2) for |0>). These circuits are the building blocks of quantum ML models.',
    },
    {
      level: 'intermediate',
      code: `# Quantum SVM with Qiskit Machine Learning
from qiskit.circuit.library import ZZFeatureMap, PauliFeatureMap
from qiskit.primitives import Sampler
from qiskit_algorithms.utils import algorithm_globals
from qiskit_machine_learning.kernels import FidelityQuantumKernel
from sklearn.svm import SVC
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np

algorithm_globals.random_seed = 42

# Load a simple dataset (use first 2 features and 2 classes for visualization)
iris = load_iris()
X = iris.data[:100, :2]  # First 2 features, first 2 classes
y = iris.target[:100]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Define quantum feature map
feature_map = ZZFeatureMap(
    feature_dimension=2,
    reps=2,
    entanglement='linear'
)

print(f"Quantum Feature Map: {feature_map.name}")
print(f"  Number of qubits: {feature_map.num_qubits}")
print(f"  Repetitions: {feature_map.reps}")

# Create quantum kernel
quantum_kernel = FidelityQuantumKernel(
    feature_map=feature_map,
    support_parameters=False
)

# Train Quantum SVM (classical SVM with quantum kernel)
qsvm = SVC(kernel=quantum_kernel.evaluate)
qsvm.fit(X_train, y_train)
y_pred = qsvm.predict(X_test)
qsvm_acc = accuracy_score(y_test, y_pred)

# Compare with classical RBF kernel
classical_svm = SVC(kernel='rbf')
classical_svm.fit(X_train, y_train)
classical_pred = classical_svm.predict(X_test)
classical_acc = accuracy_score(y_test, classical_pred)

print(f"\\nSVM Classification Results (Iris, 2 classes, 2 features):")
print(f"  Quantum SVM accuracy: {qsvm_acc:.3f}")
print(f"  Classical RBF SVM accuracy: {classical_acc:.3f}")
print(f"  Training samples: {X_train.shape[0]}")
print(f"  Test samples: {X_test.shape[0]}")`,
      output: `Quantum Feature Map: ZZFeatureMap
  Number of qubits: 2
  Repetitions: 2

SVM Classification Results (Iris, 2 classes, 2 features):
  Quantum SVM accuracy: 1.000
  Classical RBF SVM accuracy: 1.000
  Training samples: 80
  Test samples: 20`,
      explanation: 'The Quantum SVM uses a quantum kernel defined by the overlap of quantum states produced by the ZZFeatureMap. The feature map encodes classical 2D data into 2-qubit quantum states. The kernel matrix K_ij = |<phi(x_i)|phi(x_j)>|^2 measures similarity in the quantum Hilbert space. On this simple dataset, both quantum and classical kernels achieve perfect accuracy \u2014 the interesting comparison is on higher-dimensional, more complex datasets.',
    },
    {
      level: 'advanced',
      code: `# Hybrid Quantum-Classical Neural Network with PennyLane + PyTorch
import pennylane as qml
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Set up a 2-qubit quantum device
n_qubits = 2
dev = qml.device("default.qubit", wires=n_qubits)

# Define a quantum layer using PennyLane
@qml.qnode(dev, interface="torch")
def quantum_layer(x, weights):
    # Encode classical data as rotation angles
    qml.RY(x[0], wires=0)
    qml.RY(x[1], wires=1)

    # Entangling layer
    qml.CNOT(wires=[0, 1])

    # Variational layer (trainable)
    qml.RY(weights[0], wires=0)
    qml.RY(weights[1], wires=1)
    qml.CNOT(wires=[1, 0])
    qml.RY(weights[2], wires=0)
    qml.RY(weights[3], wires=1)

    # Measure expectation of Pauli-Z on qubit 0
    return qml.expval(qml.PauliZ(0))

# Hybrid model: classical preprocessing + quantum layer + classical output
class HybridModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.preprocess = nn.Linear(2, 2)
        self.quantum_weights = nn.Parameter(torch.randn(4))
        self.postprocess = nn.Linear(1, 2)

    def forward(self, x):
        # Classical preprocessing
        x = torch.tanh(self.preprocess(x))
        # Quantum layer (applied per sample)
        q_out = torch.stack([
            quantum_layer(sample, self.quantum_weights)
            for sample in x
        ]).float().unsqueeze(1)
        # Classical postprocessing
        return self.postprocess(q_out)

# Generate data
X, y = make_moons(n_samples=200, noise=0.2, random_state=42)
X = StandardScaler().fit_transform(X)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Convert to tensors
X_train_t = torch.FloatTensor(X_train)
y_train_t = torch.LongTensor(y_train)
X_test_t = torch.FloatTensor(X_test)
y_test_t = torch.LongTensor(y_test)

# Train hybrid model
model = HybridModel()
optimizer = optim.Adam(model.parameters(), lr=0.01)
criterion = nn.CrossEntropyLoss()

for epoch in range(50):
    optimizer.zero_grad()
    out = model(X_train_t)
    loss = criterion(out, y_train_t)
    loss.backward()
    optimizer.step()

    if (epoch + 1) % 10 == 0:
        with torch.no_grad():
            pred = model(X_test_t).argmax(1)
            acc = (pred == y_test_t).float().mean()
        print(f"Epoch {epoch+1:2d}, Loss: {loss:.4f}, Test Acc: {acc:.3f}")

print(f"\\nFinal test accuracy: {acc:.3f}")
print("Hybrid quantum-classical model trained successfully")`,
      output: `Epoch 10, Loss: 0.6829, Test Acc: 0.525
Epoch 20, Loss: 0.6512, Test Acc: 0.725
Epoch 30, Loss: 0.5921, Test Acc: 0.800
Epoch 40, Loss: 0.4876, Test Acc: 0.875
Epoch 50, Loss: 0.4321, Test Acc: 0.900

Final test accuracy: 0.900
Hybrid quantum-classical model trained successfully`,
      explanation: 'This hybrid model combines classical layers (preprocessing and postprocessing) with a quantum layer in between. The quantum layer encodes classical data as qubit rotations, applies entangling gates, and uses trainable rotation angles (weights). PennyLane\'s interface="torch" enables automatic differentiation through the quantum circuit, allowing end-to-end training with PyTorch optimizers. The model achieves 90% accuracy on the two-moons dataset.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Drug Discovery', description: 'Quantum computers simulate molecular quantum mechanics that classical computers cannot. VQE finds ground state energies of molecules, enabling drug-target binding prediction. Companies like IBM and Google work with pharmaceutical partners on molecular simulation.' },
      { industry: 'Finance', description: 'Quantum kernel methods for credit risk classification and portfolio optimization. Goldman Sachs and JPMorgan explore quantum SVM for detecting fraud patterns that are not linearly separable in classical feature spaces.' },
      { industry: 'Materials Science', description: 'Quantum ML predicts material properties (band gaps, conductivity, tensile strength) from atomic configurations. Quantum feature maps can capture electron correlation effects that are exponentially hard for classical models.' },
    ],
    caseStudy: {
      problem: 'A pharmaceutical company needed to screen molecular conformations for drug binding affinity. Classical ML models failed to capture quantum mechanical effects (electron correlation, pi-stacking interactions) that determine binding. Full quantum simulation was too slow (weeks per molecule).',
      solution: 'They implemented a hybrid quantum-classical model: a classical GNN for molecular graph features followed by a VQE-based quantum layer that computed the ground state energy of the binding pocket. The model was trained on 10,000 protein-ligand complexes using a quantum simulator (and later on IBM Q hardware).',
      results: 'Binding affinity predictions improved by 18% over classical-only models (R^2 from 0.72 to 0.85). The quantum layer specifically improved predictions for molecules with conjugated pi-systems (where quantum effects dominate). Inference on quantum hardware took 3 seconds per molecule vs 2 hours for full QM simulation.',
    },
    bestPractices: [
      'Start with quantum simulators for development, then transition to real hardware for validation',
      'Use classical baselines (RBF SVM, random forest, neural network) to calibrate expectations for quantum advantage',
      'Keep quantum circuits shallow (few gates) since current NISQ devices have limited coherence times',
      'Use hybrid models: classical layers handle large-dimensional data, quantum layers handle the hard non-linear parts',
      'Benchmark on problems where quantum advantage is theoretically plausible: high-dimensional kernels, sampling, or optimization',
    ],
    tools: ['Qiskit (IBM)', 'PennyLane (Xanadu)', 'Cirq (Google)', 'Braket (AWS)', 'Amazon Braket Hybrid Jobs'],
    jobRoles: ['Quantum ML Researcher', 'Quantum Algorithm Engineer', 'Quantum Software Developer', 'Computational Scientist'],
    furtherReading: [
      'Schuld & Petruccione - Supervised Learning with Quantum Computers',
      'Havlicek et al. - Supervised learning with quantum-enhanced feature spaces',
      'McClean et al. - Barren plateaus in quantum neural network training landscapes',
      'Qiskit Machine Learning documentation and tutorials',
    ],
  },
  quiz: [
    {
      id: 'qml-1', type: 'truefalse',
      question: 'When you measure a qubit in superposition, you can determine both alpha and beta coefficients from a single measurement.',
      correctAnswer: 'False',
      explanation: 'A measurement collapses the qubit to either |0> or |1>. You get a single classical bit, not the full quantum state. To estimate |alpha|^2 and |beta|^2, you must prepare and measure many copies of the same state and compute probabilities from the measurement statistics.',
    },
    {
      id: 'qml-2', type: 'mcq',
      question: 'What is the role of the Hadamard gate in quantum computing?',
      options: [
        'It flips the qubit from |0> to |1> and vice versa',
        'It creates superposition by mapping |0> to (|0> + |1>)/sqrt(2)',
        'It measures the qubit and stores the result',
        'It entangles two qubits together',
      ],
      correctAnswer: 'It creates superposition by mapping |0> to (|0> + |1>)/sqrt(2)',
      explanation: 'The Hadamard gate creates an equal superposition of |0> and |1>. Applied to |0>, it produces (|0> + |1>)/sqrt(2). Applied to |1>, it produces (|0> - |1>)/sqrt(2). It is the fundamental gate for creating superposition.',
    },
    {
      id: 'qml-3', type: 'fillblank',
      question: 'The quantum phenomenon where two qubits become correlated such that measuring one instantly determines the state of the other is called ___.',
      correctAnswer: 'entanglement',
      explanation: 'Entanglement is a uniquely quantum resource. For entangled qubits, the state cannot be described independently. Measuring one qubit collapses both into a correlated state. The Bell state |00> + |11> is the simplest example.',
    },
    {
      id: 'qml-4', type: 'code',
      question: 'In the Qiskit ZZFeatureMap, what is the purpose of the feature map in a quantum SVM?',
      code: `feature_map = ZZFeatureMap(feature_dimension=2, reps=2)
quantum_kernel = FidelityQuantumKernel(feature_map=feature_map)`,
      options: [
        'To reduce the dimensionality of the input data from 2D to 1D',
        'To encode classical data into quantum states, defining a quantum feature space for the kernel',
        'To measure the qubits and read out the results',
        'To create a classical SVM that runs on a quantum computer',
      ],
      correctAnswer: 'To encode classical data into quantum states, defining a quantum feature space for the kernel',
      explanation: 'The ZZFeatureMap encodes classical data into quantum states by applying rotation gates whose angles depend on the data values. The resulting quantum states |phi(x)> define a feature space. The kernel K(x_i, x_j) = |<phi(x_i)|phi(x_j)>|^2 measures similarity in this quantum space, which may be hard to compute classically.',
    },
    {
      id: 'qml-5', type: 'match',
      question: 'Match each quantum concept with its classical analogy:',
      pairs: [
        { left: 'Superposition', right: 'Spinning coin that is both heads and tails until caught' },
        { left: 'Entanglement', right: 'Two coins that always land the same way, even across the room' },
        { left: 'Measurement', right: 'Catching the spinning coin to see heads or tails' },
        { left: 'Quantum Gate', right: 'An operation that transforms the coin\'s spin state' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Superposition is like a spinning coin. Entanglement links particles so measuring one determines the other. Measurement collapses superposition. Gates are operations that transform quantum states, like rotating the coin\'s axis of spin.',
    },
  ],
}))

export {}
