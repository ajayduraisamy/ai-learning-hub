import { registerContent } from '@/content/index'

registerContent('p16-feature-stores', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p16-data-versioning'],
  tags: ['MLOps', 'Advanced', 'Topic'],
  objectives: [
    'Understand the feature store concept and its role in MLOps',
    'Learn Feast architecture: feature repository, registry, serving',
    'Define feature views and entity definitions',
    'Retrieve features for training (offline) and inference (online)',
    'Understand point-in-time joins and feature serving latency',
  ],
  theory: `# Feature Stores (Feast)

## The Feature Store Concept

A feature store is a centralized repository for machine learning features. It solves a critical problem: **feature inconsistency between training and serving**.

### Why Feature Stores?

Without a feature store, teams typically:
- Duplicate feature engineering code across training and inference pipelines
- Compute features differently in training vs serving (training-serving skew)
- Lack a shared catalog of available features
- Cannot reuse features across models and teams
- Struggle to serve features at low latency for online inference

### The Two Sides of a Feature Store

$$\text{Feature Store} = \text{Offline Store} \cup \text{Online Store}$$

- **Offline Store**: Batch storage for training. Features are computed from historical data at scale (Spark, BigQuery, Snowflake).
- **Online Store**: Low-latency serving for inference. Features are stored in Redis, DynamoDB, or similar key-value stores.

## Feast Architecture

Feast (Feature Store) is an open-source feature store with these components:

### Feature Repository
A directory of configuration files (YAML/Python) that define:
- **Feature Views**: Logical groups of features computed from a source
- **Entities**: The objects features describe (user, item, transaction)
- **Data Sources**: Where raw data lives (Parquet, BigQuery, Kafka)
- **Feature Services**: Bundles of feature views for serving

### Registry
The registry is a database that stores feature metadata (schemas, types, descriptions). It supports:
- gRPC registry for online serving
- SQL registry (PostgreSQL, SQLite) for development
- File-based registry (protobuf) for Git versioning

### Feature Server
Feast provides a gRPC server for low-latency online feature retrieval. It also offers a Python SDK for offline retrieval.

### Materialization
The process of computing features from offline sources and loading them into the online store:

$$\text{Materialization: } \text{Offline} \to \text{Online}$$

Feast tracks which features have been materialized (start/end time ranges) to avoid duplication.

## Feature Views and Entity Definitions

### Entity
Defines the key object for features:

\`\`\`python
user = Entity(
    name="user_id",
    description="User identifier",
    value_type=ValueType.INT64,
)
\`\`\`

### Feature View
Groups features computed from a data source:

\`\`\`python
user_features = FeatureView(
    name="user_features",
    entities=["user_id"],
    ttl=timedelta(days=30),
    features=[
        Feature(name="age", dtype=ValueType.INT64),
        Feature(name="avg_purchase", dtype=ValueType.FLOAT),
        Feature(name="membership_tier", dtype=ValueType.STRING),
    ],
    batch_source=BigQuerySource(
        table_ref="project.dataset.user_features",
        timestamp_field="event_timestamp",
    ),
)
\`\`\`

### Point-in-Time Joins

The most subtle concept in feature stores. When training, you need feature values **as they were at prediction time**, not as they are now:

$$\text{Feature}(e, t) = \text{value of feature for entity } e \text{ at time } t$$

Feast automatically performs point-in-time joins: for each training row, it retrieves the most recent feature value that existed at or before the row's timestamp. This prevents **data leakage**.

## Feature Serving Latency

| Store | Latency | Use Case |
|-------|---------|----------|
| Offline (BigQuery/Snowflake) | Seconds to minutes | Training data generation |
| Online (Redis/DynamoDB) | Milliseconds | Real-time inference |
| Streaming (Kafka) | Sub-second | Real-time feature computation |

## Feast Workflow

1. **Define**: Declare entities, feature views, and data sources in the feature repo
2. **Apply**: \texttt{feast apply} uploads metadata to the registry
3. **Materialize**: \texttt{feast materialize} loads online store with features
4. **Serve**: Retrieve features via \texttt{get\_online\_features()} or gRPC
5. **Train**: Retrieve historical features via \texttt{get\_historical\_features()}`,
  understanding: {
    analogy: 'A feature store is like a well-organized library. Features are books, each with a specific topic (user age, purchase history). The offline store is the research library — you can browse everything, take what you need, and spend hours analyzing. The online store is the quick-reference desk — commonly needed books are right there for instant lookup. The librarian (Feast) knows exactly which edition of each book existed at any point in time (point-in-time joins). Different teams (data scientists, engineers) can check out the same books without each needing to write their own copy.',
    steps: [
      { title: 'Define Entities', content: 'Identify the key objects your features describe: users, items, transactions, sessions. Each entity needs a unique identifier and (optionally) a timestamp for point-in-time correctness.' },
      { title: 'Define Feature Views', content: 'Group related features by entity. For each view, specify the data source, feature names, types, and TTL (how long features are valid). Feast uses these definitions to build schemas.' },
      { title: 'Apply to Registry', content: 'Run feast apply to register all definitions with the Feast registry. This makes features discoverable by all team members. The registry can be a local file, database, or cloud service.' },
      { title: 'Materialize to Online Store', content: 'Run feast materialize to compute features from the offline source and load them into the online store (Redis, DynamoDB). This is the bridge between batch and real-time.' },
      { title: 'Retrieve Features', content: 'For training, use get_historical_features() which returns a pandas DataFrame with point-in-time correctness. For inference, use get_online_features() which returns features in milliseconds via gRPC.' },
    ],
    misconceptions: [
      { misconception: 'Feature stores are just databases for features', truth: 'A feature store is a purpose-built system that handles point-in-time correctness, feature serving, discovery, and lineage. A plain database lacks these ML-specific capabilities.' },
      { misconception: 'You need a feature store only for large teams', truth: 'Even a single data scientist benefits from centralized feature definitions. The main win is eliminating training-serving skew, which affects projects of any size.' },
      { misconception: 'Feature stores add latency to inference', truth: 'Feature stores reduce inference latency by precomputing features and serving them from low-latency online stores (Redis, DynamoDB) with millisecond response times.' },
    ],
    comparisons: [
      { label: 'Latency', methodA: 'Offline Store: Seconds to minutes (batch)', methodB: 'Online Store: Milliseconds (key-value lookup)' },
      { label: 'Data freshness', methodA: 'Offline Store: Hours/days old (batch updates)', methodB: 'Online Store: Seconds old (streaming updates)' },
      { label: 'Use case', methodA: 'Offline Store: Training data generation', methodB: 'Online Store: Real-time inference' },
      { label: 'Storage', methodA: 'Offline Store: BigQuery, Snowflake, Parquet', methodB: 'Online Store: Redis, DynamoDB, Cassandra' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Basic Feast feature repository setup
# This example shows defining entities and feature views

from datetime import timedelta
from feast import Entity, FeatureView, Feature, ValueType, FileSource

# Define an entity (the object features describe)
user_entity = Entity(
    name="user_id",
    description="Unique identifier for a user",
    value_type=ValueType.INT64,
)

# Define a data source (Parquet file for local development)
user_features_source = FileSource(
    path="data/user_features.parquet",
    timestamp_field="event_timestamp",
    created_timestamp_column="created_timestamp",
)

# Define a feature view (group of features for an entity)
user_features = FeatureView(
    name="user_features",
    entities=["user_id"],
    ttl=timedelta(days=30),
    features=[
        Feature(name="age", dtype=ValueType.INT64),
        Feature(name="annual_income", dtype=ValueType.FLOAT),
        Feature(name="credit_score", dtype=ValueType.INT64),
        Feature(name="num_transactions_30d", dtype=ValueType.INT64),
    ],
    batch_source=user_features_source,
)

print("=== Feast Feature Repository ===")
print(f"Entity: {user_entity.name}")
print(f"Entity type: {user_entity.value_type}")
print()
print(f"Feature View: {user_features.name}")
print(f"TTL: {user_features.ttl.days} days")
print(f"Features:")
for f in user_features.features:
    print(f"  - {f.name} ({f.dtype})")
print()
print("Run 'feast apply' to register these definitions.")`,
      output: `=== Feast Feature Repository ===
Entity: user_id
Entity type: ValueType.INT64

Feature View: user_features
TTL: 30 days
Features:
  - age (ValueType.INT64)
  - annual_income (ValueType.FLOAT)
  - credit_score (ValueType.INT64)
  - num_transactions_30d (ValueType.INT64)

Run 'feast apply' to register these definitions.`,
      explanation: 'This defines the basic Feast building blocks: an entity (user_id) and a feature view (user_features) backed by a Parquet file. The TTL ensures stale features are not served. After running feast apply, these definitions are registered and features can be retrieved.',
    },
    {
      level: 'intermediate',
      code: `import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from feast import FeatureStore

class FeatureStoreClient:
    """Client for offline and online feature retrieval."""

    def __init__(self, repo_path: str = "feature_repo"):
        self.fs = FeatureStore(repo_path=repo_path)

    def get_training_features(
        self,
        feature_refs: list,
        entity_df: pd.DataFrame,
    ) -> pd.DataFrame:
        """
        Retrieve historical features for training.
        Uses point-in-time joins for correctness.
        """
        training_df = self.fs.get_historical_features(
            features=feature_refs,
            entity_df=entity_df,
        ).to_df()
        return training_df

    def get_online_features(
        self,
        feature_refs: list,
        entity_rows: list,
    ) -> dict:
        """Retrieve features in real-time for inference."""
        features = self.fs.get_online_features(
            features=feature_refs,
            entity_rows=entity_rows,
        ).to_dict()
        return features

    def list_features(self) -> list:
        """List all available features from the registry."""
        return [fv.name for fv in self.fs.list_feature_views()]

# Simulate training data retrieval
client = FeatureStoreClient(repo_path="./feature_repo")

# Entity DataFrame with timestamps for point-in-time join
entity_df = pd.DataFrame({
    "user_id": [1001, 1002, 1003],
    "event_timestamp": [
        datetime(2024, 6, 1),
        datetime(2024, 6, 2),
        datetime(2024, 6, 3),
    ],
})

# Simulated feature retrieval
features = ["user_features:age",
            "user_features:annual_income",
            "user_features:credit_score"]

print("=== Feast Feature Retrieval ===")
print(f"Requested features: {features}")
print(f"Entity IDs: {entity_df['user_id'].tolist()}")
print()
print("Point-in-time join ensures features reflect")
print("the state at each entity's event_timestamp.")
print("Feature retrieval ready for training pipeline.")`,
      output: `=== Feast Feature Retrieval ===
Requested features: ['user_features:age', 'user_features:annual_income', 'user_features:credit_score']
Entity IDs: [1001, 1002, 1003]

Point-in-time join ensures features reflect
the state at each entity's event_timestamp.
Feature retrieval ready for training pipeline.`,
      explanation: 'The feature store client retrieves features for both training (historical) and inference (online). The key method is get_historical_features() which performs point-in-time joins: for each entity row, it fetches feature values as they were at that exact timestamp, preventing look-ahead bias and data leakage.',
    },
    {
      level: 'advanced',
      code: `import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from feast import FeatureStore, RepoConfig, Entity, FeatureView, Feature, ValueType
from feast.data_source import PushSource
from feast.infra.offline_stores.file_source import FileSource

# Simulate a complete feature store pipeline

class FraudFeatureStore:
    """Production feature store for fraud detection."""

    def __init__(self, repo_path: str = "fraud_feature_repo"):
        self.repo_path = repo_path
        self._define_schema()

    def _define_schema(self):
        """Define entities and feature views."""
        self.transaction_entity = Entity(
            name="transaction_id",
            description="Unique transaction identifier",
            value_type=ValueType.STRING,
        )

        self.user_entity = Entity(
            name="user_id",
            description="User initiating the transaction",
            value_type=ValueType.INT64,
        )

        self.transaction_features = FeatureView(
            name="transaction_features",
            entities=["transaction_id"],
            ttl=timedelta(hours=1),
            features=[
                Feature(name="amount", dtype=ValueType.FLOAT),
                Feature(name="currency", dtype=ValueType.STRING),
                Feature(name="merchant_category", dtype=ValueType.STRING),
                Feature(name="is_international", dtype=ValueType.INT64),
            ],
            batch_source=FileSource(
                path="data/transactions.parquet",
                timestamp_field="event_timestamp",
            ),
        )

        self.user_agg_features = FeatureView(
            name="user_aggregation_features",
            entities=["user_id"],
            ttl=timedelta(hours=6),
            features=[
                Feature(name="avg_transaction_amount_7d", dtype=ValueType.FLOAT),
                Feature(name="num_transactions_1d", dtype=ValueType.INT64),
                Feature(name="num_failed_attempts_7d", dtype=ValueType.INT64),
                Feature(name="country_count_30d", dtype=ValueType.INT64),
            ],
            batch_source=FileSource(
                path="data/user_aggregations.parquet",
                timestamp_field="event_timestamp",
            ),
        )

    def prepare_training_data(
        self,
        start_date: datetime,
        end_date: datetime,
    ) -> pd.DataFrame:
        """Generate training data with point-in-time correctness."""
        # In production, this would call get_historical_features()
        print(f"Generating training data: {start_date.date()} to {end_date.date()}")
        print("Applying point-in-time joins for all entity types...")
        print("Feature schema:")
        for fv in [self.transaction_features, self.user_agg_features]:
            for f in fv.features:
                print(f"  - {f.name} ({f.dtype})")

    def predict(self, transaction: dict) -> dict:
        """Get online features for real-time prediction."""
        features_to_retrieve = [
            "transaction_features:amount",
            "transaction_features:currency",
            "transaction_features:merchant_category",
            "transaction_features:is_international",
            "user_aggregation_features:avg_transaction_amount_7d",
            "user_aggregation_features:num_transactions_1d",
            "user_aggregation_features:num_failed_attempts_7d",
            "user_aggregation_features:country_count_30d",
        ]

        print(f"Online feature retrieval for transaction {transaction['transaction_id']}:")
        for f in features_to_retrieve:
            print(f"  Retrieved: {f}")
        print("Total latency: ~5ms (Redis online store)")

# Usage
fs = FraudFeatureStore()
print("=== Fraud Detection Feature Store ===\n")

fs.prepare_training_data(
    start_date=datetime(2024, 1, 1),
    end_date=datetime(2024, 6, 30),
)
print()

sample_transaction = {
    "transaction_id": "txn_987654",
    "user_id": 12345,
    "amount": 2999.99,
    "currency": "USD",
    "merchant_category": "electronics",
    "is_international": 0,
}
fs.predict(sample_transaction)`,
      output: `=== Fraud Detection Feature Store ===

Generating training data: 2024-01-01 to 2024-06-30
Applying point-in-time joins for all entity types...
Feature schema:
  - amount (ValueType.FLOAT)
  - currency (ValueType.STRING)
  - merchant_category (ValueType.STRING)
  - is_international (ValueType.INT64)
  - avg_transaction_amount_7d (ValueType.FLOAT)
  - num_transactions_1d (ValueType.INT64)
  - num_failed_attempts_7d (ValueType.INT64)
  - country_count_30d (ValueType.INT64)

Online feature retrieval for transaction txn_987654:
  Retrieved: transaction_features:amount
  Retrieved: transaction_features:currency
  Retrieved: transaction_features:merchant_category
  Retrieved: transaction_features:is_international
  Retrieved: user_aggregation_features:avg_transaction_amount_7d
  Retrieved: user_aggregation_features:num_transactions_1d
  Retrieved: user_aggregation_features:num_failed_attempts_7d
  Retrieved: user_aggregation_features:country_count_30d
Total latency: ~5ms (Redis online store)`,
      explanation: 'This production feature store for fraud detection demonstrates the full workflow: entity/feature view definitions for both transactions and users, historical feature retrieval for training with point-in-time joins, and online retrieval for real-time inference. The feature store ensures training and serving use identical feature definitions and computation.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Fraud Detection', description: 'Uber uses a feature store (based on Michelangelo) to serve real-time fraud detection features. Transaction amount, user history, device fingerprint — all computed once, served everywhere with low latency.' },
      { industry: 'Recommendation Systems', description: 'Netflix and Spotify use feature stores to unify user and item features across their recommendation pipelines. User watch history, song features, and contextual signals are computed centrally and served to hundreds of models.' },
      { industry: 'Ad Tech', description: 'Google and Meta use feature stores for ad ranking and targeting. User demographics, browsing history, ad engagement features — all retrieved in milliseconds during ad auction.' },
    ],
    caseStudy: {
      problem: 'A ride-sharing company had 12 different data science teams all computing the same features independently. User distance-from-destination was computed 7 different ways, producing different training results. Each team had its own inference pipeline, leading to training-serving skew.',
      solution: 'They deployed Feast as a central feature store. All feature definitions were declared once in a shared feature repository. Historical retrieval used point-in-time joins, and online retrieval used Redis. Teams collaborated on a single feature catalog.',
      results: 'Training-serving skew dropped to zero. Feature engineering effort was reduced by 60% as teams reused existing features. New model development time decreased from 6 weeks to 2 weeks.',
    },
    bestPractices: [
      'Always use point-in-time joins for historical feature retrieval to prevent data leakage',
      'Set appropriate TTL on feature views to prevent stale feature serving',
      'Version your feature repository in Git alongside your model code',
      'Monitor online feature retrieval latency — add alerting for p99 > 50ms',
      'Profile features before adding to the store: distribution, null rate, cardinality',
      'Use feature services to bundle commonly used feature groups for specific models',
      'Materialize features in batches during low-traffic periods',
    ],
    tools: ['Feast', 'Redis', 'DynamoDB', 'BigQuery / Snowflake', 'Kafka / Kinesis', 'Spark / Flink'],
    jobRoles: ['MLOps Engineer', 'Data Engineer', 'Feature Engineer', 'ML Platform Engineer'],
    furtherReading: [
      'Feast documentation — Getting Started',
      'Feature Store Architecture (Uber Engineering)',
      'Tecton — The Feature Store Concept',
      'Point-in-Time Joins Explained',
    ],
  },
  quiz: [
    {
      id: 'p16-fs-1', type: 'mcq',
      question: 'What is the primary purpose of a feature store?',
      options: [
        'To store trained model artifacts',
        'To centralize feature definitions and ensure consistency between training and serving',
        'To replace the need for data engineering',
        'To automatically engineer features from raw data',
      ],
      correctAnswer: 'To centralize feature definitions and ensure consistency between training and serving',
      explanation: 'A feature store provides a single source of truth for ML features. It ensures the same feature computation is used during both training (offline) and inference (online), eliminating training-serving skew.',
    },
    {
      id: 'p16-fs-2', type: 'truefalse',
      question: 'Point-in-time joins in feature stores prevent data leakage by using only feature values that existed at or before the prediction time.',
      correctAnswer: 'True',
      explanation: 'Point-in-time joins ensure that for each training row, only features that would have been available at prediction time are included. This prevents look-ahead bias where future information leaks into training data.',
    },
    {
      id: 'p16-fs-3', type: 'fillblank',
      question: 'The process of computing features from the offline store and loading them into the online store is called ___.',
      correctAnswer: 'materialization',
      explanation: 'Materialization transforms batch features into a format suitable for low-latency serving. Feast tracks materialization time ranges to avoid redundant computation.',
    },
    {
      id: 'p16-fs-4', type: 'code',
      question: 'What Feast method should be used to retrieve features for model training?',
      code: `from feast import FeatureStore
fs = FeatureStore(repo_path=".")
# Which method call here?`,
      options: [
        'fs.get_online_features()',
        'fs.get_historical_features()',
        'fs.materialize()',
        'fs.apply()',
      ],
      correctAnswer: 'fs.get_historical_features()',
      explanation: 'get_historical_features() retrieves features over a time range for training, performing point-in-time joins. get_online_features() is for real-time inference. materialize() loads data into the online store. apply() registers definitions.',
    },
    {
      id: 'p16-fs-5', type: 'match',
      question: 'Match each Feast concept with its description:',
      pairs: [
        { left: 'Entity', right: 'The object that features describe (user, item)' },
        { left: 'Feature View', right: 'A group of features from a data source' },
        { left: 'Offline Store', right: 'Batch storage for historical feature retrieval' },
        { left: 'Online Store', right: 'Low-latency storage for real-time inference' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Entities are the subjects of features. Feature views group related features. The offline store serves training data. The online store serves production inference traffic at low latency.',
    },
  ],
}))

export {}
