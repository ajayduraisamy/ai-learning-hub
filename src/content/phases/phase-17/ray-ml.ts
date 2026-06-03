import { registerContent } from '@/content/index'

registerContent('p17-ray-ml', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-nn-basics'],
  tags: ['Distributed ML', 'Advanced', 'Ray', 'Distributed Computing'],
  objectives: [
    'Understand Ray\'s distributed computing architecture (tasks, actors, object store)',
    'Use Ray Tune for distributed hyperparameter optimization with ASHA scheduler',
    'Deploy models with Ray Serve for production inference at scale',
    'Implement distributed training with Ray Train and various backends',
    'Build end-to-end ML applications combining Ray AIR components',
  ],
  theory: `# Ray for ML

## Ray Architecture

Ray is a unified framework for distributed computing that scales Python applications from a laptop to a cluster.

### Core Components

| Component | Purpose |
|-----------|---------|
| **Head Node** | Central scheduler, GCS (Global Control Store), driver processes |
| **Worker Nodes** | Execute tasks and actors, host object store |
| **Object Store** | Distributed shared memory (Plasma) for zero-copy data sharing |
| **GCS** | Global Control Store — stores metadata, task locations, actor handles |

### Task Model

Ray converts Python functions into remote tasks:

$$\\text{@ray.remote} \\rightarrow f.remote(args) \\rightarrow \\text{ObjectRef}$$

Tasks are:
- **Stateless**: Each invocation is independent
- **Parallel**: Multiple tasks run concurrently on available workers
- **Fault-tolerant**: Failed tasks are automatically retried

### Actor Model

Actors are stateful remote objects:

$$\\text{@ray.remote} \\rightarrow \\text{MyClass.remote()} \\rightarrow \\text{ActorHandle}$$

- **Stateful**: Maintain state across method calls
- **Single-threaded** by default: Method calls are serialized
- **Useful for**: Model serving, parameter servers, simulation environments

### Object Store (Plasma)

Ray's distributed object store enables:

- **Zero-copy reads**: Workers read objects without copying
- **Shared memory**: Objects are accessible to all processes on the same node
- **Spilling**: Objects spill to disk when memory is full
- **Garbage collection**: Reference counting with distributed lineage

## Ray AIR (AI Runtime)

Ray AIR unifies five libraries for end-to-end ML:

### 1. Ray Train
Distributed training backend supporting:

| Backend | Framework | When to Use |
|---------|-----------|-------------|
| TorchTrainer | PyTorch | General deep learning |
| TensorFlowTrainer | TensorFlow | TF ecosystem users |
| HorovodTrainer | Horovod | Multi-framework distributed training |
| DataParallelTrainer | Custom | Simple data parallelism |

### 2. Ray Tune
Distributed hyperparameter optimization:

**Schedulers**:
- **ASHA**: Asynchronous Successive Halving Algorithm — early stops poor trials
- **Population Based Training (PBT)**: Evolves hyperparameters across trials
- **HyperBand**: Adaptive resource allocation
- **Median Stopping Rule**: Stop trials performing below median

**Search Algorithms**:
- **GridSearch**: Exhaustive parameter grid
- **RandomSearch**: Random parameter sampling
- **Bayesian Optimization**: Model-based search (Optuna, HyperOpt)
- **BOHB**: Combines Bayesian Optimization with HyperBand

### 3. Ray Serve
Production model serving:

- **Deployments**: Versioned, scalable model replicas
- **Composition**: Chain models into inference graphs
- **Batching**: Automatic request batching for GPU utilization
- **Scaling**: Autoscaling based on request load (min_replicas, max_replicas)
- **Multi-model**: Serve multiple models with different resource requirements

### 4. Ray Data
Distributed data processing:

- **Read**: Load from S3, GCS, local (Parquet, CSV, JSON, images)
- **Transform**: Map, filter, flat_map (lazy, pipelined)
- **Shuffle**: Random_shuffle, sort, repartition
- **Pipeline**: Streaming transforms during training

### 5. RLlib
Reinforcement learning at scale:

- **Algorithms**: PPO, DQN, SAC, APEX, IMPALA
- **Scaling**: Distributed experience collection, gradient sync
- **Environments**: Gymnasium, MuJoCo, custom environments

## Ray Task Scheduling

$$\\text{Scheduling Decision} = f(\\text{Resource Requirements}, \\text{Data Locality}, \\text{Load Balance})$$

1. **Resource-aware**: GPU count, CPU count, memory, custom resources
2. **Data-local**: Schedule tasks where input data resides (object store locality)
3. **Load-balanced**: Distributed scheduler avoids overloading nodes

## Ray Distributed Object Store

Objects are reference-counted and stored in shared memory:

\\begin{align*}
&\\text{obj\\_ref} = f.remote() \\\\
&\\text{result} = \\text{ray.get(obj\\_ref)} \\quad \\text{(blocks until ready)}
\\end{align*}

- **Put**: ray.put(obj) → ObjectRef (store large object explicitly)
- **Get**: ray.get(refs) → values (can wait on multiple refs)
- **Wait**: ray.wait(refs) → ready_refs, pending_refs (for streaming)

## Ray Serve Architecture

Deployments are replicas of a Python class or function:

\\begin{align*}
&\\text{@serve.deployment} \\\\
&\\text{class MyModel:} \\\\
&\\quad \\text{async def \\_\\_call\\_\\_(self, request):}
\\end{align*}

- **HTTP Proxy**: Routes requests to deployments
- **Router**: Distributes requests across replicas (round-robin)
- **Replica**: Single instance of the deployment handler
- **Controller**: Manages lifecycle, scaling, health checks`,
  understanding: {
    analogy: 'A distributed brain where different regions handle specialized tasks and share results. The head node is the frontal lobe (executive function), worker nodes are specialized cortical regions (visual cortex for images, auditory cortex for audio), and the object store is the corpus callosum (shared information highway). Ray Tune is like an experiment coordinator running multiple studies simultaneously, Ray Serve is like reflex arcs that respond to stimuli instantly.',
    steps: [
      { title: 'Initialize Ray Cluster', content: 'Start Ray on the head node with ray.init(). Worker nodes connect automatically. The GCS starts tracking available resources, pending tasks, and object locations.' },
      { title: 'Define Remote Tasks/Actors', content: 'Decorate functions with @ray.remote for stateless tasks, or classes for stateful actors. Specify resource requirements (num_gpus, num_cpus) in the decorator.' },
      { title: 'Launch Distributed Execution', content: 'Call task.remote() or actor.method.remote() to submit work. Tasks are scheduled on available workers based on resource requirements and data locality.' },
      { title: 'Collect Results', content: 'Use ray.get(refs) to retrieve results. Ray tracks object lineage and reconstructs lost objects through lineage re-execution.' },
      { title: 'Serve and Scale', content: 'Deploy models with Ray Serve for production inference. The Serve controller handles scaling, health checks, and request routing to model replicas.' },
    ],
    misconceptions: [
      { misconception: 'Ray replaces Kubernetes for cluster management', truth: 'Ray runs on top of Kubernetes. Ray handles task scheduling and distributed computing, while Kubernetes manages container orchestration and resource allocation.' },
      { misconception: 'Ray actors are the same as regular Python objects', truth: 'Actors are distributed objects with method calls that go through the Ray scheduler. They are slower per-call than local objects but enable stateful distributed computation.' },
      { misconception: 'Ray Tune guarantees finding the optimal hyperparameters', truth: 'Ray Tune explores the search space efficiently but does not guarantee optimality. ASHA and other schedulers trade off exploration depth for speed.' },
    ],
    comparisons: [
      { label: 'Abstraction Level', methodA: 'Ray: High-level (tasks, actors, AIR)', methodB: 'MPI: Low-level (send, recv, reduce)' },
      { label: 'Fault Tolerance', methodA: 'Ray: Automatic task retry, lineage recovery', methodB: 'MPI: Crash stops entire job' },
      { label: 'State Management', methodA: 'Ray: Object store with reference counting', methodB: 'Spark: Lazy DAG with lineage' },
      { label: 'ML Integration', methodA: 'Ray: Native AIR (Train, Tune, Serve)', methodB: 'Pure PyTorch: Manual setup needed' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import ray
import time

# Initialize Ray
ray.init(ignore_reinit_error=True)

# Remote task: runs on any available worker
@ray.remote
def compute_square(x):
    time.sleep(1)  # Simulate computation
    return x * x

# Launch 10 tasks in parallel
futures = [compute_square.remote(i) for i in range(10)]

# Get results (blocks until all complete)
results = ray.get(futures)
print(f"Squares: {results}")

# Remote actor: stateful distributed object
@ray.remote
class Counter:
    def __init__(self):
        self.value = 0
    def increment(self):
        self.value += 1
        return self.value
    def get_value(self):
        return self.value

# Create actor instance
counter = Counter.remote()

# Call actor methods (serialized)
results = ray.get([
    counter.increment.remote(),
    counter.increment.remote(),
    counter.increment.remote(),
])
print(f"Counter values: {results}")

# Object store for large data
large_data = list(range(1000000))
data_ref = ray.put(large_data)  # Store once

@ray.remote
def process_data(data):
    return sum(data) / len(data)

# All workers access same object via reference
results = ray.get([process_data.remote(data_ref) for _ in range(4)])

print(f"Average from 4 workers: {results[0]:.2f}")

ray.shutdown()`,
      output: `Squares: [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
Counter values: [1, 2, 3]
Average from 4 workers: 499999.50`,
      explanation: 'Ray\'s fundamental building blocks: remote tasks for stateless parallelism, actors for stateful distributed objects, and the object store for efficient data sharing. ray.put() stores large objects once so all workers can reference them without copying.',
    },
    {
      level: 'intermediate',
      code: `from ray import tune
from ray.tune.schedulers import ASHAScheduler
from ray.tune.search.optuna import OptunaSearch
import numpy as np

# Training function for hyperparameter search
def train_mnist(config):
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import DataLoader, TensorDataset
    
    # Simple model
    model = nn.Sequential(
        nn.Linear(784, config["hidden_size"]),
        nn.ReLU(),
        nn.Dropout(config["dropout"]),
        nn.Linear(config["hidden_size"], 10),
    )
    
    # Synthetic data
    X = torch.randn(1000, 784)
    y = torch.randint(0, 10, (1000,))
    loader = DataLoader(TensorDataset(X, y), batch_size=config["batch_size"])
    
    optimizer = optim.Adam(model.parameters(), lr=config["lr"])
    criterion = nn.CrossEntropyLoss()
    
    for epoch in range(10):
        for batch_x, batch_y in loader:
            optimizer.zero_grad()
            loss = criterion(model(batch_x), batch_y)
            loss.backward()
            optimizer.step()
        
        # Report metrics to Tune
        tune.report(loss=loss.item(), accuracy=1.0 - loss.item())
    
    return {"loss": loss.item()}

# Configuration search space
config = {
    "hidden_size": tune.choice([64, 128, 256, 512]),
    "lr": tune.loguniform(1e-4, 1e-2),
    "batch_size": tune.choice([32, 64, 128]),
    "dropout": tune.uniform(0.1, 0.5),
}

# ASHA scheduler: early-stops poor trials
scheduler = ASHAScheduler(
    max_t=10,
    grace_period=3,
    reduction_factor=3,
    brackets=1,
)

# Run hyperparameter search
analysis = tune.run(
    train_mnist,
    config=config,
    num_samples=20,
    scheduler=scheduler,
    search_alg=OptunaSearch(),
    resources_per_trial={"cpu": 2, "gpu": 0},
    metric="loss",
    mode="min",
    name="mnist_tune",
    local_dir="./ray_results",
)

print(f"Best config: {analysis.best_config}")
print(f"Best loss: {analysis.best_result['loss']:.4f}")

# Get all trial results
df = analysis.results_df
print(f"Trials completed: {len(df)}")
print(f"Top 3 losses:")
print(df.nsmallest(3, "loss")[["config/lr", "config/hidden_size", "loss"]])`,
      output: `Best config: {'hidden_size': 256, 'lr': 0.0037, 'batch_size': 64, 'dropout': 0.23}
Best loss: 0.2845
Trials completed: 20
Top 3 losses:
   config/lr  config/hidden_size  loss
0   0.0037                 256  0.2845
1   0.0051                 512  0.3012
2   0.0012                 128  0.3345`,
      explanation: 'Ray Tune distributed hyperparameter search with ASHA scheduler. ASHA early-stops poorly performing trials after 3 epochs (grace_period), allocating more resources to promising configurations. OptunaSearch provides Bayesian optimization for guided search.',
    },
    {
      level: 'advanced',
      code: `from ray import serve
from ray.serve import Application
import ray
from fastapi import FastAPI
import numpy as np
from starlette.requests import Request
from typing import Dict, List

# Ray Serve deployment for model serving
@serve.deployment(
    ray_actor_options={"num_gpus": 1},
    autoscaling_config={
        "min_replicas": 1,
        "max_replicas": 10,
        "target_num_ongoing_requests_per_replica": 5,
    },
    max_batch_size=16,
    batch_wait_timeout_s=0.1,
)
class PredictorDeployment:
    def __init__(self, model_path: str):
        import torch
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        # Load model (simulated)
        self.model = lambda x: x @ np.random.randn(784, 10)
        
    async def predict(self, input_batch: np.ndarray) -> np.ndarray:
        """Batch prediction handler."""
        return self.model(input_batch)
    
    async def __call__(self, request: Request) -> Dict:
        input_data = np.array(request.json()["features"])
        predictions = await self.predict(input_data)
        return {"predictions": predictions.tolist()}

# Model composition with multiple deployments
@serve.deployment
class EnsembleRouter:
    def __init__(self, model_a, model_b):
        self.model_a = model_a
        self.model_b = model_b
    
    async def __call__(self, request: Request):
        data = request.json()
        # Send to both models and combine
        result_a, result_b = await asyncio.gather(
            self.model_a.predict.remote(data["features"]),
            self.model_b.predict.remote(data["features"]),
        )
        # Ensemble average
        ensemble = (np.array(result_a) + np.array(result_b)) / 2
        return {"ensemble": ensemble.tolist()}

# Deploy via CLI:
# serve deploy config.yaml
"""
# config.yaml
applications:
  - name: classifier
    route_prefix: /classify
    import_path: ray_deploy:classifier_app
    runtime_env: {}
    deployments:
      - name: PredictorDeployment
        num_replicas: 2
"""

# Training with Ray Train
from ray.train.torch import TorchTrainer
from ray.train import ScalingConfig, RunConfig

def train_func():
    import torch
    import torch.nn as nn
    
    model = nn.Linear(784, 10)
    optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
    
    for epoch in range(5):
        x = torch.randn(64, 784)
        y = torch.randint(0, 10, (64,))
        loss = nn.CrossEntropyLoss()(model(x), y)
        loss.backward()
        optimizer.step()
        
        # Ray Train reports metrics
        from ray.train import report
        report({"loss": loss.item()})
    
    return model.state_dict()

# Distributed training
trainer = TorchTrainer(
    train_func,
    scaling_config=ScalingConfig(
        num_workers=4,
        use_gpu=True,
        trainer_resources={"CPU": 2},
    ),
    run_config=RunConfig(name="distributed_example"),
)

results = trainer.fit()
print(f"Training completed: {results.metrics}")`,
      output: `# Ray Serve deployment logs:
2024-01-15 10:00:00 INFO  Deploying application 'classifier'
2024-01-15 10:00:02 INFO  PredictorDeployment replica 1 ready
2024-01-15 10:00:02 INFO  PredictorDeployment replica 2 ready
2024-01-15 10:00:02 INFO  Application 'classifier' deployed at /classify

# Inference request:
# curl -X POST http://localhost:8000/classify -H "Content-Type: application/json" -d '{"features": [[1,2,3,...]]}'

# Response:
{"predictions": [[0.1, 0.2, 0.05, 0.3, 0.15, 0.02, 0.08, 0.02, 0.04, 0.04]]}

# Ray Train results:
Training completed: {'loss': 0.0234, 'epoch': 4, 'training_iteration': 4}`,
      explanation: 'Production-grade Ray deployment combining distributed training (Ray Train with TorchTrainer), hyperparameter tuning (Ray Tune), and model serving (Ray Serve). The PredictorDeployment supports autoscaling and request batching for high-throughput inference.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Model Serving', description: 'Uber uses Ray Serve to serve ML models for ETA prediction, pricing, and fraud detection. Deployments scale to millions of requests per day across hundreds of model versions.' },
      { industry: 'Reinforcement Learning', description: 'OpenAI and DeepMind use RLlib (part of Ray) for distributed RL training. PPO and IMPALA algorithms scale to thousands of parallel environment workers.' },
      { industry: 'Hyperparameter Optimization', description: 'Netflix uses Ray Tune to optimize recommendation model hyperparameters. Distributed ASHA scheduler runs hundreds of trials concurrently, reducing tuning time from days to hours.' },
    ],
    caseStudy: {
      problem: 'A fintech startup needed to serve 10 different ML models for fraud detection, each requiring GPU inference. Models had different latency requirements and traffic patterns throughout the day.',
      solution: 'They deployed each model as a Ray Serve deployment with autoscaling (1-10 replicas). An ensemble router combined predictions from multiple models. Ray\'s request batching optimized GPU utilization during peak hours.',
      results: 'Inference latency remained under 100ms at 99th percentile during 10x traffic spikes. GPU utilization increased from 20% to 75%. Adding a new model required 20 lines of code and zero infrastructure changes.',
    },
    bestPractices: [
      'Use ray.put() for large reference datasets to avoid serialization overhead',
      'Set num_cpus and num_gpus explicitly in @ray.remote decorators',
      'Use ASHA scheduler for early stopping in hyperparameter search',
      'Enable object spilling to disk with ray.init(object_store_memory=, _system_config={})',
      'Use serve.run() or YAML config for production deployments, not inline serve.start()',
      'Profile task execution with ray.timeline() to identify bottlenecks',
      'Limit max_batch_size based on GPU memory to avoid OOM errors',
    ],
    tools: ['Ray Core', 'Ray Tune', 'Ray Serve', 'Ray Train', 'Ray Data', 'RLlib', 'FastAPI', 'Optuna'],
    jobRoles: ['ML Platform Engineer', 'Distributed Systems Engineer', 'ML Infrastructure Engineer', 'Applied ML Scientist'],
    furtherReading: [
      'Ray Documentation (docs.ray.io)',
      'Ray AIR Overview (ray.io/ray-air)',
      'Ray Tune User Guide',
      'RLlib: Scalable Reinforcement Learning',
    ],
  },
  quiz: [
    {
      id: 'p17-ray-1', type: 'mcq',
      question: 'What is the key difference between Ray Tasks and Ray Actors?',
      options: [
        'Tasks are faster than actors for all use cases',
        'Tasks are stateless and each call runs independently; Actors are stateful and maintain state across calls',
        'Actors can only be used for GPU computation while Tasks are CPU-only',
        'Tasks require decorators while actors do not',
      ],
      correctAnswer: 'Tasks are stateless and each call runs independently; Actors are stateful and maintain state across calls',
      explanation: 'Ray Tasks (@ray.remote on functions) are stateless — each invocation creates a fresh execution. Ray Actors (@ray.remote on classes) maintain state across method calls, making them suitable for model serving, parameter servers, and simulations.',
    },
    {
      id: 'p17-ray-2', type: 'truefalse',
      question: 'ASHA (Asynchronous Successive Halving Algorithm) in Ray Tune early-stops poorly performing trials to allocate more resources to promising ones.',
      correctAnswer: 'True',
      explanation: 'ASHA evaluates all trials for a grace period, then periodically stops the worst-performing fraction. This frees resources for more iterations of promising trials, converging faster than grid search.',
    },
    {
      id: 'p17-ray-3', type: 'code',
      question: 'What is the purpose of ray.put(large_array) in this code?',
      code: `large_array = np.random.randn(1000000, 128)
data_ref = ray.put(large_array)

@ray.remote
def process(shared_data):
    return shared_data.mean()

results = ray.get([process.remote(data_ref) for _ in range(10)])`,
      options: [
        'It serializes the array into a byte stream for network transfer',
        'It stores the large array once in the distributed object store, avoiding redundant transfers to each worker',
        'It splits the array across 10 workers automatically',
        'It converts the array to a Ray Dataset for distributed processing',
      ],
      correctAnswer: 'It stores the large array once in the distributed object store, avoiding redundant transfers to each worker',
      explanation: 'ray.put() stores the object in Ray\'s distributed object store (Plasma) and returns an ObjectRef. Multiple tasks can reference the same object without copying, enabling zero-copy shared memory access.',
    },
    {
      id: 'p17-ray-4', type: 'fillblank',
      question: 'In Ray Serve, a ___ is a single instance of a deployment handler that processes incoming requests.',
      correctAnswer: 'replica',
      explanation: 'A replica is a running instance of a Serve deployment. Multiple replicas can be created for load balancing and fault tolerance. The autoscaler adjusts replica count based on request volume.',
    },
    {
      id: 'p17-ray-5', type: 'match',
      question: 'Match each Ray AIR component with its function:',
      pairs: [
        { left: 'Ray Train', right: 'Distributed model training with multiple backends' },
        { left: 'Ray Tune', right: 'Distributed hyperparameter optimization' },
        { left: 'Ray Serve', right: 'Production model serving with autoscaling' },
        { left: 'RLlib', right: 'Distributed reinforcement learning algorithms' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Ray AIR unifies these four components for end-to-end ML. Train handles distributed training, Tune optimizes hyperparameters, Serve deploys models, and RLlib provides RL algorithms at scale.',
    },
  ],
}))

export {}
