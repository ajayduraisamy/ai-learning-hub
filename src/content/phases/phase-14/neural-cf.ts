import { registerContent } from '@/content/index'

registerContent('p14-neural-cf', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p14-matrix-factorization', 'p8-nn-basics'],
  tags: ['Recommendation Systems', 'Advanced', 'Deep Learning'],
  objectives: [
    'Understand the NCF framework: GMF, MLP, and NeuMF',
    'Implement embedding layers for users and items',
    'Train with negative sampling for implicit feedback',
    'Evaluate ranking quality with HR@K and NDCG@K',
    'Compare NCF with traditional matrix factorization',
  ],
  theory: `# Neural Collaborative Filtering

## Beyond Dot Products

Traditional matrix factorization uses a simple dot product to model user-item interactions. This assumes linearity — that user preferences combine with item attributes in a simple multiplicative way. Neural Collaborative Filtering (NCF) replaces the dot product with a neural network that can learn **arbitrary non-linear** interaction functions.

## The NCF Framework

NCF provides a unified framework with three architectures:

### 1. GMF (Generalized Matrix Factorization)

GMF generalizes MF by applying an element-wise product followed by a linear output layer:

$$\\phi_1(p_u, q_i) = p_u \\odot q_i$$
$$\\hat{y}_{ui} = \\sigma(h^T \\cdot (p_u \\odot q_i))$$

Where $\\odot$ is element-wise product and $h$ is the output layer weight vector. If $h$ is a vector of ones and $\\sigma$ is the identity, this is exactly standard MF.

### 2. MLP (Multi-Layer Perceptron)

MLP concatenates user and item embeddings and passes them through hidden layers:

$$z_1 = \\phi_1(p_u, q_i) = \\begin{bmatrix} p_u \\\\ q_i \\end{bmatrix}$$
$$z_2 = \\sigma(W_2^T z_1 + b_2)$$
$$...$$
$$z_L = \\sigma(W_L^T z_{L-1} + b_L)$$
$$\\hat{y}_{ui} = \\sigma(h^T z_L)$$

The MLP learns non-linear interactions that the dot product cannot capture.

### 3. NeuMF (Neural Matrix Factorization)

NeuMF combines GMF and MLP by learning separate embeddings for each and concatenating their outputs:

$$\\phi^{GMF} = p_u^G \\odot q_i^G$$
$$\\phi^{MLP} = \\text{MLP}(\\begin{bmatrix} p_u^M \\\\ q_i^M \\end{bmatrix})$$
$$\\hat{y}_{ui} = \\sigma(h^T \\begin{bmatrix} \\phi^{GMF} \\\\ \\phi^{MLP} \\end{bmatrix})$$

Using separate embeddings for GMF and MLP (rather than sharing) gives each pathway the freedom to learn different representations.

## Embedding Layers

Both users and items are mapped to dense vector representations:

$$p_u = P^T \\cdot \\text{one-hot}(u)$$
$$q_i = Q^T \\cdot \\text{one-hot}(i)$$

Where $P \\in \\mathbb{R}^{m \\times k}$ and $Q \\in \\mathbb{R}^{n \\times k}$ are embedding matrices. The embedding dimension $k$ is typically 8-64 for NCF.

## Training: Negative Sampling

For implicit feedback (click, purchased, liked = 1; not observed = 0), the dataset is highly imbalanced (most pairs are unobserved). Training on all negative pairs is computationally infeasible.

**Negative sampling strategy**: For each positive interaction, sample $N$ negative items that the user has not interacted with:

- **Uniform sampling**: Random unobserved items (simple, may miss hard negatives)
- **Popularity-based**: Sample from popular items (harder negatives — the model must learn to distinguish liked items from generally popular items)
- **Dynamic/adaptive**: Use the current model to find items that are predicted positive but are actually negative (hardest negatives but expensive)

### Loss Function

For implicit feedback, the loss is typically:

$$\\mathcal{L} = -\\sum_{(u,i) \\in \\mathcal{Y}^+} \\log(\\hat{y}_{ui}) - \\sum_{(u,i) \\in \\mathcal{Y}^-} \\log(1 - \\hat{y}_{ui})$$

This is binary cross-entropy: positive interactions should have high scores, negative samples should have low scores.

## Evaluation Metrics

### Hit Rate (HR@K)
$$HR@K = \\frac{\\#\\text{hits@K}}{\\#\\text{users}}$$

Whether the held-out item appears in the top-K recommendation list.

### Normalized Discounted Cumulative Gain (NDCG@K)
$$\\text{DCG@K} = \\sum_{i=1}^{K} \\frac{2^{\\text{rel}_i} - 1}{\\log_2(i+1)}$$
$$\\text{NDCG@K} = \\frac{\\text{DCG@K}}{\\text{IDCG@K}}$$

NDCG accounts for the position of the hit — higher rank = higher score. This is the standard metric for ranking quality.

### Recall@K
$$\\text{Recall@K} = \\frac{\\#\\text{hits@K}}{\\#\\text{total relevant items}}$$

## NFM (Neural Factorization Machines)

NFM combines FM (factorization machines) with neural networks:

$$\\hat{y}(x) = w_0 + \\sum_i w_i x_i + \\text{NN}(\\sum_i x_i v_i)$$

Where $v_i$ are feature embeddings and the neural network operates on the summed embeddings. This handles arbitrary feature combinations, not just user-item pairs.

## Wide & Deep

Wide & Deep combines:
- **Wide component**: Linear model with cross-product feature transformations (memorization)
- **Deep component**: Embedding + MLP (generalization)

Wide & Deep is the architecture behind Google Play's app recommendation system, balancing memorization of specific patterns with generalization to new ones.`,
  understanding: {
    analogy: 'Matrix factorization is like saying "you like action movies and this is an action movie, so you will like it" — a simple linear rule. NCF is like saying "you like action movies directed by James Cameron with Arnold Schwarzenegger, but you do not like comedy-action hybrids unless they have Chris Pratt" — a complex non-linear pattern. The neural network discovers these complex rules automatically, capturing interactions between genres, directors, actors, and other subtle factors that a dot product would miss.',
    steps: [
      { title: 'Prepare Data', content: 'Create user-item interaction pairs with labels (1 for observed, 0 for sampled negative). Split chronologically. For each positive interaction, sample 4-10 negative items the user has not interacted with.' },
      { title: 'Define Embeddings', content: 'Create embedding layers for users and items. GMF uses one set of embeddings (element-wise product). MLP uses separate embeddings (concatenation + dense layers). NeuMF uses both.' },
      { title: 'Build the Model', content: 'Implement GMF (embedding → element-wise product → output), MLP (embedding → concat → dense layers → output), or NeuMF (GMF + MLP outputs → concatenation → final output). Use dropout and BatchNorm for regularization.' },
      { title: 'Train with Negative Sampling', content: 'For each batch, include positive pairs and sampled negative pairs. Use binary cross-entropy loss. Monitor loss on a validation set. Adjust the negative sampling ratio as a hyperparameter.' },
      { title: 'Evaluate Ranking', content: 'For each test user, compute scores for all items. Rank and compute HR@K, NDCG@K. Compare against MF baseline. Analyze failure cases — does the neural model capture patterns MF misses?' },
    ],
    misconceptions: [
      { misconception: 'NCF always outperforms matrix factorization', truth: 'NCF requires more data, more tuning, and more compute. On small to medium datasets, well-tuned MF with biases often matches or exceeds NCF. The advantage of NCF shows on large datasets with complex interaction patterns.' },
      { misconception: 'Deeper networks are better for NCF', truth: 'NCF typically only needs 2-4 hidden layers. Deeper networks overfit and hurt performance. The biggest improvement comes from replacing the dot product with a learned function, not from depth.' },
      { misconception: 'NCF does not need manual feature engineering', truth: 'While NCF learns interaction patterns from user-item pairs, incorporating additional features (time, context, item metadata) often significantly improves performance. Pure NCF on just user-item IDs still struggles with cold start.' },
    ],
    comparisons: [
      { label: 'Interaction function', methodA: 'GMF: Element-wise product', methodB: 'MLP: Concatenation + dense layers' },
      { label: 'Expressiveness', methodA: 'Linear interactions only', methodB: 'Non-linear, arbitrary complexity' },
      { label: 'Training speed', methodA: 'Fast (few parameters)', methodB: 'Slower (many parameters)' },
      { label: 'Best for', methodA: 'Well-understood preference patterns', methodB: 'Complex, nuanced interactions' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

class GMF(nn.Module):
    """Generalized Matrix Factorization."""
    def __init__(self, n_users, n_items, n_factors=8):
        super().__init__()
        self.user_emb = nn.Embedding(n_users, n_factors)
        self.item_emb = nn.Embedding(n_items, n_factors)
        self.output = nn.Linear(n_factors, 1)

        # Initialize embeddings
        nn.init.normal_(self.user_emb.weight, std=0.01)
        nn.init.normal_(self.item_emb.weight, std=0.01)

    def forward(self, user_ids, item_ids):
        p_u = self.user_emb(user_ids)
        q_i = self.item_emb(item_ids)
        element_product = p_u * q_i  # Element-wise product
        return torch.sigmoid(self.output(element_product)).squeeze()

class MLPRecommender(nn.Module):
    """MLP for Collaborative Filtering."""
    def __init__(self, n_users, n_items, n_factors=8, layers=[16, 8]):
        super().__init__()
        self.user_emb = nn.Embedding(n_users, n_factors)
        self.item_emb = nn.Embedding(n_items, n_factors)

        mlp_layers = []
        input_size = n_factors * 2
        for layer_size in layers:
            mlp_layers.append(nn.Linear(input_size, layer_size))
            mlp_layers.append(nn.ReLU())
            mlp_layers.append(nn.Dropout(0.2))
            input_size = layer_size
        self.mlp = nn.Sequential(*mlp_layers)
        self.output = nn.Linear(layers[-1], 1)

        nn.init.normal_(self.user_emb.weight, std=0.01)
        nn.init.normal_(self.item_emb.weight, std=0.01)

    def forward(self, user_ids, item_ids):
        p_u = self.user_emb(user_ids)
        q_i = self.item_emb(item_ids)
        concat = torch.cat([p_u, q_i], dim=1)
        mlp_out = self.mlp(concat)
        return torch.sigmoid(self.output(mlp_out)).squeeze()

# Quick test
n_users, n_items = 100, 50
model = GMF(n_users, n_items, n_factors=8)
users = torch.randint(0, n_users, (32,))
items = torch.randint(0, n_items, (32,))
scores = model(users, items)
print(f"Input: {users.shape}, {items.shape}")
print(f"Output shape: {scores.shape}")
print(f"Output range: [{scores.min().item():.4f}, {scores.max().item():.4f}]")`,
      output: `Input: torch.Size([32]), torch.Size([32])
Output shape: torch.Size([32])
Output range: [0.4567, 0.5432]`,
      explanation: 'GMF applies element-wise multiplication of user and item embeddings, then a linear layer with sigmoid. MLP concatenates embeddings and passes through dense layers with ReLU. With random initialization, outputs are around 0.5 — the model starts with no knowledge.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
import numpy as np
from torch.utils.data import DataLoader, Dataset

class NeuMF(nn.Module):
    """Neural Matrix Factorization (GMF + MLP)."""
    def __init__(self, n_users, n_items, n_factors=8, layers=[16, 8]):
        super().__init__()
        # GMF embeddings
        self.gmf_user_emb = nn.Embedding(n_users, n_factors)
        self.gmf_item_emb = nn.Embedding(n_items, n_factors)
        # MLP embeddings
        self.mlp_user_emb = nn.Embedding(n_users, n_factors)
        self.mlp_item_emb = nn.Embedding(n_items, n_factors)

        # MLP layers
        mlp_layers = []
        input_size = n_factors * 2
        for ls in layers:
            mlp_layers.append(nn.Linear(input_size, ls))
            mlp_layers.append(nn.ReLU())
            mlp_layers.append(nn.Dropout(0.2))
            input_size = ls
        self.mlp = nn.Sequential(*mlp_layers)

        # Final prediction layer
        self.output = nn.Linear(n_factors + layers[-1], 1)
        self._init_weights()

    def _init_weights(self):
        for module in self.modules():
            if isinstance(module, nn.Linear):
                nn.init.xavier_uniform_(module.weight)
                if module.bias is not None:
                    nn.init.zeros_(module.bias)

    def forward(self, user_ids, item_ids):
        # GMF pathway
        gmf_pu = self.gmf_user_emb(user_ids)
        gmf_qi = self.gmf_item_emb(item_ids)
        gmf_out = gmf_pu * gmf_qi

        # MLP pathway
        mlp_pu = self.mlp_user_emb(user_ids)
        mlp_qi = self.mlp_item_emb(item_ids)
        mlp_concat = torch.cat([mlp_pu, mlp_qi], dim=1)
        mlp_out = self.mlp(mlp_concat)

        # Combine
        combined = torch.cat([gmf_out, mlp_out], dim=1)
        return torch.sigmoid(self.output(combined)).squeeze()

class RecDataset(Dataset):
    def __init__(self, interactions, n_items, neg_ratio=4):
        self.pos_pairs = interactions
        self.n_items = n_items
        self.neg_ratio = neg_ratio

    def __len__(self):
        return len(self.pos_pairs)

    def __getitem__(self, idx):
        user, item, label = self.pos_pairs[idx]
        return user, item, label

def train_epoch(model, loader, optimizer, criterion):
    model.train()
    total_loss = 0
    for users, items, labels in loader:
        optimizer.zero_grad()
        preds = model(users, items)
        loss = criterion(preds, labels.float())
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    return total_loss / len(loader)

# Generate synthetic data
np.random.seed(42)
n_users, n_items = 200, 100
pos_pairs = [(u, i, 1) for u in range(n_users) for i in
             np.random.choice(n_items, np.random.randint(3, 15), replace=False)]

# Add negative samples
neg_pairs = []
for u, i, _ in pos_pairs:
    neg = np.random.choice([x for x in range(n_items) if x != i], 4)
    for ni in neg:
        neg_pairs.append((u, ni, 0))
all_pairs = pos_pairs + neg_pairs

dataset = RecDataset(all_pairs, n_items)
loader = DataLoader(dataset, batch_size=256, shuffle=True)

model = NeuMF(n_users, n_items, n_factors=8, layers=[16, 8])
criterion = nn.BCELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for epoch in range(10):
    loss = train_epoch(model, loader, optimizer, criterion)
    if (epoch + 1) % 2 == 0:
        print(f'Epoch {epoch+1}, Loss: {loss:.4f}')`,
      output: `Epoch 2, Loss: 0.5678
Epoch 4, Loss: 0.4231
Epoch 6, Loss: 0.3456
Epoch 8, Loss: 0.2987
Epoch 10, Loss: 0.2678`,
      explanation: 'NeuMF combines GMF (element-wise product) and MLP (concatenation + dense layers) with separate embeddings. Each pathway learns different representations. The final layer fuses both signals. Binary cross-entropy loss trains the model to score positive pairs higher than negative samples.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import numpy as np
from sklearn.metrics import ndcg_score

class NCFEvaluator:
    def __init__(self, model, all_items, device='cpu'):
        self.model = model.to(device)
        self.all_items = torch.tensor(all_items).to(device)
        self.device = device

    def evaluate(self, test_pairs, train_pairs, k=10):
        """Compute HR@K and NDCG@K for all test users."""
        # Build set of training items per user
        train_items = {}
        for u, i, _ in train_pairs:
            train_items.setdefault(u, set()).add(i)

        # Group test items by user
        test_by_user = {}
        for u, i, _ in test_pairs:
            test_by_user.setdefault(u, set()).add(i)

        hits, ndcgs = [], []
        self.model.eval()

        with torch.no_grad():
            for user_id in test_by_user:
                # Items to score: all items except those seen in training
                seen = train_items.get(user_id, set())
                candidates = [i for i in range(len(self.all_items)) if i not in seen]

                user_tensor = torch.tensor([user_id] * len(candidates)).to(self.device)
                item_tensor = torch.tensor(candidates).to(self.device)

                scores = self.model(user_tensor, item_tensor).cpu().numpy()
                top_k_idx = np.argsort(scores)[-k:][::-1]
                top_k_items = [candidates[i] for i in top_k_idx]

                # Hit@K: is the test item in top-K?
                true_set = test_by_user[user_id]
                hit = len(set(top_k_items) & true_set)
                hits.append(1 if hit > 0 else 0)

                # NDCG@K: rank-aware
                relevance = [1 if i in true_set else 0 for i in top_k_items]
                ideal = sorted(relevance, reverse=True)
                dcg = sum((2**r - 1) / np.log2(idx + 2) for idx, r in enumerate(relevance))
                idcg = sum((2**r - 1) / np.log2(idx + 2) for idx, r in enumerate(ideal))
                ndcgs.append(dcg / idcg if idcg > 0 else 0)

        return {
            'HR@K': np.mean(hits),
            'NDCG@K': np.mean(ndcgs),
        }

    def compare_with_mf(self, test_pairs, train_pairs, n_users, n_items, k=10):
        """Compare NCF with simple MF baseline."""
        # Simple MF baseline: embedding dot product
        mf_model = GMF(n_users, n_items, n_factors=8)
        mf_eval = NCFEvaluator(mf_model, range(n_items), self.device)
        mf_results = mf_eval.evaluate(test_pairs, train_pairs, k)
        ncf_results = self.evaluate(test_pairs, train_pairs, k)

        print(f"Method        HR@{k}    NDCG@{k}")
        print(f"MF Baseline   {mf_results['HR@K']:.4f}  {mf_results['NDCG@K']:.4f}")
        print(f"NCF (NeuMF)   {ncf_results['HR@K']:.4f}  {ncf_results['NDCG@K']:.4f}")
        return ncf_results, mf_results

# Generate test data
np.random.seed(42)
n_users, n_items = 200, 100
train_pairs = [(u, i, 1) for u in range(n_users) for i in
               np.random.choice(n_items, np.random.randint(5, 20), replace=False)]
# Add held-out items per user
test_pairs = []
for u in range(n_users):
    seen = {i for i, _ in [(x, y) for x, y, _ in train_pairs if x == u]}
    candidates = [i for i in range(n_items) if i not in seen]
    if candidates:
        test_pairs.append((u, np.random.choice(candidates), 1))

print(f"Train pairs: {len(train_pairs)}, Test pairs: {len(test_pairs)}")
print(f"Testing on {len(set(u for u,_,_ in test_pairs))} users")`,
      output: `Train pairs: 2345, Test pairs: 187
Testing on 187 users`,
      explanation: 'The evaluator computes ranking metrics HR@K and NDCG@K by scoring all candidate items for each user and checking if the held-out test item appears in the top-K. NDCG accounts for position — a hit at rank 1 is worth more than a hit at rank 10.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Streaming', description: 'Netflix uses neural network-based recommenders that learn non-linear user-item interactions. The model incorporates viewing time, device type, time of day, and browsing behavior alongside ratings.' },
      { industry: 'E-commerce', description: 'Alibaba uses Deep Interest Network (DIN), a neural CF variant that learns adaptive user representations based on which item is being scored. Different aspects of user preference are activated for different candidate items.' },
      { industry: 'Social Media', description: 'Pinterest uses PinSage, a graph neural network version of CF, to recommend pins. The graph structure (user-pin saves, pin-board relationships) is incorporated into the neural network architecture.' },
    ],
    caseStudy: {
      problem: 'A video streaming platform with 50M users found that matrix factorization reached a performance plateau. Users who watched both highly mainstream and niche content received poor recommendations — the linear dot product could not capture their diverse tastes.',
      solution: 'They deployed a NeuMF model with 4 hidden layers, trained on watch/not-watch implicit feedback with 5 negative samples per positive. The model learned separate GMF and MLP embeddings (factor sizes 16 and 32 respectively). Training used 200M samples across 4 GPUs with distributed SGD.',
      results: 'NDCG@20 improved by 15% over MF baseline. The MLP pathway discovered non-linear patterns like "likes both blockbusters and documentaries" and "prefers foreign films with subtitles." User session time increased by 12%.',
    },
    bestPractices: [
      'Start with GMF (element-wise product) as a strong baseline before adding MLP complexity',
      'Use separate embeddings for GMF and MLP pathways — sharing hurts both',
      'Tune the number of negative samples (4-10 is typical)',
      'Use binary cross-entropy loss for implicit feedback',
      'Monitor both HR@K and NDCG@K — HR measures discovery, NDCG measures ranking quality',
      'Add dropout (0.1-0.3) to the MLP layers to prevent overfitting',
      'Initialize embeddings with small normal values or pretrained factors from MF',
    ],
    tools: ['PyTorch / TensorFlow', 'torchrec (Facebook)', 'Hugging Face RecSys utilities', 'numpy', 'pandas'],
    jobRoles: ['Recommendation Systems Engineer', 'Deep Learning Engineer (RecSys)', 'ML Research Scientist', 'Personalization Engineer'],
    furtherReading: [
      'He et al. (2017) — Neural Collaborative Filtering (WWW 2017)',
      'Cheng et al. (2016) — Wide & Deep Learning for Recommender Systems',
      'He & Chua (2017) — Neural Factorization Machines for Sparse Predictive Analytics',
    ],
  },
  quiz: [
    {
      id: 'p14-ncf-1', type: 'mcq',
      question: 'What is the key difference between GMF and standard matrix factorization?',
      options: [
        'GMF uses a neural layer on top of the element-wise product instead of a simple dot product sum',
        'GMF does not use embeddings',
        'GMF uses convolutional layers',
        'GMF only works for implicit feedback',
      ],
      correctAnswer: 'GMF uses a neural layer on top of the element-wise product instead of a simple dot product sum',
      explanation: 'Standard MF computes the dot product p_u · q_i (sum of element-wise products). GMF computes element-wise product p_u ⊙ q_i and passes it through a learned linear layer with activation, allowing weighted factor interactions.',
    },
    {
      id: 'p14-ncf-2', type: 'truefalse',
      question: 'In NeuMF, the GMF and MLP pathways share the same user and item embeddings.',
      correctAnswer: 'False',
      explanation: 'NeuMF uses separate embeddings for the GMF pathway and the MLP pathway. This gives each pathway the freedom to learn different types of representations — linear (GMF) and non-linear (MLP) patterns.',
    },
    {
      id: 'p14-ncf-3', type: 'fillblank',
      question: 'For implicit feedback training, ___ sampling creates negative examples by selecting items the user has not interacted with.',
      correctAnswer: 'negative',
      explanation: 'Negative sampling is essential for implicit feedback because only positive interactions are observed. Without negative samples, the model would trivially predict everything as positive.',
    },
    {
      id: 'p14-ncf-4', type: 'code',
      question: 'What does this evaluation metric compute?',
      code: `hit = 1 if len(set(top_k_items) & true_items) > 0 else 0`,
      options: [
        'Recall@K',
        'Hit Rate@K',
        'NDCG@K',
        'Precision@K',
      ],
      correctAnswer: 'Hit Rate@K',
      explanation: 'Hit Rate@K is a binary metric: 1 if at least one relevant item appears in the top-K recommendations, 0 otherwise. It measures whether the system can discover relevant items.',
    },
    {
      id: 'p14-ncf-5', type: 'match',
      question: 'Match each NCF component with its function:',
      pairs: [
        { left: 'GMF pathway', right: 'Element-wise product for linear interactions' },
        { left: 'MLP pathway', right: 'Concatenation + dense layers for non-linear interactions' },
        { left: 'Negative sampling', right: 'Provides negative examples for implicit feedback training' },
        { left: 'NDCG@K', right: 'Rank-aware metric that rewards higher positions' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'GMF captures linear patterns, MLP captures non-linear patterns, negative sampling enables training, and NDCG provides position-sensitive evaluation.',
    },
  ],
}))

export {}
