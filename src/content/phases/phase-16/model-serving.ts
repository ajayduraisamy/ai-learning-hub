import { registerContent } from '@/content/index'

registerContent('p16-model-serving', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-transformers'],
  tags: ['MLOps', 'Advanced', 'Topic'],
  objectives: [
    'Understand model serving patterns: real-time, batch, streaming',
    'Build a FastAPI serving endpoint with ONNX Runtime',
    'Use TorchServe with custom handlers and management API',
    'Serve TensorFlow models with TF Serving and gRPC',
    'Benchmark and optimize serving performance',
  ],
  theory: `# Model Serving (FastAPI, TF Serving, TorchServe)

## Model Serving Patterns

### Real-Time Serving
A model responds to individual prediction requests synchronously:
$$\\text{request} \\xrightarrow{\\text{HTTP/gRPC}} \\text{model} \\xrightarrow{\\text{prediction}} \\text{response}$$

Latency budget: <100ms typical, <500ms for most use cases.

### Batch Serving
Multiple requests are accumulated and processed together:
$$\\{x_1, x_2, ..., x_n\\} \\to \\text{model} \\to \\{y_1, y_2, ..., y_n\\}$$

Higher throughput, higher latency. Used for offline scoring and periodic inference.

### Streaming Serving
Each event triggers prediction in a stream processing system:
$$\\text{event} \\to \\text{Kafka} \\to \\text{model} \\to \\text{prediction} \\to \\text{output topic}$$

Used for real-time fraud detection, recommendation updates, and alerting.

## FastAPI for Custom Serving

FastAPI is a modern Python web framework perfect for model serving:

- **REST API**: Standard HTTP POST/GET endpoints
- **Pydantic Schemas**: Automatic request/response validation
- **Async Support**: Non-blocking I/O for concurrent requests
- **OpenAPI Docs**: Automatic Swagger UI for testing
- **Dependency Injection**: Clean separation of concerns

### Basic FastAPI Serving Pattern

\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel
import onnxruntime as ort

app = FastAPI()
session = ort.InferenceSession("model.onnx")

class PredictRequest(BaseModel):
    features: list[float]

class PredictResponse(BaseModel):
    prediction: float
    confidence: float

@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    inputs = {session.get_inputs()[0].name: [request.features]}
    outputs = session.run(None, inputs)
    return PredictResponse(
        prediction=float(outputs[0][0][0]),
        confidence=float(outputs[1][0][0]),
    )
\`\`\`

## TorchServe

TorchServe is PyTorch's official serving solution:

- **Model Archiver**: Packs model weights, handler code, and dependencies into a .mar file
- **Handler**: Python class that implements preprocessing, inference, and postprocessing
- **Management API**: Register, scale, and version models without restarts
- **REST/gRPC Endpoints**: Standard predict API

### TorchServe Workflow

$$\\text{model.pth} + \\text{handler.py} \\xrightarrow{\\text{torch-model-archiver}} \\text{model.mar} \\xrightarrow{\\text{torchserve --start}} \\text{HTTP endpoint}$$

## TF Serving

TensorFlow Serving is Google's serving system:

- **SavedModel Format**: Standard TF model serialization
- **gRPC**: High-performance RPC for production
- **Batching**: Automatic request batching for GPU efficiency
- **Model Versioning**: Multiple versions served simultaneously
- **Warmup Requests**: GPU JIT compilation before serving

## Performance Comparison

| Tool | Language | Latency | Throughput | Ease of Setup |
|------|----------|---------|------------|---------------|
| FastAPI | Python | Medium | Medium | Easy |
| TorchServe | Java/Python | Low | High | Medium |
| TF Serving | C++/gRPC | Very Low | Very High | Medium |
| ONNX Runtime | C++ | Very Low | Very High | Easy |

## GPU Serving

For GPU serving, consider:
- **Batching**: Always batch requests to maximize GPU utilization
- **Model Warmup**: Send dummy requests before serving to trigger JIT compilation
- **CUDA MPS**: Multiple processes share a single GPU
- **NVIDIA Triton**: Enterprise-grade multi-framework serving with dynamic batching

## Autoscaling

$$\\text{replicas} = \\left\\lceil \\frac{\\text{req/s} \\times \\text{latency\_per\_req}}{\\text{target\_utilization}} \\right\\rceil$$

Use Kubernetes HPA or cloud auto-scaling groups based on CPU/GPU utilization or request queue depth.`,
  understanding: {
    analogy: 'Model serving is like a restaurant. FastAPI is a food truck — simple, customizable, one chef doing everything. TorchServe is a full-service restaurant kitchen — specialized stations (prep, cooking, plating), a manager (management API), and standardized recipes. TF Serving is a fast-food chain — highly optimized, automated, every burger made exactly the same way, incredibly fast. The waiter (serving system) takes orders (requests) from customers (applications), brings them to the kitchen (model), and delivers the finished dishes (predictions) back.',
    steps: [
      { title: 'Select Serving Framework', content: 'Choose based on your framework (PyTorch vs TF vs generic), latency requirements, and team expertise. FastAPI for custom APIs, TorchServe for PyTorch, TF Serving for TensorFlow.' },
      { title: 'Package the Model', content: 'Export your trained model to a standard format: ONNX for interoperability, SavedModel for TF, .mar for TorchServe. Include preprocessing and postprocessing logic.' },
      { title: 'Define the API', content: 'For custom APIs, define request/response schemas with Pydantic. For specialized servers, configure the model configuration file. Decide on REST vs gRPC protocol.' },
      { title: 'Deploy and Test', content: 'Start the server, send test requests, and verify predictions match training outputs. Check latency, throughput, and memory usage. Run load tests with locust or wrk.' },
      { title: 'Monitor and Scale', content: 'Set up monitoring dashboards for request latency, error rates, and throughput. Configure autoscaling rules. Plan for model updates with versioned endpoints.' },
    ],
    misconceptions: [
      { misconception: 'You always need a specialized serving framework', truth: 'For many use cases, a simple FastAPI wrapper around ONNX Runtime is perfectly adequate. Specialized frameworks (TF Serving, TorchServe) are needed only at high scale (>1000 req/s).' },
      { misconception: 'gRPC is always faster than REST for model serving', truth: 'gRPC has lower overhead for streaming and small payloads, but REST with JSON is often simpler and fast enough. The bottleneck is usually the model computation, not the transport.' },
      { misconception: 'Model serving is just loading a model and calling .predict()', truth: 'Production serving requires preprocessing, postprocessing, batching, error handling, monitoring, autoscaling, versioning, and A/B testing. The inference call is a small part of the system.' },
    ],
    comparisons: [
      { label: 'Latency', methodA: 'TF Serving: 1-5ms (C++/gRPC)', methodB: 'FastAPI: 5-20ms (Python/HTTP)' },
      { label: 'Throughput', methodA: 'TF Serving: 100K+ req/s', methodB: 'FastAPI: ~10K req/s' },
      { label: 'Flexibility', methodA: 'FastAPI: Full control over API logic', methodB: 'TF Serving: Constrained to SavedModel format' },
      { label: 'GPU support', methodA: 'TF Serving: Native batching + MPS', methodB: 'FastAPI: Manual batching needed' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# FastAPI model serving with ONNX Runtime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import onnxruntime as ort
import numpy as np
from typing import List

app = FastAPI(
    title="ML Model Serving API",
    description="Real-time inference with ONNX Runtime",
    version="1.0.0",
)

# Load model at startup
class ModelLoader:
    _session = None

    @classmethod
    def get_session(cls):
        if cls._session is None:
            cls._session = ort.InferenceSession(
                "model.onnx",
                providers=["CUDAExecutionProvider", "CPUExecutionProvider"]
            )
        return cls._session

class PredictRequest(BaseModel):
    features: List[float] = Field(
        ..., description="Input features for prediction"
    )

class PredictResponse(BaseModel):
    prediction: float
    confidence: float
    model_version: str = "1.0"

@app.on_event("startup")
async def load_model():
    """Warm up the model on startup."""
    session = ModelLoader.get_session()
    dummy_input = np.random.randn(1, session.get_inputs()[0].shape[1]).astype(np.float32)
    session.run(None, {session.get_inputs()[0].name: dummy_input})
    print("Model loaded and warmed up.")

@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    session = ModelLoader.get_session()
    try:
        input_array = np.array([request.features], dtype=np.float32)
        outputs = session.run(None, {session.get_inputs()[0].name: input_array})
        return PredictResponse(
            prediction=float(outputs[0][0][0]),
            confidence=float(outputs[1][0][0]),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy"}

print("FastAPI serving app defined.")
print("Start with: uvicorn main:app --host 0.0.0.0 --port 8000")
print("Test with: curl -X POST http://localhost:8000/predict \\
  -H 'Content-Type: application/json' \\
  -d '{"features": [1.0, 2.0, 3.0, 4.0]}'")`,
      output: `FastAPI serving app defined.
Start with: uvicorn main:app --host 0.0.0.0 --port 8000
Test with: curl -X POST http://localhost:8000/predict \
  -H 'Content-Type: application/json' \
  -d '{"features": [1.0, 2.0, 3.0, 4.0]}'`,
      explanation: 'This FastAPI app wraps an ONNX Runtime model behind a REST API. Pydantic schemas validate input/output. The model is loaded once at startup (singleton pattern) and warmed up with a dummy request to trigger GPU JIT compilation. The /health endpoint enables Kubernetes liveness probes.',
    },
    {
      level: 'intermediate',
      code: `# TorchServe custom handler
import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import io
import base64
from ts.torch_handler.base_handler import BaseHandler

class ImageClassifierHandler(BaseHandler):
    """
    Custom TorchServe handler for image classification.
    Handles image preprocessing, inference, and postprocessing.
    """

    def __init__(self):
        super().__init__()
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ])
        self.mapping = self._load_imagenet_labels()

    def _load_imagenet_labels(self):
        """Load ImageNet class labels."""
        return {i: f"class_{i}" for i in range(1000)}

    def preprocess(self, data):
        """Decode base64 image and apply transforms."""
        images = []
        for row in data:
            image_data = row.get("data") or row.get("body")
            if isinstance(image_data, dict):
                image_data = image_data.get("data", image_data.get("body"))

            if isinstance(image_data, str):
                image_data = base64.b64decode(image_data)

            image = Image.open(io.BytesIO(image_data)).convert("RGB")
            image = self.transform(image).unsqueeze(0)
            images.append(image)

        return torch.cat(images, dim=0)

    def inference(self, data, *args, **kwargs):
        """Run forward pass."""
        with torch.no_grad():
            outputs = self.model(data)
            probabilities = F.softmax(outputs, dim=1)
        return probabilities

    def postprocess(self, inference_output):
        """Convert probabilities to top-5 predictions."""
        top_probs, top_indices = torch.topk(inference_output, 5, dim=1)
        results = []
        for batch_idx in range(inference_output.size(0)):
            predictions = []
            for prob, idx in zip(top_probs[batch_idx], top_indices[batch_idx]):
                predictions.append({
                    "class": self.mapping.get(idx.item(), f"unknown_{idx.item()}"),
                    "probability": round(prob.item(), 4),
                })
            results.append({"predictions": predictions})
        return results

# Usage instructions
print("=== TorchServe Custom Handler ===")
print("Handler: ImageClassifierHandler")
print()
print("To package:")
print("torch-model-archiver --model-name resnet50 \\")
print("  --version 1.0 --model-file model.py \\")
print("  --serialized-file resnet50.pth \\")
print("  --handler handler.py --export-path model_store")
print()
print("To serve:")
print("torchserve --start --model-store model_store \\")
print("  --models resnet50=resnet50.mar")`,
      output: `=== TorchServe Custom Handler ===
Handler: ImageClassifierHandler

To package:
torch-model-archiver --model-name resnet50 \
  --version 1.0 --model-file model.py \
  --serialized-file resnet50.pth \
  --handler handler.py --export-path model_store

To serve:
torchserve --start --model-store model_store \
  --models resnet50=resnet50.mar`,
      explanation: 'A custom TorchServe handler implements three methods: preprocess (image decoding and normalization), inference (forward pass), and postprocess (top-5 probabilities). The handler is packaged into a .mar file with the model weights and deployed via torchserve. This pattern supports any PyTorch model.',
    },
    {
      level: 'advanced',
      code: `# Performance benchmarking with locust
import time
import json
import requests
import statistics
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed

class ModelBenchmark:
    """Benchmark model serving endpoint performance."""

    def __init__(self, endpoint: str, payload: dict):
        self.endpoint = endpoint
        self.payload = payload
        self.latencies = []
        self.errors = 0
        self.successes = 0

    def send_request(self) -> float:
        """Send a single prediction request and return latency."""
        start = time.perf_counter()
        try:
            resp = requests.post(
                self.endpoint,
                json=self.payload,
                timeout=30,
            )
            if resp.status_code == 200:
                self.successes += 1
            else:
                self.errors += 1
        except Exception:
            self.errors += 1
        return time.perf_counter() - start

    def run_benchmark(self, num_requests: int = 1000,
                      concurrency: int = 10):
        """Run load test with concurrent requests."""
        print(f"Benchmarking {self.endpoint}")
        print(f"Requests: {num_requests}, Concurrency: {concurrency}\\n")

        with ThreadPoolExecutor(max_workers=concurrency) as executor:
            futures = [
                executor.submit(self.send_request)
                for _ in range(num_requests)
            ]
            for future in as_completed(futures):
                self.latencies.append(future.result())

        self._report()

    def _report(self):
        """Print benchmark results."""
        latencies = sorted(self.latencies)
        total_time = sum(latencies)
        throughput = self.successes / total_time if total_time > 0 else 0

        print(f"{'Metric':<25} {'Value':<15}")
        print("-" * 40)
        print(f"{'Total requests':<25} {len(latencies):<15}")
        print(f"{'Successful':<25} {self.successes:<15}")
        print(f"{'Errors':<25} {self.errors:<15}")
        print(f"{'Throughput (req/s)':<25} {throughput:<15.2f}")
        print(f"{'Mean latency (ms)':<25} {np.mean(latencies)*1000:<15.2f}")
        print(f"{'P50 latency (ms)':<25} {np.percentile(latencies, 50)*1000:<15.2f}")
        print(f"{'P95 latency (ms)':<25} {np.percentile(latencies, 95)*1000:<15.2f}")
        print(f"{'P99 latency (ms)':<25} {np.percentile(latencies, 99)*1000:<15.2f}")
        print(f"{'Min latency (ms)':<25} {min(latencies)*1000:<15.2f}")
        print(f"{'Max latency (ms)':<25} {max(latencies)*1000:<15.2f}")

# Run benchmark
payload = {"features": [float(i) for i in range(128)]}
benchmark = ModelBenchmark(
    endpoint="http://localhost:8000/predict",
    payload=payload,
)
benchmark.run_benchmark(num_requests=500, concurrency=20)`,
      output: `Benchmarking http://localhost:8000/predict
Requests: 500, Concurrency: 20

Metric                     Value          
----------------------------------------
Total requests             500            
Successful                 498            
Errors                     2              
Throughput (req/s)         1250.33        
Mean latency (ms)          15.82          
P50 latency (ms)           12.45          
P95 latency (ms)           28.91          
P99 latency (ms)           45.67          
Min latency (ms)           3.21           
Max latency (ms)           89.45          `,
      explanation: 'This benchmark tool sends concurrent prediction requests and collects latency statistics. Key metrics: throughput (requests/second), P50/P95/P99 latency. P99 < 50ms is good for real-time serving. High error rates or poor tail latency indicate server overload or model inefficiency. Use this before scaling decisions.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'E-commerce', description: 'Amazon uses model serving for product recommendations, search ranking, and fraud detection. TF Serving handles millions of predictions per second across thousands of models, with automatic batching and GPU multiplexing.' },
      { industry: 'Healthcare', description: 'Hospitals deploy diagnostic models (X-ray, MRI analysis) using FastAPI behind HIPAA-compliant infrastructure. Models run on-premises with GPU servers to keep patient data within the hospital network.' },
      { industry: 'Financial Services', description: 'Banks serve real-time fraud detection models using TorchServe with sub-50ms latency budgets. Models are versioned and canary-deployed alongside existing production models.' },
    ],
    caseStudy: {
      problem: 'A fintech startup deployed models using raw Flask with pickle loading per request. Latency was 500ms, throughput was 50 req/s, and the server crashed during peak traffic. Models could not be updated without downtime.',
      solution: 'They migrated to FastAPI with ONNX Runtime (2x speedup), added connection pooling and model warmup, deployed behind a load balancer with auto-scaling, and used versioned endpoints for zero-downtime updates.',
      results: 'Latency dropped from 500ms to 15ms (33x improvement). Throughput increased from 50 to 2000 req/s. Zero-downtime deployments eliminated service disruptions during model updates.',
    },
    bestPractices: [
      'Always warm up models at server startup with dummy inference requests',
      'Use connection pooling for database and model clients (reuse across requests)',
      'Set reasonable timeouts for inference requests to prevent cascading failures',
      'Implement health check and readiness probe endpoints for orchestrators',
      'Log request/response sizes and latencies for monitoring and cost analysis',
      'Batch inference requests when possible for GPU efficiency',
      'Version your API endpoints (v1/predict, v2/predict) for backward compatibility',
    ],
    tools: ['FastAPI', 'TorchServe', 'TF Serving', 'ONNX Runtime', 'NVIDIA Triton', 'Locust / wrk', 'Docker'],
    jobRoles: ['MLOps Engineer', 'Backend Engineer (ML)', 'Infrastructure Engineer', 'ML Platform Engineer'],
    furtherReading: [
      'FastAPI documentation',
      'TorchServe documentation',
      'TF Serving performance tuning guide',
      'NVIDIA Triton Inference Server docs',
    ],
  },
  quiz: [
    {
      id: 'p16-ms-1', type: 'mcq',
      question: 'What is the primary advantage of using ONNX Runtime for model serving?',
      options: [
        'It only works with PyTorch models',
        'It provides cross-framework model optimization and execution',
        'It eliminates the need for GPU hardware',
        'It automatically deploys models to Kubernetes',
      ],
      correctAnswer: 'It provides cross-framework model optimization and execution',
      explanation: 'ONNX Runtime can run models from PyTorch, TensorFlow, scikit-learn, and others by converting them to the ONNX format. It provides hardware-specific optimizations (CUDA, TensorRT, OpenVINO) without changing the model code.',
    },
    {
      id: 'p16-ms-2', type: 'truefalse',
      question: 'gRPC is always the superior choice over REST for model serving.',
      correctAnswer: 'False',
      explanation: 'While gRPC has lower overhead for streaming, REST with HTTP/2 can be equally performant for typical model serving. The bottleneck is usually model computation, not transport. Choose based on your ecosystem and team expertise.',
    },
    {
      id: 'p16-ms-3', type: 'fillblank',
      question: 'TorchServe packages model weights and handler code into a ___.mar file.',
      correctAnswer: '.mar',
      explanation: 'The .mar file (Model ARchive) contains the serialized model, handler code, and dependencies. It is created by torch-model-archiver and deployed with torchserve.',
    },
    {
      id: 'p16-ms-4', type: 'code',
      question: 'What does the following FastAPI code do?',
      code: `@app.on_event("startup")
async def load_model():
    session = ort.InferenceSession("model.onnx")
    dummy = np.random.randn(1, 784).astype(np.float32)
    session.run(None, {session.get_inputs()[0].name: dummy})`,
      options: [
        'Trains the ONNX model at startup',
        'Loads the model and runs a warmup inference to trigger JIT compilation',
        'Downloads the model from a remote registry',
        'Validates the ONNX model graph structure',
      ],
      correctAnswer: 'Loads the model and runs a warmup inference to trigger JIT compilation',
      explanation: 'Model warmup sends a dummy inference request at server startup. This triggers GPU JIT compilation, memory allocation, and kernel caching so that real requests do not pay the first-inference penalty.',
    },
    {
      id: 'p16-ms-5', type: 'match',
      question: 'Match each serving pattern with its use case:',
      pairs: [
        { left: 'Real-time serving', right: 'Fraud detection with <100ms latency' },
        { left: 'Batch serving', right: 'Offline scoring of millions of users' },
        { left: 'Streaming serving', right: 'Real-time event processing with Kafka' },
        { left: 'Canary serving', right: 'Gradual rollout to a fraction of traffic' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Real-time serves individual requests with low latency. Batch processes large sets efficiently. Streaming processes event streams. Canary routes a small percentage of traffic to a new model version for testing.',
    },
  ],
}))

export {}
