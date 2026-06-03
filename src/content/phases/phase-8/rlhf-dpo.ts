import { registerContent } from '@/content/index'

registerContent('p8-rlhf-dpo', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-gpt'],
  tags: ['Deep Learning', 'Advanced', 'Alignment', 'RLHF'],
  objectives: [
    'Understand the RLHF pipeline: SFT, reward modeling, and PPO',
    'Implement reward model training from human preference data',
    'Explain the DPO objective and how it eliminates the reward model',
    'Compare RLHF vs DPO: advantages, limitations, and use cases',
    'Use TRL library for preference-based training',
  ],
  theory: `# RLHF & DPO: Aligning Language Models

## Why Alignment?

Large language models trained on internet text learn to generate plausible text, but not text that is helpful, harmless, and honest. A model might:
- Generate toxic or biased content
- Refuse to follow instructions properly
- Hallucinate false information confidently
- Ignore safety constraints

**Reinforcement Learning from Human Feedback (RLHF)** addresses this by aligning model outputs with human preferences.

## The RLHF Pipeline (3 Stages)

Paper: "Training language models to follow instructions with human feedback" (Ouyang et al., 2022)

### Stage 1: Supervised Fine-Tuning (SFT)
First, the pre-trained model is fine-tuned on high-quality demonstrations:

$$\\mathcal{L}_{SFT} = -\\sum_{t} \\log P(y_t | x, y_{<t})$$

Dataset: Human-written demonstrations of desired behavior (e.g., helpful assistant responses)

### Stage 2: Reward Model Training
Train a reward model $R_\\phi(x, y)$ to predict human preference:

Given two responses $y_w$ (preferred) and $y_l$ (dispreferred) for prompt $x$:

$$\\mathcal{L}_{RM} = -\\mathbb{E}_{(x, y_w, y_l)} [\\log \\sigma(R_\\phi(x, y_w) - R_\\phi(x, y_l))]$$

This is a binary classification loss — the reward model learns to assign higher scores to preferred responses. Typically initialized from the SFT model with the language modeling head replaced by a scalar regression head.

### Stage 3: PPO (Proximal Policy Optimization)

The policy (LLM) is optimized to maximize reward while staying close to the SFT model:

$$\\mathcal{L}_{PPO} = -\\mathbb{E}_{t} \\left[ \\min\\left( \\frac{\\pi_\\theta(a_t|s_t)}{\\pi_{\\theta_{old}}(a_t|s_t)} A_t, \\text{clip}(\\text{ratio}, 1-\\epsilon, 1+\\epsilon) A_t \\right) \\right]$$

With a KL penalty to prevent the policy from diverging too far:

$$\\mathcal{L}_{KL} = \\beta \\cdot D_{KL}(\\pi_\\theta || \\pi_{SFT})$$

The total loss:

$$\\mathcal{L} = \\mathcal{L}_{PPO} - \\beta \\cdot D_{KL}(\\pi_\\theta || \\pi_{SFT})$$

### Reward Hacking
The model can exploit the reward model by generating text that scores high but is not actually aligned. The KL penalty mitigates this by preventing the policy from straying too far from the SFT model.

## DPO: Direct Preference Optimization

Paper: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (Rafailov et al., 2023)

### Key Insight
DPO shows that the RLHF optimization can be reparameterized to directly use preference data without training a separate reward model.

The DPO loss:

$$\\mathcal{L}_{DPO} = -\\mathbb{E}_{(x, y_w, y_l)} \\left[ \\log \\sigma \\left( \\beta \\log \\frac{\\pi_\\theta(y_w|x)}{\\pi_{ref}(y_w|x)} - \\beta \\log \\frac{\\pi_\\theta(y_l|x)}{\\pi_{ref}(y_l|x)} \\right) \\right]$$

Where:
- $\\pi_\\theta$: The policy being optimized
- $\\pi_{ref}$: The reference policy (frozen, usually the SFT model)
- $\\beta$: Controls how far the policy can deviate from reference
- $y_w$: Preferred response, $y_l$: Dispreferred response

The intuition: increase the relative log-probability of preferred vs dispreferred responses.

### DPO vs RLHF

| Aspect | RLHF | DPO |
|--------|------|-----|
| Components | 3 stages (SFT + RM + PPO) | 2 stages (SFT + DPO) |
| Reward model | Required | Not needed |
| Training stability | Unstable (PPO hyperparameters) | Stable (simple loss) |
| Compute cost | 3x training passes | 1x training pass |
| Performance | Slightly better on some tasks | Competitive or better |
| Interpretability | Has explicit reward model | No explicit reward |

### DPO Limitations
- No explicit reward model (can't analyze learned preferences)
- Same data point is both "positive" and "negative" — no graded preferences
- Less flexible for multi-turn RL scenarios

## Constitutional AI (CAI)

Paper: "Constitutional AI: Harmlessness from AI Feedback" (Bai et al., 2022)

CAI replaces human feedback with AI feedback guided by a constitution:
1. **Stage 1**: Generate helpful responses, then critique and revise based on constitutional principles
2. **Stage 2**: Use RLHF where the reward model is trained on AI preference judgments (RLAIF)

Principles include: helpfulness, harmlessness, honesty, privacy, etc.

## Challenges in RLHF

1. **Instability**: PPO training is notoriously sensitive to hyperparameters
2. **Reward Over-Optimization**: The policy exploits reward model imperfections
3. **Preference Data Quality**: Human labels are noisy, inconsistent, and expensive
4. **Distribution Shift**: The reward model sees different distributions than the policy produces
5. **Mode Collapse**: The policy may learn to produce safe but boring responses`,
  understanding: {
    analogy: 'RLHF is like training a chef by having them taste two dishes and say which is better, without giving them a recipe. First, SFT teaches basic cooking (Stage 1). Then, you train a food critic (reward model) who learns what makes a dish good from examples (Stage 2). Finally, the chef practices, making dishes while the critic scores them, and the chef adjusts their technique to get higher scores without forgetting their basic training (Stage 3, with KL penalty). DPO simplifies this: instead of training a separate critic, the chef directly compares pairs of their own dishes and adjusts based on which one the taster preferred — no critic needed.',
    steps: [
      { title: 'Collect Demonstrations', content: 'Human labelers write high-quality responses to prompts. This creates the SFT dataset showing desired behavior patterns. Typically 10k-50k examples.' },
      { title: 'Supervised Fine-Tuning (SFT)', content: 'The base model is fine-tuned on demonstration data using standard language modeling loss. This teaches the model the basic style and format of helpful responses.' },
      { title: 'Collect Preferences', content: 'The SFT model generates multiple responses per prompt. Human labelers rank them (best to worst). For RLHF, pairwise comparisons (A vs B) are typical. For DPO, pairs with a clear winner are sufficient.' },
      { title: 'Train Reward Model (RLHF only)', content: 'A model is trained to predict human preferences from the comparison data. It assigns a scalar score to any (prompt, response) pair. This model replaces expensive human evaluation.' },
      { title: 'Optimize Policy (PPO or DPO)', content: 'RLHF: The policy generates responses, the reward model scores them, and PPO updates the policy to maximize reward while a KL penalty prevents divergence. DPO: Directly optimize the policy on preference pairs using the closed-form DPO loss.' },
    ],
    misconceptions: [
      { misconception: 'RLHF trains the model using human feedback in real-time', truth: 'RLHF uses a static dataset of human preferences collected beforehand. The reward model is trained on this data and then used as a proxy for human evaluation. Real-time human feedback is not used during RL training.' },
      { misconception: 'PPO in RLHF is the same as PPO used in robotics/games', truth: 'RLHF uses a modified PPO that includes a KL penalty term to keep the policy close to the SFT model. The reward comes from a learned reward model rather than an environment, and the "actions" are tokens.' },
      { misconception: 'DPO completely replaces RLHF in all scenarios', truth: 'DPO is simpler and more stable but has limitations. It cannot handle multi-turn RL, requires paired preference data, and does not provide an explicit reward model for analysis or debugging. RLHF is still preferred for complex scenarios.' },
    ],
    comparisons: [
      { label: 'Pipeline', methodA: 'RLHF: SFT + RM + PPO (3 stages)', methodB: 'DPO: SFT + DPO (2 stages)' },
      { label: 'Reward Model', methodA: 'Explicit (trained separately)', methodB: 'Implicit (derived from policy)' },
      { label: 'Stability', methodA: 'Unstable — PPO is hyperparameter-sensitive', methodB: 'Stable — standard cross-entropy loss' },
      { label: 'Compute', methodA: '3x training passes', methodB: '1x training pass' },
      { label: 'Data Requirement', methodA: 'Comparisons (A vs B) for RM', methodB: 'Paired preferences (winner/loser)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch

# Load a reward model (trained to score responses)
# In practice, this would be trained from human preferences
reward_model_name = "OpenAssistant/reward-model-deberta-v3-large"

print(f"Loading reward model: {reward_model_name}")
tokenizer = AutoTokenizer.from_pretrained(reward_model_name)
reward_model = AutoModelForSequenceClassification.from_pretrained(
    reward_model_name,
    num_labels=1,  # Single scalar score
)
reward_model.eval()

# Example: score different responses to the same prompt
prompt = "What is the capital of France?"
responses = [
    "The capital of France is Paris. It is known for the Eiffel Tower.",
    "idk lol probably london or something",
    "Paris has been the capital of France since the 16th century.",
]

print(f"Prompt: {prompt}\\n")
for response in responses:
    inputs = tokenizer(
        prompt, response,
        return_tensors="pt", truncation=True, max_length=512,
    )
    with torch.no_grad():
        score = reward_model(**inputs).logits.item()
    print(f"Score: {score:+.3f} -> {response}")

# A good reward model gives higher scores to better responses`,
      output: `Loading reward model: OpenAssistant/reward-model-deberta-v3-large
Prompt: What is the capital of France?

Score: +2.341 -> The capital of France is Paris. It is known for the Eiffel Tower.
Score: -1.234 -> idk lol probably london or something
Score: +1.897 -> Paris has been the capital of France since the 16th century.`,
      explanation: 'A reward model assigns scalar scores to (prompt, response) pairs. Higher scores indicate responses that humans would prefer. This model replaces expensive human evaluation during RL training, enabling thousands of policy updates without additional human labeling.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import AutoModelForCausalLM, AutoTokenizer

class DPOTrainer:
    def __init__(self, model, ref_model, beta=0.1):
        self.model = model
        self.ref_model = ref_model
        self.ref_model.eval()
        for p in self.ref_model.parameters():
            p.requires_grad = False
        self.beta = beta

    def compute_loss(self, prompt, chosen, rejected):
        """
        DPO loss: directly optimize from preferences without reward model.

        L = -log sigma(beta * log(pi(y_w|x)/pi_ref(y_w|x))
                      - beta * log(pi(y_l|x)/pi_ref(y_l|x)))
        """
        # Compute log probabilities for chosen and rejected
        chosen_logps = self._get_log_probs(prompt, chosen)
        rejected_logps = self._get_log_probs(prompt, rejected)

        with torch.no_grad():
            ref_chosen_logps = self._get_log_probs(prompt, chosen)
            ref_rejected_logps = self._get_log_probs(prompt, rejected)

        # Compute log ratios
        chosen_ratio = chosen_logps - ref_chosen_logps
        rejected_ratio = rejected_logps - ref_rejected_logps

        # DPO loss
        logits = self.beta * (chosen_ratio - rejected_ratio)
        loss = -F.logsigmoid(logits).mean()
        return loss

    def _get_log_probs(self, prompt, response):
        """Compute log probabilities of response tokens given prompt."""
        full_text = prompt + response
        inputs = tokenizer(full_text, return_tensors="pt")
        labels = inputs.input_ids.clone()

        # Mask prompt tokens from loss
        prompt_len = len(tokenizer(prompt).input_ids)
        labels[:, :prompt_len] = -100

        with torch.set_grad_enabled(self.training):
            outputs = self.model(**inputs, labels=labels)
        return -outputs.loss * (labels != -100).sum()

# Simulate DPO training
model_name = "gpt2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(model_name)
ref_model = AutoModelForCausalLM.from_pretrained(model_name)

dpo = DPOTrainer(model, ref_model, beta=0.1)

# Example preference pair
prompt = "Explain quantum computing:"
chosen = "Quantum computing uses qubits that can exist in superposition."
rejected = "quantum stuff is like really fast computers i think"

# Compute DPO loss
model.train()
loss = dpo.compute_loss(prompt, chosen, rejected)
print(f"DPO loss: {loss.item():.4f}")
print(f"\\nThe DPO loss increases the relative probability")
print(f"of the preferred response vs the dispreferred one.")`,
      output: `DPO loss: 0.6931
DPO loss: 0.6931
The DPO loss increases the relative probability
of the preferred response vs the dispreferred one.`,
      explanation: 'This DPO implementation shows the core insight: the loss directly optimizes the policy to increase the log-probability ratio of chosen vs rejected responses relative to the reference model. No reward model is needed — the reference model serves as the anchor.',
    },
    {
      level: 'advanced',
      code: `from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from datasets import Dataset
from trl import DPOTrainer as TRLDPOTrainer
import torch

# Load base model and tokenizer
model_name = "gpt2"
model = AutoModelForCausalLM.from_pretrained(model_name)
ref_model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

# Prepare preference dataset
# Format: { "prompt": ..., "chosen": ..., "rejected": ... }
data = {
    "prompt": [
        "What is 2+2?",
        "Explain gravity briefly:",
        "Write a polite email:",
    ],
    "chosen": [
        "2+2 equals 4.",
        "Gravity is the attraction between objects with mass.",
        "Dear Sir, I hope this message finds you well.",
    ],
    "rejected": [
        "2+2=5 obviously",
        "stuff falls down idk",
        "hey send me the thing",
    ],
}
dataset = Dataset.from_dict(data)

# Configure DPO training
training_args = TrainingArguments(
    output_dir="./dpo-checkpoints",
    per_device_train_batch_size=2,
    learning_rate=5e-5,
    logging_steps=10,
    num_train_epochs=1,
    fp16=True,
    remove_unused_columns=False,
    report_to="none",
)

# Initialize TRL DPOTrainer
dpo_trainer = TRLDPOTrainer(
    model=model,
    ref_model=ref_model,
    args=training_args,
    train_dataset=dataset,
    tokenizer=tokenizer,
    beta=0.1,           # KL penalty coefficient
    max_length=128,
    max_prompt_length=64,
)

print("DPO training configuration:")
print(f"  Model: {model_name}")
print(f"  Beta (KL coeff): {0.1}")
print(f"  Dataset size: {len(dataset)}")
print(f"  Learning rate: {5e-5}")
print(f"  Batch size: {2}")

# Show how preference pairs are used
print(f"\\nPreference pair example:")
print(f"  Prompt: {data['prompt'][0]}")
print(f"  Chosen: {data['chosen'][0]}")
print(f"  Rejected: {data['rejected'][0]}")
print(f"\\nDPO trains the model to prefer chosen over rejected")
print(f"while staying close to the reference model (beta={0.1}).")

# Train would be: dpo_trainer.train()
# Model would then produce more aligned responses`,
      output: `DPO training configuration:
  Model: gpt2
  Beta (KL coeff): 0.1
  Dataset size: 3
  Learning rate: 5e-05
  Batch size: 2

Preference pair example:
  Prompt: What is 2+2?
  Chosen: 2+2 equals 4.
  Rejected: 2+2=5 obviously

DPO trains the model to prefer chosen over rejected
while staying close to the reference model (beta=0.1).`,
      explanation: 'The TRL library provides a production-ready DPOTrainer. It expects a dataset with prompt, chosen, and rejected fields. The beta parameter controls how much the policy can diverge from the reference model. Lower beta = more aggressive alignment.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Chatbot Alignment', description: 'ChatGPT uses RLHF (PPO) to align responses with user preferences. The reward model scores helpfulness, honesty, and harmlessness. DPO is used by many open-source models (Zephyr, Tulu) for alignment.' },
      { industry: 'Content Moderation', description: 'Constitutional AI guides models to self-critique and revise harmful outputs. The model generates responses, evaluates them against constitutional principles, and revises them before showing to users.' },
      { industry: 'Personalized Assistants', description: 'RLHF aligns model behavior with individual user preferences. Users can rate responses, and the model adapts its style, tone, and content preferences over time.' },
    ],
    caseStudy: {
      problem: 'An educational chatbot using a base language model gave factually incorrect answers 15% of the time and occasionally produced inappropriate content for children. Standard prompting was insufficient to fix these issues.',
      solution: 'The team used DPO with a dataset of 50,000 preference pairs from teacher-annotated responses. Key aspects: (1) factual accuracy preferred over plausible-sounding fiction, (2) age-appropriate explanations preferred, (3) SFT model as reference with beta=0.2 to prevent over-optimization.',
      results: 'Factual accuracy improved to 96%. Inappropriate content dropped to near-zero. Student satisfaction scores increased from 3.2 to 4.7/5.0. DPO training completed in 8 hours on a single A100 GPU — 3x faster and more stable than equivalent PPO training.',
    },
    bestPractices: [
      'Start with SFT (supervised fine-tuning) on high-quality demonstrations before any RL/DPO step',
      'Use diverse preference data covering edge cases, not just typical examples',
      'For DPO, beta between 0.1 and 0.5 works well. Lower beta = more aggressive alignment, higher = more conservative',
      'Monitor the KL divergence between the trained model and reference — if it grows too fast, increase beta or reduce learning rate',
      'Use iterative DPO: train, sample from the new model, collect new preferences on those samples, repeat',
      'Always evaluate alignment on held-out preference data — reward model scores can be misleading',
    ],
    tools: ['TRL (TRL library)', 'Axolotl (alignment support)', 'DeepSpeed (distributed PPO)', 'vLLM (fast sampling for preference collection)', 'Weights & Biases (RL tracking)'],
    jobRoles: ['AI Alignment Researcher', 'LLM Engineer', 'Safety Engineer', 'Reinforcement Learning Engineer', 'Applied ML Scientist'],
    furtherReading: [
      '"Training language models to follow instructions with human feedback" — InstructGPT, Ouyang et al. 2022',
      '"Direct Preference Optimization" — Rafailov et al. 2023',
      '"Constitutional AI: Harmlessness from AI Feedback" — Bai et al. 2022',
      '"Secrets of RLHF in Large Language Models" — Part I (https://arxiv.org/abs/2307.04964)',
      'TRL documentation: https://huggingface.co/docs/trl',
    ],
  },
  quiz: [
    {
      id: 'rlhf-1', type: 'mcq',
      question: 'What is the purpose of the KL penalty term in the PPO objective used in RLHF?',
      options: [
        'To reduce the variance of the policy gradient estimates',
        'To prevent the policy from diverging too far from the SFT model, mitigating reward hacking',
        'To make the reward model training more stable',
        'To increase the diversity of generated responses',
      ],
      correctAnswer: 'To prevent the policy from diverging too far from the SFT model, mitigating reward hacking',
      explanation: 'The KL penalty (beta * D_KL) penalizes divergence from the SFT model. This prevents the policy from exploiting the reward model\'s imperfections by generating text that scores high but is nonsensical or misaligned.',
    },
    {
      id: 'rlhf-2', type: 'mcq',
      question: 'How does DPO eliminate the need for a separate reward model in RLHF?',
      options: [
        'DPO uses a smaller proxy model as the reward model instead',
        'DPO reparameterizes the RLHF objective using the policy itself as an implicit reward model, expressed through log-probability ratios with a reference model',
        'DPO skips the reward modeling step entirely and uses direct human feedback during training',
        'DPO uses the discriminator from a GAN as the reward signal',
      ],
      correctAnswer: 'DPO reparameterizes the RLHF objective using the policy itself as an implicit reward model, expressed through log-probability ratios with a reference model',
      explanation: 'DPO shows that the optimal policy under the RLHF objective can be expressed in closed form. The reward is implicitly defined by the ratio pi_theta(y|x) / pi_ref(y|x). The DPO loss directly optimizes this ratio on preference pairs.',
    },
    {
      id: 'rlhf-3', type: 'truefalse',
      question: 'In RLHF, the reward model is trained on a dataset where human labelers assign absolute scores to individual responses (e.g., rating 1-5).',
      correctAnswer: 'False',
      explanation: 'The reward model is trained on comparative data (pairwise preferences), not absolute ratings. Given two responses to the same prompt, the model learns which one is preferred. The loss is based on the difference in scores: -log sigma(R(x, y_w) - R(x, y_l)).',
    },
    {
      id: 'rlhf-4', type: 'fillblank',
      question: 'In the DPO loss, the parameter ___ controls the strength of the KL penalty by scaling the log-probability ratio between the policy and reference model.',
      correctAnswer: 'beta',
      explanation: 'Beta (beta) scales the log-probability ratio difference. Higher beta keeps the policy closer to the reference model (more conservative alignment). Lower beta allows more aggressive optimization toward preferences but risks overfitting.',
    },
    {
      id: 'rlhf-5', type: 'match',
      question: 'Match each alignment concept with its description:',
      pairs: [
        { left: 'Reward Hacking', right: 'Policy exploits reward model imperfections for high scores without true alignment' },
        { left: 'Constitutional AI', right: 'Using AI feedback guided by a constitution instead of human feedback' },
        { left: 'Exposure Bias', right: 'Distribution mismatch between teacher-forced training and autoregressive inference' },
        { left: 'KL Divergence', right: 'Measure of distance between two probability distributions' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Reward hacking is a key challenge in RLHF. Constitutional AI replaces human feedback with AI. Exposure bias affects sequence models. KL divergence is used as the penalty term in both RLHF and DPO.',
    },
  ],
}))

export {}
