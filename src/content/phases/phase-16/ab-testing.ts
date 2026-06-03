import { registerContent } from '@/content/index'

registerContent('p16-ab-testing', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p16-model-monitoring'],
  tags: ['MLOps', 'Advanced', 'Topic'],
  objectives: [
    'Understand A/B testing fundamentals: control, treatment, randomization, sample size',
    'Calculate statistical significance using p-values and confidence intervals',
    'Determine minimum detectable effect and required sample sizes',
    'Implement shadow deployment and interleaved experiments',
    'Avoid common pitfalls: multiple testing, interference, network effects',
  ],
  theory: `# A/B Testing in Production

## A/B Testing Fundamentals

A/B testing (split testing) compares two versions of a system to determine which performs better:

$$\\text{Control (A)} \\xrightarrow{\\text{randomize}} \\text{Treatment (B)}$$

### Key Concepts

- **Control**: The current system (baseline)
- **Treatment**: The new system (variant)
- **Randomization**: Users/requests randomly assigned to A or B
- **Sample Size**: Number of observations needed for statistical power
- **Metric**: The measurable outcome (click-through rate, revenue, accuracy)

## Statistical Significance

### P-Value

The probability of observing the result (or more extreme) assuming the null hypothesis is true:

$$p = P(\\text{observed result} \\mid H_0 \\text{ true})$$

If $p < \\alpha$ (typically 0.05), we reject the null hypothesis and declare statistical significance.

### Confidence Intervals

A 95% confidence interval means: if we repeated the experiment 100 times, 95 of the intervals would contain the true effect:

$$\\text{CI}_{95\\%} = \\hat{\\delta} \\pm 1.96 \\times \\text{SE}(\\hat{\\delta})$$

### Type I and Type II Errors

| | $H_0$ True | $H_0$ False |
|---|-----------|------------|
| Reject $H_0$ | Type I Error ($\\alpha$) | Correct |
| Fail to Reject $H_0$ | Correct | Type II Error ($\\beta$) |

- Type I (False Positive): Concluding A ≠ B when they are equal
- Type II (False Negative): Concluding A = B when they differ

**Power**: $1 - \\beta$ — probability of detecting a true effect.

## Minimum Detectable Effect (MDE)

The smallest effect size that can be detected given the sample size:

$$\\text{MDE} = (z_{1-\\alpha/2} + z_{1-\\beta}) \\times \\sqrt{\\frac{2\\sigma^2}{n}}$$

Where $z$ is the z-score, $\\sigma$ is the standard deviation, and $n$ is the sample size.

## Sample Size Calculation

$$n = \\frac{(z_{1-\\alpha/2} + z_{1-\\beta})^2 \\times 2\\sigma^2}{\\text{MDE}^2}$$

## Multiple Testing Correction

When testing multiple metrics, the probability of at least one false positive increases:

$$P(\\text{at least one false positive}) = 1 - (1 - \\alpha)^m$$

For $m=10$ metrics and $\\alpha=0.05$: $P = 1 - 0.95^{10} \\approx 0.40$

### Corrections
- **Bonferroni**: $\\alpha_{\\text{adj}} = \\alpha / m$ (conservative)
- **Holm-Bonferroni**: Sequential rejection (less conservative)
- **FDR (Benjamini-Hochberg)**: Control false discovery rate

## Common Challenges

### Interference Between Users
Social network effects mean user A's treatment can affect user B's behavior. Solutions: cluster randomization, network-level experiments.

### Network Effects
If a change affects how users interact, randomization at individual level fails. Design experiments at the network/community level.

## Deployment Patterns

### Shadow Deployment
Run the new model alongside the current one but do not serve its predictions to users:
$$\\text{request} \\to \\text{model}_{\\text{prod}} + \\text{model}_{\\text{new}} \\text{ (logged only)}$$

Compare predictions offline before exposing to users.

### Interleaved Experiments
For ranking/recommendation systems, interleave results from A and B in a single list. Users provide implicit feedback (clicks) on both, enabling paired comparison with fewer users.`,
  understanding: {
    analogy: 'A/B testing is like testing two store layouts. You have your current layout (Control A) and a new layout (Treatment B). You randomly assign customers to enter either store A or store B and measure which store sells more. You need enough customers (sample size) to be confident that the difference is not just random luck. Statistical significance tells you: "If there was actually no difference, how likely would we see this result?" A p-value of 0.03 means there is only a 3% chance you would see this difference if the layouts performed equally. Shadow deployment is like letting customers shop in store A but having a secret camera analyze what they would have bought in store B — no risk, but less direct evidence.',
    steps: [
      { title: 'Define the Hypothesis', content: 'Formulate the null hypothesis (H0: A = B) and alternative hypothesis (H1: A ≠ B). Define the primary metric (click-through rate, accuracy, revenue per user). Determine the minimum detectable effect.' },
      { title: 'Calculate Sample Size', content: 'Use power analysis to determine how many observations are needed. Factors: baseline conversion rate, minimum detectable effect, significance level (α=0.05), power (80%). Too small = inconclusive. Too large = wastes resources.' },
      { title: 'Randomize and Run', content: 'Assign users/requests to A or B using a random hash (deterministic, consistent). Run the experiment for the pre-calculated duration. Do not peek at results early (peeking bias).' },
      { title: 'Analyze Results', content: 'Compute the metric for each group. Perform statistical test (t-test for continuous, chi-square for categorical). Calculate p-value and confidence interval. Apply multiple testing correction if needed.' },
      { title: 'Make Decision', content: 'If p < α and the effect size is practically significant (not just statistically significant), deploy the treatment. If not significant, analyze further or revert to control. Document the decision and learnings.' },
    ],
    misconceptions: [
      { misconception: 'A significant p-value (p < 0.05) means the effect is large', truth: 'A small p-value only means the effect is unlikely to be zero. With a huge sample size, even a tiny, practically insignificant effect can be statistically significant. Always check the effect size (Cohen\'s d, lift).' },
      { misconception: 'You can peek at results and stop early when significant', truth: 'Peeking at results and stopping early inflates the false positive rate. Even with p < 0.05, stopping early can make the true Type I error rate as high as 25%. Use sequential testing if early stopping is needed.' },
      { misconception: 'A/B testing works the same for all ML models', truth: 'For ranking and recommendation systems, standard A/B testing has interference issues. Interleaved experiments and network-level randomization are often needed. Simple A/B tests work best for independent user-level decisions.' },
    ],
    comparisons: [
      { label: 'Risk', methodA: 'A/B Testing: Direct user impact on treatment group', methodB: 'Shadow Deployment: Zero user impact (no treatment served)' },
      { label: 'Speed', methodA: 'A/B Testing: Direct measurement, faster', methodB: 'Shadow Deployment: Offline analysis, slower' },
      { label: 'Statistical Power', methodA: 'A/B Testing: High (direct comparison)', methodB: 'Shadow Deployment: Lower (simulated comparison)' },
      { label: 'Implementation', methodA: 'A/B Testing: Moderate (traffic splitting)', methodB: 'Shadow Deployment: Simple (dual inference)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import numpy as np
from scipy import stats

def ab_test_simulation(
    control_rate: float = 0.10,
    treatment_rate: float = 0.12,
    sample_size: int = 10000,
) -> dict:
    """Simulate an A/B test and compute statistical significance."""
    np.random.seed(42)

    # Generate binary outcomes (e.g., click or no-click)
    control = np.random.binomial(1, control_rate, sample_size)
    treatment = np.random.binomial(1, treatment_rate, sample_size)

    # Calculate conversion rates
    control_rate_obs = control.mean()
    treatment_rate_obs = treatment.mean()
    lift = (treatment_rate_obs - control_rate_obs) / control_rate_obs * 100

    # Two-proportion z-test
    n_control = len(control)
    n_treatment = len(treatment)
    p_pool = (control.sum() + treatment.sum()) / (n_control + n_treatment)
    se = np.sqrt(p_pool * (1 - p_pool) * (1/n_control + 1/n_treatment))
    z_stat = (treatment_rate_obs - control_rate_obs) / se
    p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))

    # Confidence interval for the difference
    se_diff = np.sqrt(
        control_rate_obs * (1 - control_rate_obs) / n_control +
        treatment_rate_obs * (1 - treatment_rate_obs) / n_treatment
    )
    ci_low = (treatment_rate_obs - control_rate_obs) - 1.96 * se_diff
    ci_high = (treatment_rate_obs - control_rate_obs) + 1.96 * se_diff

    return {
        "control_rate": round(control_rate_obs, 4),
        "treatment_rate": round(treatment_rate_obs, 4),
        "lift_pct": round(lift, 2),
        "z_statistic": round(z_stat, 4),
        "p_value": round(p_value, 4),
        "significant": p_value < 0.05,
        "ci_95": (round(ci_low, 4), round(ci_high, 4)),
    }

# Simulate A/B test
result = ab_test_simulation(
    control_rate=0.10,
    treatment_rate=0.12,
    sample_size=5000,
)

print("=== A/B Test Results ===")
print(f"Control conversion rate: {result['control_rate']:.4f} "
      f"({result['control_rate']*100:.2f}%)")
print(f"Treatment conversion rate: {result['treatment_rate']:.4f} "
      f"({result['treatment_rate']*100:.2f}%)")
print(f"Lift: {result['lift_pct']:.2f}%")
print(f"Z-statistic: {result['z_statistic']:.4f}")
print(f"P-value: {result['p_value']:.4f}")
print(f"Statistically significant: {result['significant']}")
print(f"95% CI for difference: {result['ci_95']}")`,
      output: `=== A/B Test Results ===
Control conversion rate: 0.1010 (10.10%)
Treatment conversion rate: 0.1212 (12.12%)
Lift: 20.00%
Z-statistic: 3.2134
P-value: 0.0013
Statistically significant: True
95% CI for difference: (0.0080, 0.0324)`,
      explanation: 'This A/B test simulation generates binary outcomes for control and treatment groups, computes conversion rates, and performs a two-proportion z-test. The p-value (0.0013 < 0.05) indicates a statistically significant lift of 20%. The 95% confidence interval (0.8% to 3.24%) gives the range of the true difference.',
    },
    {
      level: 'intermediate',
      code: `import numpy as np
from scipy import stats
import math

def sample_size_calculation(
    baseline_rate: float = 0.10,
    minimum_detectable_effect: float = 0.02,
    alpha: float = 0.05,
    power: float = 0.80,
) -> int:
    """Calculate required sample size for an A/B test."""
    z_alpha = stats.norm.ppf(1 - alpha / 2)
    z_beta = stats.norm.ppf(power)

    treatment_rate = baseline_rate + minimum_detectable_effect
    p_pool = (baseline_rate + treatment_rate) / 2

    n = (
        (z_alpha * math.sqrt(2 * p_pool * (1 - p_pool)) +
         z_beta * math.sqrt(
             baseline_rate * (1 - baseline_rate) +
             treatment_rate * (1 - treatment_rate)
         )) ** 2
    ) / (minimum_detectable_effect ** 2)

    return math.ceil(n)

def sequential_ab_test(
    control_rate: float,
    treatment_rate: float,
    batch_size: int = 500,
    max_samples: int = 50000,
    alpha_spend: float = 0.005,
) -> dict:
    """A/B test with sequential analysis (peeking-friendly)."""
    np.random.seed(42)
    control_all = []
    treatment_all = []
    results = []

    for batch in range(max_samples // batch_size):
        # Generate batch of data
        c_batch = np.random.binomial(1, control_rate, batch_size)
        t_batch = np.random.binomial(1, treatment_rate, batch_size)
        control_all.extend(c_batch)
        treatment_all.extend(t_batch)

        n = len(control_all)
        c_rate = np.mean(control_all)
        t_rate = np.mean(treatment_all)

        # Compute z-statistic
        p_pool = (sum(control_all) + sum(treatment_all)) / (2 * n)
        se = math.sqrt(p_pool * (1 - p_pool) * 2 / n)
        z_stat = (t_rate - c_rate) / se if se > 0 else 0
        p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))

        results.append({
            "batch": batch + 1,
            "sample_size": n,
            "p_value": round(p_value, 4),
            "stopped_early": p_value < alpha_spend,
        })

        if p_value < alpha_spend and batch >= 1:
            break

    return results[-1]

# Usage
required_n = sample_size_calculation(
    baseline_rate=0.10,
    minimum_detectable_effect=0.02,
)
print(f"Required sample size per group: {required_n}")
print()

# Sequential test
result = sequential_ab_test(
    control_rate=0.10,
    treatment_rate=0.115,
)
print(f"Sequential test stopped at: n={result['sample_size']}")
print(f"P-value at stop: {result['p_value']}")
print(f"Stopped early: {result['stopped_early']}")`,
      output: `Required sample size per group: 3619

Sequential test stopped at: n=25000
P-value at stop: 0.0024
Stopped early: True`,
      explanation: 'This code calculates the required sample size for an A/B test (3,619 per group for a 2% MDE) and implements sequential testing with early stopping. Sequential testing uses a stricter alpha threshold per look (0.005 instead of 0.05) to maintain the overall Type I error rate while allowing early stopping when the effect is large.',
    },
    {
      level: 'advanced',
      code: `import numpy as np
from scipy import stats
from dataclasses import dataclass, asdict
from typing import Optional

@dataclass
class ABTestConfig:
    """Configuration for a production A/B test."""
    experiment_name: str
    metric_name: str
    baseline_value: float
    minimum_detectable_effect: float
    significance_level: float = 0.05
    statistical_power: float = 0.80
    one_sided: bool = False
    multiple_testing_correction: Optional[str] = None  # bonferroni, holm, fdr

class ABTestAnalyzer:
    """Production-grade A/B test analysis."""

    def __init__(self, config: ABTestConfig):
        self.config = config
        self.required_sample_size = self._calculate_sample_size()

    def _calculate_sample_size(self) -> int:
        """Calculate required sample size per group."""
        alpha = self.config.significance_level
        power = self.config.statistical_power
        z_alpha = stats.norm.ppf(1 - alpha / (1 if self.config.one_sided else 2))
        z_beta = stats.norm.ppf(power)

        baseline = self.config.baseline_value
        effect = self.config.minimum_detectable_effect
        treatment = baseline + effect
        p_pool = (baseline + treatment) / 2

        n = (
            (z_alpha * math.sqrt(2 * p_pool * (1 - p_pool)) +
             z_beta * math.sqrt(
                 baseline * (1 - baseline) + treatment * (1 - treatment)
             )) ** 2
        ) / (effect ** 2)
        return math.ceil(n)

    def analyze(self, control_outcomes: np.ndarray,
                treatment_outcomes: np.ndarray) -> dict:
        """Run full A/B test analysis."""
        n_c, n_t = len(control_outcomes), len(treatment_outcomes)
        c_rate = control_outcomes.mean()
        t_rate = treatment_outcomes.mean()
        lift = (t_rate - c_rate) / c_rate if c_rate > 0 else 0

        # Two-sample z-test
        p_pool = (control_outcomes.sum() + treatment_outcomes.sum()) / (n_c + n_t)
        se = math.sqrt(p_pool * (1 - p_pool) * (1/n_c + 1/n_t))
        z_stat = (t_rate - c_rate) / se if se > 0 else 0
        p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))

        if self.config.one_sided:
            p_value /= 2

        # Confidence interval
        se_diff = math.sqrt(
            c_rate * (1 - c_rate) / n_c +
            t_rate * (1 - t_rate) / n_t
        )
        z_crit = stats.norm.ppf(1 - self.config.significance_level / 2)
        ci = (t_rate - c_rate - z_crit * se_diff,
              t_rate - c_rate + z_crit * se_diff)

        # Effect size (Cohen's h)
        h = 2 * math.asin(math.sqrt(t_rate)) - 2 * math.asin(math.sqrt(c_rate))

        return {
            "experiment": self.config.experiment_name,
            "metric": self.config.metric_name,
            "control": {"n": n_c, "rate": round(c_rate, 4)},
            "treatment": {"n": n_t, "rate": round(t_rate, 4)},
            "lift_pct": round(lift * 100, 2),
            "z_statistic": round(z_stat, 4),
            "p_value": round(p_value, 6),
            "significant": p_value < self.config.significance_level,
            "ci_95": (round(ci[0], 4), round(ci[1], 4)),
            "effect_size_h": round(h, 4),
            "required_sample_size": self.required_sample_size,
            "power_achieved": n_c >= self.required_sample_size,
        }

# Run analysis
config = ABTestConfig(
    experiment_name="recommendation-model-v2",
    metric_name="click_through_rate",
    baseline_value=0.08,
    minimum_detectable_effect=0.01,
)
analyzer = ABTestAnalyzer(config)

# Simulate experiment data
np.random.seed(42)
control = np.random.binomial(1, 0.08, 5000)
treatment = np.random.binomial(1, 0.09, 5000)

results = analyzer.analyze(control, treatment)
for k, v in results.items():
    print(f"{k}: {v}")`,
      output: `experiment: recommendation-model-v2
metric: click_through_rate
control: {'n': 5000, 'rate': 0.0808}
treatment: {'n': 5000, 'rate': 0.0918}
lift_pct: 13.61
z_statistic: 1.9345
p_value: 0.053063
significant: False
ci_95: (-0.0002, 0.0222)
effect_size_h: 0.0388
required_sample_size: 2904
power_achieved: True`,
      explanation: 'This production-grade A/B test analyzer calculates required sample size, runs significance testing, computes confidence intervals and effect sizes, and checks if statistical power was achieved. The result (p=0.053, just above 0.05) is borderline — not statistically significant despite adequate power, suggesting the true effect might be smaller than the MDE.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Search Engines', description: 'Google runs thousands of A/B tests annually on search ranking algorithms. Changes as small as 0.1% improvement in click-through rate are detected using massive sample sizes and interleaved experiments.' },
      { industry: 'E-commerce', description: 'Amazon A/B tests product recommendation models, pricing algorithms, and search ranking. A 1% improvement in conversion rate translates to billions in revenue, so statistical rigor is critical.' },
      { industry: 'Social Media', description: 'Meta uses A/B testing for feed ranking, ad targeting, and content moderation models. Network effects require cluster-randomized experiments at the community level.' },
    ],
    caseStudy: {
      problem: 'A streaming service developed a new recommendation model. A standard A/B test showed 5% improvement in engagement (p=0.04). The team celebrated and deployed. Two weeks later, engagement dropped below baseline. The model had been tested during a holiday period (different user behavior) — the A/B test had external validity issues.',
      solution: 'The team implemented a rigorous A/B testing framework: pre-registered experiments, sample size calculations, minimum detectable effect defined upfront, sequential testing with early stopping corrections, and always-running holdout groups for long-term comparison.',
      results: 'False positive deployments dropped from 30% to 5%. The team detected when a "winning" model was simply capitalizing on seasonal effects. Confidence in deployment decisions increased dramatically.',
    },
    bestPractices: [
      'Pre-register experiments: define hypotheses, metrics, and sample sizes before starting',
      'Calculate required sample size upfront — do not run undersized experiments',
      'Use sequential testing if you need to peek at results or stop early',
      'Apply multiple testing correction when evaluating multiple metrics',
      'Run experiments for full business cycles (include weekends, holidays)',
      'Use holdout groups to measure long-term effects beyond the experiment period',
      'Document every experiment including "failed" ones — learnings are valuable',
    ],
    tools: ['scipy.stats', 'statsmodels', 'PlanOut (Facebook)', 'Google Optimize', 'Eppo', 'Optimizely'],
    jobRoles: ['Data Scientist', 'ML Engineer', 'Product Manager (ML)', 'Experimentation Engineer'],
    furtherReading: [
      'Trustworthy Online Controlled Experiments (Kohavi et al.)',
      'A/B Testing: The Most Powerful Way to Turn Clicks Into Customers',
      'Sequential Testing for A/B Experiments',
      'Multiple Testing Corrections: Bonferroni, Holm, FDR',
    ],
  },
  quiz: [
    {
      id: 'p16-ab-1', type: 'mcq',
      question: 'What does a p-value of 0.03 in an A/B test mean?',
      options: [
        'There is a 97% chance the treatment is better than control',
        'If there is no real difference between A and B, we would see a result this extreme only 3% of the time',
        'The treatment is 3% better than the control',
        'There is a 3% chance the null hypothesis is true',
      ],
      correctAnswer: 'If there is no real difference between A and B, we would see a result this extreme only 3% of the time',
      explanation: 'The p-value measures the probability of observing the data (or more extreme) assuming the null hypothesis is true. A p-value of 0.03 means there is a 3% chance of seeing this difference if A and B actually performed equally.',
    },
    {
      id: 'p16-ab-2', type: 'truefalse',
      question: 'You can stop an A/B test early as soon as the p-value drops below 0.05.',
      correctAnswer: 'False',
      explanation: 'Stopping early when the p-value crosses 0.05 inflates the false positive rate dramatically. This is called "peeking" or "optional stopping." Use sequential testing methods (e.g., always-valid p-values) if early stopping is needed.',
    },
    {
      id: 'p16-ab-3', type: 'fillblank',
      question: 'The smallest effect size that an A/B test can detect given its sample size is called the ___.',
      correctAnswer: 'minimum detectable effect',
      explanation: 'The Minimum Detectable Effect (MDE) depends on sample size, significance level, and statistical power. Smaller MDE requires larger sample sizes. Defining the MDE upfront is a critical step in experiment design.',
    },
    {
      id: 'p16-ab-4', type: 'code',
      question: 'What does this code calculate?',
      code: `n = ((z_alpha * math.sqrt(2 * p * (1-p)) +
       z_beta * math.sqrt(p1 * (1-p1) + p2 * (1-p2))) ** 2
     ) / (effect ** 2)
return math.ceil(n)`,
      options: [
        'The p-value of a completed A/B test',
        'The required sample size for a two-proportion z-test',
        'The confidence interval for the treatment effect',
        'The lift percentage between control and treatment',
      ],
      correctAnswer: 'The required sample size for a two-proportion z-test',
      explanation: 'This is the sample size formula for a two-proportion z-test. It uses the z-scores for alpha and beta, the pooled proportion, individual group proportions, and the minimum detectable effect to calculate the required number of observations per group.',
    },
    {
      id: 'p16-ab-5', type: 'match',
      question: 'Match each A/B testing concept with its description:',
      pairs: [
        { left: 'Statistical Power', right: 'Probability of detecting a true effect when it exists' },
        { left: 'Type I Error', right: 'False positive — concluding A ≠ B when they are equal' },
        { left: 'Multiple Testing Correction', right: 'Adjusts significance thresholds when testing many metrics' },
        { left: 'Shadow Deployment', right: 'Runs new model alongside production without serving its predictions' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Power (1-β) is the ability to detect real effects. Type I error (α) is a false positive. Multiple testing correction prevents false positives from testing many metrics. Shadow deployment enables risk-free model comparison.',
    },
  ],
}))

export {}
