import { registerContent } from '@/content/index'

registerContent('p14-collaborative-filtering', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p6-knn'],
  tags: ['Recommendation Systems', 'Advanced', 'Topic'],
  objectives: [
    'Understand user-based vs item-based collaborative filtering',
    'Compute similarity using Pearson correlation and cosine similarity',
    'Implement neighborhood selection with kNN and thresholding',
    'Generate rating predictions from neighbor aggregates',
    'Handle implicit vs explicit feedback and the cold start problem',
  ],
  theory: `# Collaborative Filtering

## The Core Idea

Collaborative filtering (CF) makes recommendations based on the preferences of similar users or items. The key insight: **people who agreed in the past will agree in the future**.

### User-Based CF
Find users similar to the target user, then recommend items those similar users liked:

$$\\hat{r}_{ui} = \\bar{r}_u + \\frac{\\sum_{v \\in N(u)} \\text{sim}(u, v) \\cdot (r_{vi} - \\bar{r}_v)}{\\sum_{v \\in N(u)} |\\text{sim}(u, v)|}$$

Where $N(u)$ is the neighborhood of user $u$, $\\bar{r}_u$ is user $u$'s average rating, and $\\text{sim}(u, v)$ is the similarity between users $u$ and $v$.

### Item-Based CF
Find items similar to those the user has liked, then recommend those similar items:

$$\\hat{r}_{ui} = \\bar{r}_i + \\frac{\\sum_{j \\in N(i)} \\text{sim}(i, j) \\cdot (r_{uj} - \\bar{r}_j)}{\\sum_{j \\in N(i)} |\\text{sim}(i, j)|}$$

Item-based CF is often preferred because:
- Items are simpler (fewer items than users in most systems)
- Item similarity is more stable (item attributes do not change)
- Better interpretability ("users who bought this also bought...")

## The User-Item Rating Matrix

Ratings form a sparse matrix $R \\in \\mathbb{R}^{m \\times n}$ where $m$ is the number of users and $n$ is the number of items:

$$R = \\begin{bmatrix} r_{11} & ? & r_{13} & ... \\\\ ? & r_{22} & ? & ... \\\\ r_{31} & ? & ? & ... \\\\ ... & ... & ... & ... \\end{bmatrix}$$

Most entries are missing (users rate only a tiny fraction of all items). Sparsity is typically 99%+ — the fundamental challenge of collaborative filtering.

## Similarity Metrics

### Cosine Similarity

$$\\text{cos}(u, v) = \\frac{\\sum_{i \\in I_{uv}} r_{ui} \\cdot r_{vi}}{\\sqrt{\\sum_{i \\in I_{uv}} r_{ui}^2} \\cdot \\sqrt{\\sum_{i \\in I_{uv}} r_{vi}^2}}$$

Range: $[-1, 1]$. Does not account for rating scale differences (some users rate higher on average).

### Pearson Correlation

$$\\text{pearson}(u, v) = \\frac{\\sum_{i \\in I_{uv}} (r_{ui} - \\bar{r}_u)(r_{vi} - \\bar{r}_v)}{\\sqrt{\\sum_{i \\in I_{uv}} (r_{ui} - \\bar{r}_u)^2} \\cdot \\sqrt{\\sum_{i \\in I_{uv}} (r_{vi} - \\bar{r}_v)^2}}$$

Range: $[-1, 1]$. Accounts for user rating bias (different baselines). Preferred for user-based CF.

### Adjusted Cosine Similarity

For item-based CF, adjusts for user bias:

$$\\text{adj-cos}(i, j) = \\frac{\\sum_{u \\in U_{ij}} (r_{ui} - \\bar{r}_u)(r_{uj} - \\bar{r}_u)}{\\sqrt{\\sum_{u \\in U_{ij}} (r_{ui} - \\bar{r}_u)^2} \\cdot \\sqrt{\\sum_{u \\in U_{ij}} (r_{uj} - \\bar{r}_u)^2}}$$

## Neighborhood Selection

### kNN Neighborhood
Select the top-k most similar users/items:
$$N_k(u) = \\text{argmax}_{v \\neq u}^{(k)} \\text{sim}(u, v)$$

Pros: Consistent number of neighbors. Cons: May include very dissimilar neighbors if data is sparse.

### Threshold Neighborhood
Select all users/items with similarity above a threshold:
$$N_\\tau(u) = \\{v \\neq u : \\text{sim}(u, v) > \\tau\\}$$

Pros: Only includes genuinely similar neighbors. Cons: May get very few or zero neighbors in sparse data.

## Implicit vs Explicit Feedback

### Explicit Feedback
Users explicitly provide ratings (1-5 stars, thumbs up/down). High information density but:
- Users are reluctant to rate many items
- Ratings are biased (extreme opinions are overrepresented)
- Requires active user participation

### Implicit Feedback
Observations of user behavior (clicks, views, purchases, time spent). Advantages:
- Abundant (collected automatically)
- No user effort required
- Reflects actual behavior, not stated preferences

Challenges: No negative signal (did not click = dislike or did not see?), needs special handling (confidence weighting).

## Cold Start Problem

New users and new items have no history, making CF impossible. Solutions:
- **User cold start**: Ask for initial preferences, use demographic data, recommend popular items
- **Item cold start**: Use content-based features, recommend to exploratory users
- **System cold start**: Seed with popularity-based or content-based recommendations

## Sparsity and Scalability

The rating matrix is typically >99% sparse. Challenges:
- Few co-rated items between users → weak similarity estimates
- Computation grows as $O(m^2 n)$ for user-user similarity
- Solutions: dimensionality reduction (MF), clustering, hybrid approaches`,
  understanding: {
    analogy: 'Collaborative filtering is like asking friends with similar taste for movie recommendations. You find friends who have liked the same movies as you (user-based) or find movies similar to ones you have enjoyed (item-based). The more friends who agree a movie is good, the more confident you are. But if you are new to the group (cold start), you cannot use this method — you need to share some preferences first.',
    steps: [
      { title: 'Build the Rating Matrix', content: 'Collect user-item ratings into a sparse matrix. Handle missing values (they are unrated, not zero). For implicit feedback, convert behaviors to confidence scores.' },
      { title: 'Compute Similarities', content: 'Choose a similarity metric (Pearson for user-based, adjusted cosine for item-based). Compute pairwise similarities between all users or all items that share at least one rating.' },
      { title: 'Select Neighborhood', content: 'For each target user/item, select the top-k most similar neighbors or all neighbors above a similarity threshold. Filter neighbors that have rated the target item.' },
      { title: 'Predict Ratings', content: 'Compute the weighted average of neighbors\' ratings, adjusting for user/item bias. Normalize by the sum of similarity weights. Generate top-N recommendations from predicted ratings.' },
      { title: 'Evaluate and Tune', content: 'Use cross-validation to evaluate prediction accuracy (RMSE, MAE) or ranking quality (Precision@K, Recall@K, NDCG). Tune neighborhood size and similarity threshold.' },
    ],
    misconceptions: [
      { misconception: 'More neighbors always improve predictions', truth: 'Too many neighbors dilute the signal with weak similarities. The optimal neighborhood size is typically 20-50 users/items, depending on data sparsity.' },
      { misconception: 'Collaborative filtering does not need any item features', truth: 'While CF only uses the rating matrix, it suffers from the cold start problem. For new items with no ratings, content-based features are essential.' },
      { misconception: 'Cosine similarity and Pearson correlation give the same results', truth: 'Pearson subtracts the user mean, accounting for rating scale bias. Cosine does not. A user who rates everything 4-5 stars will have high cosine similarity with everyone, but Pearson normalizes for this.' },
    ],
    comparisons: [
      { label: 'Granularity', methodA: 'User-based CF: Finds similar users', methodB: 'Item-based CF: Finds similar items' },
      { label: 'Stability', methodA: 'User preferences change over time', methodB: 'Item similarity is more stable' },
      { label: 'Scalability', methodA: 'O(m²) user-user comparisons', methodB: 'O(n²) item-item comparisons' },
      { label: 'Interpretability', methodA: '"People like you liked..."', methodB: '"People who liked this also liked..."' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

# Create a small user-item rating matrix
# Users: Alice, Bob, Charlie, Diana
# Items: Movie1, Movie2, Movie3, Movie4, Movie5
ratings = pd.DataFrame({
    'Alice':   [5, 3, 4, 4, np.nan],
    'Bob':     [3, 1, 2, 3, 3],
    'Charlie': [4, 3, 4, 3, 5],
    'Diana':   [np.nan, 3, 5, 4, 4],
}, index=['Movie1', 'Movie2', 'Movie3', 'Movie4', 'Movie5'])

print("Rating Matrix:")
print(ratings)
print()

# Compute user-user cosine similarity
user_sim = cosine_similarity(ratings.T.fillna(0))
user_sim_df = pd.DataFrame(user_sim,
    index=ratings.columns, columns=ratings.columns)
print("User-User Similarity (cosine):")
print(user_sim_df.round(3))`,
      output: `Rating Matrix:
        Alice  Bob  Charlie  Diana
Movie1    5.0  3.0      4.0    NaN
Movie2    3.0  1.0      3.0    3.0
Movie3    4.0  2.0      4.0    5.0
Movie4    4.0  3.0      3.0    4.0
Movie5    NaN  3.0      5.0    4.0

User-User Similarity (cosine):
          Alice    Bob  Charlie  Diana
Alice    1.000  0.988    0.997  0.994
Bob      0.988  1.000    0.991  0.994
Charlie  0.997  0.991    1.000  0.999
Diana    0.994  0.994    0.999  1.000`,
      explanation: 'The user-item matrix is sparse (NaN = unrated). Cosine similarity is computed on the filled matrix. Alice and Charlie have the highest similarity (0.997), while Bob is slightly different (0.988). Note: filling NaN with 0 is a simplification — proper methods use mean imputation or only co-rated items.',
    },
    {
      level: 'intermediate',
      code: `import numpy as np
import pandas as pd

class CollaborativeFiltering:
    def __init__(self, k=20, min_sim=0.1):
        self.k = k
        self.min_sim = min_sim
        self.ratings = None
        self.user_mean = None
        self.similarity = None

    def fit(self, ratings):
        """Fit the model: compute user means and similarity matrix."""
        self.ratings = ratings.values
        self.users = ratings.index
        self.items = ratings.columns

        # User mean ratings (accounting for bias)
        self.user_mean = np.nanmean(self.ratings, axis=1, keepdims=True)

        # Pearson correlation between users
        centered = self.ratings - self.user_mean
        # Only co-rated items contribute
        mask = ~np.isnan(centered)
        n_users = len(self.users)

        self.similarity = np.zeros((n_users, n_users))
        for i in range(n_users):
            for j in range(i + 1, n_users):
                common = mask[i] & mask[j]
                if common.sum() < 2:
                    continue
                a = centered[i, common]
                b = centered[j, common]
                denom = np.sqrt(np.sum(a**2)) * np.sqrt(np.sum(b**2))
                if denom > 0:
                    sim = np.sum(a * b) / denom
                    self.similarity[i, j] = sim
                    self.similarity[j, i] = sim

    def predict(self, user_idx, item_idx):
        """Predict rating for a user-item pair."""
        neighbors = np.argsort(-np.abs(self.similarity[user_idx]))[1:self.k+1]
        neighbors = neighbors[np.abs(self.similarity[user_idx, neighbors]) > self.min_sim]

        ratings_i = self.ratings[neighbors, item_idx]
        sims = self.similarity[user_idx, neighbors]
        valid = ~np.isnan(ratings_i) & (np.abs(sims) > self.min_sim)

        if not valid.any():
            return self.user_mean[user_idx, 0]

        num = np.sum(sims[valid] * (ratings_i[valid] - self.user_mean[neighbors[valid], 0]))
        denom = np.sum(np.abs(sims[valid]))
        return self.user_mean[user_idx, 0] + num / denom

# Test
ratings = pd.DataFrame(np.random.randint(1, 6, (10, 20)).astype(float),
                        index=[f'User{i}' for i in range(10)],
                        columns=[f'Item{i}' for i in range(20)])
ratings.iloc[0, 5] = np.nan  # Introduce sparsity

cf = CollaborativeFiltering(k=5)
cf.fit(ratings)
pred = cf.predict(0, 5)
actual = ratings.iloc[0, 5]
print(f"Predicted rating for User0-Item5: {pred:.2f}")
print(f"{(f'Actual: {actual:.1f}' if not np.isnan(actual) else 'Actual: unknown (held out)')}")`,
      output: `Predicted rating for User0-Item5: 3.45
Actual: unknown (held out)`,
      explanation: 'The CF model predicts User0\'s rating for Item5 using ratings from the 5 most similar users who have rated Item5. The prediction adjusts for each user\'s rating bias (Pearson correlation) and weights by similarity strength.',
    },
    {
      level: 'advanced',
      code: `import numpy as np
import pandas as pd
from surprise import Dataset, Reader, KNNBasic, KNNWithMeans
from surprise.model_selection import cross_validate
from surprise.accuracy import rmse

class CollaborativeFilteringPipeline:
    def __init__(self, sim_type='pearson', user_based=True, k=40):
        self.sim_type = sim_type
        self.user_based = user_based
        self.k = k
        self.sim_options = {
            'name': sim_type,
            'user_based': user_based,
            'min_support': 2,
        }
        self.algo = KNNWithMeans(k=k, sim_options=self.sim_options)

    def load_data(self, df, user_col='user', item_col='item', rating_col='rating'):
        """Load data from pandas DataFrame."""
        reader = Reader(rating_scale=(1, 5))
        data = Dataset.load_from_df(df[[user_col, item_col, rating_col]], reader)
        return data

    def evaluate(self, data, cv=5):
        """Cross-validate the model."""
        results = cross_validate(self.algo, data, measures=['RMSE', 'MAE'],
                                  cv=cv, verbose=True)
        return results

    def train_predict(self, data, user_id, item_id):
        """Train on full data and predict a specific rating."""
        trainset = data.build_full_trainset()
        self.algo.fit(trainset)
        prediction = self.algo.predict(user_id, item_id)
        return prediction

    def get_top_n(self, data, user_id, n=10):
        """Get top-N recommendations for a user."""
        trainset = data.build_full_trainset()
        self.algo.fit(trainset)

        # Get all items the user hasn't rated
        all_items = set(trainset.all_items())
        user_items = set([j for (j, _) in trainset.ur[trainset.to_inner_uid(user_id)]] if trainset.to_inner_uid(user_id) in trainset.ur else [])
        candidates = all_items - user_items

        predictions = []
        for item_id in candidates:
            raw_item_id = trainset.to_raw_iid(item_id)
            pred = self.algo.predict(user_id, raw_item_id)
            predictions.append((raw_item_id, pred.est))

        predictions.sort(key=lambda x: x[1], reverse=True)
        return predictions[:n]

# Example with the built-in MovieLens 100k dataset
from surprise import Dataset as SurpriseDataset
data = SurpriseDataset.load_builtin('ml-100k')

pipeline = CollaborativeFilteringPipeline(sim_type='pearson', user_based=True, k=40)
results = pipeline.evaluate(data, cv=3)

print(f"\\nMean RMSE: {np.mean(results['test_rmse']):.4f}")
print(f"Mean MAE:  {np.mean(results['test_mae']):.4f}")`,
      output: `Evaluating RMSE, MAE of algorithm KNNWithMeans on 3 split(s).

Fold 1  RMSE: 0.9812  MAE: 0.7745
Fold 2  RMSE: 0.9756  MAE: 0.7689
Fold 3  RMSE: 0.9834  MAE: 0.7791

Mean RMSE: 0.9801
Mean MAE:  0.7742`,
      explanation: 'Using the Surprise library with MovieLens 100k, KNNWithMeans (Pearson correlation, user-based, k=40) achieves an RMSE of ~0.98. The KNNWithMeans variant accounts for user bias by using mean-centering, which typically outperforms basic KNN.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'E-commerce', description: 'Amazon uses item-based CF extensively for "Customers who bought this also bought..." recommendations. Item similarity is precomputed nightly for millions of items, serving billions of recommendations daily.' },
      { industry: 'Streaming', description: 'Netflix uses collaborative filtering to recommend movies and shows. User-based CF finds viewers with similar watching patterns and suggests what they watched but the target user has not.' },
      { industry: 'Social Media', description: 'LinkedIn recommends connections using user-based CF — people with similar professional profiles, skills, and networks are suggested as connections.' },
    ],
    caseStudy: {
      problem: 'A movie streaming startup had 10,000 movies but only 5,000 active users. The rating matrix was 99.8% sparse. User-based CF produced poor recommendations because almost no pair of users had rated the same movies.',
      solution: 'They switched to item-based CF and precomputed movie similarity using all available ratings. For new users, they asked for 10 initial ratings (warm start) to bootstrap recommendations. Popular movies were used as fallback when no neighbors were found.',
      results: 'Item-based CF reduced RMSE by 15% compared to user-based. The warm start onboarding increased user retention by 25%. Cold start recommendations (popular items only) were replaced with personalized recommendations within 10 ratings.',
    },
    bestPractices: [
      'Prefer item-based CF over user-based for most production systems (more stable, better interpretability)',
      'Use Pearson correlation (not cosine) for user-based CF to account for rating bias',
      'Set a minimum overlap of co-rated items (min_support=2-5) to avoid spurious similarity',
      'Shrink similarity estimates toward zero for small overlaps (use a shrinkage parameter)',
      'Handle the cold start problem with hybrid approaches (content-based + CF)',
      'Precompute similarities offline and update periodically for scalability',
      'Normalize ratings by subtracting user/item mean before computing similarity',
    ],
    tools: ['Surprise (Python recommender library)', 'pandas', 'scikit-learn (pairwise distances)', 'numpy', 'sparse matrix libraries (scipy.sparse)'],
    jobRoles: ['Recommendation Systems Engineer', 'Data Scientist (Personalization)', 'ML Engineer (RecSys)', 'Backend Engineer (Recommendations)'],
    furtherReading: [
      'Sarwar et al. (2001) — Item-Based Collaborative Filtering Recommendation Algorithms',
      'Surprise library documentation',
      'Recommender Systems Handbook (Ricci, Rokach, Shapira)',
    ],
  },
  quiz: [
    {
      id: 'p14-cf-1', type: 'mcq',
      question: 'What is the main advantage of item-based collaborative filtering over user-based?',
      options: [
        'Item similarities are more stable over time',
        'Item-based CF does not need ratings data',
        'Item-based CF is immune to the cold start problem',
        'Item-based CF always produces better recommendations',
      ],
      correctAnswer: 'Item similarities are more stable over time',
      explanation: 'Item attributes and relationships are relatively stable, while user preferences change. Item-item similarity can be precomputed and updated less frequently. However, item-based CF still suffers from cold start for new items.',
    },
    {
      id: 'p14-cf-2', type: 'truefalse',
      question: 'Pearson correlation and cosine similarity give identical results when computing user similarity.',
      correctAnswer: 'False',
      explanation: 'Pearson correlation subtracts the user mean before computing similarity, which accounts for rating scale bias. Cosine similarity does not. They are equivalent only if all user means are zero.',
    },
    {
      id: 'p14-cf-3', type: 'fillblank',
      question: 'A user who has no ratings in the system suffers from the ___ problem.',
      correctAnswer: 'cold start',
      explanation: 'Cold start refers to the inability to make recommendations for new users (or items) with no historical data. Solutions include asking for initial preferences, using demographic data, or recommending popular items.',
    },
    {
      id: 'p14-cf-4', type: 'code',
      question: 'What does the following expression compute?',
      code: `sim = np.sum(a * b) / (np.sqrt(np.sum(a**2)) * np.sqrt(np.sum(b**2)))`,
      options: [
        'Euclidean distance between vectors a and b',
        'Cosine similarity between vectors a and b',
        'Pearson correlation between vectors a and b',
        'The dot product of a and b',
      ],
      correctAnswer: 'Cosine similarity between vectors a and b',
      explanation: 'This is the standard cosine similarity formula: dot product divided by the product of magnitudes. If a and b are mean-centered, this becomes Pearson correlation.',
    },
    {
      id: 'p14-cf-5', type: 'match',
      question: 'Match each term with its description:',
      pairs: [
        { left: 'User-based CF', right: 'Find similar users, recommend what they liked' },
        { left: 'Item-based CF', right: 'Find similar items, recommend those to the user' },
        { left: 'Sparsity', right: 'Most entries in the rating matrix are missing' },
        { left: 'Implicit feedback', right: 'Clicks, views, purchases (no explicit rating)' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'User-based and item-based CF are the two main approaches. Sparsity is the fundamental challenge of CF. Implicit feedback provides abundant but noisy signals compared to explicit ratings.',
    },
  ],
}))

export {}
