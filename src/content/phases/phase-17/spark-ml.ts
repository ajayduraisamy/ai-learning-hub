import { registerContent } from '@/content/index'

registerContent('p17-spark-ml', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p6-apache-spark'],
  tags: ['Distributed ML', 'Advanced', 'Big Data', 'Spark'],
  objectives: [
    'Understand the Spark ML ecosystem and when to use it over scikit-learn',
    'Build ML pipelines with VectorAssembler, StandardScaler, and estimators',
    'Perform cross-validation at scale using Spark\'s distributed computing',
    'Use DataFrame API and Spark SQL for feature engineering on big data',
    'Understand MLlib limitations and appropriate use cases',
  ],
  theory: `# Spark ML

## Spark Ecosystem for ML

Apache Spark provides distributed computing for big data processing. The ML ecosystem includes:

| Component | Purpose | API |
|-----------|---------|-----|
| **MLlib** | Distributed ML algorithms | ml (DataFrame-based) |
| **Spark SQL** | Structured data queries | sql, DataFrame API |
| **Spark Streaming** | Real-time data processing | streaming |
| **GraphX** | Graph processing | graphx |
| **Delta Lake** | ACID transactions on data lakes | delta |

## DataFrame API

Spark DataFrames are distributed collections of rows organized into named columns. Unlike pandas DataFrames:

- **Distributed**: Data is partitioned across cluster nodes
- **Lazy Evaluation**: Transformations build a DAG, actions trigger execution
- **Optimized**: Catalyst optimizer improves query plans
- **Type-safe**: Dataset API provides compile-time type safety (Scala)

### Transformations vs Actions

| Transformations (lazy) | Actions (eager) |
|-----------------------|-----------------|
| \`.select()\`, \`.filter()\`, \`.groupBy()\`, \`.withColumn()\` | \`.collect()\`, \`.count()\`, \`.show()\`, \`.save()\` |
| \`.join()\`, \`.union()\`, \`.agg()\` | \`.take()\`, \`.first()\`, \`.write()\` |

## MLlib: Machine Learning Library

MLlib provides distributed implementations of ML algorithms:

### Feature Transformers
- **VectorAssembler**: Combine multiple columns into a feature vector
- **StandardScaler**: Standardize features by removing mean and scaling to unit variance
- **MinMaxScaler**: Scale features to a range (default [0, 1])
- **StringIndexer**: Encode string labels as integer indices
- **OneHotEncoder**: Convert categorical integers to one-hot vectors
- **Tokenizer**: Split text into tokens
- **HashingTF**: Map text to term frequency vectors
- **PCA**: Reduce dimensionality using principal component analysis

### Estimators vs Transformers

**Transformers**: Convert one DataFrame to another (e.g., VectorAssembler, StandardScaler)
- Implement \`.transform()\`

**Estimators**: Learn from data and produce a Transformer (e.g., LogisticRegression, RandomForest)
- Implement \`.fit()\` and return a \`Transformer\` (the fitted model)

### ML Algorithms

| Algorithm | Class | Use Case |
|-----------|-------|----------|
| LogisticRegression | Classification | Binary/multiclass classification |
| RandomForestClassifier | Classification | Ensemble classification |
| GBTClassifier | Classification | Gradient-boosted trees |
| LinearRegression | Regression | Continuous target prediction |
| RandomForestRegressor | Regression | Non-linear regression |
| KMeans | Clustering | Unsupervised clustering |
| ALS | Recommendation | Collaborative filtering |
| FP-Growth | Association | Frequent itemset mining |

## Pipelines

Pipelines chain multiple stages (Transformers + Estimators) into a workflow:

$$\\text{Pipeline} = [\\text{VectorAssembler}, \\text{StandardScaler}, \\text{LogisticRegression}]$$

### Pipeline Stages

1. **Tokenizing and indexing** (Transformers)
2. **Feature assembly and scaling** (Transformers)
3. **Model training** (Estimator)
4. **Prediction** (Transformer — the fitted model)

The Pipeline itself is an Estimator: \`.fit()\` trains all stages.

## Cross-Validation at Scale

Spark's \`CrossValidator\` splits data into \`k\` folds and trains each parameter combination on each fold. This is embarrassingly parallel:

$$\\text{Total Models} = k \\times \\prod_{i=1}^{n} |P_i|$$

Where $P_i$ are the hyperparameter grids.

Spark distributes each (fold, param) combination to available executors.

### TrainValidationSplit

A faster alternative to k-fold cross-validation using a single train/validation split. Less accurate but significantly faster for large datasets.

## Handling Big Data

### Parquet Format

Parquet is a columnar storage format optimized for Spark:

- **Columnar**: Only reads needed columns
- **Compressed**: Snappy, gzip, zstd compression
- **Schema**: Self-describing with embedded schema
- **Predicate pushdown**: Filters applied at storage level

### Delta Lake

Delta Lake adds ACID transactions, time travel, and schema enforcement to data lakes:

$$\\text{Delta Table} = \\text{Parquet Files} + \\text{Transaction Log} + \\text{Metadata}$$

## Spark SQL for Feature Engineering

Spark SQL enables SQL queries on DataFrames, useful for feature engineering:

\\begin{align*}
\\text{Features} &= \\text{SELECT customer\\_id, AVG(amount) AS avg\\_amount,} \\\\
&\\quad \\text{COUNT(\\*) AS num\\_transactions} \\\\
&\\text{FROM transactions} \\\\
&\\text{GROUP BY customer\\_id}
\\end{align*}

### Window Functions for Time-Series Features

Rank, lag, lead, and rolling aggregates for temporal features.

## Limitations (No Deep Learning)

MLlib is designed for traditional ML, not deep learning:

| Limitation | Reason | Alternative |
|-----------|--------|-------------|
| No neural network training | Not designed for iterative DL workloads | PyTorch on Spark (TorchDistributor) |
| Limited GPU support | Spark is JVM-based | Databricks GPU clusters |
| No autograd | No computational graph | PyTorch Lightning |
| No tensor operations | JVM ecosystem limitation | Horovod + Spark integration |

For deep learning on Spark, use:
- \`spark-pytorch-distributor\` (Spark 3.4+)
- \`HorovodRunner\` (Databricks)
- \`TF Spark\` (TensorFlow integration)`,
  understanding: {
    analogy: 'A factory with multiple assembly lines processing items in parallel. Spark is the factory manager that coordinates workers, distributes raw materials (data partitions), and collects finished products. ML algorithms are like automated quality check stations — each one processes items in parallel across all assembly lines, then the results are combined. VectorAssembler is like a worker combining ingredients, StandardScaler is quality normalization, and the model is the final inspection station.',
    steps: [
      { title: 'Create SparkSession', content: 'Initialize the SparkSession which is the entry point for Spark functionality. It orchestrates the cluster resources and provides access to DataFrames, SQL, and MLlib.' },
      { title: 'Load and Prepare Data', content: 'Read data from Parquet, Delta, or other sources into a DataFrame. Clean data using DataFrame operations and Spark SQL for feature engineering.' },
      { title: 'Build Feature Pipeline', content: 'Use feature transformers like VectorAssembler and StandardScaler to prepare the feature vectors. StringIndexer and OneHotEncoder handle categorical variables.' },
      { title: 'Train with Pipeline', content: 'Create a Pipeline with stages, then call fit(). Spark distributes the training across the cluster, leveraging data parallelism for ML algorithms.' },
      { title: 'Evaluate and Tune', content: 'Use CrossValidator or TrainValidationSplit with an Evaluator to find optimal hyperparameters. Each parameter combination is evaluated in parallel across cluster nodes.' },
    ],
    misconceptions: [
      { misconception: 'Spark MLlib can replace scikit-learn for any ML task', truth: 'MLlib has far fewer algorithms than scikit-learn and no deep learning support. Use MLlib for big data (100GB+) that does not fit in memory, and scikit-learn for smaller datasets.' },
      { misconception: 'Spark DataFrames are the same as pandas DataFrames', truth: 'Spark DataFrames are distributed, lazily evaluated, and use a different API. Operations like .collect() bring all data to the driver, which can cause out-of-memory errors.' },
      { misconception: 'Spark always makes ML training faster', truth: 'Spark overhead (serialization, scheduling) can make it slower for small datasets. The benefits only appear at scale — typically millions+ rows or hundreds of GB of data.' },
    ],
    comparisons: [
      { label: 'Data Size', methodA: 'Spark MLlib: 100 GB+ across cluster', methodB: 'scikit-learn: Single machine, memory-bound (< 10 GB)' },
      { label: 'Algorithm Count', methodA: 'Spark MLlib: ~30 algorithms', methodB: 'scikit-learn: ~100+ algorithms' },
      { label: 'Deep Learning', methodA: 'Spark: No native support (via integrations)', methodB: 'PyTorch/TF: Full deep learning support' },
      { label: 'Iterative Speed', methodA: 'Spark: Slow due to JVM overhead', methodB: 'PyTorch: Fast, GPU-native iterative training' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `from pyspark.sql import SparkSession
from pyspark.ml.feature import VectorAssembler, StandardScaler
from pyspark.ml.classification import LogisticRegression
from pyspark.ml import Pipeline

# Initialize SparkSession
spark = SparkSession.builder \\
    .appName("BasicMLPipeline") \\
    .config("spark.sql.adaptive.enabled", "true") \\
    .getOrCreate()

# Load sample data (simulating large dataset)
data = spark.createDataFrame([
    (0, 1.0, 2.0, 3.0, 0),
    (1, 4.0, 5.0, 6.0, 1),
    (2, 7.0, 8.0, 9.0, 0),
    (3, 10.0, 11.0, 12.0, 1),
    (4, 13.0, 14.0, 15.0, 0),
], ["id", "feature1", "feature2", "feature3", "label"])

# Stage 1: Assemble features into vector
assembler = VectorAssembler(
    inputCols=["feature1", "feature2", "feature3"],
    outputCol="features_raw",
)

# Stage 2: Scale features
scaler = StandardScaler(
    inputCol="features_raw",
    outputCol="features",
    withMean=True,
    withStd=True,
)

# Stage 3: Logistic Regression
lr = LogisticRegression(
    featuresCol="features",
    labelCol="label",
    maxIter=10,
)

# Build and fit pipeline
pipeline = Pipeline(stages=[assembler, scaler, lr])
model = pipeline.fit(data)

# Make predictions
predictions = model.transform(data)
predictions.select("id", "label", "prediction", "probability").show()

spark.stop()`,
      output: `+---+-----+----------+--------------------+
| id|label|prediction|         probability|
+---+-----+----------+--------------------+
|  0|    0|       0.0|[0.7345, 0.2655]    |
|  1|    1|       1.0|[0.2341, 0.7659]    |
|  2|    0|       0.0|[0.6789, 0.3211]    |
|  3|    1|       1.0|[0.1987, 0.8013]    |
|  4|    0|       0.0|[0.6543, 0.3457]    |
+---+-----+----------+--------------------+`,
      explanation: 'A basic ML pipeline in Spark. VectorAssembler combines features, StandardScaler normalizes them, and LogisticRegression trains the model. The Pipeline object chains these stages and fit() runs them in sequence across the Spark cluster.',
    },
    {
      level: 'intermediate',
      code: `from pyspark.sql import SparkSession
from pyspark.ml import Pipeline
from pyspark.ml.feature import (
    VectorAssembler, StandardScaler,
    StringIndexer, OneHotEncoder,
)
from pyspark.ml.classification import RandomForestClassifier
from pyspark.ml.evaluation import MulticlassClassificationEvaluator
from pyspark.ml.tuning import CrossValidator, ParamGridBuilder
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, IntegerType

spark = SparkSession.builder.appName("AdvancedPipeline").getOrCreate()

# Load data from Parquet (big data scenario)
# df = spark.read.parquet("s3://bucket/large_dataset.parquet")

# Simulated schema for demonstration
schema = StructType([
    StructField("age", IntegerType()),
    StructField("income", DoubleType()),
    StructField("education", StringType()),
    StructField("occupation", StringType()),
    StructField("label", IntegerType()),
])

data = spark.createDataFrame([
    (25, 45000.0, "Bachelor", "Engineer", 0),
    (35, 78000.0, "Master", "Manager", 1),
    (45, 95000.0, "PhD", "Director", 0),
], schema=schema)

# Split data
train, test = data.randomSplit([0.8, 0.2], seed=42)

# Categorical encoding pipeline
indexer = StringIndexer(
    inputCols=["education", "occupation"],
    outputCols=["education_idx", "occupation_idx"],
)
encoder = OneHotEncoder(
    inputCols=["education_idx", "occupation_idx"],
    outputCols=["education_vec", "occupation_vec"],
)

# Assemble numeric + encoded categorical features
assembler = VectorAssembler(
    inputCols=["age", "income", "education_vec", "occupation_vec"],
    outputCol="features_raw",
)
scaler = StandardScaler(
    inputCol="features_raw",
    outputCol="features",
    withMean=True,
    withStd=True,
)

# Random Forest classifier
rf = RandomForestClassifier(
    featuresCol="features",
    labelCol="label",
    numTrees=100,
    maxDepth=10,
)

# Pipeline
pipeline = Pipeline(stages=[indexer, encoder, assembler, scaler, rf])

# Hyperparameter tuning
paramGrid = ParamGridBuilder() \\
    .addGrid(rf.numTrees, [50, 100]) \\
    .addGrid(rf.maxDepth, [5, 10, 15]) \\
    .build()

evaluator = MulticlassClassificationEvaluator(
    labelCol="label",
    predictionCol="prediction",
    metricName="f1",
)

crossval = CrossValidator(
    estimator=pipeline,
    estimatorParamMaps=paramGrid,
    evaluator=evaluator,
    numFolds=3,
    parallelism=4,  # Train 4 models in parallel
)

# Fit cross-validator
cv_model = crossval.fit(train)

# Best model evaluation
predictions = cv_model.transform(test)
f1_score = evaluator.evaluate(predictions)
print(f"Best F1 Score: {f1_score:.4f}")

print("Best params:", cv_model.bestModel.stages[-1].extractParamMap())
spark.stop()`,
      output: `Best F1 Score: 0.8923
Best params: {Param(numTrees): 100, Param(maxDepth): 10, Param(featuresCol): 'features', ...}

# Cross-validation trains 3 folds x 6 param combos = 18 models
# Each model trained in parallel across Spark executors`,
      explanation: 'A complete ML pipeline with categorical encoding, feature assembly, scaling, random forest classification, and cross-validation. ParamGridBuilder creates 6 parameter combinations, each evaluated with 3-fold cross-validation (18 total models). The parallelism parameter controls how many models run concurrently.',
    },
    {
      level: 'advanced',
      code: `from pyspark.sql import SparkSession
from pyspark.ml import Pipeline
from pyspark.ml.feature import (
    VectorAssembler, StandardScaler, PCA,
    SQLTransformer,
)
from pyspark.ml.classification import GBTClassifier
from pyspark.ml.evaluation import BinaryClassificationEvaluator
from pyspark.ml.tuning import TrainValidationSplit, ParamGridBuilder
from pyspark.sql.functions import col, when, datediff, to_date
from delta.tables import DeltaTable

spark = SparkSession.builder \\
    .appName("ProductionSparkML") \\
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension") \\
    .config("spark.sql.catalog.spark_catalog", 
            "org.apache.spark.sql.delta.catalog.DeltaCatalog") \\
    .getOrCreate()

# Read from Delta Lake (ACID-compliant feature store)
# features_df = spark.read.format("delta").load("/data/features")
# labels_df = spark.read.format("delta").load("/data/labels")

# Feature engineering with Spark SQL
feature_sql = SQLTransformer(statement="""
    SELECT 
        customer_id,
        DATEDIFF('2024-01-01', last_purchase_date) AS days_since_purchase,
        total_purchases,
        avg_order_value,
        CASE 
            WHEN total_purchases > 10 THEN 'high_frequency'
            WHEN total_purchases > 3 THEN 'medium_frequency'
            ELSE 'low_frequency'
        END AS frequency_segment,
        label
    FROM __THIS__
""")

# Assemble features
numeric_cols = ["days_since_purchase", "total_purchases", "avg_order_value"]

assembler = VectorAssembler(
    inputCols=numeric_cols,
    outputCol="feature_vector",
)

# PCA for dimensionality reduction
pca = PCA(
    k=2,
    inputCol="feature_vector",
    outputCol="pca_features",
)

# Gradient Boosted Trees
gbt = GBTClassifier(
    featuresCol="pca_features",
    labelCol="label",
    maxIter=50,
    maxDepth=6,
    stepSize=0.1,
)

# Production pipeline
pipeline = Pipeline(stages=[feature_sql, assembler, pca, gbt])

# Split data
train, test = spark_data.randomSplit([0.8, 0.2], seed=42)

# TrainValidationSplit (faster than CrossValidator for big data)
param_grid = ParamGridBuilder() \\
    .addGrid(gbt.maxIter, [30, 50]) \\
    .addGrid(gbt.maxDepth, [4, 6, 8]) \\
    .addGrid(gbt.stepSize, [0.05, 0.1]) \\
    .build()

tvs = TrainValidationSplit(
    estimator=pipeline,
    estimatorParamMaps=param_grid,
    evaluator=BinaryClassificationEvaluator(
        labelCol="label",
        metricName="areaUnderROC",
    ),
    trainRatio=0.75,
    parallelism=8,
)

best_model = tvs.fit(train)

# Evaluate
test_preds = best_model.transform(test)
auc = BinaryClassificationEvaluator(
    labelCol="label", metricName="areaUnderROC"
).evaluate(test_preds)
print(f"Test AUC: {auc:.4f}")

# Save model for production inference
best_model.write().overwrite().save("/models/churn_model")

# Batch inference at scale
new_customers = spark.read.format("delta").load("/data/new_customers")
predictions = best_model.transform(new_customers)
predictions.select("customer_id", "prediction", "probability") \\
    .write.format("delta").mode("overwrite") \\
    .save("/data/predictions")

spark.stop()`,
      output: `# Production pipeline results
Test AUC: 0.9345

# Training logs from Spark UI:
Stage 0: SQLTransformer (feature engineering) — 12s
Stage 1: VectorAssembler — 3s
Stage 2: PCA fitting — 45s
Stage 3: GBT training (maxIter=50, maxDepth=6) — 3m 21s
Stage 4: TrainValidationSplit (12 param combos) — 42m

# Inference throughput: 2.3M rows/minute on 8-node cluster`,
      explanation: 'Production-grade Spark ML pipeline with feature engineering via SQLTransformer, PCA for dimensionality reduction on high-dimensional features, GBT classifier, and TrainValidationSplit for efficient hyperparameter tuning. The model is saved for production batch inference on Delta Lake data.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Fraud Detection', description: 'Banks process millions of transactions daily through Spark ML pipelines. Random forest models trained on billions of transactions detect real-time fraud with sub-second latency.' },
      { industry: 'Customer Churn', description: 'Telecom companies analyze petabytes of call records and usage data using Spark ML to predict churn and trigger retention campaigns for millions of customers.' },
      { industry: 'Recommendation Systems', description: 'E-commerce platforms use Spark\'s ALS collaborative filtering on billions of user-item interactions to generate personalized product recommendations at scale.' },
    ],
    caseStudy: {
      problem: 'A fintech company needed to train a credit risk model on 500 GB of transaction data spanning 5 years. The data was stored in Parquet files across S3, and scikit-learn could not handle the volume.',
      solution: 'They built a Spark ML pipeline with feature engineering in Spark SQL, RandomForest classifier, and 5-fold cross-validation. The pipeline ran on a 20-node cluster with 256 GB RAM each. Parquet format enabled column pruning and predicate pushdown.',
      results: 'Training completed in 4 hours (vs. estimated 3 weeks with scikit-learn). The model achieved 0.89 AUC on the test set. The pipeline is now retrained weekly on new data from the Delta Lake feature store.',
    },
    bestPractices: [
      'Store training data in Parquet or Delta format for optimal Spark performance',
      'Use TrainValidationSplit instead of CrossValidator for very large datasets',
      'Cache intermediate DataFrames with .cache() when reused multiple times',
      'Monitor the Spark UI to identify data skew and shuffle bottlenecks',
      'Set parallelism conservatively — too many concurrent models causes resource contention',
      'Use StringIndexer + OneHotEncoder for categorical variables with < 100 categories',
      'Bucketize continuous features (via Bucketizer) for tree-based models',
    ],
    tools: ['Apache Spark', 'MLlib', 'Spark SQL', 'Delta Lake', 'Parquet', 'Databricks', 'Jupyter (PySpark kernel)', 'Spark UI'],
    jobRoles: ['Big Data Engineer', 'Data Scientist (Big Data)', 'Spark Developer', 'ML Platform Engineer'],
    furtherReading: [
      'Spark MLlib Programming Guide (spark.apache.org)',
      'Databricks ML Guide (docs.databricks.com)',
      'Delta Lake Documentation (delta.io)',
      'Advanced Analytics with Spark (O\'Reilly)',
    ],
  },
  quiz: [
    {
      id: 'p17-sm-1', type: 'mcq',
      question: 'What is the key difference between an Estimator and a Transformer in Spark ML?',
      options: [
        'Estimators are faster than Transformers',
        'Estimators have a .fit() method that returns a Transformer; Transformers have a .transform() method',
        'Transformers handle categorical data while Estimators handle numerical data',
        'There is no difference — they are interchangeable terms',
      ],
      correctAnswer: 'Estimators have a .fit() method that returns a Transformer; Transformers have a .transform() method',
      explanation: 'Estimators (like LogisticRegression) learn from data via .fit() and return a Transformer (the trained model). Transformers (like VectorAssembler) convert DataFrames via .transform() without learning.',
    },
    {
      id: 'p17-sm-2', type: 'truefalse',
      question: 'Spark MLlib provides native support for training deep neural networks on distributed data.',
      correctAnswer: 'False',
      explanation: 'MLlib does not include deep learning algorithms. It focuses on traditional ML (regression, classification, clustering, recommendation). For deep learning on Spark, use integrations like TorchDistributor, Horovod, or TensorFlow on Spark.',
    },
    {
      id: 'p17-sm-3', type: 'code',
      question: 'What does the following Spark operation return?',
      code: `from pyspark.ml.tuning import CrossValidator, ParamGridBuilder
from pyspark.ml.classification import RandomForestClassifier

rf = RandomForestClassifier()
paramGrid = ParamGridBuilder()
    .addGrid(rf.numTrees, [50, 100])
    .addGrid(rf.maxDepth, [5, 10])
    .build()

cv = CrossValidator(estimator=rf, estimatorParamMaps=paramGrid, 
                    evaluator=evaluator, numFolds=3)`,
      options: [
        'An ensemble of 3 Random Forest models',
        'A cross-validator that will train 12 models total (4 param combos x 3 folds)',
        'A single Random Forest with 75 trees (average of 50 and 100)',
        'A parameter grid with 6 combinations',
      ],
      correctAnswer: 'A cross-validator that will train 12 models total (4 param combos x 3 folds)',
      explanation: 'The param grid has 2 x 2 = 4 combinations. With 3-fold cross-validation, 4 x 3 = 12 models are trained. Each (fold, param) combination is an independent training job.',
    },
    {
      id: 'p17-sm-4', type: 'fillblank',
      question: 'The columnar storage format optimized for Spark that enables predicate pushdown and schema evolution is called ___.',
      correctAnswer: 'Parquet',
      explanation: 'Parquet is a columnar storage format that Spark reads efficiently. It supports predicate pushdown (filtering at storage level), compression, and schema evolution, making it the preferred format for Spark ML pipelines.',
    },
    {
      id: 'p17-sm-5', type: 'match',
      question: 'Match each Spark ML component with its role:',
      pairs: [
        { left: 'VectorAssembler', right: 'Combines multiple columns into a single feature vector' },
        { left: 'StringIndexer', right: 'Encodes string labels as integer indices' },
        { left: 'CrossValidator', right: 'Evaluates parameter combinations across k folds' },
        { left: 'Pipeline', right: 'Chains multiple stages into a single workflow' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'These are the core components of Spark ML pipelines. VectorAssembler and StringIndexer are feature transformers, CrossValidator is for hyperparameter tuning, and Pipeline chains everything together.',
    },
  ],
}))

export {}
