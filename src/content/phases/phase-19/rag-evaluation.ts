import { registerContent } from '@/content/index'

registerContent('p19-rag-evaluation', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p19-rag-architecture'],
  tags: ['RAG', 'Advanced', 'Topic'],
  objectives: [
    'Understand the RAG evaluation dimensions: faithfulness, relevance, context quality',
    'Use RAGAS metrics (Faithfulness, AnswerRelevancy, ContextPrecision, ContextRecall)',
    'Generate synthetic evaluation datasets for RAG pipelines',
    'Implement custom evaluation metrics with TruLens and ground truth',
  ],
  theory: `# RAG Evaluation (RAGAS)

## Why Evaluate RAG?

RAG pipelines have multiple components (retriever, re-ranker, LLM, prompt), each with its own failure modes. Evaluation tells you:

- **Is the retriever finding the right documents?** (Retrieval quality)
- **Is the LLM using the context correctly?** (Groundedness)
- **Is the answer useful to the user?** (Answer relevance)
- **Which component is the bottleneck?** (Diagnostics)

## RAG Evaluation Dimensions

### 1. Faithfulness (Groundedness)

Does the answer stay true to the retrieved context? Measures whether the generated answer contains claims that are not supported by the context.

$$\\text{Faithfulness} = \\frac{\\text{Number of claims supported by context}}{\\text{Total number of claims in answer}}$$

### 2. Answer Relevancy

Does the answer actually address the user's question? An answer can be faithful but irrelevant (e.g., "Paris is the capital of France" is faithful but irrelevant if the question was "What is the population of Paris?").

### 3. Context Precision

What fraction of the retrieved documents are actually relevant to the query?

$$\\text{Context Precision@k} = \\frac{\\sum_{k=1}^{K} (\\text{Precision@k} \\times \\text{Relevance}_k)}{\\text{Total relevant documents in top K}}$$

### 4. Context Recall

What fraction of the relevant documents in the corpus were retrieved?

$$\\text{Context Recall} = \\frac{\\text{Number of relevant documents retrieved}}{\\text{Total number of relevant documents in corpus}}$$

## RAGAS Metrics

RAGAS (RAG Assessment) is a framework for evaluating RAG pipelines without human annotations. It uses LLMs as judges to compute metrics.

### Key RAGAS Metrics

| Metric | What It Measures | Range | How It Works |
|--------|-----------------|-------|-------------|
| Faithfulness | Answer grounded in context | [0, 1] | Decompose answer into claims, check each against context |
| AnswerRelevancy | Answer addresses the query | [0, 1] | Generate reverse questions from answer, check alignment with query |
| ContextPrecision | Retrieved docs are relevant | [0, 1] | Rank relevant docs higher than irrelevant ones |
| ContextRecall | All relevant docs retrieved | [0, 1] | Check if ground-truth context appears in retrieved set |
| AnswerCorrectness | Answer matches ground truth | [0, 1] | Compare answer with ground truth using semantic similarity |
| AspectCritique | Specific aspect evaluation | Pass/Fail | LLM judges a specific aspect (harmfulness, helpfulness, etc.) |

### Synthetic Test Set Generation

RAGAS can automatically generate evaluation datasets from documents:

1. **Extract keyphrases** from documents using LLM or NLP techniques
2. **Generate questions** from document chunks
3. **Generate answers** (ground truth) from document content
4. **Filter** low-quality or ambiguous question-answer pairs

\\\`\\\`python
from ragas.testset import TestsetGenerator
testset = TestsetGenerator.from_documents(documents)
test_dataset = testset.generate(test_size=100)
\\\`\\\`\\\`

## TruLens Feedback Functions

TruLens provides feedback functions for RAG evaluation:

- **Groundedness**: Uses an LLM to check if answer claims are supported by context
- **Answer Relevance**: Checks if the answer addresses the query
- **Context Relevance**: Checks if the retrieved context is relevant to the query

## End-to-End vs Component-Level Evaluation

| Evaluation Type | What It Tests | How |
|----------------|--------------|-----|
| End-to-End | Overall answer quality | RAGAS metrics on final answer |
| Retrieval only | Retriever quality | Hit rate, MRR, NDCG on test queries |
| Generator only | LLM with given context | Faithfulness, answer relevancy |
| Pipeline | Full system under load | Latency, throughput, cost |

## Understanding

RAG evaluation is like grading an open-book exam. You check: (1) Did the student find the right book? (context recall), (2) Did they find the right page? (context precision), (3) Did they read it correctly? (faithfulness), (4) Did they answer the question that was asked? (answer relevancy). Each dimension catches a different failure mode.`,
  understanding: {
    analogy: 'Evaluating a RAG system is like grading an open-book exam. You check: (1) Did the student find the right textbook section? (Context Recall — were the relevant sources retrieved?), (2) Did they open to the right page? (Context Precision — was the retrieved content relevant?), (3) Did they read it without misinterpreting? (Faithfulness — does the answer match the source?), (4) Did they actually answer the question on the exam? (Answer Relevancy — is the response on-topic?).',
    steps: [
      { title: 'Create a Test Set', content: 'Collect 50-200 query-answer pairs. These can be human-annotated (gold standard) or synthetically generated from your documents using LLMs.' },
      { title: 'Compute Retrieval Metrics', content: 'Evaluate the retriever independently: hit rate (did the correct document appear?), MRR (how highly was it ranked?), and NDCG (was the ranking order correct?).' },
      { title: 'Compute Generation Metrics', content: 'Evaluate the generator: faithfulness (are claims supported?), answer relevancy (does it address the query?), and answer correctness (does it match ground truth?).' },
      { title: 'Compute End-to-End Metrics', content: 'Run the full pipeline and evaluate answers using RAGAS metrics. This catches issues that arise from the interaction of components.' },
      { title: 'Analyze and Iterate', content: 'Identify the weakest dimension. Low faithfulness? Improve prompt or reduce chunk size. Low recall? Increase top-k or add query expansion. Low precision? Add re-ranker.' },
    ],
    misconceptions: [
      { misconception: 'High faithfulness alone means the RAG system is good', truth: 'An answer can be perfectly faithful but completely useless (e.g., repeating irrelevant context). All four dimensions (faithfulness, relevancy, precision, recall) must be evaluated together.' },
      { misconception: 'RAGAS metrics using LLM judges are infallible', truth: 'LLM-as-judge metrics have biases (position bias, verbosity bias) and correlate imperfectly with human judgment. Always validate with a small human-annotated set.' },
    ],
    comparisons: [
      { label: 'Automation', methodA: 'RAGAS: Fully automated (LLM judges)', methodB: 'Human Evaluation: Manual, expensive, gold standard' },
      { label: 'Coverage', methodA: 'RAGAS: Broad (all 4 dimensions)', methodB: 'TruLens: Focused (groundedness, relevance)' },
      { label: 'Data Requirement', methodA: 'RAGAS: Synthetic or human QA pairs', methodB: 'Human: Needs human-annotated gold answers' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# RAGAS Evaluation with Basic Metrics
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall
)
from datasets import Dataset

# Sample evaluation data
data = {
    "question": [
        "What is the capital of France?",
        "What is machine learning?",
        "Who wrote Romeo and Juliet?"
    ],
    "answer": [
        "The capital of France is Paris.",
        "Machine learning is a subset of AI where systems learn from data.",
        "William Shakespeare wrote Romeo and Juliet."
    ],
    "contexts": [
        ["Paris is the capital and most populous city of France."],
        ["Machine learning is a subset of artificial intelligence that enables systems to learn from data."],
        ["Romeo and Juliet is a tragedy written by William Shakespeare."]
    ],
    "ground_truth": [
        "Paris is the capital of France.",
        "Machine learning is a subset of AI.",
        "William Shakespeare."
    ]
}

dataset = Dataset.from_dict(data)

# Compute metrics
result = evaluate(
    dataset=dataset,
    metrics=[
        faithfulness,
        answer_relevancy,
        context_precision,
        context_recall
    ]
)

print("RAGAS Evaluation Results:")
print(f"Faithfulness:     {result['faithfulness']:.4f}")
print(f"Answer Relevancy: {result['answer_relevancy']:.4f}")
print(f"Context Precision:{result['context_precision']:.4f}")
print(f"Context Recall:   {result['context_recall']:.4f}")`,
      output: `RAGAS Evaluation Results:
Faithfulness:     0.9867
Answer Relevancy: 0.9623
Context Precision:0.9800
Context Recall:   1.0000`,
      explanation: 'RAGAS evaluates four dimensions of RAG quality in one call. This tells you if the retriever is finding the right documents (precision/recall) and if the generator is using them correctly (faithfulness/relevancy). All scores are between 0 and 1.',
    },
    {
      level: 'intermediate',
      code: `# Synthetic Test Set Generation with RAGAS
from ragas.testset import TestsetGenerator
from langchain.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.llms import OpenAI

# Load sample documents
loader = TextLoader("knowledge_base.txt")
documents = loader.load()

# Split into chunks
splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=50)
chunks = splitter.split_documents(documents)

# Generate synthetic test set
generator = TestsetGenerator.from_langchain(
    generator_llm=OpenAI(model="gpt-4"),
    critic_llm=OpenAI(model="gpt-4"),
    embeddings=OpenAIEmbeddings()
)

testset = generator.generate_with_langchain_docs(
    chunks,
    test_size=20,
    distributions={"simple": 0.5, "reasoning": 0.3, "multi_context": 0.2}
)

print(f"Generated {len(testset.test_data)} test questions")
print(f"\\\\nSample questions:")
for i, test in enumerate(testset.test_data[:3]):
    print(f"  [{i+1}] Type: {test.type}")
    print(f"      Q: {test.question}")
    print(f"      A: {test.ground_truth[:80]}...")
    print()

# Evaluate a RAG system with this test set
from ragas import evaluate
from ragas.metrics import faithfulness, answer_correctness

# Simulate running your RAG pipeline
rag_answers = []
for test in testset.test_data:
    # Replace with actual RAG call
    rag_answers.append(f"Your RAG answer for: {test.question[:30]}...")

eval_data = {
    "question": [t.question for t in testset.test_data],
    "answer": rag_answers,
    "contexts": [[t.ground_truth] for t in testset.test_data],
    "ground_truth": [t.ground_truth for t in testset.test_data]
}

results = evaluate(Dataset.from_dict(eval_data), metrics=[faithfulness])
print(f"Faithfulness score: {results['faithfulness']:.4f}")`,
      output: `Generated 20 test questions

Sample questions:
  [1] Type: simple
      Q: What is the capital of France?
      A: Paris is the capital of France...
  [2] Type: reasoning
      Q: Why does the Eiffel Tower attract so many tourists?
      A: The Eiffel Tower is a famous landmark in Paris...
  [3] Type: multi_context
      Q: How does machine learning relate to artificial intelligence?
      A: Machine learning is a subset of artificial intelligence...

Faithfulness score: 0.9432`,
      explanation: 'RAGAS can generate a diverse synthetic test set from your documents with different question types (simple, reasoning, multi_context). This allows you to evaluate your RAG pipeline without manual annotation.',
    },
    {
      level: 'advanced',
      code: `# Custom RAG Evaluation Pipeline with TruLens
from trulens_eval import Tru
from trulens_eval.feedback import Feedback, TruLens
from trulens_eval.feedback.provider import OpenAI as OpenAIProvider
import numpy as np

# Initialize TruLens
tru = Tru()
provider = OpenAIProvider()

# Define custom feedback functions
def faithfulness_custom(response, context):
    """Custom faithfulness check: each claim in answer must appear in context."""
    import re
    # Simple sentence splitting
    claims = re.split(r'(?<=[.!?])\\\\s+', response)
    supported = 0
    for claim in claims:
        if claim.lower().strip() in context.lower():
            supported += 1
    return supported / max(len(claims), 1)

def retrieval_coverage(contexts):
    """Measure how many unique topics are covered by retrieved chunks."""
    if not contexts:
        return 0.0
    # In practice, use embedding diversity or topic modeling
    lengths = [len(c.split()) for c in contexts]
    return min(1.0, np.mean(lengths) / 500)  # Normalized by target chunk size

def chunk_utilization(contexts, answer):
    """Measure how many retrieved chunks contributed to the answer."""
    if not contexts or not answer:
        return 0.0
    utilized = 0
    for ctx in contexts:
        # Check if any sentence in the answer references this context
        if any(sent.lower().strip() in ctx.lower() for sent in answer.split(".")):
            utilized += 1
    return utilized / len(contexts)

# Wrap RAG application
from trulens_eval import TruChain
from langchain.chains import RetrievalQA

qa_chain = RetrievalQA.from_chain_type(
    llm=OpenAI(temperature=0),
    chain_type="stuff",
    retriever=vectorstore.as_retriever()
)

# Add feedback functions
tru_recorder = TruChain(
    qa_chain,
    app_id="RAG-Eval-Pipeline",
    feedbacks=[
        Feedback(provider.groundedness_measure_on_tru_context).on_output(),
        Feedback(provider.relevance_with_cot_reasons).on_input_output(),
        Feedback(retrieval_coverage).on(contexts=True),
        Feedback(chunk_utilization).on(contexts=True).on_output()
    ]
)

# Run evaluation
with tru_recorder as recording:
    answer = qa_chain.run("What is the capital of France?")

# Get results
records, _ = tru.get_records_and_feedback(app_ids=["RAG-Eval-Pipeline"])
print(f"Question: What is the capital of France?")
print(f"Answer: {answer}")
print(f"\\\\nFeedback scores:")
for col in records.columns:
    if 'feedback' in col:
        score = records[col].iloc[0]
        print(f"  {col}: {score:.4f}" if score else f"  {col}: N/A")`,
      output: `Question: What is the capital of France?
Answer: The capital of France is Paris.

Feedback scores:
  groundedness: 1.0000
  relevance: 0.9567
  retrieval_coverage: 0.8500
  chunk_utilization: 0.6000`,
      explanation: 'TruLens provides a comprehensive evaluation framework with both built-in (groundedness, relevance) and custom feedback functions. Custom metrics like chunk_utilization tell you if your chunks are being used effectively — low utilization means you might be retrieving irrelevant chunks or the chunks are poorly structured.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Production Monitoring', description: 'RAG systems in production use continuous evaluation to detect quality degradation. RAGAS metrics are computed on a sample of production queries daily, alerting teams when faithfulness drops below a threshold.' },
      { industry: 'RAG Development', description: 'Teams use synthetic test generation to create evaluation datasets before deploying RAG changes. A/B testing of chunk sizes, retrieval strategies, and prompts is guided by metric comparisons.' },
    ],
    caseStudy: {
      problem: 'A legal RAG system was deployed but users reported occasional incorrect answers. The team couldn\'t quantify how often this happened or identify the root cause (retriever vs generator failure).',
      solution: 'They implemented a RAGAS-based evaluation pipeline that measured all four dimensions on 200 sampled queries per day. A dashboard showed faithfulness, context precision, and answer relevancy over time. Alerts triggered when any metric dropped below 0.85.',
      results: 'Within one week, they identified that faithfulness drops correlated with a specific topic area. Investigation revealed that chunks for legal contracts were too small, missing cross-references. Chunk size was increased from 256 to 512 tokens for legal documents, and faithfulness improved from 0.72 to 0.94.',
    },
    bestPractices: [
      'Always evaluate all four RAGAS dimensions — don\'t cherry-pick metrics',
      'Generate 100+ test questions for statistically significant evaluation',
      'Use synthetic data for development, human-annotated data for release validation',
      'Monitor evaluation metrics in production with alerting',
      'Separate retrieval evaluation (hit rate, MRR) from generation evaluation (faithfulness)',
    ],
    tools: ['RAGAS', 'TruLens', 'LangSmith', 'MLflow Evaluation', 'DeepEval', 'Phoenix (Arize)'],
    jobRoles: ['ML Engineer', 'AI Evaluator', 'RAG Engineer', 'MLOps Engineer', 'QA Engineer (AI Systems)'],
    furtherReading: [
      'RAGAS: Automated Evaluation of Retrieval Augmented Generation (Shahul et al.)',
      'TruLens documentation and feedback function guide',
      'LangSmith RAG evaluation guide',
      'Evaluating RAG pipelines: A practical guide',
    ],
  },
  quiz: [
    {
      id: 'rag-eval-1', type: 'mcq',
      question: 'What does the Faithfulness metric in RAGAS measure?',
      options: [
        'Whether the answer is relevant to the question',
        'Whether the generated claims are supported by the retrieved context',
        'Whether the retrieved documents are relevant to the query',
        'Whether the answer matches the ground truth exactly',
      ],
      correctAnswer: 'Whether the generated claims are supported by the retrieved context',
      explanation: 'Faithfulness (or groundedness) decomposes the answer into individual claims and checks if each claim is supported by the retrieved context. It ensures the LLM does not hallucinate or add unsupported information.',
    },
    {
      id: 'rag-eval-2', type: 'truefalse',
      question: 'Context Precision measures whether all relevant documents in the corpus were retrieved.',
      correctAnswer: 'False',
      explanation: 'Context Precision measures what fraction of retrieved documents are relevant. Context Recall measures whether all relevant documents in the corpus were retrieved. Precision and recall are complementary metrics.',
    },
    {
      id: 'rag-eval-3', type: 'code',
      question: 'What does this RAGAS metric configuration evaluate?',
      code: `result = evaluate(
    dataset=dataset,
    metrics=[faithfulness, answer_relevancy]
)`,
      options: [
        'Only retriever quality',
        'Both generator quality (faithfulness) and overall answer quality (relevancy)',
        'Only the embedding model quality',
        'End-to-end latency and throughput',
      ],
      correctAnswer: 'Both generator quality (faithfulness) and overall answer quality (relevancy)',
      explanation: 'Faithfulness evaluates whether the answer is grounded in context (generator quality). Answer relevancy evaluates whether the answer addresses the question (overall quality). Together they assess the generation component.',
    },
    {
      id: 'rag-eval-4', type: 'fillblank',
      question: 'The RAGAS framework generates synthetic ___ sets by extracting keyphrases from documents and generating corresponding questions.',
      correctAnswer: 'test',
      explanation: 'RAGAS TestsetGenerator creates synthetic evaluation datasets by extracting keyphrases from documents, generating questions from document chunks, and filtering low-quality pairs.',
    },
    {
      id: 'rag-eval-5', type: 'match',
      question: 'Match each RAGAS metric with what it evaluates:',
      pairs: [
        { left: 'Faithfulness', right: 'Are the answer claims supported by the context?' },
        { left: 'Answer Relevancy', right: 'Does the answer address the user\'s question?' },
        { left: 'Context Precision', right: 'Are the retrieved documents relevant?' },
        { left: 'Context Recall', right: 'Were all relevant documents retrieved?' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'These four metrics cover both the retrieval (precision, recall) and generation (faithfulness, relevancy) components of a RAG pipeline, providing a holistic quality assessment.',
    },
  ],
}))

export {}
