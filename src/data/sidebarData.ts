import type { Phase } from '@/store/useStore'

export const phases: Phase[] = [
  {
    id: 'phase-0',
    title: 'Phase 0: Pre-Programming Basics',
    topics: [
      { id: 'p0-how-computers-work', title: 'How Computers Work' },
      { id: 'p0-binary-logic', title: 'Binary & Logic Gates' },
      { id: 'p0-algorithm-thinking', title: 'Algorithmic Thinking' },
      { id: 'p0-pseudocode', title: 'Pseudocode & Flowcharts' },
      { id: 'p0-setup-dev-env', title: 'Setting Up Dev Environment' },
    ],
  },
  {
    id: 'phase-1',
    title: 'Phase 1: Python Deep Dive',
    topics: [
      { id: 'p1-intro-python', title: 'Introduction to Python' },
      { id: 'p1-data-types', title: 'Data Types & Variables' },
      { id: 'p1-control-flow', title: 'Control Flow & Loops' },
      { id: 'p1-functions', title: 'Functions & Scope' },
      { id: 'p1-data-structures', title: 'Lists, Tuples, Dicts & Sets' },
      { id: 'p1-comprehensions', title: 'Comprehensions & Generators' },
      { id: 'p1-lambda-map-filter', title: 'Lambda, Map, Filter & Reduce' },
      { id: 'p1-oop', title: 'Object-Oriented Programming' },
      { id: 'p1-modules-packages', title: 'Modules & Packages' },
      { id: 'p1-file-io', title: 'File I/O & Context Managers' },
      { id: 'p1-exception-handling', title: 'Exception Handling' },
      { id: 'p1-decorators', title: 'Decorators & Closures' },
      { id: 'p1-iterators-generators', title: 'Iterators & Generators Deep Dive' },
      { id: 'p1-async-python', title: 'Async Python Basics' },
      { id: 'p1-testing-debugging', title: 'Testing & Debugging' },
    ],
  },
  {
    id: 'phase-2',
    title: 'Phase 2: Mathematics for ML',
    topics: [
      { id: 'p2-linear-algebra', title: 'Linear Algebra' },
      { id: 'p2-calculus', title: 'Calculus' },
      { id: 'p2-probability-stats', title: 'Probability & Statistics' },
      { id: 'p2-info-optimization', title: 'Information & Optimization Theory' },
    ],
  },
  {
    id: 'phase-3',
    title: 'Phase 3: Python ML Ecosystem',
    topics: [
      { id: 'p3-numpy', title: 'NumPy' },
      { id: 'p3-pandas', title: 'Pandas' },
      { id: 'p3-visualization', title: 'Data Visualization (Matplotlib, Seaborn, Plotly)' },
      { id: 'p3-scipy', title: 'SciPy for ML' },
    ],
  },
  {
    id: 'phase-4',
    title: 'Phase 4: Data Preprocessing',
    topics: [
      { id: 'p4-eda', title: 'EDA (Exploratory Data Analysis)' },
      { id: 'p4-handling-missing-data', title: 'Handling Missing Data' },
      { id: 'p4-outlier-detection', title: 'Outlier Detection & Treatment' },
      { id: 'p4-data-validation', title: 'Data Validation' },
      { id: 'p4-data-drift', title: 'Data Drift Detection' },
    ],
  },
  {
    id: 'phase-5',
    title: 'Phase 5: Feature Engineering',
    topics: [
      { id: 'p5-numerical-features', title: 'Numerical Feature Engineering' },
      { id: 'p5-categorical-encoding', title: 'Categorical Encoding (One-Hot, Label, Target)' },
      { id: 'p5-datetime-features', title: 'DateTime Features' },
      { id: 'p5-feature-scaling', title: 'Feature Scaling (Standardization, Normalization)' },
      { id: 'p5-feature-selection', title: 'Feature Selection Methods' },
    ],
  },
  {
    id: 'phase-6',
    title: 'Phase 6: Classical ML Algorithms',
    topics: [
      { id: 'p6-linear-regression', title: 'Linear Regression (Full)' },
      { id: 'p6-ridge-lasso', title: 'Ridge & Lasso Regression' },
      { id: 'p6-logistic-regression', title: 'Logistic Regression' },
      { id: 'p6-decision-trees', title: 'Decision Trees' },
      { id: 'p6-random-forest', title: 'Random Forest' },
      { id: 'p6-knn', title: 'K-Nearest Neighbors' },
      { id: 'p6-svm', title: 'Support Vector Machines' },
      { id: 'p6-naive-bayes', title: 'Naive Bayes' },
      { id: 'p6-xgboost', title: 'XGBoost' },
      { id: 'p6-lightgbm', title: 'LightGBM' },
      { id: 'p6-catboost', title: 'CatBoost' },
      { id: 'p6-kmeans', title: 'K-Means Clustering' },
      { id: 'p6-dbscan-hdbscan', title: 'DBSCAN & HDBSCAN' },
      { id: 'p6-pca', title: 'PCA' },
      { id: 'p6-tsne-umap', title: 't-SNE & UMAP' },
    ],
  },
  {
    id: 'phase-7',
    title: 'Phase 7: Model Evaluation',
    topics: [
      { id: 'p7-regression-metrics', title: 'Regression Metrics (MAE, MSE, RMSE, R²)' },
      { id: 'p7-classification-metrics', title: 'Classification Metrics (Confusion Matrix, Precision, Recall, F1)' },
      { id: 'p7-roc-auc', title: 'ROC Curve & AUC' },
      { id: 'p7-cross-validation', title: 'Cross-Validation Strategies' },
    ],
  },
  {
    id: 'phase-8',
    title: 'Phase 8: Deep Learning',
    topics: [
      { id: 'p8-nn-basics', title: 'Neural Network Basics & Perceptron' },
      { id: 'p8-activation-functions', title: 'Activation Functions' },
      { id: 'p8-backpropagation', title: 'Backpropagation' },
      { id: 'p8-optimizers', title: 'Optimizers (SGD, Adam, AdamW)' },
      { id: 'p8-loss-functions', title: 'Loss Functions' },
      { id: 'p8-cnn', title: 'Convolutional Neural Networks' },
      { id: 'p8-cnn-architectures', title: 'CNN Architectures (VGG, ResNet, EfficientNet)' },
      { id: 'p8-transfer-learning', title: 'Transfer Learning' },
      { id: 'p8-rnn-lstm', title: 'RNN & LSTM' },
      { id: 'p8-gru-bidirectional', title: 'GRU & Bidirectional RNNs' },
      { id: 'p8-self-attention', title: 'Self-Attention & Multi-Head Attention' },
      { id: 'p8-transformer-arch', title: 'Transformer Architecture' },
      { id: 'p8-bert', title: 'BERT (Architecture, Pre-training, Fine-tuning)' },
      { id: 'p8-gpt', title: 'GPT Models (GPT-1 to GPT-4)' },
      { id: 'p8-llama-mistral', title: 'LLaMA, Mistral, Mixtral' },
      { id: 'p8-lora-qlora', title: 'LoRA & QLoRA Fine-tuning' },
      { id: 'p8-rlhf-dpo', title: 'RLHF & DPO' },
    ],
  },
  {
    id: 'phase-9',
    title: 'Phase 9: Generative AI',
    topics: [
      { id: 'p9-gans', title: 'Vanilla GAN & DCGAN' },
      { id: 'p9-stylegan', title: 'StyleGAN Series' },
      { id: 'p9-cyclegan-pix2pix', title: 'CycleGAN & Pix2Pix' },
      { id: 'p9-vaes', title: 'Variational Autoencoders (VAEs)' },
      { id: 'p9-diffusion', title: 'Diffusion Models (DDPM)' },
      { id: 'p9-stable-diffusion', title: 'Stable Diffusion' },
      { id: 'p9-controlnet-dreambooth', title: 'ControlNet & DreamBooth' },
    ],
  },
  {
    id: 'phase-10',
    title: 'Phase 10: Agentic AI',
    topics: [
      { id: 'p10-agent-fundamentals', title: 'AI Agent Fundamentals' },
      { id: 'p10-react', title: 'ReAct Pattern' },
      { id: 'p10-tool-use', title: 'Tool Use & Function Calling' },
      { id: 'p10-multi-agent', title: 'Multi-Agent Systems (CrewAI, AutoGen)' },
      { id: 'p10-langchain-agents', title: 'LangChain Agents' },
      { id: 'p10-langgraph', title: 'LangGraph' },
    ],
  },
  {
    id: 'phase-11',
    title: 'Phase 11: Computer Vision',
    topics: [
      { id: 'p11-object-detection', title: 'Object Detection (YOLO)' },
      { id: 'p11-image-segmentation', title: 'Image Segmentation (U-Net, SAM)' },
      { id: 'p11-pose-estimation', title: 'Pose Estimation' },
      { id: 'p11-3d-vision-nerf', title: '3D Vision & NeRF' },
      { id: 'p11-video-analysis', title: 'Video Analysis' },
    ],
  },
  {
    id: 'phase-12',
    title: 'Phase 12: NLP Advanced',
    topics: [
      { id: 'p12-tokenization', title: 'Text Tokenization (BPE, WordPiece)' },
      { id: 'p12-word-embeddings', title: 'Word Embeddings (Word2Vec, GloVe)' },
      { id: 'p12-ner', title: 'Named Entity Recognition' },
      { id: 'p12-summarization', title: 'Text Summarization' },
      { id: 'p12-semantic-search', title: 'Semantic Search' },
      { id: 'p12-qa', title: 'Question Answering Systems' },
    ],
  },
  {
    id: 'phase-13',
    title: 'Phase 13: Time Series',
    topics: [
      { id: 'p13-stationarity', title: 'Stationarity & ACF/PACF' },
      { id: 'p13-arima', title: 'ARIMA & SARIMA' },
      { id: 'p13-prophet', title: 'Prophet' },
      { id: 'p13-lstm-ts', title: 'LSTM for Time Series' },
      { id: 'p13-anomaly-detection', title: 'Anomaly Detection in Time Series' },
    ],
  },
  {
    id: 'phase-14',
    title: 'Phase 14: Recommendation Systems',
    topics: [
      { id: 'p14-collaborative-filtering', title: 'Collaborative Filtering' },
      { id: 'p14-matrix-factorization', title: 'Matrix Factorization' },
      { id: 'p14-neural-cf', title: 'Neural Collaborative Filtering' },
      { id: 'p14-two-tower', title: 'Two-Tower Models' },
      { id: 'p14-multi-armed-bandits', title: 'Multi-Armed Bandits' },
    ],
  },
  {
    id: 'phase-15',
    title: 'Phase 15: Training Pipeline',
    topics: [
      { id: 'p15-problem-framing', title: 'Problem Framing (Business → ML)' },
      { id: 'p15-baseline-models', title: 'Baseline Models' },
      { id: 'p15-hyperparameter-tuning', title: 'Hyperparameter Tuning (Grid, Random, Bayesian, Optuna)' },
      { id: 'p15-error-analysis', title: 'Error Analysis' },
      { id: 'p15-model-calibration', title: 'Model Calibration' },
      { id: 'p15-model-interpretability', title: 'Model Interpretability (SHAP, LIME)' },
      { id: 'p15-fairness-bias', title: 'Fairness & Bias in ML' },
      { id: 'p15-adversarial-robustness', title: 'Adversarial Robustness' },
    ],
  },
  {
    id: 'phase-16',
    title: 'Phase 16: MLOps',
    topics: [
      { id: 'p16-experiment-tracking', title: 'Experiment Tracking (MLflow, W&B)' },
      { id: 'p16-data-versioning', title: 'Data Versioning (DVC)' },
      { id: 'p16-feature-stores', title: 'Feature Stores (Feast)' },
      { id: 'p16-model-serving', title: 'Model Serving (FastAPI, TF Serving, TorchServe)' },
      { id: 'p16-docker-ml', title: 'Docker for ML' },
      { id: 'p16-kubernetes-ml', title: 'Kubernetes for ML' },
      { id: 'p16-ci-cd-ml', title: 'CI/CD Pipelines for ML' },
      { id: 'p16-model-monitoring', title: 'Model Monitoring (Data Drift, Concept Drift)' },
      { id: 'p16-ab-testing', title: 'A/B Testing in Production' },
      { id: 'p16-cloud-deployment', title: 'Cloud Deployment (AWS SageMaker, GCP Vertex AI)' },
    ],
  },
  {
    id: 'phase-17',
    title: 'Phase 17: Distributed & Scalable ML',
    topics: [
      { id: 'p17-distributed-training', title: 'Distributed Training (DDP, FSDP)' },
      { id: 'p17-deepspeed-zero', title: 'DeepSpeed & ZeRO' },
      { id: 'p17-spark-ml', title: 'Spark ML' },
      { id: 'p17-ray-ml', title: 'Ray for ML' },
      { id: 'p17-streaming-ml', title: 'Streaming ML (Kafka + ML)' },
    ],
  },
  {
    id: 'phase-18',
    title: 'Phase 18: Advanced & Cutting Edge',
    topics: [
      { id: 'p18-rl', title: 'Reinforcement Learning (DQN, PPO)' },
      { id: 'p18-causal-ml', title: 'Causal ML' },
      { id: 'p18-federated-learning', title: 'Federated Learning' },
      { id: 'p18-graph-nn', title: 'Graph Neural Networks' },
      { id: 'p18-meta-learning', title: 'Meta-Learning' },
      { id: 'p18-xai', title: 'Explainable AI (XAI)' },
      { id: 'p18-ai-safety', title: 'AI Safety & Alignment' },
      { id: 'p18-quantum-ml', title: 'Quantum ML Basics' },
    ],
  },
  {
    id: 'phase-19',
    title: 'Phase 19: RAG Complete',
    topics: [
      { id: 'p19-rag-architecture', title: 'RAG Architecture & Pipeline' },
      { id: 'p19-chunking', title: 'Chunking Strategies (All types)' },
      { id: 'p19-vector-dbs', title: 'Vector Databases (Pinecone, Weaviate, Chroma, FAISS)' },
      { id: 'p19-retrieval-strategies', title: 'Retrieval Strategies (Hybrid, Multi-Query, HyDE)' },
      { id: 'p19-reranking', title: 'Re-ranking' },
      { id: 'p19-advanced-rag', title: 'Advanced RAG (Self-RAG, Corrective RAG, Graph RAG)' },
      { id: 'p19-rag-evaluation', title: 'RAG Evaluation (RAGAS)' },
      { id: 'p19-rag-production', title: 'RAG in Production' },
    ],
  },
  {
    id: 'phase-20',
    title: 'Phase 20: Specialized Modules',
    topics: [
      { id: 'p20-faiss', title: 'FAISS Deep Dive' },
      { id: 'p20-langchain', title: 'LangChain Complete' },
      { id: 'p20-llamaindex', title: 'LlamaIndex Complete' },
      { id: 'p20-graph-rag', title: 'Knowledge Graphs & Graph RAG' },
    ],
  },
  {
    id: 'phase-21',
    title: 'Phase 21: End-to-End Projects',
    topics: [
      { id: 'p21-house-price-prediction', title: 'House Price Prediction Pipeline' },
      { id: 'p21-churn-prediction', title: 'Customer Churn Prediction' },
      { id: 'p21-sentiment-analysis', title: 'Sentiment Analysis with BERT' },
      { id: 'p21-document-qa-rag', title: 'Document Q&A with RAG' },
      { id: 'p21-ai-research-agent', title: 'AI Research Agent' },
      { id: 'p21-image-classification', title: 'Image Classification App' },
      { id: 'p21-object-detection', title: 'Object Detection System' },
      { id: 'p21-custom-chatbot', title: 'Custom Chatbot with Fine-tuning' },
      { id: 'p21-mlops-pipeline', title: 'Full MLOps CI/CD Pipeline' },
    ],
  },
]

export function getPhaseByTopicId(topicId: string): Phase | undefined {
  return phases.find((p) => p.topics.some((t) => t.id === topicId))
}

export function getTopicById(topicId: string) {
  for (const phase of phases) {
    const topic = phase.topics.find((t) => t.id === topicId)
    if (topic) return { ...topic, phaseTitle: phase.title }
  }
  return undefined
}

export function getAllTopics() {
  return phases.flatMap((phase) =>
    phase.topics.map((topic) => ({
      ...topic,
      phaseTitle: phase.title,
      phaseId: phase.id,
    }))
  )
}
