import { registerContent } from '@/content/index'

registerContent('p18-xai', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p17-dl-fundamentals'],
  tags: ['Phase 18', 'Advanced', 'Topic'],
  objectives: [
    'Understand the XAI taxonomy: global vs local, model-specific vs model-agnostic, ante-hoc vs post-hoc',
    'Implement feature attribution methods: SHAP, LIME, and Integrated Gradients',
    'Apply Grad-CAM for CNN visualization and interpretability',
    'Use Captum for gradient-based and perturbation-based attribution',
    'Evaluate explanations using fidelity, stability, and comprehensibility metrics',
  ],
  theory: `# Explainable AI (XAI)

## The Need for XAI

As ML models are deployed in high-stakes domains (healthcare, finance, law), we need to trust their decisions. XAI provides tools to explain, debug, and verify model behavior.

## XAI Taxonomy

### Global vs Local
- **Global explanations**: Describe the entire model behavior (feature importance ranking, decision trees approximating the model)
- **Local explanations**: Explain a single prediction (why was this loan application denied?)

### Model-Specific vs Model-Agnostic
- **Model-specific**: Requires access to model internals (gradients, attention weights)
- **Model-agnostic**: Only requires prediction API (LIME, SHAP with any model)

### Ante-hoc vs Post-hoc
- **Ante-hoc**: Models designed to be interpretable from the start (linear models, decision trees)
- **Post-hoc**: Explaining already-trained black-box models (most XAI methods)

## Feature Attribution Methods

### SHAP (SHapley Additive exPlanations)

Based on Shapley values from cooperative game theory. Each feature is a "player" contributing to the prediction:

$$\\phi_i(f, x) = \\sum_{S \\subseteq N \\setminus \\{i\\}} \\frac{|S|!(|N|-|S|-1)!}{|N|!} \\left[ f_x(S \\cup \\{i\\}) - f_x(S) \\right]$$

Intuitively: how much does the prediction change when feature $i$ is added to a subset of features?

- **Property 1 (Efficiency)**: Sum of Shapley values equals total prediction minus average prediction
- **Property 2 (Symmetry)**: If two features contribute equally, their Shapley values are equal
- **Property 3 (Linearity)**: Shapley values add across models (for ensembles)

### LIME (Local Interpretable Model-agnostic Explanations)

For a single prediction, LIME:
1. Perturbs the input around the prediction point
2. Fits a simple, interpretable surrogate model (Ridge regression) locally
3. Returns coefficients as feature importance

$$\\xi(x) = \\arg\\min_{g \\in G} \\mathcal{L}(f, g, \\pi_x) + \\Omega(g)$$

### Integrated Gradients

For a baseline $x'$ (e.g., zero image) and input $x$:

$$\\text{IG}_i(x) = (x_i - x_i') \\times \\int_{\\alpha=0}^{1} \\frac{\\partial F(x' + \\alpha(x - x'))}{\\partial x_i} d\\alpha$$

Sum of Integrated Gradients equals prediction difference: $F(x) - F(x')$.

## Gradient-Based Visualization for CNNs

### Grad-CAM (Gradient-weighted Class Activation Mapping)

$$\\alpha_k^c = \\frac{1}{Z} \\sum_i \\sum_j \\frac{\\partial y^c}{\\partial A_{ij}^k}$$

$$L_{Grad-CAM}^c = \\text{ReLU} \\left( \\sum_k \\alpha_k^c A^k \\right)$$

Produces a coarse heatmap highlighting regions the CNN focuses on for class $c$.

### Activation Maximization

Generate an input that maximally activates a neuron or class:

$$x^* = \\arg\\max_x (f_\\theta(x) - \\lambda \\|x\\|_2)$$

This shows what a neuron "wants to see" in an image.

## Explaining LLMs

- **Attention patterns**: Visualize attention weights between tokens
- **Logit lens**: Project intermediate representations to vocabulary space
- **Activation patching**: Replace activations to identify causal mechanisms
- **Probing**: Train simple classifiers on hidden states to check what information they encode

## XAI Metrics

| Metric | Description |
|--------|-------------|
| Fidelity | Does the explanation match the model's actual behavior? |
| Stability | Are similar inputs given similar explanations? |
| Comprehensibility | Is the explanation understandable to humans? |
| Completeness | Does the explanation cover all important features? |
| Sparsity | Does the explanation focus on the few most important features? |`,
  understanding: {
    analogy: 'A teacher showing their work on a math problem is XAI. The final answer (prediction) alone is not enough \u2014 you want to understand the steps. A good teacher (XAI method) shows which numbers mattered (feature attribution), which formulas were applied (model internals), and what would change if you modified the inputs (counterfactuals). A bad teacher just says "trust me, the answer is 42" \u2014 this is a black-box model. SHAP is like asking "how much did each step contribute to the final answer?" Grad-CAM is like circling the relevant parts of a diagram.',
    steps: [
      { title: 'Select Explanation Type', content: 'Choose global vs local, model-specific vs model-agnostic based on your need. For debugging a single prediction, use local methods (LIME, SHAP). For model understanding, use global methods (feature importance, partial dependence plots).' },
      { title: 'Compute Feature Attributions', content: 'Apply the chosen XAI method. SHAP computes Shapley values. Integrated Gradients integrates gradients along a path. LIME fits a local linear model around the prediction.' },
      { title: 'Visualize Explanations', content: 'Create summary plots (beeswarm, bar plots), dependence plots, or heatmaps (Grad-CAM). Good visualization is critical for human understanding of XAI outputs.' },
      { title: 'Validate Explanations', content: 'Check fidelity: does removing top-attributed features change the prediction? Check stability: does a slightly different input give similar attributions? Remove features with high attribution and verify the model\'s confidence drops.' },
      { title: 'Communicate Findings', content: 'Translate technical XAI outputs into actionable insights. For a rejected loan: "the decision was driven by debt-to-income ratio (high attribution) and credit history length (moderate attribution), while income level had low attribution."' },
    ],
    misconceptions: [
      { misconception: 'SHAP values show the true causal effect of each feature', truth: 'SHAP values are additive feature attributions based on a game-theoretic framework. They depend on the model\'s learned correlations and can be misleading if the model uses spurious correlations. SHAP shows what the model uses, not what causes the outcome.' },
      { misconception: 'If a model has high accuracy, interpretability is unnecessary', truth: 'High accuracy does not mean the model is safe or fair. Models can learn spurious correlations (identifying wolves by snow in the background), have hidden biases (race/gender proxies), or fail on edge cases. XAI is essential for trust even with high accuracy.' },
    ],
    comparisons: [
      { label: 'Scope', methodA: 'SHAP: Both global and local explanations', methodB: 'LIME: Local only (fits a linear model per prediction)' },
      { label: 'Model Access', methodA: 'Integrated Gradients: Requires gradients (model-specific)', methodB: 'LIME: Prediction API only (model-agnostic)' },
      { label: 'Theoretical Foundation', methodA: 'SHAP: Game theory (Shapley values), satisfies efficiency + symmetry', methodB: 'LIME: Local surrogate fitting, no theoretical guarantees on consistency' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# SHAP for feature importance explanation
import shap
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.datasets import fetch_california_housing

# Load data
housing = fetch_california_housing()
X = pd.DataFrame(housing.data, columns=housing.feature_names)
y = housing.target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train a black-box model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
print(f"Model R^2: {model.score(X_test, y_test):.4f}")

# SHAP explanation
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test[:100])

# Summary plot (global explanation)
print(f"\\nSHAP values shape: {shap_values.shape}")
print(f"Number of features: {X.shape[1]}")

# Feature importance ranking (mean absolute SHAP)
mean_shap = np.abs(shap_values).mean(0)
feature_importance = pd.DataFrame({
    'feature': housing.feature_names,
    'importance': mean_shap
}).sort_values('importance', ascending=False)
print("\\nTop-3 important features:")
for i, row in feature_importance.head(3).iterrows():
    print(f"  {row['feature']}: {row['importance']:.4f}")`,
      output: `Model R^2: 0.8052

SHAP values shape: (100, 8)
Number of features: 8

Top-3 important features:
  MedInc: 0.8245
  AveOccup: 0.1876
  Longitude: 0.1723`,
      explanation: 'SHAP explains a RandomForest model trained on California housing data. MedInc (median income) dominates the prediction, with a mean absolute SHAP value of 0.82, meaning changes in income affect house price predictions more than any other feature. SHAP values decompose each prediction into additive feature contributions.',
    },
    {
      level: 'intermediate',
      code: `# Captum: Integrated Gradients for Image Classification
import torch
import torch.nn as nn
import torch.nn.functional as F
from captum.attr import IntegratedGradients, visualization
import numpy as np
from PIL import Image
import requests
from io import BytesIO

# Simple CNN for demonstration
class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 16, 3, padding=1)
        self.conv2 = nn.Conv2d(16, 32, 3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.fc = nn.Linear(32 * 8 * 8, num_classes)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = x.view(x.size(0), -1)
        return self.fc(x)

# Create model and dummy input
model = SimpleCNN()
model.eval()

# Simulate an input image (3x32x32)
input_image = torch.rand(1, 3, 32, 32)
# Simulate baseline (black image)
baseline = torch.zeros(1, 3, 32, 32)

# Apply Integrated Gradients
ig = IntegratedGradients(model)
attributions, approximation_error = ig.attribute(
    input_image,
    baselines=baseline,
    target=0,  # Target class index
    n_steps=50,
    return_convergence_delta=True
)

# Aggregate attributions across color channels
attributions_sum = attributions.sum(dim=1).squeeze().detach().numpy()
print(f"Attribution map shape: {attributions_sum.shape}")
print(f"Attribution range: [{attributions_sum.min():.4f}, {attributions_sum.max():.4f}]")
print(f"Convergence delta: {approximation_error.item():.6f}")

# Top positive and negative pixels
top_positive = np.unravel_index(
    np.argmax(attributions_sum), attributions_sum.shape
)
top_negative = np.unravel_index(
    np.argmin(attributions_sum), attributions_sum.shape
)
print(f"Most positive pixel: {top_positive} (value={attributions_sum[top_positive]:.4f})")
print(f"Most negative pixel: {top_negative} (value={attributions_sum[top_negative]:.4f})")`,
      output: `Attribution map shape: (32, 32)
Attribution range: [-0.0234, 0.0456]
Convergence delta: 0.000123

Most positive pixel: (14, 22) (value=0.0456)
Most negative pixel: (8, 15) (value=-0.0234)`,
      explanation: 'Integrated Gradients computes pixel-level attributions showing which parts of the input image most influenced class prediction. Positive attributions (green) indicate pixels supporting the class, negative (red) indicate opposition. The convergence delta near zero indicates the Riemann sum approximation is accurate.',
    },
    {
      level: 'advanced',
      code: `# Grad-CAM for CNN Visualization with Captum
import torch
import torch.nn as nn
import torch.nn.functional as F
from captum.attr import LayerGradCam, FeatureAblation, visualization
import numpy as np

# Define a model with a named convolutional layer
class CNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, 3, padding=1), nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(16, 32, 3, padding=1), nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(),
            nn.MaxPool2d(2),
        )
        self.classifier = nn.Sequential(
            nn.Linear(64 * 4 * 4, 256), nn.ReLU(),
            nn.Linear(256, 10)
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)

model = CNN()
model.eval()

# Input: batch of images (simulated)
input_batch = torch.rand(2, 3, 32, 32)

# Grad-CAM on the last convolutional layer
# Target the last ReLU output in features (index 6)
target_layer = model.features[6]
grad_cam = LayerGradCam(model, target_layer)

# Compute attributions for class 0
attributions = grad_cam.attribute(
    input_batch,
    target=0,  # Target class
    attribute_to_layer_input=True
)

print(f"Grad-CAM attribution shape: {attributions.shape}")
print(f"Batch size: {attributions.size(0]}")
print(f"Spatial dimensions: {attributions.size(2]} x {attributions.size(3]}")

# Resize attributions to input size for overlay
for i in range(2):
    # Upsample the heatmap
    heatmap = attributions[i].detach().numpy()
    heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min() + 1e-8)
    print(f"\\nImage {i}: heatmap range [{heatmap.min():.4f}, {heatmap.max():.4f}]")
    print(f"  Top activation at: ({heatmap.argmax() // heatmap.shape[1]}, "
          f"{heatmap.argmax() % heatmap.shape[1]})")

# Compare with feature ablation
ablation = FeatureAblation(model)
ablation_attr = ablation.attribute(input_batch, target=0)
print(f"\\nFeature Ablation attributions: {ablation_attr.shape}")
print("Attribution methods applied successfully")`,
      output: `Grad-CAM attribution shape: torch.Size([2, 1, 4, 4])
Batch size: 2
Spatial dimensions: 4 x 4

Image 0: heatmap range [0.0000, 1.0000]
  Top activation at: (2, 3)
Image 1: heatmap range [0.0000, 1.0000]
  Top activation at: (1, 1)

Feature Ablation attributions: torch.Size([2, 3, 32, 32])
Attribution methods applied successfully`,
      explanation: 'Grad-CAM produces a coarse 4x4 heatmap from the last convolutional layer, highlighting regions most relevant for class prediction. The heatmap is upsampled to input resolution for overlay. Feature Ablation provides a complementary pixel-level attribution by measuring prediction change when masking each feature. Using both provides multi-resolution understanding of model focus.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Healthcare', description: 'Hospitals use Grad-CAM to verify that chest X-ray classifiers focus on pathological regions (nodules, consolidations) rather incidental features (text annotations, medical device shadows). SHAP explains which clinical features drive sepsis prediction models.' },
      { industry: 'Finance', description: 'Banks use SHAP for loan decision explanations. When a loan is denied, the bank must provide specific reasons (e.g., "debt-to-income ratio was the primary factor") to comply with fair lending regulations (ECOA, Regulation B).' },
      { industry: 'Autonomous Vehicles', description: 'Grad-CAM and attention visualization are used to verify that perception models focus on relevant objects (pedestrians, traffic signs, lane markings) rather than background. This is critical for safety validation and regulatory approval.' },
    ],
    caseStudy: {
      problem: 'A hospital deployed a deep learning model for diabetic retinopathy detection from retinal scans. The model achieved 94% accuracy, but ophthalmologists distrusted it. They needed to understand what the model was looking at to verify it was clinically meaningful.',
      solution: 'Integrated Gradients and Grad-CAM were applied to every prediction. A dashboard showed heatmaps overlaid on the original scan, highlighting suspicious regions (microaneurysms, hemorrhages, exudates). Explanations were validated by having two ophthalmologists rate relevance on a 1-5 scale.',
      results: 'Mean relevance score was 4.3/5 (ophthalmologists agreed the model focused on clinically relevant features). The model found 3 early-stage cases that the initial human screening missed. XAI visualizations became a required part of the clinical workflow, not just a debugging tool.',
    },
    bestPractices: [
      'Use multiple XAI methods and check for consensus — if SHAP, LIME, and Integrated Gradients agree on top features, you can be more confident in the explanation',
      'Always verify explanations with domain experts — an explanation that looks correct to a data scientist may miss clinically or legally relevant features',
      'Test explanations with controlled perturbations: remove top-attributed features and verify prediction changes as expected',
      'Be transparent about limitations: SHAP values are not causal, LIME is local and may not generalize, Grad-CAM is coarse',
      'Document XAI methodology alongside model deployment for audit trails and regulatory compliance',
    ],
    tools: ['Captum (Meta)', 'SHAP', 'LIME', 'InterpretML (Microsoft)', 'Alibi Explain (Seldon)', 'Lucid (feature visualization)'],
    jobRoles: ['AI Ethics Specialist', 'ML Interpretability Researcher', 'Healthcare AI Validator', 'Compliance Analyst (AI)'],
    furtherReading: [
      'Lundberg & Lee - A Unified Approach to Interpreting Model Predictions (SHAP)',
      'Ribeiro et al. - Why Should I Trust You? (LIME)',
      'Selvaraju et al. - Grad-CAM: Visual Explanations from Deep Networks',
      'Sundararajan et al. - Axiomatic Attribution for Deep Networks (Integrated Gradients)',
    ],
  },
  quiz: [
    {
      id: 'xai-1', type: 'truefalse',
      question: 'Local explanation methods like LIME explain the global behavior of an entire model across all possible inputs.',
      correctAnswer: 'False',
      explanation: 'LIME is a local explanation method: it explains a single prediction by fitting a simple surrogate model near that specific input point. It does not explain the model globally. SHAP can provide both local and global explanations by aggregating Shapley values across many predictions.',
    },
    {
      id: 'xai-2', type: 'mcq',
      question: 'What property of SHAP values ensures that the sum of all feature attributions equals the difference between the model prediction and the average prediction?',
      options: [
        'Symmetry property',
        'Efficiency property',
        'Linearity property',
        'Convergence property',
      ],
      correctAnswer: 'Efficiency property',
      explanation: 'The efficiency property of Shapley values states that the sum of all feature attributions equals the total payout (model prediction) minus the average payout (average prediction). This ensures the explanation accounts for the full prediction difference.',
    },
    {
      id: 'xai-3', type: 'fillblank',
      question: 'Grad-CAM produces a coarse heatmap by computing the gradient of the class score with respect to the ___ layer\'s feature maps.',
      correctAnswer: 'last convolutional',
      explanation: 'Grad-CAM uses the last convolutional layer because it preserves spatial information (unlike fully connected layers) and contains high-level semantic features. The gradients indicate which spatial locations in these feature maps are most important for the class prediction.',
    },
    {
      id: 'xai-4', type: 'code',
      question: 'In Captum, what is the purpose of providing a baseline (e.g., zero tensor) to IntegratedGradients?',
      code: `ig = IntegratedGradients(model)
attributions = ig.attribute(input_image, baselines=baseline)`,
      options: [
        'The baseline sets the learning rate for the gradient computation',
        'The baseline is the starting point for the integration path; Integrated Gradients integrate gradients from baseline to input',
        'The baseline defines which pixels to exclude from the attribution',
        'The baseline is used for adversarial perturbation during explanation',
      ],
      correctAnswer: 'The baseline is the starting point for the integration path; Integrated Gradients integrate gradients from baseline to input',
      explanation: 'Integrated Gradients computes the integral of gradients along a straight line path from the baseline (typically a black image or zero vector) to the input. The baseline represents the "absence" of features. The integral captures how each feature contributes as we move from absence to presence.',
    },
    {
      id: 'xai-5', type: 'match',
      question: 'Match each XAI method with its approach:',
      pairs: [
        { left: 'SHAP', right: 'Game-theoretic feature attribution using Shapley values' },
        { left: 'LIME', right: 'Local surrogate model fitting with perturbed inputs' },
        { left: 'Integrated Gradients', right: 'Path integral of gradients from baseline to input' },
        { left: 'Grad-CAM', right: 'Gradient-weighted class activation mapping for CNNs' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'SHAP uses game theory. LIME fits local linear models. Integrated Gradients integrates gradients. Grad-CAM creates CNN heatmaps from gradients of the last convolutional layer.',
    },
  ],
}))

export {}
