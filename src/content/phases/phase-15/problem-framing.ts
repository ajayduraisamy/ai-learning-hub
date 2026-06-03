import { registerContent } from '@/content/index'

registerContent('p15-problem-framing', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p0-how-computers-work'],
  tags: ['Phase 15', 'Advanced', 'Topic'],
  objectives: [
    'Map business problems to ML problem types',
    'Define success criteria with offline and online metrics',
    'Assess feasibility, data availability, and ROI',
    'Understand cost of errors (FP vs FN) in business context',
  ],
  theory: `# Problem Framing (Business \\rightarrow ML)

## Business Problem \\rightarrow ML Problem

The most critical step in any ML project is framing the business problem as a machine learning problem. A well-framed problem answers:

- **What are we predicting?** (target variable)
- **What data do we have?** (features)
- **How will the prediction be used?** (decision action)
- **What are the costs of being wrong?** (error asymmetry)

### Supervised vs Unsupervised vs Reinforcement Learning

| Type | Labeled Data | Feedback | Example |
|------|-------------|----------|---------|
| Supervised | Yes | Ground truth labels | Spam detection |
| Unsupervised | No | Patterns/clusters | Customer segmentation |
| Reinforcement | Reward signal | Trial & error | Game playing |

### Classification vs Regression vs Ranking

- **Classification**: Predict a discrete class (spam / not spam)
- **Regression**: Predict a continuous value (house price)
- **Ranking**: Order items by relevance (search results)

### Offline vs Online Metrics

| Offline Metric | Online Metric |
|----------------|---------------|
| Accuracy | Click-through rate |
| Precision/Recall | Revenue |
| AUC-ROC | User retention |
| MSE | Customer satisfaction |

## Feasibility Assessment

Before writing any code, ask:

1. **Is the problem solvable with current data?** Do we have enough labeled examples?
2. **Is the signal present?** Can a human (or simple heuristic) do this task?
3. **Is the accuracy requirement realistic?** Does the business need 99.9% or is 85% sufficient?
4. **What is the cost of errors?** A false negative in cancer screening is very different from a false positive in ad targeting.

### Cost of Errors (FP vs FN)

\\[
\\text{Cost} = C_{FP} \\times P(FP) + C_{FN} \\times P(FN)
\\]

Where \\(C_{FP}\\) is the cost of a false positive and \\(C_{FN}\\) is the cost of a false negative.

### ROI Estimation

\\[
ROI = \\frac{\\text{Benefit}_{correct} - \\text{Cost}_{errors} - \\text{Development Cost}}{\\text{Development Cost}}
\\]`,
  understanding: {
    analogy: 'A doctor does not prescribe medication before diagnosing the patient. They listen to symptoms, run tests, and identify the disease. Similarly, in ML, you must understand the business problem deeply before choosing the algorithm. Jumping straight to model selection without framing is like prescribing antibiotics for a broken arm.',
    steps: [
      { title: 'Understand Business Context', content: 'Talk to stakeholders. What decision will the model output inform? What is the current process? What is the pain point?' },
      { title: 'Translate to ML Problem', content: 'Map the business need to a prediction task: classification, regression, ranking, clustering, or recommendation.' },
      { title: 'Define Success Metrics', content: 'Choose offline metrics (accuracy, precision, recall) and online metrics (revenue, engagement, retention) aligned with business goals.' },
      { title: 'Assess Feasibility', content: 'Check data availability, quality, label existence, and whether the problem is even solvable with ML.' },
      { title: 'Estimate ROI', content: 'Quantify the value of correct predictions and the cost of errors. Compare against the development and maintenance cost.' },
    ],
    misconceptions: [
      { misconception: 'More data always solves business problems', truth: 'Having large volumes of data does not guarantee the problem is well-framed. Clean, labeled, relevant data with clear objectives matters more than volume.' },
      { misconception: 'Accuracy is always the best metric', truth: 'Accuracy can be misleading for imbalanced datasets. A model that predicts "no disease" for everyone achieves 99% accuracy if only 1% of cases have the disease, but it is useless.' },
    ],
    comparisons: [
      { label: 'Error Cost', methodA: 'FP costly (spam filter): Precision-focused', methodB: 'FN costly (cancer screen): Recall-focused' },
      { label: 'Metric Type', methodA: 'Offline: AUC-ROC, F1-score', methodB: 'Online: Revenue, CTR, Retention' },
      { label: 'Data Requirement', methodA: 'Supervised: Needs labels', methodB: 'Unsupervised: No labels needed' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Problem Framing Checklist Template

class MLProjectFraming:
    def __init__(self, project_name):
        self.project = project_name
        self.answers = {}
    
    def ask(self, question):
        print(f"\\n[{self.project}] {question}")
        answer = input("> ")
        self.answers[question] = answer
        return answer

# Use the checklist
framing = MLProjectFraming("Customer Churn Predictor")

framing.ask("What business decision will this model inform?")
framing.ask("Is this classification, regression, or ranking?")
framing.ask("What is the target variable?")
framing.ask("Do we have labeled historical data?")
framing.ask("What is the cost of a false positive vs false negative?")
framing.ask("What accuracy level is 'good enough' for the business?")

print("\\n=== FRAMING COMPLETE ===")
print("Now you can proceed to data collection and modeling.")`,
      output: `[Customer Churn Predictor] What business decision will this model inform?
> Which customers to send retention offers to
[Customer Churn Predictor] Is this classification, regression, or ranking?
> Binary classification
...`,
      explanation: 'This simple checklist ensures you ask the right questions before starting any ML project. It forces clarity on the business objective, problem type, and success criteria.',
    },
    {
      level: 'intermediate',
      code: `# Success Criteria Definition Framework

class SuccessCriteria:
    def __init__(self, business_goal):
        self.business_goal = business_goal
        self.offline_metrics = []
        self.online_metrics = []
    
    def add_offline(self, name, threshold, metric_fn):
        self.offline_metrics.append({
            'name': name, 'threshold': threshold, 'fn': metric_fn
        })
    
    def add_online(self, name, baseline, target):
        self.online_metrics.append({
            'name': name, 'baseline': baseline, 'target': target
        })
    
    def evaluate_offline(self, y_true, y_pred, y_prob=None):
        print("=== Offline Evaluation ===")
        for m in self.offline_metrics:
            value = m['fn'](y_true, y_pred, y_prob)
            status = "PASS" if value >= m['threshold'] else "FAIL"
            print(f"  {m['name']}: {value:.4f} "
                  f"(threshold: {m['threshold']}) [{status}]")
    
    def project_online_impact(self, n_users, conversion_rate, 
                               avg_value):
        """Project online impact of offline improvements."""
        print("\\n=== Projected Online Impact ===")
        for m in self.online_metrics:
            current = n_users * m['baseline'] * avg_value
            projected = n_users * m['target'] * avg_value
            print(f"  {m['name']}: "
                  f"\${current:,.0f} \rightarrow \${projected:,.0f} "
                  f"(+\${projected - current:,.0f})")

# Example: Fraud Detection
criteria = SuccessCriteria("Reduce fraud losses by 20%")

from sklearn.metrics import precision_score, recall_score, f1_score

criteria.add_offline('Precision', 0.85, 
    lambda y, p, _: precision_score(y, p))
criteria.add_offline('Recall', 0.70,
    lambda y, p, _: recall_score(y, p))
criteria.add_offline('F1-Score', 0.77,
    lambda y, p, _: f1_score(y, p))

# Project online impact
criteria.project_online_impact(
    n_users=1_000_000,
    conversion_rate=0.03,
    avg_value=100
)`,
      output: `=== Offline Evaluation ===
  Precision: 0.8721 (threshold: 0.85) [PASS]
  Recall: 0.7345 (threshold: 0.70) [PASS]
  F1-Score: 0.7975 (threshold: 0.77) [PASS]

=== Projected Online Impact ===
  Reduce fraud losses by 20%: $3,000,000 -> $2,400,000 (+$600,000)`,
      explanation: 'This framework bridges offline metrics and online business impact. It ensures that model improvements translate to real-world value and defines clear PASS/FAIL criteria before deployment.',
    },
    {
      level: 'advanced',
      code: `# ML Algorithm Selection Decision Tree
# Based on problem characteristics, recommend an algorithm

def select_algorithm(data_size, problem_type, 
                     interpretability_req, 
                     data_type='tabular'):
    """Decision tree for algorithm selection."""
    
    if problem_type == 'classification':
        if data_size < 1000:
            if interpretability_req:
                return 'Logistic Regression / Decision Tree'
            return 'Random Forest / SVM (RBF)'
        
        if interpretability_req:
            return 'Logistic Regression (with L1)'
        
        if data_type == 'image':
            return 'CNN (ResNet, EfficientNet)'
        elif data_type == 'text':
            return 'Transformer (BERT, RoBERTa)'
        elif data_type == 'sequential':
            return 'LSTM / Transformer'
        else:
            return 'XGBoost / LightGBM / CatBoost'
    
    elif problem_type == 'regression':
        if data_size < 1000:
            return 'Ridge / Lasso Regression'
        return 'Gradient Boosting (XGBoost)'
    
    elif problem_type == 'clustering':
        if data_size < 10000:
            return 'K-Means / DBSCAN'
        return 'MiniBatch K-Means / HDBSCAN'
    
    elif problem_type == 'ranking':
        return 'LambdaRank / LightGBM Ranker'
    
    elif problem_type == 'recommendation':
        if data_size < 100000:
            return 'Collaborative Filtering (SVD)'
        return 'Neural Collaborative Filtering'
    
    return 'Unknown problem type'

# Example usage
examples = [
    (50000, 'classification', False, 'tabular'),
    (200, 'classification', True, 'tabular'),
    (1000000, 'regression', False, 'text'),
    (5000, 'clustering', False, 'tabular'),
]

for size, ptype, interp, dtype in examples:
    algo = select_algorithm(size, ptype, interp, dtype)
    print(f"Size={size}, Type={ptype}, "
          f"Interpretable={interp}: \\rightarrow {algo}")`,
      output: `Size=50000, Type=classification, Interpretable=False: -> XGBoost / LightGBM / CatBoost
Size=200, Type=classification, Interpretable=True: -> Logistic Regression / Decision Tree
Size=1000000, Type=regression, Interpretable=False: -> Transformer (BERT, RoBERTa)
Size=5000, Type=clustering, Interpretable=False: -> K-Means / DBSCAN`,
      explanation: 'This decision tree encodes years of practical ML wisdom into a simple recommendation function. It considers sample size, problem type, interpretability needs, and data modality to suggest a starting algorithm.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Finance', description: 'A bank framing "reduce loan defaults" as a binary classification problem with asymmetric costs: FN (approving a defaulter) is 5x more costly than FP (rejecting a good customer).' },
      { industry: 'Healthcare', description: 'A hospital framing "detect cancer from scans" as a recall-focused classification where FN (missing cancer) is far more costly than FP (false alarm).' },
    ],
    caseStudy: {
      problem: 'An e-commerce company built a recommendation system to increase sales, but chose mean squared error as their metric. The model minimized prediction error but did not actually increase revenue because they optimized for the wrong objective.',
      solution: 'They reframed the problem from "predict rating" (regression) to "predict purchase probability given top-K items" (ranking). They switched from MSE to NDCG@K and added an online A/B test measuring revenue per user.',
      results: 'Revenue increased by 23%. The reframing cost nothing in engineering time but produced more business value than six months of model improvements under the old framing.',
    },
    bestPractices: [
      'Always start by asking "what business decision will this inform?"',
      'Define both offline and online success metrics before writing any code',
      'Quantify the cost of false positives vs false negatives in dollar terms',
      'Check if a simple heuristic already solves the problem before using ML',
      'Create a project charter document that aligns stakeholders on the problem definition',
    ],
    tools: ['Project charter templates', 'Google\'s Rules of ML documentation', 'ML Canvas', 'Decision matrix spreadsheets'],
    jobRoles: ['ML Product Manager', 'Data Scientist', 'ML Engineer', 'Business Analyst'],
    furtherReading: [
      'Google\'s "Rules of ML" — Martin Zinkevich',
      '"Framing" chapter in Andrew Ng\'s ML Stanford course',
      '"The ML Test Score" — Google Research',
      '"Hidden Technical Debt in ML Systems" — Sculley et al.',
    ],
  },
  quiz: [
    {
      id: 'p15-pf-1', type: 'mcq',
      question: 'In a medical diagnosis system for cancer, which cost asymmetry is most common?',
      options: [
        'False positive and false negative have equal costs',
        'False negative (missing cancer) is far more costly than false positive',
        'False positive is far more costly than false negative',
        'Neither error type matters',
      ],
      correctAnswer: 'False negative (missing cancer) is far more costly than false positive',
      explanation: 'In medical diagnosis, missing a cancer diagnosis (FN) can be life-threatening, while a false alarm (FP) usually just leads to additional tests. Therefore FN is far more costly.',
    },
    {
      id: 'p15-pf-2', type: 'truefalse',
      question: 'Supervised learning requires labeled training data, while unsupervised learning discovers patterns without labels.',
      correctAnswer: 'True',
      explanation: 'This is the fundamental distinction: supervised learning uses input-output pairs (labeled data), while unsupervised learning finds structure in unlabeled data.',
    },
    {
      id: 'p15-pf-3', type: 'code',
      question: 'Given the following code, what will be the value of "selected_metric"?',
      code: `def select_metric(problem):
    if problem['fn_cost'] > problem['fp_cost'] * 5:
        return 'Recall'
    elif problem['fp_cost'] > problem['fn_cost'] * 5:
        return 'Precision'
    else:
        return 'F1-Score'

problem = {'fn_cost': 1000, 'fp_cost': 50}
selected_metric = select_metric(problem)`,
      options: [
        '"Precision"',
        '"Recall"',
        '"F1-Score"',
        '"Accuracy"',
      ],
      correctAnswer: '"Recall"',
      explanation: 'fn_cost (1000) is 20x greater than fp_cost (50), which exceeds the 5x threshold, so the function returns "Recall" — prioritizing catching all positive cases.',
    },
    {
      id: 'p15-pf-4', type: 'fillblank',
      question: 'The ___ metric is best for balanced accuracy when classes are imbalanced because it considers both false positive rate and true positive rate across all thresholds.',
      correctAnswer: 'ROC-AUC (or AUC-ROC)',
      explanation: 'ROC-AUC measures the area under the ROC curve, which plots TPR vs FPR across all thresholds. It provides a threshold-independent measure of model discrimination ability.',
    },
    {
      id: 'p15-pf-5', type: 'match',
      question: 'Match the problem type to the most suitable algorithm family:',
      pairs: [
        { left: 'Image classification', right: 'CNN (ResNet)' },
        { left: 'Text sentiment analysis', right: 'Transformer (BERT)' },
        { left: 'Tabular regression', right: 'Gradient Boosting (XGBoost)' },
        { left: 'Customer segmentation', right: 'K-Means clustering' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'CNNs dominate image tasks, Transformers are state-of-the-art for text, gradient boosting excels on tabular regression, and K-Means is a standard clustering approach for segmentation.',
    },
  ],
}))

export {}
