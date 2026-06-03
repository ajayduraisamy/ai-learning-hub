import { registerContent } from '@/content/index'

registerContent('p17-streaming-ml', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p6-apache-kafka', 'p8-nn-basics'],
  tags: ['Distributed ML', 'Advanced', 'Streaming', 'Kafka'],
  objectives: [
    'Understand streaming ML architecture and components',
    'Implement Kafka producers and consumers for ML data pipelines',
    'Build online inference systems with stateless and stateful processing',
    'Design feature computation on streaming data',
    'Compare lambda and kappa architectures for ML pipelines',
  ],
  theory: `# Streaming ML (Kafka + ML)

## Streaming ML Architecture

Streaming ML processes data in real-time as it arrives, unlike batch ML which processes data in scheduled intervals.

### Key Components

| Component | Role | Example |
|-----------|------|---------|
| **Data Source** | Generates events | User clicks, IoT sensors, transactions |
| **Message Broker** | Buffers and distributes events | Apache Kafka |
| **Stream Processor** | Computes features and runs inference | Kafka Streams, Faust |
| **Model Store** | Serves trained models | MLflow, S3 |
| **Serving Store** | Stores features for inference | Redis, Cassandra |

## Apache Kafka

Kafka is a distributed event streaming platform with four core APIs:

### Topics and Partitions

A topic is a logical channel for related events. Each topic is split into **partitions** for parallelism:

$$\\text{Throughput} \\propto \\text{Partitions} \\times \\text{Consumer Group Size}$$

- **Partitions**: Ordered, immutable sequence of records
- **Offset**: Unique ID for each record within a partition
- **Replication**: Partitions are replicated across brokers for fault tolerance

### Producers

Producers write records to topics:

$$\\text{Record} = \\text{Key} + \\text{Value} + \\text{Timestamp} + \\text{Headers}$$

- **Key**: Determines partition assignment (same key → same partition, preserving order)
- **Value**: The actual data payload (JSON, Avro, Protobuf)
- **Acks**: 0 (fire-and-forget), 1 (leader write), all (full ISR replication)

### Consumers and Consumer Groups

Consumers read records from topics. A **consumer group** enables parallel processing:

| Consumer Group Size | Partitions | Behavior |
|-------------------|------------|----------|
| 1 consumer | N partitions | Reads all partitions |
| N consumers | N partitions | Each reads one partition (ideal) |
| M > N consumers | N partitions | M-N consumers idle |

### Offsets

Kafka tracks consumer offset per partition:

- **Auto-commit**: Periodic offset commit (at-least-once semantics)
- **Manual commit**: Application controls exactly when to commit
- **Seek**: Reset to specific offset for replay

## Kafka Streams vs ksqlDB

| Feature | Kafka Streams | ksqlDB |
|---------|---------------|--------|
| Interface | Java/Scala library | SQL-like query language |
| State Management | RocksDB (embedded) | Kafka topics |
| Processing | Custom processors | Declarative queries |
| ML Integration | Embed models in processors | UDFs for inference |
| Operations | Deploy as any JAR | Standalone server |

### Kafka Streams DSL

$$\\text{Stream} \\rightarrow \\text{map} \\rightarrow \\text{filter} \\rightarrow \\text{aggregate} \\rightarrow \\text{Table}$$

- **KStream**: Record stream (each record processed independently)
- **KTable**: Changelog stream (latest value per key)
- **GlobalKTable**: Full KTable replicated to all instances

## Feature Computation on Streams

### Stateless Features

Features computed per-event without history:

$$f(x_t) = g(x_t) \\text{ where } g \\text{ is independent of } x_{<t}$$

Examples:
- Token count of text
- Transaction amount binning
- Timestamp to day-of-week encoding
- URL length, domain extraction

### Stateful Features

Features requiring historical context:

$$f(x_t) = h(x_t, \\text{state}_{t-1})$$

Examples:
- Rolling average of last 10 transactions
- Count of events in a time window (tumbling, hopping, sliding)
- Rate of change over last hour
- User session features (pages visited, time spent)

### Window Types

| Window | Description | Use Case |
|--------|-------------|----------|
| **Tumbling** | Fixed non-overlapping windows | Hourly aggregates |
| **Hopping** | Fixed overlapping windows | Rolling 10-min averages |
| **Sliding** | Windows triggered by each event | Real-time monitoring |
| **Session** | Windows based on activity gaps | User session analysis |

## Online Inference

### Stateless Inference

Each prediction is independent of past predictions:

$$y_t = f_{\\theta}(x_t)$$

- **Pros**: Simple, stateless, horizontally scalable
- **Cons**: No temporal context
- **Use case**: Simple classification (spam detection)

### Stateful Inference

Predictions depend on model state updated by each observation:

$$y_t = f_{\\theta}(x_t, s_{t-1}); \\quad s_t = g_{\\theta}(x_t, s_{t-1})$$

- **Pros**: Captures temporal dynamics
- **Cons**: State management complexity
- **Use case**: Anomaly detection, RNN inference

## Model Updating on Streams

### Concept Drift

The statistical properties of the target variable change over time:

$$P(Y|X)_{t_1} \\neq P(Y|X)_{t_2}$$

### Detection Methods

- **DDM**: Drift Detection Method (monitor error rate)
- **ADWIN**: Adaptive Windowing (change detection in data streams)
- **KS Test**: Kolmogorov-Smirnov test on feature distributions
- **Error Rate Monitor**: Track prediction accuracy over sliding windows

### Online Learning

Update model incrementally as new data arrives:

$$\\theta_{t+1} = \\theta_t - \\eta \\nabla_{\\theta} L(y_t, f_{\\theta}(x_t))$$

Algorithms: SGD, Online Random Forest, Hoeffding Trees, Vowpal Wabbit

## Streaming Evaluation

Track model performance on streams:

\\begin{align*}
&\\text{Accuracy}_t = \\frac{1}{W} \\sum_{i=t-W}^{t} \\mathbb{I}(y_i = \\hat{y}_i) \\\\
&\\text{Latency}_t = \\text{avg}(\\text{inference time per request})
\\end{align*}

- **Delayed Labels**: Use estimated labels or time-shifted evaluation
- **Pre-Quential**: Evaluate on each point before using it for update

## Lambda vs Kappa Architecture

### Lambda Architecture

$$\\text{Result} = \\text{Batch Layer} + \\text{Speed Layer}$$

1. **Batch Layer**: Accurate but slow (Spark, Hive)
2. **Speed Layer**: Approximate but fast (Kafka Streams)
3. **Serving Layer**: Combines results (Cassandra, Redis)

**Problem**: Maintain two code paths — batch and streaming.

### Kappa Architecture

$$\\text{Result} = \\text{Single Stream Processing Layer}$$

- Everything is a stream (including historical data replay)
- Single codebase for both real-time and historical
- Replay capability for backtesting and retraining`,
  understanding: {
    analogy: 'A river (data stream) with monitoring stations (ML models) that analyze water quality in real-time. The river flows continuously — sometimes calm, sometimes rapid. Monitoring stations at different points measure temperature, pH, and pollutants (features) and instantly flag contamination (inference). If the water source changes (concept drift), the stations recalibrate their sensors (model update). Historical data is stored in reservoirs (data lakes) for periodic analysis (batch layer).',
    steps: [
      { title: 'Set Up Data Stream', content: 'Configure Kafka topic with appropriate partitions and replication. Producers send events (transactions, clicks, sensor readings) to the topic. Each event has a key for partitioning and a value payload.' },
      { title: 'Compute Streaming Features', content: 'Use a stream processor (Kafka Streams, Faust) to compute features. Stateless features are computed per-event. Stateful features use windowed aggregation with state stores (RocksDB).' },
      { title: 'Deploy Online Model', content: 'Load a pre-trained model into the streaming application. For stateless inference, the model runs independently per event. For stateful inference, maintain model state across events.' },
      { title: 'Monitor and Evaluate', content: 'Track prediction accuracy, feature distributions, and latency in real-time. Use dashboarding (Grafana) and alerting for concept drift and performance degradation.' },
      { title: 'Update and Iterate', content: 'Retrain models on accumulated streaming data. Use the kappa architecture to replay historical streams through new models for backtesting before deployment.' },
    ],
    misconceptions: [
      { misconception: 'Streaming ML replaces batch ML entirely', truth: 'Streaming ML handles real-time inference but batch ML is still needed for training, evaluation, and complex analytics. The kappa architecture unifies both, but batch layers are simpler for non-streaming workloads.' },
      { misconception: 'Kafka guarantees exactly-once processing for ML pipelines', truth: 'Exactly-once semantics in Kafka apply to consumer offsets, not to downstream side effects (database writes, API calls). ML pipelines must handle duplicate events through idempotency.' },
      { misconception: 'Streaming features are just batch features computed faster', truth: 'Streaming features must be computable incrementally. Many batch features (quantiles, complex joins) are difficult or impossible to compute in a single pass over a stream.' },
    ],
    comparisons: [
      { label: 'Latency', methodA: 'Batch: Hours to days', methodB: 'Streaming: Milliseconds to seconds' },
      { label: 'Data Volume', methodA: 'Batch: Petabytes (periodic)', methodB: 'Streaming: GB/s (continuous)' },
      { label: 'Model Freshness', methodA: 'Batch: Retrained daily/weekly', methodB: 'Streaming: Continuously updated' },
      { label: 'Complexity', methodA: 'Batch: Simpler infra, easier debugging', methodB: 'Streaming: Complex state management, hard to reproduce' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `from confluent_kafka import Producer, Consumer
import json
import numpy as np
from datetime import datetime
import time

# ------------------------------------------------
# Kafka Producer: Sends transaction events
# ------------------------------------------------
def create_producer():
    return Producer({
        'bootstrap.servers': 'localhost:9092',
        'acks': 'all',
        'retries': 3,
    })

def delivery_report(err, msg):
    if err:
        print(f"Delivery failed: {err}")
    else:
        print(f"Delivered to {msg.topic()} [{msg.partition()}] @ {msg.offset()}")

def produce_transactions():
    producer = create_producer()
    
    for i in range(100):
        event = {
            'transaction_id': f'txn_{i}',
            'user_id': f'user_{np.random.randint(1, 100)}',
            'amount': round(np.random.exponential(50), 2),
            'timestamp': datetime.now().isoformat(),
            'merchant': np.random.choice(['amazon', 'walmart', 'target']),
            'device': np.random.choice(['mobile', 'desktop']),
        }
        
        # Key determines partition (same user -> same partition)
        key = event['user_id']
        value = json.dumps(event)
        
        producer.produce(
            'transactions',
            key=key,
            value=value,
            callback=delivery_report,
        )
        producer.poll(0)  # Trigger delivery callbacks
        time.sleep(0.1)
    
    producer.flush()

# ------------------------------------------------
# Kafka Consumer: Processes events for ML inference
# ------------------------------------------------
def create_consumer(group_id):
    return Consumer({
        'bootstrap.servers': 'localhost:9092',
        'group.id': group_id,
        'auto.offset.reset': 'earliest',
        'enable.auto.commit': True,
        'auto.commit.interval.ms': 5000,
    })

def consume_for_inference():
    consumer = create_consumer('ml-inference-group')
    consumer.subscribe(['transactions'])
    
    # Load pre-trained model (simulated)
    model = lambda features: np.random.choice([0, 1], p=[0.9, 0.1])
    
    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                print(f"Error: {msg.error()}")
                continue
            
            event = json.loads(msg.value())
            
            # Feature extraction
            features = np.array([
                event['amount'],
                len(event['merchant']),
                1.0 if event['device'] == 'mobile' else 0.0,
            ])
            
            # Online inference
            prediction = model(features)
            risk_score = float(np.random.random())
            
            print(f"Transaction {event['transaction_id']}: "
                  f"Amount=\${event['amount']:.2f}, "
                  f"Fraud={bool(prediction)}, "
                  f"Risk={risk_score:.3f}")
            
    except KeyboardInterrupt:
        pass
    finally:
        consumer.close()

# Run: produce_transactions() or consume_for_inference()`,
      output: `# Producer output:
Delivered to transactions [3] @ 0
Delivered to transactions [1] @ 0
Delivered to transactions [2] @ 0
...

# Consumer output:
Transaction txn_0: Amount=$45.23, Fraud=False, Risk=0.234
Transaction txn_1: Amount=$123.45, Fraud=True, Risk=0.891
Transaction txn_2: Amount=$12.10, Fraud=False, Risk=0.123`,
      explanation: 'Basic Kafka producer sends transaction events with user_id as the key (ensuring all transactions for a user go to the same partition, preserving order). The consumer reads events in real-time, extracts features, and runs simple batch inference. This is stateless inference — each prediction is independent.',
    },
    {
      level: 'intermediate',
      code: `import faust
import json
import numpy as np
from datetime import datetime, timedelta
from typing import List, Optional

# Faust streaming application
app = faust.App(
    'ml-stream-processor',
    broker='kafka://localhost:9092',
    value_serializer='json',
    store='rocksdb://',
    version=1,
)

# Define stream schema
class Transaction(faust.Record):
    transaction_id: str
    user_id: str
    amount: float
    timestamp: str
    merchant: str
    device: str

class UserFeatures(faust.Record):
    user_id: str
    avg_amount_1h: float = 0.0
    transaction_count_1h: int = 0
    total_amount_1h: float = 0.0
    mobile_ratio: float = 0.0
    last_updated: str = ""

# Stream topic
transactions_topic = app.topic('transactions', value_type=Transaction)

# Stateful feature table (keyed by user_id)
user_features = app.Table('user_features', default=UserFeatures, partitions=4)

@app.agent(transactions_topic)
async def process_transactions(stream):
    async for txn in stream:
        # Update sliding window features (1-hour tumbling window)
        current_time = datetime.fromisoformat(txn.timestamp)
        window_start = current_time - timedelta(hours=1)
        
        # Get current state
        features = user_features[txn.user_id]
        
        # Update windowed statistics
        features.transaction_count_1h += 1
        features.total_amount_1h += txn.amount
        features.avg_amount_1h = (
            features.total_amount_1h / features.transaction_count_1h
        )
        features.mobile_ratio = (
            (features.mobile_ratio * (features.transaction_count_1h - 1) +
             (1.0 if txn.device == 'mobile' else 0.0)) /
            features.transaction_count_1h
        )
        features.last_updated = txn.timestamp
        
        # Save updated state
        user_features[txn.user_id] = features
        
        # Compute feature vector for ML
        feature_vector = np.array([
            txn.amount,
            features.avg_amount_1h,
            features.transaction_count_1h,
            features.mobile_ratio,
        ])
        
        # Stateful inference (threshold-based anomaly detection)
        z_score = abs(txn.amount - features.avg_amount_1h) / max(
            features.avg_amount_1h * 0.5, 0.01
        )
        is_anomaly = z_score > 3.0
        
        if is_anomaly:
            print(f"ANOMALY: {txn.user_id} "
                  f"Amount={txn.amount:.2f} "
                  f"Avg={features.avg_amount_1h:.2f} "
                  f"Z={z_score:.2f}")

@app.task
async def cleanup_old_state():
    """Periodic cleanup of stale state."""
    while True:
        await asyncio.sleep(3600)  # Every hour
        cutoff = (datetime.now() - timedelta(hours=24)).isoformat()
        async for user_id, features in user_features.items():
            if features.last_updated < cutoff:
                del user_features[user_id]`,
      output: `# Faust streaming application output:
ANOMALY: user_42 Amount=5432.10 Avg=67.23 Z=81.23
ANOMALY: user_17 Amount=2345.67 Avg=89.45 Z=25.67
...

# State store (RocksDB) is persisted to disk for fault recovery
# Kafka consumer group: ml-stream-processor
# Topics: transactions (input), __faust-* (internal state)`,
      explanation: 'Faust streaming application with stateful feature computation. User transaction statistics are maintained in RocksDB-backed tables keyed by user_id. Sliding window features (1-hour averages, counts, ratios) are updated incrementally as each event arrives. Anomaly detection uses Z-scores against the user\'s historical average.',
    },
    {
      level: 'advanced',
      code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio
from typing import Dict, List, Optional
from datetime import datetime
import json
import numpy as np
from confluent_kafka import Producer, Consumer
import joblib
from dataclasses import dataclass

# FastAPI online inference service
app = FastAPI(title="Streaming ML Service")

# Kafka producer for writing predictions back
producer = Producer({'bootstrap.servers': 'localhost:9092'})

# Model registry (loaded from model store)
models: Dict[str, object] = {}

# Streaming feature cache (Redis in production)
feature_cache: Dict[str, Dict] = {}

# Request/Response schemas
class PredictionRequest(BaseModel):
    user_id: str
    features: Dict[str, float]
    timestamp: Optional[str] = None

class PredictionResponse(BaseModel):
    user_id: str
    prediction: float
    probability: float
    model_version: str
    latency_ms: float

# Model loading on startup
@app.on_event("startup")
async def load_models():
    # In production, load from model registry (MLflow, S3)
    models["fraud_v1"] = {
        "coef": np.array([0.5, -0.3, 0.8, 0.1]),
        "intercept": -2.0,
        "threshold": 0.5,
        "version": "1.0.0",
    }
    models["fraud_v2"] = {
        "coef": np.array([0.6, -0.2, 0.9, 0.15]),
        "intercept": -1.8,
        "threshold": 0.5,
        "version": "2.0.0",
    }

def predict_logistic(features: np.ndarray, model: Dict) -> tuple:
    """Logistic regression prediction with probability."""
    logit = features @ model["coef"] + model["intercept"]
    probability = 1.0 / (1.0 + np.exp(-logit))
    prediction = float(probability >= model["threshold"])
    return prediction, float(probability)

# Streaming inference endpoint
@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    import time
    start = time.time()
    
    user_id = request.user_id
    model_version = "fraud_v2"
    model = models.get(model_version)
    
    if model is None:
        raise HTTPException(404, "Model not found")
    
    # Build feature vector
    feature_names = ["amount", "frequency", "recency", "device_score"]
    feature_vector = np.array([
        request.features.get(f, 0.0) for f in feature_names
    ])
    
    # Run inference
    prediction, probability = predict_logistic(feature_vector, model)
    
    latency = (time.time() - start) * 1000
    
    # Publish prediction to Kafka for monitoring
    prediction_event = {
        "user_id": user_id,
        "prediction": prediction,
        "probability": probability,
        "timestamp": datetime.now().isoformat(),
        "latency_ms": latency,
    }
    producer.produce(
        "predictions",
        key=user_id,
        value=json.dumps(prediction_event),
    )
    producer.poll(0)
    
    return PredictionResponse(
        user_id=user_id,
        prediction=prediction,
        probability=probability,
        model_version=model["version"],
        latency_ms=round(latency, 2),
    )

# Streaming consumer for model monitoring
async def monitor_predictions():
    consumer = Consumer({
        'bootstrap.servers': 'localhost:9092',
        'group.id': 'monitoring-group',
        'auto.offset.reset': 'latest',
    })
    consumer.subscribe(['predictions'])
    
    window: List[Dict] = []
    
    while True:
        msg = consumer.poll(1.0)
        if msg is None:
            continue
        if msg.error():
            continue
        
        event = json.loads(msg.value())
        window.append(event)
        
        # Sliding window evaluation (last 1000 predictions)
        if len(window) > 1000:
            window.pop(0)
        
        if len(window) >= 100:
            fraud_rate = sum(e["prediction"] for e in window) / len(window)
            avg_latency = sum(e["latency_ms"] for e in window) / len(window)
            print(f"Fraud Rate: {fraud_rate:.3f} | "
                  f"Avg Latency: {avg_latency:.1f}ms | "
                  f"Window: {len(window)}")

# Kappa architecture: replay historical data
@app.post("/replay")
async def replay_stream(start_offset: int, end_offset: int):
    """Replay historical stream for backtesting."""
    consumer = Consumer({
        'bootstrap.servers': 'localhost:9092',
        'group.id': f'replay-{datetime.now().timestamp()}',
        'auto.offset.reset': 'earliest',
    })
    consumer.assign([
        TopicPartition('transactions', p, start_offset)
        for p in range(4)  # 4 partitions
    ])
    
    results = {"total": 0, "fraud": 0, "latencies": []}
    
    while True:
        msg = consumer.poll(0.1)
        if not msg:
            break
        
        event = json.loads(msg.value())
        features = np.array([event["amount"], 1.0, 0.0, 0.5])
        pred, prob = predict_logistic(features, models["fraud_v2"])
        
        results["total"] += 1
        results["fraud"] += pred
    
    consumer.close()
    return results`,
      output: `# FastAPI inference endpoint:
# POST /predict
# {"user_id": "user_42", "features": {"amount": 500.0, "frequency": 0.8, "recency": 0.1, "device_score": 0.9}}

# Response:
{
    "user_id": "user_42",
    "prediction": 1.0,
    "probability": 0.873,
    "model_version": "2.0.0",
    "latency_ms": 12.34
}

# Monitoring output:
Fraud Rate: 0.123 | Avg Latency: 14.2ms | Window: 100
Fraud Rate: 0.118 | Avg Latency: 13.8ms | Window: 100

# Replay results:
{"total": 50000, "fraud": 5234, "latencies": [12.3, 11.8, ...]}`,
      explanation: 'Production streaming ML system with three components: FastAPI inference endpoint (online predictions with sub-100ms latency), Kafka-based prediction monitoring (sliding window evaluation of fraud rate and latency), and Kappa architecture replay capability (backtest models on historical streams). Predictions are published back to Kafka for downstream monitoring and model drift detection.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Real-Time Fraud Detection', description: 'Banks process millions of credit card transactions per day through Kafka-based streaming ML pipelines. Models score each transaction in under 50ms with features computed from rolling windows of user behavior.' },
      { industry: 'IoT Anomaly Detection', description: 'Manufacturing plants use Kafka to collect sensor data from thousands of machines. Streaming ML models detect equipment anomalies in real-time, triggering maintenance alerts before failures occur.' },
      { industry: 'Personalization at Edge', description: 'Streaming platforms (Netflix, Spotify) use Kafka to process user interaction events and update recommendation models in near-real-time, adapting to changing user preferences within minutes.' },
    ],
    caseStudy: {
      problem: 'A payment company\'s batch fraud detection system had a 24-hour delay between transaction and fraud flagging. Fraudsters exploited this window, causing $2M in monthly losses. They needed real-time detection with <100ms latency.',
      solution: 'They built a Kafka-based streaming ML pipeline. Transactions flowed through Kafka topics, features were computed in Faust with sliding windows (user velocity, amount deviation, device fingerprints), and a logistic regression model scored each transaction in <50ms via a FastAPI service.',
      results: 'Fraud detection latency dropped from 24 hours to 50ms. Fraud losses decreased by 78% in the first month. The streaming pipeline processed 50K transactions/second on a 6-node Kafka cluster with 99.99% uptime.',
    },
    bestPractices: [
      'Use Kafka keys for event ordering — same key guarantees same partition and order',
      'Choose message format (Avro/Protobuf) with schema registry for evolution',
      'Make inference services idempotent to handle duplicate Kafka messages',
      'Use sliding windows for features, not unbounded state',
      'Monitor prediction distribution drift (PSI) alongside feature drift',
      'Separate model training (batch) from model serving (streaming)',
      'Use dead-letter topics for failed predictions to avoid data loss',
    ],
    tools: ['Apache Kafka', 'Kafka Streams', 'ksqlDB', 'Faust', 'FastAPI', 'Redis', 'RocksDB', 'MLflow', 'Grafana'],
    jobRoles: ['Streaming ML Engineer', 'ML Platform Engineer', 'Data Infrastructure Engineer', 'Real-Time ML Engineer'],
    furtherReading: [
      'Kafka: The Definitive Guide (Confluent)',
      'Streaming Systems (Akidau, Chernyak, Lax)',
      'Faust Documentation (faust.readthedocs.io)',
      'Kappa Architecture (Jay Kreps, O\'Reilly)',
    ],
  },
  quiz: [
    {
      id: 'p17-sm-1', type: 'mcq',
      question: 'What is the key difference between stateless and stateful streaming feature computation?',
      options: [
        'Stateless features are faster but less accurate; stateful features are slower but more accurate',
        'Stateless features are computed per-event without history; stateful features require maintaining context across events',
        'Stateless features require GPUs; stateful features run on CPUs',
        'There is no difference — all streaming features are inherently stateful',
      ],
      correctAnswer: 'Stateless features are computed per-event without history; stateful features require maintaining context across events',
      explanation: 'Stateless features (e.g., transaction amount) are computed independently for each event. Stateful features (e.g., rolling 1-hour average) require maintaining state across multiple events using state stores like RocksDB.',
    },
    {
      id: 'p17-sm-2', type: 'truefalse',
      question: 'In Kafka, using the same message key guarantees that messages are sent to the same partition, preserving order for that key.',
      correctAnswer: 'True',
      explanation: 'Kafka uses the hash of the message key to determine partition assignment. The same key always maps to the same partition, ensuring messages with the same key (e.g., same user_id) are processed in order within that partition.',
    },
    {
      id: 'p17-sm-3', type: 'code',
      question: 'In the Faust code below, what type of window is being maintained?',
      code: `features = user_features[txn.user_id]
features.transaction_count_1h += 1
features.total_amount_1h += txn.amount
features.avg_amount_1h = features.total_amount_1h / features.transaction_count_1h`,
      options: [
        'A sliding window that decays old data exponentially',
        'A cumulative count since the application started (unbounded state)',
        'A 1-hour tumbling window being emulated through manual updates',
        'A session window based on user inactivity gaps',
      ],
      correctAnswer: 'A cumulative count since the application started (unbounded state)',
      explanation: 'This code accumulates state indefinitely — it never resets. The variable is named "1h" but there is no actual time-based windowing logic. Proper windowing requires expiration or explicit window boundaries.',
    },
    {
      id: 'p17-sm-4', type: 'fillblank',
      question: 'The architecture that processes all data (historical and real-time) through a single stream processing pipeline is called ___.',
      correctAnswer: 'Kappa architecture',
      explanation: 'Kappa architecture uses a single stream processing engine for both historical replay and real-time data. This eliminates the need to maintain separate batch and stream processing code paths (unlike Lambda architecture).',
    },
    {
      id: 'p17-sm-5', type: 'match',
      question: 'Match each streaming concept with its description:',
      pairs: [
        { left: 'Kafka Partition', right: 'Ordered, immutable sequence of records within a topic' },
        { left: 'Consumer Group', right: 'Set of consumers that divide partitions among themselves' },
        { left: 'Concept Drift', right: 'Change in statistical properties of target variable over time' },
        { left: 'Sliding Window', right: 'Moving time window updated with each new event' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Partitions enable parallelism within Kafka topics. Consumer groups allow horizontal scaling of consumption. Concept drift requires model retraining. Sliding windows enable continuous feature computation.',
    },
  ],
}))

export {}
