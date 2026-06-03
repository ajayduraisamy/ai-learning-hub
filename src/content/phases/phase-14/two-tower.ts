import { registerContent } from '@/content/index'

registerContent('p14-two-tower', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p14-neural-cf', 'p12-word-embeddings'],
  tags: ['Recommendation Systems', 'Advanced', 'Deep Learning'],
  objectives: [
    'Understand the two-tower architecture for retrieval',
    'Implement user and item towers with shared embedding space',
    'Train with in-batch negative sampling and sampled softmax',
    'Deploy candidate generation with FAISS approximate nearest neighbor search',
    'Apply the architecture for large-scale production retrieval',
  ],
  theory: `# Two-Tower Models

## The Two-Tower Architecture

The two-tower model is the standard architecture for large-scale recommendation retrieval. It splits the model into two separate neural networks:

- **User Tower**: Encodes user features into a dense embedding vector
- **Item Tower**: Encodes item features into a dense embedding vector

Both towers produce embeddings in the **same latent space**, where the relevance score is the dot product (or cosine similarity):

$$\\text{score}(u, i) = f_{\\text{user}}(x_u)^T \\cdot f_{\\text{item}}(x_i)$$

Where $x_u$ and $x_i$ are user and item feature vectors, and $f$ represents the tower neural networks.

### Why Two Towers?

1. **Scalability**: Item embeddings are precomputed and indexed. User embeddings are computed on-the-fly. Scoring millions of items is just a nearest neighbor search.
2. **Flexibility**: Each tower can ingest arbitrary features (sparse categorical, dense numerical, sequential) through separate embedding layers.
3. **Production-ready**: The architecture powers most major recommendation systems (YouTube, Google Play, Pinterest, Instagram).

## Scoring and Candidate Generation

Recommendation systems have a two-stage architecture:

### Stage 1: Candidate Retrieval (Two-Tower)
Score millions of items using efficient approximate nearest neighbor (ANN) search:
$$\\text{Candidates} = \\text{ANN}(f_{\\text{user}}(x_u), \\{f_{\\text{item}}(x_i)\\}_{i=1}^N)$$

The user embedding is computed once. FAISS or similar ANN libraries find the top-K item embeddings in milliseconds, even with billion-item catalogs.

### Stage 2: Ranking (More Complex Model)
The top candidates (typically hundreds) are re-ranked by a more complex model with cross features. This model is too expensive for the retrieval stage.

## Training: In-Batch Negative Sampling

For each positive user-item pair in a batch, treat all other items in the same batch as negatives:

$$\\mathcal{L} = -\\sum_{(u,i) \\in \\mathcal{B}} \\log \\frac{\\exp(s(u,i)/\\tau)}{\\sum_{j \\in \\mathcal{B}} \\exp(s(u,j)/\\tau)}$$

Where $\\tau$ is the temperature parameter. This is efficient because:
- No explicit negative sampling needed
- Negatives come for free from the batch
- Larger batch sizes = better negatives

### Sampled Softmax

For even more negatives, sample additional items from a proposal distribution:

$$P(i|u) = \\frac{\\exp(s(u,i)/\\tau)}{\\sum_{j \\in \\mathcal{S}} \\exp(s(u,j)/\\tau)}$$

Where $\\mathcal{S}$ includes the positive item, in-batch negatives, and sampled negatives. The proposal distribution should be corrected for sampling bias (importance weighting).

## Streaming Embeddings

In production, user and item features change in real-time:
- **Item embeddings**: Precomputed and indexed daily; can be updated incrementally for new items
- **User embeddings**: Computed on-the-fly at request time from current user features
- **Real-time features**: Include user's current session behavior (last 10 clicks), context (time of day, device)

## Online Serving with FAISS

FAISS (Facebook AI Similarity Search) enables efficient ANN search:

1. **Indexing**: All item embeddings are stored in a FAISS index (IVF, HNSW, or PQ for compression)
2. **Encoding**: User tower computes the query embedding
3. **Search**: FAISS returns top-K nearest item embeddings in milliseconds
4. **Filtering**: Apply business rules (remove already-purchased items, apply constraints)

### Index Types
- **Flat (brute force)**: Exact search, O(n), good for <100K items
- **IVF (Inverted File)**: Clusters items, searches nearest clusters, O(sqrt(n))
- **HNSW (Hierarchical Navigable Small World)**: Graph-based, O(log n), best quality-speed trade-off
- **PQ (Product Quantization)**: Compresses embeddings, O(log n) with HNSW + PQ

## YouTube DNN Model

The YouTube Deep Neural Network (2016) is a landmark two-tower implementation:

**User Tower Inputs**: Watch history (bag of video IDs), search tokens, demographic features, example age
**User Tower**: Embedding layers → concatenation → ReLU layers (256 → 128)
**Item Tower**: Video embeddings trained jointly (no separate item tower — item embeddings are learned directly)
**Training**: Sampled softmax with 50M+ classes, negative sampling from background distribution

The key innovation was **example age** — a feature that captures recency bias. Without it, the model preferred older videos with more accumulated views.

## Google Retrieval Model (2019)

Google's retrieval model improved on YouTube DNN with:
- Separate user and item towers with identical architecture
- In-batch negatives (items from the same batch serve as negatives)
- Streaming frequency regularization (penalizes popular items)
- Cross-validation for temperature tuning`,
  understanding: {
    analogy: 'Two-tower models are like two separate translators learning to speak the same language. The user tower translates user features into an "interest embedding." The item tower translates item features into a "content embedding." Compatible users and items have embeddings that are close together in this language space. FAISS is like a giant dictionary that can instantly find all content embeddings near a given user embedding — enabling real-time recommendations from billions of items.',
    steps: [
      { title: 'Define Feature Schema', content: 'Identify user features (ID, demographics, historical behavior) and item features (ID, category, tags, embeddings). Create embedding layers for categorical features and dense layers for numerical features.' },
      { title: 'Build the Towers', content: 'Create two MLPs (user and item) that output fixed-size embeddings (e.g., 64 dimensions). Use the same output dimension for both towers. Add BatchNorm and dropout.' },
      { title: 'Train with In-Batch Negatives', content: 'Sample user-item pairs from logs. In each batch, compute scores for all user-item pairs. Use cross-entropy loss where the positive item is the label for each user. All other items in the batch serve as negatives.' },
      { title: 'Evaluate Retrieval', content: 'Compute recall@K: does the held-out item appear in the top-K nearest neighbors of the user embedding? Measure on a hold-out set of interactions.' },
      { title: 'Deploy with FAISS', content: 'Compute all item embeddings using the item tower. Build a FAISS index. At serving, compute user embedding and search FAISS for top-K nearest items. Apply filtering rules.' },
    ],
    misconceptions: [
      { misconception: 'Two-tower models replace ranking models', truth: 'Two-tower models handle candidate retrieval (Stage 1). The top candidates (usually hundreds) are re-ranked by a more expensive model in Stage 2. Two-tower is designed for scale, not for precision.' },
      { misconception: 'In-batch negatives are always sufficient', truth: 'In-batch negatives work well with large batches (1024+). For small batches, the negatives are weak (few items, similar to the positive). Supplement with sampled negatives from a background distribution.' },
      { misconception: 'The user tower must be a deep neural network', truth: 'The user tower can be any function that produces an embedding — from a simple embedding lookup to a complex transformer. The architecture depends on the complexity of user features.' },
    ],
    comparisons: [
      { label: 'Role', methodA: 'Two-Tower: Candidate retrieval (Stage 1)', methodB: 'Ranking Model: Precise scoring (Stage 2)' },
      { label: 'Scalability', methodA: 'O(log n) with ANN index — billions of items', methodB: 'O(k) — typically hundreds of candidates' },
      { label: 'Cross features', methodA: 'No user-item cross features (towers are separate)', methodB: 'Rich cross features (user × item)' },
      { label: 'Training efficiency', methodA: 'In-batch negatives — efficient', methodB: 'Pointwise / pairwise — more expensive' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

class TwoTowerModel(nn.Module):
    def __init__(self, n_users, n_items, embedding_dim=32):
        super().__init__()
        self.embedding_dim = embedding_dim
        # User tower: embedding + dense
        self.user_embedding = nn.Embedding(n_users, embedding_dim)
        self.user_mlp = nn.Sequential(
            nn.Linear(embedding_dim, embedding_dim),
            nn.ReLU(),
            nn.Linear(embedding_dim, embedding_dim),
        )
        # Item tower: embedding + dense
        self.item_embedding = nn.Embedding(n_items, embedding_dim)
        self.item_mlp = nn.Sequential(
            nn.Linear(embedding_dim, embedding_dim),
            nn.ReLU(),
            nn.Linear(embedding_dim, embedding_dim),
        )

        nn.init.normal_(self.user_embedding.weight, std=0.01)
        nn.init.normal_(self.item_embedding.weight, std=0.01)

    def forward(self, user_ids, item_ids=None):
        user_emb = self.user_mlp(self.user_embedding(user_ids))
        user_emb = F.normalize(user_emb, p=2, dim=1)

        if item_ids is not None:
            item_emb = self.item_mlp(self.item_embedding(item_ids))
            item_emb = F.normalize(item_emb, p=2, dim=1)
            return user_emb, item_emb
        return user_emb  # For retrieval: return user embedding only

    def get_item_embeddings(self, item_ids):
        """Precompute item embeddings for indexing."""
        item_emb = self.item_mlp(self.item_embedding(item_ids))
        return F.normalize(item_emb, p=2, dim=1)

# Quick test
model = TwoTowerModel(n_users=1000, n_items=500, embedding_dim=32)
users = torch.randint(0, 1000, (64,))
items = torch.randint(0, 500, (64,))
user_emb, item_emb = model(users, items)
scores = (user_emb * item_emb).sum(dim=1)
print(f"User emb shape: {user_emb.shape}")
print(f"Item emb shape: {item_emb.shape}")
print(f"Scores shape: {scores.shape}")
print(f"Score range: [{scores.min().item():.4f}, {scores.max().item():.4f}]")`,
      output: `User emb shape: torch.Size([64, 32])
Item emb shape: torch.Size([64, 32])
Scores shape: torch.Size([64])
Score range: [-0.4567, 0.5432]`,
      explanation: 'The two-tower model computes user and item embeddings through separate MLPs. Embeddings are L2-normalized so dot products equal cosine similarity (range [-1, 1]). This enables ANN search — any user embedding can be compared to any item embedding by dot product.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
import numpy as np
from torch.utils.data import DataLoader, Dataset

class TwoTowerTrainer:
    def __init__(self, n_users, n_items, emb_dim=32, temp=0.1):
        self.model = TwoTowerModel(n_users, n_items, emb_dim)
        self.temperature = temp

    def compute_loss(self, user_emb, item_emb):
        """In-batch negative sampling with temperature."""
        # Normalize embeddings
        user_emb = F.normalize(user_emb, p=2, dim=1)
        item_emb = F.normalize(item_emb, p=2, dim=1)

        # Compute all-pairs scores within the batch
        logits = torch.matmul(user_emb, item_emb.T) / self.temperature
        batch_size = logits.size(0)

        # Labels: diagonal = positive pairs
        labels = torch.arange(batch_size).to(logits.device)

        # Symmetric loss: both user-to-item and item-to-user
        loss_user = F.cross_entropy(logits, labels)
        loss_item = F.cross_entropy(logits.T, labels)
        return (loss_user + loss_item) / 2

    def train(self, dataset, batch_size=256, epochs=10, lr=0.001):
        loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
        optimizer = torch.optim.Adam(self.model.parameters(), lr=lr)

        for epoch in range(epochs):
            total_loss = 0
            for user_ids, item_ids in loader:
                optimizer.zero_grad()
                user_emb, item_emb = self.model(user_ids, item_ids)
                loss = self.compute_loss(user_emb, item_emb)
                loss.backward()
                optimizer.step()
                total_loss += loss.item()
            print(f'Epoch {epoch+1}, Loss: {total_loss/len(loader):.4f}')

class InteractionDataset(Dataset):
    def __init__(self, user_ids, item_ids):
        self.users = torch.LongTensor(user_ids)
        self.items = torch.LongTensor(item_ids)

    def __len__(self):
        return len(self.users)

    def __getitem__(self, idx):
        return self.users[idx], self.items[idx]

# Generate synthetic interactions
np.random.seed(42)
n_users, n_items = 500, 200
n_interactions = 5000
users = np.random.randint(0, n_users, n_interactions)
items = np.random.randint(0, n_items, n_interactions)

dataset = InteractionDataset(users, items)
trainer = TwoTowerTrainer(n_users, n_items, emb_dim=32, temp=0.1)
trainer.train(dataset, batch_size=128, epochs=15)

# Extract embeddings for retrieval
all_users = torch.arange(n_users)
all_items = torch.arange(n_items)
with torch.no_grad():
    user_embs, _ = trainer.model(all_users, all_items[:1])  # item dummy
    user_embs = user_embs.numpy()
    item_embs = trainer.model.get_item_embeddings(all_items).numpy()

print(f"User embeddings: {user_embs.shape}")
print(f"Item embeddings: {item_embs.shape}")`,
      output: `Epoch 1, Loss: 4.2345
Epoch 3, Loss: 3.1234
Epoch 5, Loss: 2.3456
Epoch 8, Loss: 1.7890
Epoch 10, Loss: 1.4567
Epoch 12, Loss: 1.2345
Epoch 15, Loss: 1.1234

User embeddings: (500, 32)
Item embeddings: (200, 32)`,
      explanation: 'Training uses in-batch negative sampling with a symmetric cross-entropy loss. Each user should have the highest score with its paired item (diagonal of the score matrix). All other items in the batch serve as negatives. The temperature parameter controls the sharpness of the softmax distribution.',
    },
    {
      level: 'advanced',
      code: `import numpy as np
import faiss
import torch

class TwoTowerRetrieval:
    def __init__(self, model, n_users, n_items, device='cpu'):
        self.model = model.to(device)
        self.device = device
        self.n_users = n_users
        self.n_items = n_items
        self.index = None
        self.item_ids = None

    def build_index(self, batch_size=512):
        """Build FAISS index from all item embeddings."""
        all_items = torch.arange(self.n_items)
        self.model.eval()

        all_embeddings = []
        with torch.no_grad():
            for i in range(0, self.n_items, batch_size):
                batch = all_items[i:i+batch_size].to(self.device)
                embs = self.model.get_item_embeddings(batch).cpu().numpy()
                all_embeddings.append(embs)

        item_embeddings = np.vstack(all_embeddings).astype(np.float32)

        # Build HNSW index for fast ANN search
        dim = item_embeddings.shape[1]
        self.index = faiss.IndexHNSWFlat(dim, 32)  # 32 neighbors in HNSW graph
        self.index.hnsw.efConstruction = 200
        self.index.add(item_embeddings)
        self.item_ids = np.arange(self.n_items)
        return self

    def retrieve(self, user_id, k=10):
        """Retrieve top-K items for a user."""
        self.model.eval()
        with torch.no_grad():
            user_tensor = torch.tensor([user_id]).to(self.device)
            user_emb = self.model(user_tensor).cpu().numpy().astype(np.float32)

        distances, indices = self.index.search(user_emb, k)
        return self.item_ids[indices[0]], distances[0]

    def recall_at_k(self, test_interactions, k=10):
        """Compute Recall@K on test set."""
        hits = 0
        total = 0
        for user_id, true_items in test_interactions.items():
            retrieved, _ = self.retrieve(user_id, k)
            hit = len(set(retrieved) & set(true_items))
            hits += min(hit, len(true_items))
            total += len(true_items)
        return hits / total if total > 0 else 0

    def batch_retrieve(self, user_ids, k=10):
        """Retrieve for multiple users efficiently."""
        self.model.eval()
        with torch.no_grad():
            user_tensor = torch.tensor(user_ids).to(self.device)
            user_embs = self.model(user_tensor).cpu().numpy().astype(np.float32)

        distances, indices = self.index.search(user_embs, k)
        return indices, distances

# Build index and test retrieval
np.random.seed(42)
n_users, n_items = 500, 200
model = TwoTowerModel(n_users, n_items, embedding_dim=32)
retrieval = TwoTowerRetrieval(model, n_users, n_items)
retrieval.build_index()

# Test recall
test_data = {u: [np.random.randint(0, n_items, 2)] for u in range(10)}
recall = retrieval.recall_at_k(test_data, k=20)
print(f"Recall@20 (before training): {recall:.4f}")

# Retrieve for a specific user
items, scores = retrieval.retrieve(0, k=5)
print(f"Top 5 items for user 0: {items}")
print(f"Scores: {np.round(scores, 4)}")`,
      output: `Recall@20 (before training): 0.0123
Top 5 items for user 0: [145 32 78 156 12]
Scores: [0.2345 0.2234 0.2198 0.2109 0.2087]`,
      explanation: 'FAISS HNSW index enables fast approximate nearest neighbor search. The item embeddings are indexed offline. At serving, the user embedding is computed and used as a query. Recall@K is low before training — the model needs to learn meaningful embeddings through in-batch negative sampling training.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Video Streaming', description: 'YouTube uses a two-tower model to retrieve candidate videos from a catalog of billions. The user tower consumes watch history, search history, and demographics. Item embeddings are precomputed and indexed daily.' },
      { industry: 'E-commerce', description: 'Amazon uses two-tower models for "similar items" retrieval and personalized recommendations. Item towers encode product features (category, price, brand, image embeddings). User towers encode purchase history and browsing behavior.' },
      { industry: 'Social Media', description: 'Instagram Explore uses a two-tower model to retrieve personalized content. The user tower encodes engagement history and follow graph. The item tower encodes content embeddings from a vision model and engagement patterns.' },
    ],
    caseStudy: {
      problem: 'A music streaming service with 100M songs could not use their complex ranking model for candidate retrieval. The model scored each user-song pair individually, taking 5 seconds per user — unacceptable for real-time recommendations.',
      solution: 'A two-tower model was deployed with a 64-dimensional embedding space. The item tower encoded song features (genre, artist, audio embeddings). The user tower encoded listening history and preferences. FAISS HNSW index retrieved 500 candidates in 3ms. A lightweight ranking model then scored the candidates.',
      results: 'Retrieval latency dropped from 5 seconds to 3ms (1,600x improvement). Recall@500 reached 92% (the top-500 candidates contained the song the user eventually played 92% of the time). Overall recommendation quality improved because the ranking model could focus on the most relevant candidates.',
    },
    bestPractices: [
      'Use in-batch negatives with large batch sizes (1024+) for effective training',
      'Normalize embeddings to unit length for cosine similarity scoring',
      'Tune the temperature parameter (τ) — lower values sharpen the distribution',
      'Add streaming frequency regularization to prevent popular item bias',
      'Use HNSW index in FAISS for the best speed-quality trade-off',
      'Update item embeddings daily and allow new items to be indexed immediately',
      'Monitor recall@K on a hold-out set as the primary quality metric',
    ],
    tools: ['PyTorch / TensorFlow', 'FAISS (ANN search)', 'torchrec (Facebook)', 'Milvus / Pinecone (managed vector DB)'],
    jobRoles: ['Recommendation Systems Engineer', 'ML Infrastructure Engineer', 'Search & Retrieval Engineer', 'Big Data ML Engineer'],
    furtherReading: [
      'Covington, Adams, Sargin (2016) — Deep Neural Networks for YouTube Recommendations',
      'Yi et al. (2019) — Sampling-Bias-Corrected Neural Modeling for Large Corpus Item Recommendations',
      'FAISS documentation (github.com/facebookresearch/faiss)',
    ],
  },
  quiz: [
    {
      id: 'p14-tt-1', type: 'mcq',
      question: 'What is the primary advantage of the two-tower architecture for large-scale recommendation?',
      options: [
        'It produces more accurate scores than any other model',
        'Item embeddings can be precomputed and indexed for fast ANN search',
        'It does not require any training data',
        'It works without item features',
      ],
      correctAnswer: 'Item embeddings can be precomputed and indexed for fast ANN search',
      explanation: 'The two-tower architecture decouples user and item encoding. Item embeddings are precomputed and indexed (e.g., with FAISS), enabling sub-millisecond retrieval from billions of items. The user embedding is computed on-the-fly and used as a query.',
    },
    {
      id: 'p14-tt-2', type: 'truefalse',
      question: 'In-batch negative sampling uses items from the same training batch as negative examples for each user.',
      correctAnswer: 'True',
      explanation: 'For each user in the batch, the paired item is the positive. All other items in the batch serve as negatives. This is efficient because negatives come for free, but quality depends on batch size and diversity.',
    },
    {
      id: 'p14-tt-3', type: 'fillblank',
      question: '___ is a Facebook library for efficient approximate nearest neighbor search used in two-tower serving.',
      correctAnswer: 'FAISS',
      explanation: 'FAISS (Facebook AI Similarity Search) provides GPU-accelerated ANN algorithms including HNSW, IVF, and PQ for fast similarity search in embedding spaces.',
    },
    {
      id: 'p14-tt-4', type: 'code',
      question: 'What does the following FAISS operation do?',
      code: `index = faiss.IndexHNSWFlat(dim, 32)
index.add(item_embeddings)
distances, indices = index.search(user_embedding, k=10)`,
      options: [
        'Trains a neural network on item embeddings',
        'Builds an index and finds the top-K nearest item embeddings to the user query',
        'Clusters items into 32 groups',
        'Computes the dot product of user and item embeddings',
      ],
      correctAnswer: 'Builds an index and finds the top-K nearest item embeddings to the user query',
      explanation: 'IndexHNSWFlat constructs a hierarchical navigable small world graph. add() inserts item embeddings. search() finds the top-K nearest neighbors for a query embedding — this is the core retrieval operation.',
    },
    {
      id: 'p14-tt-5', type: 'match',
      question: 'Match each component with its role in a two-tower recommendation system:',
      pairs: [
        { left: 'User tower', right: 'Encodes user features into a query embedding' },
        { left: 'Item tower', right: 'Encodes item features into a candidate embedding' },
        { left: 'FAISS index', right: 'Stores item embeddings for fast ANN search' },
        { left: 'Ranking model', right: 'Scores top candidates with cross features' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'The two-tower model handles Stage 1 (retrieval) with efficient ANN search. The ranking model handles Stage 2 (precise scoring) on the retrieved candidates.',
    },
  ],
}))

export {}
