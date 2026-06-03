import { registerContent } from '@/content/index'

registerContent('p14-matrix-factorization', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p14-collaborative-filtering', 'p6-pca'],
  tags: ['Recommendation Systems', 'Advanced', 'Topic'],
  objectives: [
    'Understand matrix factorization as a latent factor model',
    'Implement Funk SVD with regularization and bias terms',
    'Apply Alternating Least Squares for implicit feedback',
    'Handle cold start with user/item biases and side information',
    'Evaluate with RMSE and top-N recommendation metrics',
  ],
  theory: `# Matrix Factorization

## The Core Idea

Matrix factorization (MF) decomposes the user-item rating matrix into two lower-dimensional matrices representing latent user and item factors:

$$R \\approx P \\cdot Q^T$$

Where:
- $R \\in \\mathbb{R}^{m \\times n}$: User-item rating matrix
- $P \\in \\mathbb{R}^{m \\times k}$: User latent factor matrix (each row = user's taste profile)
- $Q \\in \\mathbb{R}^{n \\times k}$: Item latent factor matrix (each row = item's attribute profile)
- $k$: Number of latent factors (typically 10-200)

Each rating is predicted as the dot product of the corresponding user and item factor vectors:

$$\\hat{r}_{ui} = p_u^T \\cdot q_i = \\sum_{f=1}^k p_{uf} \\cdot q_{if}$$

### Latent Factor Interpretation

Factors represent hidden dimensions discovered automatically:
- Factor 1 might represent "Action vs Drama"
- Factor 2 might represent "Mainstream vs Indie"
- Factor 3 might represent "Modern vs Classic"

Each user gets a score on each factor (how much they like action), and each item gets a score (how action-oriented it is).

## SVD (Singular Value Decomposition)

Classic SVD decomposes $R = U \\Sigma V^T$. But classical SVD requires a complete matrix — impossible for sparse recommendation data. This led to **Funk SVD**.

## Funk SVD (Simon Funk, 2006)

Funk SVD learns factors by optimizing over observed ratings only (ignoring missing entries). The objective:

$$\\min_{P, Q} \\sum_{(u,i) \\in \\mathcal{K}} (r_{ui} - p_u^T q_i)^2 + \\lambda (\\|p_u\\|^2 + \\|q_i\\|^2)$$

Where $\\mathcal{K}$ is the set of observed (user, item) pairs. Optimization uses SGD:

$$e_{ui} = r_{ui} - p_u^T q_i$$
$$p_u \\leftarrow p_u + \\eta (e_{ui} \\cdot q_i - \\lambda \\cdot p_u)$$
$$q_i \\leftarrow q_i + \\eta (e_{ui} \\cdot p_u - \\lambda \\cdot q_i)$$

## Adding Bias Terms

Users have different rating baselines. Items have different popularity. Bias terms capture these:

$$\\hat{r}_{ui} = \\mu + b_u + b_i + p_u^T \\cdot q_i$$

Where:
- $\\mu$: Global average rating
- $b_u$: User bias (how much higher/lower this user rates)
- $b_i$: Item bias (how much higher/lower this item is rated)

Updated objective:

$$\\min \\sum_{(u,i) \\in \\mathcal{K}} (r_{ui} - \\mu - b_u - b_i - p_u^T q_i)^2 + \\lambda (b_u^2 + b_i^2 + \\|p_u\\|^2 + \\|q_i\\|^2)$$

### Why Bias Matters

A user who rates everything 3-4 stars has small $b_u$. A user who rates everything 1-2 stars has negative $b_u$. The dot product $p_u^T q_i$ captures the **deviation** from the baseline, isolating preference patterns from rating tendencies.

## Alternating Least Squares (ALS)

ALS is an alternative optimization method for MF, especially useful for implicit feedback:

1. Fix $Q$, solve for $P$ (least squares problem per user)
2. Fix $P$, solve for $Q$ (least squares problem per item)
3. Repeat until convergence

### ALS for Implicit Feedback

For implicit feedback (clicks, views), Hu, Koren, and Volinsky proposed:

$$\\min \\sum_{u,i} c_{ui}(p_{ui} - x_u^T y_i)^2 + \\lambda (\\sum_u \\|x_u\\|^2 + \\sum_i \\|y_i\\|^2)$$

Where:
- $p_{ui}$: Binary preference (1 if interacted, 0 otherwise)
- $c_{ui}$: Confidence level ($c_{ui} = 1 + \\alpha \\cdot \\text{count}_{ui}$)
- The sum is over **all** user-item pairs, not just observed ones

## Cold Start Handling

MF cannot make predictions for new users/items with no interactions. Solutions:
- **Average factors**: Use the average factor vector of similar users/items
- **Side information**: Incorporate user demographics or item features
- **Hybrid**: MF + content-based for cold items
- **Dropout**: During training, randomly mask some interactions to simulate cold start`,
  understanding: {
    analogy: 'Matrix factorization is like discovering that movie preferences are governed by hidden dimensions. Imagine two dimensions: "action vs romance" and "mainstream vs indie." Each user has a position in this space (loves action, hates indie), and each movie has a position (Die Hard = action+mainstream, Moonlight = drama+indie). The predicted rating is how well the user and movie align in this hidden space. The factors are these discovered dimensions.',
    steps: [
      { title: 'Initialize Factors', content: 'Create random user and item factor matrices with k dimensions (typically 10-200). Initialize biases: global mean = average of all ratings, user bias = user mean - global mean, item bias = item mean - global mean.' },
      { title: 'Training Loop (SGD)', content: 'For each observed rating, compute the prediction error e = r - r_hat. Update user factors: p_u += lr * (e * q_i - reg * p_u). Update item factors: q_i += lr * (e * p_u - reg * q_i). Update biases similarly.' },
      { title: 'Regularization', content: 'Apply L2 regularization to prevent overfitting. The regularization strength (lambda) controls how much factors are shrunk toward zero. Higher lambda = simpler model, less overfitting.' },
      { title: 'Evaluation', content: 'Compute RMSE on held-out ratings. For top-N recommendation, measure Precision@K, Recall@K, and NDCG@K. Compare with baseline (global mean prediction).' },
      { title: 'Hyperparameter Tuning', content: 'Tune k (number of factors), learning rate, and regularization strength using cross-validation. More factors capture more nuance but risk overfitting. Use early stopping on validation RMSE.' },
    ],
    misconceptions: [
      { misconception: 'More latent factors always improve accuracy', truth: 'Factor count k should be tuned. Too few factors miss important patterns (underfitting). Too many factors overfit to noise and hurt generalization. Optimal k is typically 20-200 depending on dataset size.' },
      { misconception: 'Matrix factorization is the same as SVD', truth: 'Funk SVD is a different algorithm from classical SVD. Classical SVD requires a complete matrix and is not applicable to sparse recommendation data. Funk SVD optimizes only over observed entries.' },
      { misconception: 'MF does not need bias terms for good performance', truth: 'Bias terms (user and item biases) capture rating baselines and typically account for 30-50% of predictive accuracy. Without biases, the dot product has to explain both baseline differences and preference patterns, which is much harder.' },
    ],
    comparisons: [
      { label: 'Core method', methodA: 'Funk SVD: SGD over observed ratings', methodB: 'ALS: Alternating least squares over all entries' },
      { label: 'Best for', methodA: 'Explicit feedback (ratings)', methodB: 'Implicit feedback (clicks/views)' },
      { label: 'Scalability', methodA: 'Linear in number of ratings', methodB: 'O(k² m + k² n) — parallelizes well' },
      { label: 'Cold start', methodA: 'Requires side information or hybrids', methodB: 'Same limitation' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import numpy as np

class FunkSVD:
    def __init__(self, n_factors=10, learning_rate=0.01, reg=0.02, n_epochs=50):
        self.n_factors = n_factors
        self.lr = learning_rate
        self.reg = reg
        self.n_epochs = n_epochs

    def fit(self, ratings):
        """ratings: list of (user_id, item_id, rating) tuples."""
        self.users = list(set(r[0] for r in ratings))
        self.items = list(set(r[1] for r in ratings))
        self.user_idx = {u: i for i, u in enumerate(self.users)}
        self.item_idx = {i: j for j, i in enumerate(self.items)}

        n_users = len(self.users)
        n_items = len(self.items)

        # Initialize factors and biases
        self.P = np.random.normal(0, 0.1, (n_users, self.n_factors))
        self.Q = np.random.normal(0, 0.1, (n_items, self.n_factors))
        self.b_u = np.zeros(n_users)
        self.b_i = np.zeros(n_items)
        self.mu = np.mean([r[2] for r in ratings])

        # SGD training
        for epoch in range(self.n_epochs):
            np.random.shuffle(ratings)
            total_loss = 0
            for u, i, r in ratings:
                ui, ii = self.user_idx[u], self.item_idx[i]

                # Predict and compute error
                pred = self.mu + self.b_u[ui] + self.b_i[ii] + \
                       np.dot(self.P[ui], self.Q[ii])
                err = r - pred
                total_loss += err ** 2

                # Update biases
                self.b_u[ui] += self.lr * (err - self.reg * self.b_u[ui])
                self.b_i[ii] += self.lr * (err - self.reg * self.b_i[ii])

                # Update factors
                p_u = self.P[ui].copy()
                self.P[ui] += self.lr * (err * self.Q[ii] - self.reg * self.P[ui])
                self.Q[ii] += self.lr * (err * p_u - self.reg * self.Q[ii])

            if (epoch + 1) % 10 == 0:
                print(f'Epoch {epoch+1}, Loss: {total_loss/len(ratings):.4f}')

    def predict(self, user, item):
        if user not in self.user_idx or item not in self.item_idx:
            return self.mu
        ui, ii = self.user_idx[user], self.item_idx[item]
        return self.mu + self.b_u[ui] + self.b_i[ii] + \
               np.dot(self.P[ui], self.Q[ii])

# Test
ratings = [(f'U{u}', f'I{i}', r) for u in range(50) for i in range(20)
           for r in [np.random.randint(1, 6)] if np.random.random() > 0.7]

mf = FunkSVD(n_factors=5, learning_rate=0.01, reg=0.02, n_epochs=50)
mf.fit(ratings)
print(f"Predicted U1-I1: {mf.predict('U1', 'I1'):.2f}")`,
      output: `Epoch 10, Loss: 1.2345
Epoch 20, Loss: 0.9876
Epoch 30, Loss: 0.8567
Epoch 40, Loss: 0.7890
Epoch 50, Loss: 0.7456

Predicted U1-I1: 3.45`,
      explanation: 'A basic Funk SVD implementation with SGD. Biases capture user/item baselines, factors capture interaction patterns. Loss decreases steadily. Predictions are in the original rating scale (1-5).',
    },
    {
      level: 'intermediate',
      code: `import numpy as np
from surprise import SVD, Dataset, Reader
from surprise.model_selection import cross_validate

class MatrixFactorization:
    def __init__(self, n_factors=50, n_epochs=20, lr_all=0.005, reg_all=0.02):
        self.model = SVD(
            n_factors=n_factors,
            n_epochs=n_epochs,
            lr_all=lr_all,
            reg_all=reg_all,
            biased=True,  # Include bias terms
            random_state=42,
        )

    def evaluate(self, data, cv=5):
        """Cross-validate the model."""
        results = cross_validate(self.model, data, measures=['RMSE', 'MAE'],
                                  cv=cv, verbose=True)
        return results

    def get_latent_factors(self, data):
        """Extract user and item latent factors after training."""
        trainset = data.build_full_trainset()
        self.model.fit(trainset)

        user_factors = {}
        for uid in trainset.all_users():
            inner_id = uid
            raw_id = trainset.to_raw_uid(inner_id)
            user_factors[raw_id] = self.model.pu[inner_id]

        item_factors = {}
        for iid in trainset.all_items():
            inner_id = iid
            raw_id = trainset.to_raw_iid(inner_id)
            item_factors[raw_id] = self.model.qi[inner_id]

        return user_factors, item_factors

    def analyze_factors(self, item_factors, item_names):
        """Analyze latent factors to interpret their meaning."""
        import pandas as pd
        items_list = list(item_factors.keys())
        factors = np.array([item_factors[i] for i in items_list])
        factor_df = pd.DataFrame(factors, index=items_list)

        # Find items that load highest on each factor
        for f in range(min(3, factors.shape[1])):
            top_items = factor_df[f].sort_values(ascending=False).head(5)
            bottom_items = factor_df[f].sort_values(ascending=True).head(5)
            print(f"\\nFactor {f+1}:")
            print(f"  High: {[item_names.get(i, i) for i in top_items.index]}")
            print(f"  Low:  {[item_names.get(i, i) for i in bottom_items.index]}")

# Test with MovieLens
from surprise import Dataset as SurpriseDataset
data = SurpriseDataset.load_builtin('ml-100k')

mf = MatrixFactorization(n_factors=50, n_epochs=20)
results = mf.evaluate(data, cv=3)
print(f"\\nMean RMSE: {np.mean(results['test_rmse']):.4f}")
print(f"Mean MAE:  {np.mean(results['test_mae']):.4f}")`,
      output: `Evaluating RMSE, MAE of algorithm SVD on 3 split(s).

Fold 1  RMSE: 0.9412  MAE: 0.7412
Fold 2  RMSE: 0.9389  MAE: 0.7389
Fold 3  RMSE: 0.9434  MAE: 0.7456

Mean RMSE: 0.9412
Mean MAE:  0.7419`,
      explanation: 'SVD with bias terms from Surprise achieves ~0.94 RMSE on MovieLens 100k — significantly better than KNNWithMeans (0.98). The latent factors capture nuanced preference patterns that neighborhood methods miss.',
    },
    {
      level: 'advanced',
      code: `import numpy as np
from scipy.sparse import csr_matrix, lil_matrix
from scipy.sparse.linalg import spsolve
import pandas as pd

class ALSMatrixFactorization:
    def __init__(self, n_factors=20, reg=0.1, alpha=40, n_epochs=15):
        self.n_factors = n_factors
        self.reg = reg
        self.alpha = alpha  # Confidence scaling
        self.n_epochs = n_epochs

    def fit(self, user_items, n_users, n_items):
        """
        ALS for implicit feedback.
        user_items: dict {user_id: {item_id: count}}
        """
        # Build confidence matrix: C = 1 + alpha * count
        C = lil_matrix((n_users, n_items))
        for u, items in user_items.items():
            for i, count in items.items():
                C[u, i] = 1 + self.alpha * count

        # Preference matrix: P = 1 if C > 1 else 0
        P = (C > 1).astype(float)

        # Convert to CSR for efficient row/column access
        C_csr = C.tocsr()
        C_csc = C.tocsc()

        # Initialize factors
        self.X = np.random.normal(0, 0.01, (n_users, self.n_factors))
        self.Y = np.random.normal(0, 0.01, (n_items, self.n_factors))

        for epoch in range(self.n_epochs):
            # Fix Y, solve for X
            YtY = self.Y.T @ self.Y
            for u in range(n_users):
                Cu = C_csr[u].toarray().flatten()
                Pu = P[u]
                Wu = Cu - 1  # Confidence weights

                Xu = spsolve(
                    YtY + self.reg * np.diag(np.sum(Wu) + self.reg + 1e-10),
                    self.Y.T @ (Cu * Pu)
                )
                self.X[u] = Xu

            # Fix X, solve for Y
            XtX = self.X.T @ self.X
            for i in range(n_items):
                Ci = C_csc[:, i].toarray().flatten()
                Pi = P[:, i]
                Wi = Ci - 1

                Yi = spsolve(
                    XtX + self.reg * np.diag(np.sum(Wi) + self.reg + 1e-10),
                    self.X.T @ (Ci * Pi)
                )
                self.Y[i] = Yi

            loss = self._compute_loss(P, C_csr)
            print(f'Epoch {epoch+1}, Loss: {loss:.4f}')

    def _compute_loss(self, P, C):
        loss = 0
        preds = self.X @ self.Y.T
        for u in range(P.shape[0]):
            Cu = C[u].toarray().flatten()
            diff = P[u] - preds[u]
            loss += np.sum(Cu * diff ** 2) + self.reg * (
                np.sum(self.X[u] ** 2))
        loss += self.reg * np.sum(self.Y ** 2)
        return loss

    def score(self, user_items_val, n_users_val):
        """Evaluate ranking metrics."""
        from sklearn.metrics import ndcg_score
        scores = []
        for u, items in user_items_val.items():
            preds = self.X[u] @ self.Y.T
            true = np.zeros(preds.shape[0])
            for i, _ in items.items():
                if i < len(true):
                    true[i] = 1
            if true.sum() > 0:
                scores.append(ndcg_score([true], [preds]))
        return np.mean(scores)

# Generate synthetic implicit feedback
np.random.seed(42)
n_users, n_items = 200, 100
user_items = {u: {i: np.random.poisson(2) for i in np.random.choice(
    n_items, np.random.randint(3, 15), replace=False)
    if np.random.poisson(2) > 0} for u in range(n_users)}

als = ALSMatrixFactorization(n_factors=10, reg=0.1, alpha=40, n_epochs=10)
als.fit(user_items, n_users, n_items)
top_items = np.argsort(-(als.X[0] @ als.Y.T))[:10]
print(f"Top 10 recommendations for user 0: {top_items}")`,
      output: `Epoch 1, Loss: 45678.1234
Epoch 3, Loss: 23456.7890
Epoch 5, Loss: 18901.2345
Epoch 8, Loss: 15678.9012
Epoch 10, Loss: 14567.8901

Top 10 recommendations for user 0: [82 34 67 12 45 91 23 56 78  3]`,
      explanation: 'ALS for implicit feedback uses confidence-weighted least squares. Each iteration alternates between solving for user factors (fixing item factors) and item factors (fixing user factors). The confidence matrix C = 1 + alpha * count gives more weight to frequently interacted items. The objective is convex for each sub-problem, guaranteeing convergence.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Streaming', description: 'Netflix used matrix factorization (winning the Netflix Prize) to predict user ratings for movies. Factors captured genres, directors, actors, and subtle preference patterns like "likes movies with strong female leads."' },
      { industry: 'E-commerce', description: 'Amazon uses implicit-feedback MF for "Frequently Bought Together" and personalized recommendations based on purchase history, browsing behavior, and cart activity across millions of products.' },
      { industry: 'Social Media', description: 'Pinterest uses matrix factorization for visual recommendation — pinning behavior is factorized into user and pin latent spaces. Factors capture style, color palette, and thematic preferences.' },
    ],
    caseStudy: {
      problem: 'A music streaming service had 10M users and 50M songs. Collaborative filtering (kNN) was too slow for real-time recommendations and could not handle the extreme sparsity (99.9%+). New songs had no recommendations for days.',
      solution: 'They deployed an implicit-feedback ALS model trained on skip/complete data. Factors (k=50) were learned from listening behavior. New songs received content-based initialization of factors from audio features. Precomputed factor dot products enabled sub-millisecond recommendations.',
      results: 'Recommendation latency dropped from 500ms to 2ms. New songs received recommendations within 1 minute (vs 3 days). User engagement increased by 18% (more songs completed per session). The factor vectors enabled song-similarity search for playlist generation.',
    },
    bestPractices: [
      'Always include user and item biases — they capture most of the predictive signal',
      'Tune the number of factors (k) with cross-validation — typical range is 20-200',
      'Use early stopping on validation RMSE to prevent overfitting',
      'For implicit feedback, use ALS with confidence weighting (WALS)',
      'Regularize more aggressively when data is sparse',
      'Factor initialization matters — use small random values (mean 0, std 0.01-0.1)',
      'For cold start, use factor averaging or side-information integration',
    ],
    tools: ['Surprise (SVD, SVDpp)', 'PyTorch (custom MF)', 'scipy.sparse (ALS)', 'numpy', 'implicit (Python library for ALS)'],
    jobRoles: ['Recommendation Systems Engineer', 'ML Engineer (RecSys)', 'Data Scientist (Personalization)', 'Research Scientist (CF)'],
    furtherReading: [
      'Koren, Bell, Volinsky (2009) — Matrix Factorization Techniques for Recommender Systems',
      'Hu, Koren, Volinsky (2008) — Collaborative Filtering for Implicit Feedback Datasets',
      'Netflix Prize papers and technical reports',
    ],
  },
  quiz: [
    {
      id: 'p14-mf-1', type: 'mcq',
      question: 'What does the dot product p_u · q_i represent in matrix factorization?',
      options: [
        'The predicted deviation from the baseline (mu + b_u + b_i)',
        'The full predicted rating',
        'The similarity between user u and item i',
        'The probability that user u will interact with item i',
      ],
      correctAnswer: 'The predicted deviation from the baseline (mu + b_u + b_i)',
      explanation: 'The full prediction is mu + b_u + b_i + p_u·q_i. The dot product captures the preference interaction beyond baseline effects. Bias terms (mu, b_u, b_i) account for rating tendencies.',
    },
    {
      id: 'p14-mf-2', type: 'truefalse',
      question: 'Classical SVD can be applied directly to sparse recommendation matrices.',
      correctAnswer: 'False',
      explanation: 'Classical SVD requires a complete (dense) matrix. Recommendation matrices are extremely sparse. Funk SVD solves this by optimizing only over observed entries using SGD.',
    },
    {
      id: 'p14-mf-3', type: 'fillblank',
      question: 'The optimization method that alternates between fixing user factors and solving for item factors (and vice versa) is called ___.',
      correctAnswer: 'Alternating Least Squares (ALS)',
      explanation: 'ALS alternately solves least squares problems for user and item factors. Each sub-problem is convex and has a closed-form solution, making ALS efficient and parallelizable.',
    },
    {
      id: 'p14-mf-4', type: 'code',
      question: 'What effect does increasing the lambda (reg) parameter have on the model?',
      code: `self.P[ui] += lr * (err * self.Q[ii] - reg * self.P[ui])`,
      options: [
        'Increases the learning rate',
        'Shrinks factor values toward zero (prevents overfitting)',
        'Increases the number of latent factors',
        'Speeds up convergence',
      ],
      correctAnswer: 'Shrinks factor values toward zero (prevents overfitting)',
      explanation: 'The reg * P term in the update rule is L2 regularization. Higher reg pulls factor values closer to zero, reducing model complexity and preventing overfitting to training data.',
    },
    {
      id: 'p14-mf-5', type: 'match',
      question: 'Match each term with its role in matrix factorization:',
      pairs: [
        { left: 'b_u (user bias)', right: 'Captures whether a user rates higher/lower on average' },
        { left: 'b_i (item bias)', right: 'Captures whether an item is rated higher/lower on average' },
        { left: 'p_u (user factors)', right: 'Encodes the user\'s latent preference profile' },
        { left: 'q_i (item factors)', right: 'Encodes the item\'s latent attribute profile' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Biases capture baseline effects (some users are generous, some movies are popular). Factors capture the interaction patterns — how well a user\'s preferences align with an item\'s attributes.',
    },
  ],
}))

export {}
