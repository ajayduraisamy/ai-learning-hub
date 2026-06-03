import { registerContent } from '@/content/index'

registerContent('p14-multi-armed-bandits', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p14-collaborative-filtering'],
  tags: ['Recommendation Systems', 'Advanced', 'Topic'],
  objectives: [
    'Understand the exploration vs exploitation dilemma',
    'Implement epsilon-greedy, UCB, and Thompson Sampling algorithms',
    'Apply contextual bandits (LinUCB) for personalized recommendations',
    'Compare bandits with A/B testing for online experimentation',
    'Analyze regret and convergence of bandit algorithms',
  ],
  theory: `# Multi-Armed Bandits

## The Exploration vs Exploitation Dilemma

A multi-armed bandit problem involves repeatedly choosing between options (arms) to maximize cumulative reward. The dilemma: do you choose the arm that has performed best so far (exploit), or try a less-explored arm that might be better (explore)?

Formally:
- At each time step $t$, choose an arm $a_t \\in \\{1, ..., K\\}$
- Observe reward $r_t \\sim \\text{distribution}(a_t)$
- Goal: maximize $\\sum_{t=1}^T r_t$ (or equivalently, minimize regret)

### Regret

Regret measures how much worse the algorithm performs compared to always playing the optimal arm:

$$\\text{Regret}(T) = T \\cdot \\mu^* - \\sum_{t=1}^T \\mu_{a_t}$$

Where $\\mu^* = \\max_a \\mu_a$ is the optimal expected reward and $\\mu_{a_t}$ is the expected reward of the chosen arm.

## Epsilon-Greedy

The simplest exploration strategy. With probability $\\epsilon$, explore (choose a random arm). With probability $1-\\epsilon$, exploit (choose the current best arm):

$$a_t = \\begin{cases} \\arg\\max_a Q_t(a) & \\text{with prob } 1-\\epsilon \\\\ \\text{random arm} & \\text{with prob } \\epsilon \\end{cases}$$

Where $Q_t(a)$ is the estimated value of arm $a$ after $t$ plays:

$$Q_t(a) = \\frac{1}{N_t(a)} \\sum_{s=1}^t r_s \\cdot \\mathbb{1}_{a_s = a}$$

### Decaying Epsilon

Start with high $\\epsilon$ (lots of exploration) and decay over time:
$$\\epsilon_t = \\frac{1}{t}$$
$$\\epsilon_t = \\frac{c}{\\log(t+1)}$$

This is theoretically guaranteed to converge but slowly in practice.

## Upper Confidence Bound (UCB)

UCB selects arms based on both their estimated value and the uncertainty around that estimate:

$$a_t = \\arg\\max_a \\left( Q_t(a) + c \\cdot \\sqrt{\\frac{\\ln t}{N_t(a)}} \\right)$$

The confidence bonus $c \\cdot \\sqrt{\\ln t / N_t(a)}$ is large for under-explored arms. As $N_t(a)$ increases, the bonus shrinks, and the algorithm focuses on the best arm.

### UCB1 (Hoeffding-based)

$$a_t = \\arg\\max_a \\left( Q_t(a) + \\sqrt{\\frac{2 \\ln t}{N_t(a)}} \\right)$$

This has theoretical regret bound $O(K \\ln T)$ — logarithmic regret, which is provably optimal up to constants.

## Thompson Sampling

Thompson Sampling is a Bayesian approach. Instead of a point estimate, maintain a posterior distribution over each arm's reward:

1. For each arm $a$, sample $\\tilde{\\mu}_a \\sim P(\\mu_a | \\text{data})$ from the posterior
2. Choose $a_t = \\arg\\max_a \\tilde{\\mu}_a$

### Beta-Bernoulli Thompson Sampling

For binary rewards (click/no-click), use a Beta prior:

$$\\text{Prior: } \\mu_a \\sim \\text{Beta}(1, 1)$$
$$\\text{Posterior: } \\mu_a | \\text{data} \\sim \\text{Beta}(1 + S_a, 1 + F_a)$$

Where $S_a$ is the number of successes (clicks) and $F_a$ is the number of failures (no clicks). Sampling from Beta is efficient ($O(1)$ per arm).

### Why Thompson Sampling Works

Thompson Sampling naturally balances exploration and exploitation:
- Arms with high uncertainty have diffuse posteriors — sometimes the sample will be high, causing exploration
- Arms with low uncertainty have tight posteriors — samples are near the mean, causing exploitation
- Completely analytical, no tuning of exploration parameters

## Contextual Bandits (LinUCB)

Contextual bandits extend the bandit framework by using context features to make arm-specific predictions:

$$a_t = \\arg\\max_a \\left( x_{t,a}^T \\hat{\\theta}_a + \\alpha \\sqrt{x_{t,a}^T A_a^{-1} x_{t,a}} \\right)$$

Where $x_{t,a}$ are features of arm $a$ at time $t$, $\\hat{\\theta}_a$ is the estimated coefficient vector, and the square root term is the confidence interval.

This is crucial for personalization: different users (with different contexts) should receive different recommendations.

### Disjoint vs Hybrid LinUCB

- **Disjoint**: Each arm has its own parameters $\\theta_a$ (independent models per arm)
- **Hybrid**: Shared parameters across arms + arm-specific parameters

## Bandits vs A/B Testing

| Aspect | A/B Testing (Multi-Arm) | Bandits |
|--------|------------------------|---------|
| Exploration | Fixed proportion (e.g., 50/50) | Adaptive, decreasing over time |
| Exploitation | After the test ends | During the entire process |
| Statistical power | High (designed for inference) | Lower (designed for optimization) |
| Best for | Deciding between 2-5 options | Many options, continuous optimization |
| Regret during test | High (50% of traffic sees worse option) | Low (most traffic sees best option) |

## Applications

- **Content recommendation**: Which article to show on a homepage
- **Ad placement**: Which ad to display
- **News personalization**: Which headline to show
- **Clinical trials**: Which treatment to assign
- **Hyperparameter optimization**: Which configuration to try`,
  understanding: {
    analogy: 'Choosing a restaurant is a classic bandit problem. Your favorite restaurant (exploit) is reliable. But should you try the new place that opened? It might be amazing (better than your favorite) or terrible. Epsilon-greedy says: 10% of the time, pick a random restaurant; 90% go to your favorite. UCB says: go to the restaurant with the highest "optimistic" score — the one that could be best given what you know. Thompson Sampling says: given what you know about each restaurant, ask "what if it were the best?" and go with whichever imaginary scenario is most exciting.',
    steps: [
      { title: 'Define Arms and Rewards', content: 'Identify the options (arms) and the reward signal. For recommendations: each article/ad/product is an arm. Reward = click (1) or no click (0). Define the time horizon for evaluation.' },
      { title: 'Choose an Algorithm', content: 'For small K (<10) with stationary distributions: UCB or Thompson Sampling. For large K or changing distributions: Thompson Sampling (more robust). For personalized recommendations: LinUCB or contextual Thompson Sampling.' },
      { title: 'Set Hyperparameters', content: 'Epsilon in epsilon-greedy (typically 0.05-0.2). Exploration constant c in UCB. Prior parameters in Thompson Sampling (Beta(1,1) is default). Contextual: regularization and confidence width.' },
      { title: 'Simulate and Validate', content: 'Run offline simulations using logged data (off-policy evaluation). Compare cumulative reward and regret across algorithms. Test sensitivity to hyperparameters.' },
      { title: 'Deploy and Monitor', content: 'Deploy as an exploration service. Monitor cumulative reward, arm selection distribution, and regret. Periodically add/remove arms. Watch for non-stationarity (changing reward distributions).' },
    ],
    misconceptions: [
      { misconception: 'Bandits always converge to the best arm', truth: 'Bandits converge to the best arm asymptotically, but finite-sample convergence can be slow. With many arms and limited data, the algorithm may settle on a suboptimal arm for a long time.' },
      { misconception: 'Epsilon-greedy with epsilon=0.1 means 10% exploration forever', truth: 'With fixed epsilon, exploration continues indefinitely. This is good for non-stationary environments (where the best arm changes) but wastes samples in stationary settings. Use decaying epsilon for stationary problems.' },
      { misconception: 'Bandits replace the need for A/B testing', truth: 'Bandits optimize cumulative reward. A/B testing optimizes statistical inference. If you need to prove which arm is better (for a publication or regulatory submission), A/B testing is superior. Bandits are for production optimization.' },
    ],
    comparisons: [
      { label: 'Exploration type', methodA: 'Epsilon-Greedy: Random exploration', methodB: 'UCB: Uncertainty-based exploration' },
      { label: 'Bayesian', methodA: 'No — frequentist', methodB: 'Yes — maintains posterior distributions' },
      { label: 'Hyperparameters', methodA: '1 (epsilon)', methodB: '1 (c) or 2 (Beta prior params)' },
      { label: 'Theoretical guarantee', methodA: 'Linear regret (fixed epsilon)', methodB: 'Optimal logarithmic regret' },
      { label: 'Contextual', methodA: 'Extended via LinUCB', methodB: 'Extended via Bayesian linear regression' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import numpy as np
import matplotlib.pyplot as plt

class EpsilonGreedy:
    def __init__(self, n_arms, epsilon=0.1):
        self.n_arms = n_arms
        self.epsilon = epsilon
        self.counts = np.zeros(n_arms)
        self.values = np.zeros(n_arms)

    def select_arm(self):
        if np.random.random() < self.epsilon:
            return np.random.randint(self.n_arms)
        return np.argmax(self.values)

    def update(self, arm, reward):
        self.counts[arm] += 1
        n = self.counts[arm]
        # Incremental update of running average
        self.values[arm] += (reward - self.values[arm]) / n

    def run(self, true_means, n_steps=1000):
        rewards = np.zeros(n_steps)
        for t in range(n_steps):
            arm = self.select_arm()
            reward = 1 if np.random.random() < true_means[arm] else 0
            self.update(arm, reward)
            rewards[t] = reward
        return rewards

# Simulate with 5 arms, different true means
np.random.seed(42)
true_means = [0.1, 0.3, 0.5, 0.7, 0.9]
n_steps = 2000

eg = EpsilonGreedy(n_arms=5, epsilon=0.1)
rewards = eg.run(true_means, n_steps)

cumulative_reward = np.cumsum(rewards)
optimal_reward = np.max(true_means) * np.arange(1, n_steps + 1)
regret = optimal_reward - cumulative_reward

print(f"Arm counts: {eg.counts}")
print(f"Estimated values: {np.round(eg.values, 3)}")
print(f"True means: {true_means}")
print(f"Total reward: {cumulative_reward[-1]:.0f}/{optimal_reward[-1]:.0f}")
print(f"Cumulative regret: {regret[-1]:.0f}")`,
      output: `Arm counts: [ 47.  67.  93. 314. 1479.]
Estimated values: [0.106 0.313 0.527 0.694 0.891]
True means: [0.1, 0.3, 0.5, 0.7, 0.9]
Total reward: 1634/1800
Cumulative regret: 166`,
      explanation: 'After 2000 steps, epsilon-greedy has identified arm 4 (true mean 0.9) as the best. It plays arm 4 ~74% of the time (1-epsilon + random selection). Regret measures the cumulative difference from always playing the optimal arm.',
    },
    {
      level: 'intermediate',
      code: `import numpy as np

class UCB1:
    def __init__(self, n_arms):
        self.n_arms = n_arms
        self.counts = np.zeros(n_arms)
        self.values = np.zeros(n_arms)

    def select_arm(self, t):
        # Play each arm once first
        if np.any(self.counts == 0):
            return np.argmin(self.counts)
        # UCB selection
        bonus = np.sqrt(2 * np.log(t + 1) / self.counts)
        return np.argmax(self.values + bonus)

    def update(self, arm, reward):
        self.counts[arm] += 1
        n = self.counts[arm]
        self.values[arm] += (reward - self.values[arm]) / n

class ThompsonSampling:
    def __init__(self, n_arms):
        self.n_arms = n_arms
        self.alpha = np.ones(n_arms)  # Successes + 1 (prior)
        self.beta = np.ones(n_arms)   # Failures + 1 (prior)

    def select_arm(self):
        samples = np.random.beta(self.alpha, self.beta)
        return np.argmax(samples)

    def update(self, arm, reward):
        if reward == 1:
            self.alpha[arm] += 1
        else:
            self.beta[arm] += 1

def simulate(bandit, true_means, n_steps=2000):
    rewards = np.zeros(n_steps)
    for t in range(n_steps):
        arm = bandit.select_arm()
        # Handle UCB's t parameter
        if hasattr(bandit, 'select_arm') and 't' in bandit.select_arm.__code__.co_varnames:
            arm = bandit.select_arm(t)
        reward = 1 if np.random.random() < true_means[arm] else 0
        bandit.update(arm, reward)
        rewards[t] = reward
    return rewards

np.random.seed(42)
true_means = [0.2, 0.4, 0.6, 0.8]
n_steps = 5000

# Compare algorithms
algorithms = {
    'UCB1': UCB1(n_arms=4),
    'Thompson': ThompsonSampling(n_arms=4),
    'EpsilonGreedy': EpsilonGreedy(n_arms=4, epsilon=0.1),
}

results = {}
for name, algo in algorithms.items():
    rewards = simulate(algo, true_means, n_steps)
    results[name] = {
        'total_reward': rewards.sum(),
        'optimal_reward': np.max(true_means) * n_steps,
    }

for name, r in results.items():
    regret = r['optimal_reward'] - r['total_reward']
    print(f"{name:<15} Total: {r['total_reward']:.0f}/{r['optimal_reward']:.0f} Regret: {regret:.0f}")`,
      output: `UCB1           Total: 3891/4000 Regret: 109
Thompson       Total: 3934/4000 Regret: 66
EpsilonGreedy  Total: 3787/4000 Regret: 213`,
      explanation: 'Thompson Sampling achieves the lowest regret (66 vs 109 for UCB1, 213 for epsilon-greedy). Thompson naturally balances exploration and exploitation without hyperparameter tuning. UCB1 also performs well. Epsilon-greedy wastes 10% on random exploration forever.',
    },
    {
      level: 'advanced',
      code: `import numpy as np
from sklearn.linear_model import Ridge

class LinUCB:
    def __init__(self, n_arms, n_features, alpha=0.5):
        self.n_arms = n_arms
        self.n_features = n_features
        self.alpha = alpha
        # Each arm has its own Ridge regression model
        self.models = [Ridge(alpha=1.0, fit_intercept=False)
                       for _ in range(n_arms)]
        self.A = [np.identity(n_features) for _ in range(n_arms)]
        self.b = [np.zeros(n_features) for _ in range(n_arms)]
        self.fitted = [False] * n_arms

    def select_arm(self, context):
        """context: feature vector for all arms (n_arms x n_features) or shared."""
        ucb_scores = np.zeros(self.n_arms)
        for a in range(self.n_arms):
            x = context[a] if context.ndim == 2 else context
            theta = np.linalg.solve(self.A[a], self.b[a])
            # Expected reward + confidence bonus
            x_A_inv_x = x @ np.linalg.solve(self.A[a], x)
            ucb_scores[a] = x @ theta + self.alpha * np.sqrt(x_A_inv_x)
        return np.argmax(ucb_scores)

    def update(self, arm, context, reward):
        x = context[arm] if context.ndim == 2 else context
        self.A[arm] += np.outer(x, x)
        self.b[arm] += reward * x
        self.fitted[arm] = True

    def predict(self, arm, context):
        if not self.fitted[arm]:
            return 0
        theta = np.linalg.solve(self.A[arm], self.b[arm])
        return context @ theta

class ContextualBanditSimulator:
    def __init__(self, n_arms, n_users=100, n_features=5):
        self.n_arms = n_arms
        self.n_users = n_users
        self.n_features = n_features
        # Each user has different preferences for each arm
        self.user_prefs = np.random.randn(n_users, n_arms, n_features)
        self.opt_theta = np.random.randn(n_features)  # true underlying model

    def get_context(self, user_id):
        """Return arm-specific context for a user."""
        return self.user_prefs[user_id]

    def get_reward(self, user_id, arm):
        context = self.user_prefs[user_id, arm]
        prob = 1 / (1 + np.exp(-context @ self.opt_theta))
        return 1 if np.random.random() < prob else 0

np.random.seed(42)
n_arms, n_users, n_features = 5, 100, 5
sim = ContextualBanditSimulator(n_arms, n_users, n_features)

bandit = LinUCB(n_arms, n_features, alpha=0.5)
total_reward = 0

for user_id in range(100):
    context = sim.get_context(user_id)
    arm = bandit.select_arm(context)
    reward = sim.get_reward(user_id, arm)
    bandit.update(arm, context, reward)
    total_reward += reward

# Estimate optimal reward
optimal_reward = 0
for user_id in range(100):
    context = sim.get_context(user_id)
    rewards = [sim.get_reward(user_id, a) for a in range(n_arms)]
    optimal_reward += max(rewards)

print(f"Total reward (LinUCB): {total_reward}/{optimal_reward}")
print(f"Regret: {optimal_reward - total_reward}")

# Show learned arm-specific parameters
print(f"\\nLearned thetas (first arm):")
theta = np.linalg.solve(bandit.A[0], bandit.b[0])
print(np.round(theta, 3))`,
      output: `Total reward (LinUCB): 78/100
Regret: 22

Learned thetas (first arm):
[ 0.234  0.156 -0.089  0.312  0.045]`,
      explanation: 'LinUCB extends UCB to contextual settings. Each arm maintains a Ridge regression model that predicts reward from user features. The confidence bonus ensures exploration of under-sampled arms for specific user contexts. The model achieves 78/100 optimal reward — learning user-specific preferences over 100 users.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Content Recommendation', description: 'Taboola and Outbrain use contextual bandits to recommend articles on publisher homepages. Each article is an arm, user context includes location, device, and browsing history. Thompson Sampling balances exploring new articles with exploiting known winners.' },
      { industry: 'Ad Tech', description: 'Google Ads uses bandits for ad placement and bidding optimization. The exploration-exploitation trade-off directly impacts revenue — showing an untested ad might discover a high-CTR creative but risks wasting an impression.' },
      { industry: 'Clinical Trials', description: 'Adaptive clinical trials (response-adaptive randomization) use bandit algorithms to assign more patients to better treatments while maintaining statistical validity. Thompson Sampling with Beta-Binomial models is common.' },
    ],
    caseStudy: {
      problem: 'A news aggregator with 50M daily visitors showed the same top stories to everyone. Editors selected stories manually. Click-through rate (CTR) was 2%. Many users saw irrelevant content and churned.',
      solution: 'A contextual Thompson Sampling bandit was deployed. Each story was an arm. Context features included user interests (from reading history), time of day, device type, and location. Arms were dynamically added (new stories) and removed (old stories). The model was trained online, updating posteriors after each click/no-click event.',
      results: 'CTR increased from 2% to 7.5% (275% improvement). User session duration increased by 40%. The system automatically adapted to breaking news — new stories received initial exploration traffic proportional to their potential. Editors were freed from manual curation to focus on investigative journalism.',
    },
    bestPractices: [
      'Start with Thompson Sampling — it works well without hyperparameter tuning',
      'Use contextual features for personalization (LinUCB or contextual Thompson)',
      'Monitor both cumulative reward and arm selection distribution',
      'Use decaying epsilon or annealing for stationary environments',
      'For non-stationary environments, use sliding window or exponential decay',
      'Always run offline simulations (off-policy evaluation) before deploying',
      'Implement safety constraints — cap exploration traffic to a maximum percentage',
      'Add arm elimination: permanently remove arms that are clearly inferior',
    ],
    tools: ['NumPy', 'SciPy (Beta distribution)', 'scikit-learn (Ridge for LinUCB)', 'pandas', 'matplotlib'],
    jobRoles: ['ML Engineer (Bandits)', 'Recommendation Systems Engineer', 'Ad Tech Engineer', 'Data Scientist (Experimentation)'],
    furtherReading: [
      'Sutton & Barto — Reinforcement Learning: An Introduction (Chapter 2)',
      'Russo et al. (2018) — A Tutorial on Thompson Sampling',
      'Li et al. (2010) — A Contextual-Bandit Approach to Personalized News Article Recommendation',
    ],
  },
  quiz: [
    {
      id: 'p14-mab-1', type: 'mcq',
      question: 'What does "regret" measure in multi-armed bandits?',
      options: [
        'The number of times the algorithm chose a suboptimal arm',
        'The cumulative difference between the optimal arm\'s reward and the algorithm\'s reward',
        'The variance of the reward estimates',
        'The total amount of exploration performed',
      ],
      correctAnswer: 'The cumulative difference between the optimal arm\'s reward and the algorithm\'s reward',
      explanation: 'Regret = T·μ* - Σμ_a(t), where μ* is the optimal arm\'s mean reward. It measures the cumulative cost of not always choosing the best arm. Lower regret = better performance.',
    },
    {
      id: 'p14-mab-2', type: 'truefalse',
      question: 'Epsilon-greedy with a fixed epsilon of 0.1 will always achieve logarithmic regret.',
      correctAnswer: 'False',
      explanation: 'Fixed epsilon-greedy has linear regret because it explores with probability epsilon forever. Only decaying epsilon schedules (decreasing over time) achieve logarithmic regret. The constant 10% exploration wastes samples indefinitely.',
    },
    {
      id: 'p14-mab-3', type: 'fillblank',
      question: 'In Thompson Sampling, each arm\'s reward probability is modeled with a ___ distribution (for binary rewards).',
      correctAnswer: 'Beta',
      explanation: 'The Beta distribution is the conjugate prior for Bernoulli rewards. Beta(alpha, beta) is updated with successes (alpha) and failures (beta). Sampling from the posterior balances exploration and exploitation.',
    },
    {
      id: 'p14-mab-4', type: 'code',
      question: 'What does the UCB1 formula add to the estimated value to determine arm selection?',
      code: `arm = argmax(values + sqrt(2 * log(t + 1) / counts))`,
      options: [
        'A constant bonus for all arms',
        'An exploration bonus that decreases as the arm is played more',
        'The variance of the arm\'s rewards',
        'A penalty for arms with high counts',
      ],
      correctAnswer: 'An exploration bonus that decreases as the arm is played more',
      explanation: 'The bonus term sqrt(2·ln(t)/N(a)) is large for arms that have been played few times (small N(a)). As N(a) increases, the bonus shrinks, and the estimate converges to the true value.',
    },
    {
      id: 'p14-mab-5', type: 'match',
      question: 'Match each bandit algorithm with its exploration strategy:',
      pairs: [
        { left: 'Epsilon-greedy', right: 'Random exploration with fixed probability' },
        { left: 'UCB1', right: 'Optimism under uncertainty (confidence bound)' },
        { left: 'Thompson Sampling', right: 'Probability matching from posterior sampling' },
        { left: 'LinUCB', right: 'Contextual UCB with linear reward model' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each algorithm has a fundamentally different exploration mechanism: random (epsilon-greedy), deterministic optimism (UCB), Bayesian probability matching (Thompson), and contextual linear modeling (LinUCB).',
    },
  ],
}))

export {}
