import { registerContent } from '@/content/index'

registerContent('p16-docker-ml', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p16-model-serving'],
  tags: ['MLOps', 'Advanced', 'Topic'],
  objectives: [
    'Understand Docker concepts: images, containers, Dockerfile, docker-compose',
    'Build optimized Docker images for ML applications',
    'Use CUDA-enabled base images for GPU support',
    'Create multi-stage builds for smaller images',
    'Orchestrate multi-service ML apps with Docker Compose',
  ],
  theory: `# Docker for ML

## Docker Basics

Docker packages applications and their dependencies into lightweight, portable containers.

### Images vs Containers

- **Image**: A read-only template (snapshot) containing the application, libraries, and environment configuration
- **Container**: A running instance of an image — isolated, ephemeral, and executable
- **Dockerfile**: A script that defines how to build an image
- **docker-compose**: Define and run multi-container applications

### Why Docker for ML?

$$\text{Container} = \text{Code} + \text{Environment} + \text{Dependencies} + \text{Config}$$

ML benefits enormously:
- **Reproducibility**: Same image = same environment everywhere
- **Portability**: Run locally, on-prem, or on any cloud
- **GPU support**: NVIDIA Container Toolkit for GPU passthrough
- **Microservices**: Separate training, serving, monitoring into containers
- **CI/CD Integration**: Build once, deploy anywhere

## Dockerfile for ML

### Base Image Selection

\`\`\`dockerfile
# CPU-only
FROM python:3.10-slim

# GPU support
FROM nvidia/cuda:12.2.0-runtime-ubuntu22.04

# ML framework specific
FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime
FROM tensorflow/tensorflow:2.13.0-gpu
\`\`\`

### Multi-Stage Builds

Reduce final image size by separating build and runtime:

$$\text{Build Stage} \to \text{Runtime Stage}$$

Build stage: compiles code, installs build dependencies. Runtime stage: only the artifacts and runtime dependencies.

### Requirements Installation

\`\`\`dockerfile
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
\`\`\`

Use \texttt{--no-cache-dir} to reduce image size. Prefer pinned versions (\texttt{numpy==1.24.0}) for reproducibility.

## Docker Compose for Multi-Service ML

\`\`\`yaml
version: "3.8"
services:
  model-api:
    build: ./api
    ports:
      - "8000:8000"
    depends_on:
      - redis
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  stream-processor:
    build: ./stream
    depends_on:
      - redis
      - model-api
\`\`\`

## GPU Passthrough (nvidia-docker)

To use GPUs inside containers:

\texttt{docker run --gpus all nvidia/cuda:12.2.0-runtime nvidia-smi}

The NVIDIA Container Toolkit (nvidia-docker2) exposes GPUs to containers. Without it, containers cannot access host GPUs.

## Image Size Optimization

| Technique | Size Reduction |
|-----------|---------------|
| Use slim/alpine base | 300MB+ saved |
| Multi-stage builds | 50-80% smaller |
| \texttt{--no-cache-dir} | 100-500MB saved |
| Remove dev packages | 50-200MB saved |
| Layer ordering (caching) | Faster builds |

## Container vs Virtual Environment

| Feature | Docker | venv/conda |
|---------|--------|------------|
| Isolation | OS-level (kernel, filesystem) | Python-level only |
| GPU support | Native (nvidia-docker) | Host-dependent |
| Reproducibility | Exact OS + libs + Python | Python packages only |
| Image size | 100MB-10GB | Minimal (packages only) |
| Startup time | Seconds | Instant |
| Portability | Any Docker host | Any OS with same Python |`,
  understanding: {
    analogy: 'Docker is like a shipping container for your ML application. A shipping container holds everything needed to transport goods — same size, same connectors, works on ships, trains, and trucks. A Docker container holds everything needed to run your app — same OS, libraries, and code, works on your laptop, server, or cloud. Docker Compose is like a logistics coordinator that arranges multiple containers (shipping containers) to work together: one for the model API (cargo ship), one for Redis (warehouse), one for monitoring (inspection station).',
    steps: [
      { title: 'Write a Dockerfile', content: 'Start with a base image (pytorch/pytorch for GPU, python:3.10-slim for CPU). Install system dependencies, copy requirements, install Python packages, copy application code, set the entrypoint.' },
      { title: 'Build the Image', content: 'Run docker build -t my-ml-service:1.0. Docker caches layers — order Dockerfile commands from least to most frequently changing (base image, system deps, requirements, code) to maximize cache usage.' },
      { title: 'Test Locally', content: 'Run docker run --gpus all -p 8000:8000 my-ml-service and send test requests. Verify GPU access, latency, and correctness. Debug with docker logs and docker exec.' },
      { title: 'Orchestrate Multi-Service', content: 'Write a docker-compose.yml with your API server, database (Redis), message queue (RabbitMQ), and monitoring. Use depends_on for startup ordering and networks for isolation.' },
      { title: 'Deploy to Production', content: 'Push the image to a container registry (Docker Hub, ECR, GCR). Pull on production servers. Use docker stack deploy or Kubernetes for production orchestration.' },
    ],
    misconceptions: [
      { misconception: 'Docker containers are virtual machines', truth: 'Containers share the host OS kernel. They are not VMs — they do not have their own OS kernel. This makes them lighter (MB vs GB) and faster to start (seconds vs minutes).' },
      { misconception: 'Docker images must be rebuilt for every code change', truth: 'Docker caches layers. If you COPY code last, changing code only rebuilds the final layer. Proper layer ordering makes rebuilds near-instant.' },
      { misconception: 'GPU support in Docker is complex and unreliable', truth: 'NVIDIA Container Toolkit makes GPU passthrough a single flag (--gpus all). It is used in production by every major ML platform.' },
    ],
    comparisons: [
      { label: 'Isolation level', methodA: 'Docker: OS-level (kernel, filesystem, network)', methodB: 'venv/conda: Python environment only' },
      { label: 'GPU support', methodA: 'Docker: --gpus all (nvidia-docker)', methodB: 'venv/conda: Inherits from host' },
      { label: 'Reproducibility', methodA: 'Docker: Bit-for-bit identical across machines', methodB: 'venv/conda: OS-dependent behavior possible' },
      { label: 'Image size', methodA: 'Docker: 1-10 GB (includes OS + CUDA)', methodB: 'venv/conda: 50-500 MB (Python packages only)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Dockerfile for a machine learning model serving application

dockerfile_content = '''
# === Base Image ===
FROM python:3.10-slim AS builder

# Set working directory
WORKDIR /app

# Install system dependencies (build stage)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# === Runtime Stage ===
FROM python:3.10-slim

WORKDIR /app

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.10/site-packages \
    /usr/local/lib/python3.10/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY app/ ./app/
COPY model.onnx .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
'''

# Display the Dockerfile
print("=== Dockerfile for ML Model Serving ===")
print(dockerfile_content)
print()
print("# Build command:")
print("docker build -t ml-serving:1.0 .")
print()
print("# Run command:")
print("docker run -p 8000:8000 --name ml-api ml-serving:1.0")`,
      output: `=== Dockerfile for ML Model Serving ===
# === Base Image ===
FROM python:3.10-slim AS builder
...
# === Runtime Stage ===
FROM python:3.10-slim
...

# Build command:
docker build -t ml-serving:1.0 .
# Run command:
docker run -p 8000:8000 --name ml-api ml-serving:1.0`,
      explanation: 'This multi-stage Dockerfile separates build and runtime. The builder stage installs system build tools and Python packages. The runtime stage only has the packages and application code — no build tools. This produces a smaller, more secure image. Multi-stage builds are essential for production ML images.',
    },
    {
      level: 'intermediate',
      code: `# GPU-enabled ML service with Docker
# Dockerfile for a PyTorch training script

gpu_dockerfile = '''
FROM nvidia/cuda:12.2.0-cudnn8-runtime-ubuntu22.04

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive
ENV CUDA_HOME=/usr/local/cuda

# Install Python and system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.10 \
    python3-pip \
    python3-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python ML packages
RUN pip3 install --no-cache-dir \
    torch==2.1.0 \
    torchvision==0.16.0 \
    numpy==1.24.0 \
    pandas==2.0.0 \
    scikit-learn==1.3.0 \
    mlflow==2.5.0

# Copy application
WORKDIR /app
COPY train.py .
COPY config.yaml .
COPY data/ ./data/

# Verify GPU access
RUN python3 -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')"

# Entrypoint
ENTRYPOINT ["python3", "train.py"]
'''

# .dockerignore file content
dockerignore = '''
.git
__pycache__
*.pyc
.ipynb_checkpoints
data/raw/*
!data/raw/.gitkeep
*.log
.env
.venv
'''

# Build and run with GPU
print("=== GPU Docker for ML Training ===\n")
print("# Build the image:")
print("docker build -f Dockerfile.gpu -t ml-train-gpu:1.0 .\n")
print("# Run with GPU access:")
print("docker run --gpus all -v $(pwd)/data:/app/data ml-train-gpu:1.0\n")
print("# Verify GPU in container:")
print("docker run --gpus all nvidia/cuda:12.2.0-runtime nvidia-smi")`,
      output: `=== GPU Docker for ML Training ===

# Build the image:
docker build -f Dockerfile.gpu -t ml-train-gpu:1.0 .

# Run with GPU access:
docker run --gpus all -v $(pwd)/data:/app/data ml-train-gpu:1.0

# Verify GPU in container:
docker run --gpus all nvidia/cuda:12.2.0-runtime nvidia-smi`,
      explanation: 'This GPU-enabled Dockerfile starts from NVIDIA\'s CUDA base image, installs PyTorch with CUDA support, and verifies GPU access at build time. The --gpus all flag exposes the host GPU to the container. The .dockerignore file prevents bloating the image with unnecessary files (git, cache, etc.).',
    },
    {
      level: 'advanced',
      code: `# Docker Compose for multi-service ML application

docker_compose_yaml = '''
version: "3.8"

services:
  # Model Training Service
  trainer:
    build:
      context: ./trainer
      dockerfile: Dockerfile.gpu
    image: ml-trainer:latest
    volumes:
      - ./data:/app/data
      - ./models:/app/models
      - ./config:/app/config
    environment:
      - MLFLOW_TRACKING_URI=http://mlflow:5000
      - CUDA_VISIBLE_DEVICES=0
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    depends_on:
      - mlflow

  # Model Serving API
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    image: ml-api:latest
    ports:
      - "8000:8000"
    volumes:
      - ./models:/app/models:ro
    environment:
      - MODEL_PATH=/app/models/production/model.onnx
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s

  # MLflow Tracking Server
  mlflow:
    build:
      context: ./mlflow
      dockerfile: Dockerfile
    image: mlflow-server:latest
    ports:
      - "5000:5000"
    volumes:
      - mlflow-artifacts:/app/artifacts
    command: >
      mlflow server
      --host 0.0.0.0
      --backend-store-uri sqlite:///mlflow.db
      --default-artifact-root /app/artifacts

  # Monitoring Dashboard
  monitor:
    build:
      context: ./monitor
      dockerfile: Dockerfile
    image: ml-monitor:latest
    ports:
      - "8050:8050"
    depends_on:
      - api
    environment:
      - API_URL=http://api:8000

volumes:
  redis-data:
  mlflow-artifacts:
'''

print("=== Docker Compose: Multi-Service ML App ===\n")
print(docker_compose_yaml)
print()
print("# Start all services:")
print("docker-compose up -d")
print()
print("# View logs:")
print("docker-compose logs -f api trainer")
print()
print("# Scale API servers:")
print("docker-compose up -d --scale api=3")`,
      output: `=== Docker Compose: Multi-Service ML App ===

version: "3.8"
services:
  trainer:
    build: ./trainer...
  api:
    build: ./api...
  redis:
    image: redis:7-alpine...
  mlflow:
    build: ./mlflow...
  monitor:
    build: ./monitor...

# Start all services:
docker-compose up -d

# View logs:
docker-compose logs -f api trainer

# Scale API servers:
docker-compose up -d --scale api=3`,
      explanation: 'This docker-compose.yml defines five services for a complete ML platform: trainer (GPU training), api (model serving with GPU), redis (feature cache), mlflow (experiment tracking), and monitor (dashboard). Docker Compose handles networking (services find each other by name), volume mounting, GPU passthrough, and scaling.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Cloud ML Platforms', description: 'AWS SageMaker, GCP Vertex AI, and Azure ML use Docker internally to package training and inference code. Users provide a Dockerfile, and the platform executes it at scale on managed infrastructure.' },
      { industry: 'Edge ML', description: 'NVIDIA Jetson devices run Docker containers with optimized models for edge inference. Docker ensures the same environment runs on development machines and edge hardware.' },
      { industry: 'ML Research Labs', description: 'Research groups like FAIR and DeepMind use Docker to share reproducible experiment environments. A Docker image + Git commit = complete experiment reproducibility for paper submissions.' },
    ],
    caseStudy: {
      problem: 'An ML team spent 40% of their time on environment issues: "It works on my machine" conflicts, CUDA version mismatches, missing system libraries. Setting up a new team member took 2 days. Reproducing a 3-month-old experiment was nearly impossible.',
      solution: 'They standardized on Docker for all ML workloads. Each project had a Dockerfile pinned to specific base image versions. docker-compose.yml defined the full stack (training, serving, monitoring). CI built images automatically on every Git push.',
      results: 'Environment setup dropped from 2 days to 10 minutes (docker-compose up). "Works on my machine" problems were eliminated. Experiment reproducibility reached 100%. Infrastructure team maintenance time dropped 70%.',
    },
    bestPractices: [
      'Use multi-stage builds to separate build dependencies from runtime',
      'Pin base image tags to specific versions (not "latest") for reproducibility',
      'Order Dockerfile commands from least to most frequently changing to maximize layer caching',
      'Use .dockerignore to exclude unnecessary files from the build context',
      'Run containers as non-root user for security',
      'Add HEALTHCHECK instructions for orchestrator integration',
      'Use docker-compose for local development and Kubernetes for production',
    ],
    tools: ['Docker', 'Docker Compose', 'NVIDIA Container Toolkit', 'Kubernetes', 'Helm'],
    jobRoles: ['MLOps Engineer', 'DevOps Engineer', 'ML Platform Engineer', 'Infrastructure Engineer'],
    furtherReading: [
      'Docker documentation — Best practices for writing Dockerfiles',
      'NVIDIA Container Toolkit — GPU support in Docker',
      'Docker Compose documentation',
      'Multi-stage builds in Docker',
    ],
  },
  quiz: [
    {
      id: 'p16-dm-1', type: 'mcq',
      question: 'What is the primary benefit of using Docker for ML applications?',
      options: [
        'It automatically optimizes model performance',
        'It provides reproducible environments that include OS, libraries, and code',
        'It replaces the need for version control (Git)',
        'It trains models faster than native execution',
      ],
      correctAnswer: 'It provides reproducible environments that include OS, libraries, and code',
      explanation: 'Docker packages the entire environment — operating system, system libraries, Python packages, and application code — into a portable image. This ensures the same environment runs identically everywhere.',
    },
    {
      id: 'p16-dm-2', type: 'truefalse',
      question: 'Docker containers virtualize the OS kernel, similar to virtual machines.',
      correctAnswer: 'False',
      explanation: 'Containers share the host OS kernel. They are not full virtual machines. This makes them lighter (no guest OS overhead) but also means Linux containers cannot run natively on Windows (without WSL2).',
    },
    {
      id: 'p16-dm-3', type: 'fillblank',
      question: 'To enable GPU access in a Docker container, use the ___ flag with docker run.',
      correctAnswer: '--gpus all',
      explanation: 'The --gpus all flag exposes all host GPUs to the container. This requires the NVIDIA Container Toolkit (nvidia-docker2) to be installed on the host.',
    },
    {
      id: 'p16-dm-4', type: 'code',
      question: 'What Docker technique does the following Dockerfile pattern demonstrate?',
      code: `FROM python:3.10-slim AS builder
RUN pip install -r requirements.txt

FROM python:3.10-slim
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages`,
      options: [
        'Layer caching optimization',
        'Multi-stage build',
        'GPU passthrough configuration',
        'Container orchestration',
      ],
      correctAnswer: 'Multi-stage build',
      explanation: 'Multi-stage builds use multiple FROM statements. The first stage (builder) installs dependencies, and the second stage copies only the artifacts (installed packages) into the final image. This keeps the final image small by excluding build tools.',
    },
    {
      id: 'p16-dm-5', type: 'match',
      question: 'Match each Docker concept with its description:',
      pairs: [
        { left: 'Image', right: 'Read-only template containing the application and environment' },
        { left: 'Container', right: 'Running instance of an image' },
        { left: 'Dockerfile', right: 'Script that defines how to build an image' },
        { left: 'docker-compose', right: 'Tool for defining and running multi-container applications' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Images are immutable blueprints. Containers are running instances. Dockerfiles define image builds. Docker Compose orchestrates multiple containers as a single application.',
    },
  ],
}))

export {}
