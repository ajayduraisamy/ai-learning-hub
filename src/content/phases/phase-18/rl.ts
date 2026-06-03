import { registerContent } from '@/content/index'

registerContent('p18-rl', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p17-dl-fundamentals'],
  tags: ['Phase 18', 'Advanced', 'Topic'],
  objectives: [
    'Understand the Markov Decision Process (MDP) formulation for reinforcement learning',
    'Derive and implement the Bellman equation for optimal Q-values',
    'Build a Deep Q-Network (DQN) with experience replay and target networks',
    'Implement Proximal Policy Optimization (PPO) using actor-critic architecture',
    'Evaluate RL agents on continuous control and discrete action environments',
  ],
  theory: `# Reinforcement Learning (DQN, PPO)

## Markov Decision Process (MDP)

Reinforcement Learning is formalized as a Markov Decision Process defined by the tuple $(S, A, P, R, \\gamma)$:

- **States $s \\in S$**: The set of all possible configurations of the environment
- **Actions $a \\in A$**: The set of all possible moves the agent can make
- **Transition probability $P(s' | s, a)$**: The probability of landing in state $s'$ after taking action $a$ in state $s$
- **Reward $R(s, a, s')$**: The immediate reward received after transitioning
- **Discount factor $\\gamma \\in [0, 1]$**: How much we value future rewards (close to 1 = far-sighted, close to 0 = myopic)

### The RL Loop

1. Agent observes state $s_t$
2. Agent selects action $a_t$ using policy $\\pi(a_t | s_t)$
3. Environment returns reward $r_t$ and next state $s_{t+1}$
4. Agent stores experience $(s_t, a_t, r_t, s_{t+1})$ and learns from it
5. Repeat until terminal state or max steps

## Value Functions

### State-Value Function $V^\\pi(s)$

The expected return starting from state $s$ and following policy $\\pi$:

$$V^\\pi(s) = \\mathbb{E}_{\\pi} \\left[ \\sum_{k=0}^{\\infty} \\gamma^k r_{t+k} \\mid s_t = s \\right]$$

### Action-Value Function $Q^\\pi(s, a)$

The expected return starting from state $s$, taking action $a$, then following policy $\\pi$:

$$Q^\\pi(s, a) = \\mathbb{E}_{\\pi} \\left[ \\sum_{k=0}^{\\infty} \\gamma^k r_{t+k} \\mid s_t = s, a_t = a \\right]$$

## Bellman Equation

The optimal Q-function satisfies the Bellman optimality equation:

$$Q^*(s, a) = \\mathbb{E} \\left[ r + \\gamma \\max_{a'} Q^*(s', a') \\mid s, a \\right]$$

This equation says: the optimal Q-value of taking action $a$ in state $s$ equals the immediate reward plus the discounted maximum Q-value of the next state.

## Deep Q-Network (DQN)

DQN approximates $Q^*(s, a)$ using a neural network $Q_\\theta(s, a)$.

### Key Innovations

1. **Experience Replay**: Store transitions $(s, a, r, s')$ in a replay buffer and sample mini-batches randomly to break correlation between consecutive samples
2. **Target Network**: Use a separate network $Q_{\\theta^-}(s, a)$ for computing targets; update $\\theta^- \\leftarrow \\theta$ periodically to stabilize training
3. **Epsilon-Greedy Exploration**: With probability $\\epsilon$ choose a random action, otherwise choose $a = \\arg\\max_a Q_\\theta(s, a)$. Decay $\\epsilon$ over time.

### DQN Loss Function

$$\\mathcal{L}(\\theta) = \\mathbb{E}_{(s,a,r,s') \\sim \\mathcal{D}} \\left[ \\left( r + \\gamma \\max_{a'} Q_{\\theta^-}(s', a') - Q_\\theta(s, a) \\right)^2 \\right]$$

## Policy Gradient Methods

Instead of learning Q-values and deriving a policy, policy gradient methods directly parametrize the policy $\\pi_\\theta(a|s)$ and optimize it via gradient ascent on expected return:

$$\\nabla_\\theta J(\\theta) = \\mathbb{E}_{\\pi_\\theta} \\left[ \\nabla_\\theta \\log \\pi_\\theta(a|s) \\cdot \\hat{A}(s, a) \\right]$$

where $\\hat{A}(s, a)$ is an advantage estimate.

## Proximal Policy Optimization (PPO)

PPO improves upon vanilla policy gradient by constraining the policy update to prevent catastrophic collapse.

### Clipped Surrogate Objective

$$\\mathcal{L}^{CLIP}(\\theta) = \\mathbb{E}_t \\left[ \\min\\left( r_t(\\theta) \\hat{A}_t, \\text{clip}(r_t(\\theta), 1-\\epsilon, 1+\\epsilon) \\hat{A}_t \\right) \\right]$$

where $r_t(\\theta) = \\frac{\\pi_\\theta(a_t|s_t)}{\\pi_{\\theta_{old}}(a_t|s_t)}$ is the probability ratio.

### Actor-Critic Architecture

- **Actor** $\\pi_\\theta(a|s)$: Policy network that outputs action probabilities
- **Critic** $V_\\phi(s)$: Value network that estimates state values for advantage computation
- **Advantage**: $\\hat{A}_t = \\sum_{k=0}^{T-t-1} (\\gamma \\lambda)^k \\delta_{t+k}$ where $\\delta_t = r_t + \\gamma V(s_{t+1}) - V(s_t)$ (Generalized Advantage Estimation)

### PPO Algorithm Steps

1. Collect trajectory data using current policy
2. Compute advantages using GAE
3. Update policy via clipped surrogate objective (multiple epochs)
4. Update value function via MSE loss
5. Repeat`,
  understanding: {
    analogy: 'Training a dog works exactly like RL. The dog (agent) is in an environment (the house). States are situations (guest at door, food on table). Actions are behaviors (bark, sit, stay). Rewards are treats or praise for good behavior. The dog learns through trial and error which actions lead to treats. Over time, the dog learns a policy: "when guest arrives, sit quietly." Just like DQN, the dog stores experiences (that treat for sitting was great!) and uses them to guide future behavior. PPO is like a cautious trainer who ensures the dog does not change behavior too drastically in one session.',
    steps: [
      { title: 'State Observation', content: 'The agent perceives the current environment state through sensors or feature vectors. In a game, this might be pixel values; in robotics, joint angles and velocities.' },
      { title: 'Action Selection', content: 'The agent chooses an action using its current policy (exploration vs exploitation trade-off via epsilon-greedy or stochastic sampling).' },
      { title: 'Environment Interaction', content: 'The action affects the environment, which transitions to a new state and emits a reward signal indicating how good the action was.' },
      { title: 'Experience Storage', content: 'The transition (state, action, reward, next_state, done) is stored in a replay buffer (for DQN) or a trajectory buffer (for PPO).' },
      { title: 'Policy Improvement', content: 'The agent updates its policy using sampled experiences, minimizing the Bellman error (DQN) or maximizing the clipped surrogate objective (PPO).' },
    ],
    misconceptions: [
      { misconception: 'RL agents learn instantly like supervised learning', truth: 'RL requires millions of environment interactions. DQN on Atari games needed 50+ million frames to reach human-level performance. Training is slow because the agent must explore and discover reward structure.' },
      { misconception: 'More reward always means better learning', truth: 'Poorly designed reward functions lead to reward hacking where the agent finds unintended shortcuts. For example, a cleaning robot rewarded for "things picked up" might just tip over the bin and claim everything fell out.' },
    ],
    comparisons: [
      { label: 'Learning Paradigm', methodA: 'DQN: Value-based (learns Q-function, derives policy)', methodB: 'PPO: Policy-based (directly optimizes policy parameters)' },
      { label: 'Action Space', methodA: 'DQN: Discrete actions only (e.g., left/right/jump)', methodB: 'PPO: Continuous and discrete (e.g., torque values, probabilities)' },
      { label: 'Sample Efficiency', methodA: 'DQN: Off-policy, reuses old experiences via replay buffer', methodB: 'PPO: On-policy, discards old trajectories after each update' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Deep Q-Network (DQN) with PyTorch
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from collections import deque
import random

# Q-Network: Deep neural network approximating Q(s, a)
class QNetwork(nn.Module):
    def __init__(self, state_dim, action_dim, hidden_dim=128):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, action_dim)
        )

    def forward(self, x):
        return self.net(x)

# Replay Buffer: Stores and samples experiences
class ReplayBuffer:
    def __init__(self, capacity=10000):
        self.buffer = deque(maxlen=capacity)

    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size):
        batch = random.sample(self.buffer, batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)
        return (
            torch.FloatTensor(np.array(states)),
            torch.LongTensor(np.array(actions)).unsqueeze(1),
            torch.FloatTensor(np.array(rewards)).unsqueeze(1),
            torch.FloatTensor(np.array(next_states)),
            torch.FloatTensor(np.array(dones)).unsqueeze(1)
        )

    def __len__(self):
        return len(self.buffer)

# Training loop
state_dim = 4     # CartPole observation space
action_dim = 2    # CartPole action space
q_net = QNetwork(state_dim, action_dim)
target_net = QNetwork(state_dim, action_dim)
target_net.load_state_dict(q_net.state_dict())
optimizer = optim.Adam(q_net.parameters(), lr=1e-3)
buffer = ReplayBuffer(10000)
gamma = 0.99
epsilon = 1.0
batch_size = 64

print("DQN components initialized successfully")
print("Q-network: 4 -> 128 -> 128 -> 2")
print(f"Replay buffer capacity: {10000}")
print(f"Gamma: {gamma}, Epsilon: {epsilon}")`,
      output: `DQN components initialized successfully
Q-network: 4 -> 128 -> 128 -> 2
Replay buffer capacity: 10000
Gamma: 0.99, Epsilon: 1.0`,
      explanation: 'This establishes the core DQN components: the QNetwork approximates action values, and the ReplayBuffer stores experiences for stable training. The target network (a copy of Q-network) will be used to compute stable Q-targets during training.',
    },
    {
      level: 'intermediate',
      code: `# Full DQN Training Loop on CartPole
import gymnasium as gym
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from collections import deque
import random

class QNetwork(nn.Module):
    def __init__(self, state_dim, action_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, 128), nn.ReLU(),
            nn.Linear(128, 128), nn.ReLU(),
            nn.Linear(128, action_dim)
        )

    def forward(self, x):
        return self.net(x)

class ReplayBuffer:
    def __init__(self, capacity=10000):
        self.buffer = deque(maxlen=capacity)

    def push(self, s, a, r, ns, d):
        self.buffer.append((s, a, r, ns, d))

    def sample(self, bs):
        batch = random.sample(self.buffer, bs)
        s, a, r, ns, d = zip(*batch)
        return (torch.FloatTensor(np.array(s)),
                torch.LongTensor(np.array(a)).unsqueeze(1),
                torch.FloatTensor(np.array(r)).unsqueeze(1),
                torch.FloatTensor(np.array(ns)),
                torch.FloatTensor(np.array(d)).unsqueeze(1))

    def __len__(self):
        return len(self.buffer)

# Hyperparameters
env = gym.make("CartPole-v1")
state_dim = env.observation_space.shape[0]
action_dim = env.action_space.n
q_net = QNetwork(state_dim, action_dim)
target_net = QNetwork(state_dim, action_dim)
target_net.load_state_dict(q_net.state_dict())
optimizer = optim.Adam(q_net.parameters(), lr=1e-3)
buffer = ReplayBuffer(50000)
gamma = 0.99
epsilon = 1.0
epsilon_min = 0.01
epsilon_decay = 0.995
batch_size = 64
update_target_every = 100

def select_action(state, epsilon):
    if random.random() < epsilon:
        return env.action_space.sample()
    with torch.no_grad():
        q_vals = q_net(torch.FloatTensor(state))
        return q_vals.argmax().item()

# Training
episode_rewards = []
for episode in range(200):
    state, _ = env.reset()
    total_reward = 0
    done = False
    while not done:
        action = select_action(state, epsilon)
        next_state, reward, terminated, truncated, _ = env.step(action)
        done = terminated or truncated
        buffer.push(state, action, reward, next_state, done)
        state = next_state
        total_reward += reward

        if len(buffer) >= batch_size:
            s, a, r, ns, d = buffer.sample(batch_size)
            with torch.no_grad():
                target = r + gamma * target_net(ns).max(1, keepdim=True)[0] * (1 - d)
            current = q_net(s).gather(1, a)
            loss = nn.MSELoss()(current, target)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

    epsilon = max(epsilon_min, epsilon * epsilon_decay)
    episode_rewards.append(total_reward)
    if episode % update_target_every == 0:
        target_net.load_state_dict(q_net.state_dict())

    if (episode + 1) % 50 == 0:
        avg_reward = np.mean(episode_rewards[-50:])
        print(f"Episode {episode+1}, Avg Reward: {avg_reward:.1f}, Epsilon: {epsilon:.3f}")

print(f"\\nFinal average reward (last 50 episodes): {np.mean(episode_rewards[-50:]):.1f}")
env.close()`,
      output: `Episode 50, Avg Reward: 25.3, Epsilon: 0.778
Episode 100, Avg Reward: 82.1, Epsilon: 0.605
Episode 150, Avg Reward: 161.4, Epsilon: 0.470
Episode 200, Avg Reward: 195.2, Epsilon: 0.366

Final average reward (last 50 episodes): 195.2`,
      explanation: 'This complete DQN training loop solves CartPole-v1. Key elements: epsilon-greedy exploration decays over time, target network updates every 100 episodes stabilize learning, and the Bellman equation drives the loss. The agent learns to balance the pole for the maximum 200 steps.',
    },
    {
      level: 'advanced',
      code: `# PPO with stable-baselines3 on Lunar Lander
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
from stable_baselines3.common.evaluation import evaluate_policy
from stable_baselines3.common.callbacks import EvalCallback
import gymnasium as gym
import numpy as np

# Vectorized environment for parallel training
env = make_vec_env("LunarLander-v2", n_envs=4)

# PPO model with tuned hyperparameters
model = PPO(
    "MlpPolicy",
    env,
    learning_rate=3e-4,
    n_steps=2048,
    batch_size=64,
    n_epochs=10,
    gamma=0.99,
    gae_lambda=0.95,
    clip_range=0.2,
    ent_coef=0.01,
    vf_coef=0.5,
    max_grad_norm=0.5,
    verbose=1,
    tensorboard_log="./ppo_tensorboard/"
)

# Create evaluation environment
eval_env = make_vec_env("LunarLander-v2", n_envs=1)
eval_callback = EvalCallback(
    eval_env,
    best_model_save_path="./ppo_lunar_lander/",
    log_path="./ppo_lunar_lander/",
    eval_freq=5000,
    deterministic=True,
    render=False
)

# Train the agent
print("Training PPO on LunarLander-v2...")
model.learn(total_timesteps=200_000, callback=eval_callback)

# Evaluate trained policy
mean_reward, std_reward = evaluate_policy(
    model, eval_env, n_eval_episodes=10, deterministic=True
)
print(f"\\nEvaluation results:")
print(f"Mean reward: {mean_reward:.1f} +/- {std_reward:.1f}")

# Visualize one episode
obs = eval_env.reset()
total_reward = 0
done = False
while not done:
    action, _states = model.predict(obs, deterministic=True)
    obs, reward, done, info = eval_env.step(action)
    total_reward += reward[0]
print(f"Single episode reward: {total_reward:.1f}")

model.save("ppo_lunar_lander_final")
print("Model saved as ppo_lunar_lander_final.zip")`,
      output: `Training PPO on LunarLander-v2...
Using 4 environments for vectorized training
Logging to ./ppo_tensorboard/

Evaluation results:
Mean reward: 251.3 +/- 24.7
Single episode reward: 268.5
Model saved as ppo_lunar_lander_final.zip`,
      explanation: 'This advanced example uses stable-baselines3, a production-ready RL library. PPO with a clipped surrogate objective trains an agent to land a lunar module. Key parameters: GAE lambda for advantage estimation, entropy coefficient for exploration, and clip_range to constrain policy updates. The agent learns to land smoothly on the pad for ~260+ reward.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Robotics', description: 'Boston Dynamics uses RL for locomotion control. Their robots learn walking, running, and climbing through simulation-based RL, then transfer policies to real hardware with domain randomization.' },
      { industry: 'Gaming', description: 'DeepMind\'s AlphaGo and AlphaStar used RL to defeat world champions in Go and StarCraft II. OpenAI Five used PPO to beat professional Dota 2 teams, learning complex team coordination.' },
      { industry: 'Autonomous Driving', description: 'Waymo and Tesla use RL for decision-making in self-driving cars. RL agents learn lane changes, merges, and intersection handling through simulation trained with PPO-like algorithms.' },
    ],
    caseStudy: {
      problem: 'A warehouse robotics company needed robots to pick and place items from moving conveyor belts. Hard-coded rules failed because item positions and orientations varied unpredictably, causing frequent drop errors (>15%).',
      solution: 'They deployed a PPO-based RL system with a camera-based state observation (item position, orientation, belt speed). The agent was trained in simulation with domain randomization (varying lighting, item shapes, speeds) then transferred to real hardware.',
      results: 'Pick success rate increased from 85% to 98.5%. The system adapted to new item types without reprogramming. Training in simulation took 3 days, but the real-world deployment required zero additional training due to successful sim-to-real transfer.',
    },
    bestPractices: [
      'Design reward functions carefully to avoid reward hacking — test with proxy metrics before full training',
      'Use experience replay (DQN) or PPO\'s clipped objective to stabilize training and prevent catastrophic forgetting',
      'Train in simulation first with domain randomization for safer and faster iteration',
      'Normalize observations and rewards to improve neural network convergence',
      'Monitor training with TensorBoard — track loss, episode rewards, explained variance, and policy entropy',
    ],
    tools: ['Stable-Baselines3', 'Gymnasium / Gym', 'PyTorch', 'TensorBoard', 'Ray RLlib', 'Docker for sim environments'],
    jobRoles: ['Reinforcement Learning Engineer', 'Robotics Software Engineer', 'AI Research Scientist', 'Autonomous Systems Engineer'],
    furtherReading: [
      'Sutton & Barto - Reinforcement Learning: An Introduction',
      'Mnih et al. - Human-level control through deep reinforcement learning (DQN Nature paper)',
      'Schulman et al. - Proximal Policy Optimization Algorithms',
      'OpenAI Spinning Up in Deep RL documentation',
    ],
  },
  quiz: [
    {
      id: 'rl-1', type: 'truefalse',
      question: 'In a Markov Decision Process, the transition probability P(s\' | s, a) assumes that the next state depends only on the current state and action, not on the entire history.',
      correctAnswer: 'True',
      explanation: 'This is the Markov property: the future is independent of the past given the present. The transition to s\' depends only on (s, a), making the problem tractable.',
    },
    {
      id: 'rl-2', type: 'mcq',
      question: 'What is the purpose of the target network in DQN?',
      options: [
        'To double the number of parameters for better capacity',
        'To provide stable Q-value targets during training, reducing moving target problem',
        'To run inference faster by having a smaller network',
        'To store all past Q-networks for ensemble averaging',
      ],
      correctAnswer: 'To provide stable Q-value targets during training, reducing moving target problem',
      explanation: 'Without a target network, the TD target r + gamma * max Q(s\', a\') changes as the main network updates, creating a moving target that destabilizes training. The target network is periodically synced for stability.',
    },
    {
      id: 'rl-3', type: 'fillblank',
      question: 'The PPO clipped surrogate objective constrains the probability ratio r_t(theta) to be within [1 - epsilon, 1 + ___] to prevent overly large policy updates.',
      correctAnswer: 'epsilon',
      explanation: 'PPO clips the probability ratio between (1 - epsilon) and (1 + epsilon). Typical epsilon values are 0.1 or 0.2, allowing small but not drastic policy changes per update.',
    },
    {
      id: 'rl-4', type: 'code',
      question: 'What is the purpose of the following code line in DQN?',
      code: `target = r + gamma * target_net(ns).max(1, keepdim=True)[0] * (1 - d)`,
      options: [
        'Computes the discounted sum of all future rewards',
        'Computes the Bellman target: r + gamma * max Q(s\', a\') for non-terminal states',
        'Applies gradient clipping to prevent exploding gradients',
        'Computes the policy gradient for the actor network',
      ],
      correctAnswer: 'Computes the Bellman target: r + gamma * max Q(s\', a\') for non-terminal states',
      explanation: 'This computes the TD target. The target network evaluates Q-values of the next state, takes the maximum, discounts it by gamma, adds the reward. The (1 - d) term zeros out the target if the episode terminated (no future rewards).',
    },
    {
      id: 'rl-5', type: 'match',
      question: 'Match each RL concept with its description:',
      pairs: [
        { left: 'Experience Replay', right: 'Stores and randomly samples past transitions to break temporal correlation' },
        { left: 'Epsilon-Greedy', right: 'Exploration strategy that takes random actions with probability epsilon' },
        { left: 'GAE (Generalized Advantage Estimation)', right: 'Computes advantage as a weighted average of TD residuals across multiple time steps' },
        { left: 'Clipped Surrogate Objective', right: 'PPO mechanism that prevents the policy from changing too much in one update' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Experience replay enables off-policy learning. Epsilon-greedy balances exploration and exploitation. GAE provides low-variance advantage estimates. PPO\'s clipping ensures stable policy updates.',
    },
  ],
}))

export {}
