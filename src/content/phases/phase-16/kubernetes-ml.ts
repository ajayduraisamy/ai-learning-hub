import { registerContent } from '@/content/index'

registerContent('p16-kubernetes-ml', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p16-docker-ml'],
  tags: ['MLOps', 'Advanced', 'Topic'],
  objectives: [
    'Understand Kubernetes concepts: pods, deployments, services, ingress',
    'Deploy ML models on Kubernetes with GPU scheduling',
    'Configure resource requests and limits for ML workloads',
    'Use Kubeflow for ML pipelines, notebooks, and hyperparameter tuning',
    'Serve models with Kserve and manage with Helm charts',
  ],
  theory: `# Kubernetes for ML

## Kubernetes Basics

Kubernetes (K8s) is a container orchestration platform that automates deployment, scaling, and management of containerized applications.

### Key Concepts

- **Pod**: Smallest deployable unit — one or more containers with shared storage/network
- **Deployment**: Declarative update for Pods and ReplicaSets
- **Service**: Stable network endpoint to access a set of Pods
- **Ingress**: External HTTP/HTTPS routing to Services
- **ConfigMap/Secret**: Configuration and sensitive data management
- **PersistentVolume (PV) / PersistentVolumeClaim (PVC)**: Storage for stateful applications

## Kubernetes for ML

### GPU Scheduling

Kubernetes supports GPU scheduling via device plugins:

\`\`\`yaml
resources:
  limits:
    nvidia.com/gpu: 1
  requests:
    nvidia.com/gpu: 1
\`\`\`

The node must have the NVIDIA device plugin installed. GPUs are a **limited resource** — once allocated to a pod, other pods cannot use the same GPU (no oversubscription without MPS/MIG).

### Resource Requests and Limits

| Resource | request | limit |
|----------|---------|-------|
| CPU | Guaranteed minimum | Hard cap |
| Memory | Guaranteed minimum | Hard cap (OOM if exceeded) |
| GPU | N/A (must equal limit) | Must equal request |

### Horizontal Pod Autoscaling (HPA)

$$\\text{Target Replicas} = \\left\\lceil \\text{Current Replicas} \\times \\frac{\\text{Current Metric}}{\\text{Target Metric}} \\right\\rceil$$

HPA scales pods based on CPU, memory, or custom metrics (requests per second, queue depth).

## Kubeflow

Kubeflow is an ML toolkit for Kubernetes:

### Components

- **Kubeflow Pipelines**: DAG-based ML workflows with reusable components
- **Kubeflow Notebooks**: Jupyter notebooks running on K8s with GPU access
- **Katib**: Hyperparameter tuning and neural architecture search
- **Kserve**: Model serving with canary deployments and autoscaling
- **Central Dashboard**: UI for managing all Kubeflow resources

### Kubeflow Pipeline

$$\\text{Component} \\to \\text{Component} \\to \\text{Component}$$

Each component is a containerized step (data ingest, preprocess, train, evaluate, deploy). Argo Workflows executes the DAG.

## Kserve (formerly KFServing)

Kserve provides a Kubernetes Custom Resource for model serving:

\`\`\`yaml
apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata:
  name: my-model
spec:
  predictor:
    pytorch:
      storageUri: s3://models/resnet50/
      resources:
        limits:
          nvidia.com/gpu: 1
\`\`\`

Features:
- **Canary deployments**: Route % of traffic to new model version
- **Autoscaling**: Scale to zero when idle, scale up on demand
- **Multi-framework**: PyTorch, TensorFlow, scikit-learn, ONNX
- **Explainability**: Built-in model explanation endpoints

## Helm Charts

Helm is the Kubernetes package manager. Charts bundle related K8s resources:

$$\\text{Helm Chart} = \\text{Deployment} + \\text{Service} + \\text{Ingress} + \\text{ConfigMap} + \\text{PVC}$$

Charts are parameterized with \\texttt{values.yaml} — change values per environment without duplicating YAML.`,
  understanding: {
    analogy: 'Kubernetes is like a hotel manager for ML workloads. Pods are guests checking into rooms (nodes). The manager ensures each guest has the resources they need (CPU, memory, GPU), assigns rooms efficiently (scheduling), handles check-in/out (container lifecycle), and redirects visitors to the right room (service routing). Kubeflow is like a specialized conference center attached to the hotel — it provides dedicated spaces for training (notebooks), workshops (pipelines), and presentations (model serving).',
    steps: [
      { title: 'Containerize Your ML App', content: 'Build a Docker image with your model serving code, dependencies, and configuration. Push it to a container registry (Docker Hub, ECR, GCR).' },
      { title: 'Write Kubernetes Manifests', content: 'Create YAML files for Deployment (pod template with resources), Service (internal endpoint), Ingress (external routing), and ConfigMap (configuration).' },
      { title: 'Deploy to Cluster', content: 'Use kubectl apply -f manifests/ to deploy. Monitor with kubectl get pods, kubectl logs, and kubectl describe.' },
      { title: 'Configure Scaling', content: 'Set resource requests/limits for CPU, memory, GPU. Configure HPA for autoscaling based on request load or custom metrics.' },
      { title: 'Set Up CI/CD Pipeline', content: 'Git push triggers image build, testing, and deployment to staging. Promotion to production uses canary deployments with Kserve.' },
    ],
    misconceptions: [
      { misconception: 'Kubernetes is only for large-scale deployments', truth: 'Kubernetes works on a single machine (minikube, kind) and scales to thousands of nodes. It provides the same API and operational model at any scale.' },
      { misconception: 'Kubernetes replaces Docker', truth: 'Kubernetes orchestrates Docker containers (or other runtimes). Docker builds images and runs containers; Kubernetes manages them across a cluster.' },
      { misconception: 'GPU scheduling works automatically', truth: 'GPUs require the NVIDIA device plugin, node labels, and proper resource limits in pod specs. Without explicit GPU resource requests, pods cannot access GPUs.' },
    ],
    comparisons: [
      { label: 'Setup complexity', methodA: 'Kubernetes: Complex (needs cluster, networking, storage)', methodB: 'Docker Compose: Simple (single YAML file)' },
      { label: 'Scaling', methodA: 'Kubernetes: Automatic (HPA, cluster autoscaler)', methodB: 'Docker Compose: Manual (--scale flag)' },
      { label: 'GPU support', methodA: 'Kubernetes: Device plugin, MIG, MPS', methodB: 'Docker Compose: --gpus all' },
      { label: 'Production readiness', methodA: 'Kubernetes: Self-healing, rolling updates, HA', methodB: 'Docker Compose: Single host, no self-healing' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Kubernetes Deployment and Service for ML model serving
# Save as ml-deployment.yaml

deployment_yaml = '''
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-model-server
  labels:
    app: ml-model
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ml-model
  template:
    metadata:
      labels:
        app: ml-model
    spec:
      containers:
      - name: model-api
        image: myregistry/ml-serving:1.0
        ports:
        - containerPort: 8000
          name: http
        env:
        - name: MODEL_PATH
          value: "/models/production/model.onnx"
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2"
            nvidia.com/gpu: 1
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: model-storage
          mountPath: /models
      volumes:
      - name: model-storage
        persistentVolumeClaim:
          claimName: model-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: ml-model-service
spec:
  selector:
    app: ml-model
  ports:
  - port: 80
    targetPort: 8000
    name: http
  type: ClusterIP
'''

print("=== Kubernetes ML Deployment ===\\n")
print(deployment_yaml)
print("# Deploy:")
print("kubectl apply -f ml-deployment.yaml")
print("# Check:")
print("kubectl get pods -l app=ml-model")`,
      output: `=== Kubernetes ML Deployment ===

apiVersion: apps/v1
kind: Deployment
...
# Deploy:
kubectl apply -f ml-deployment.yaml
# Check:
kubectl get pods -l app=ml-model`,
      explanation: 'This Kubernetes Deployment defines a model serving pod with GPU access, resource limits (2 CPU cores, 2GB memory, 1 GPU), health checks (liveness/readiness probes), and environment configuration. The Service exposes the pods internally on port 80. Three replicas provide redundancy and load distribution.',
    },
    {
      level: 'intermediate',
      code: `# Horizontal Pod Autoscaler and GPU resource config

hpa_yaml = '''
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ml-model-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ml-model-server
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
    scaleUp:
      stabilizationWindowSeconds: 60
'''

# Kserve InferenceService for canary deployments
kserve_yaml = '''
apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
metadata:
  name: sentiment-model
spec:
  predictor:
    canary:
      trafficPercent: 10
      pytorch:
        storageUri: s3://models/sentiment-v2/
        resources:
          limits:
            nvidia.com/gpu: 1
    latest:
      pytorch:
        storageUri: s3://models/sentiment-v1/
        resources:
          limits:
            nvidia.com/gpu: 1
'''

print("=== HPA Configuration ===\\n")
print(hpa_yaml)
print()
print("=== Kserve Canary Deployment ===\\n")
print(kserve_yaml)
print()
print("Kserve canary routes 10% of traffic to v2 model.")
print("Monitor and promote to 100% when confident.")`,
      output: `=== HPA Configuration ===

apiVersion: autoscaling/v2
...

=== Kserve Canary Deployment ===

apiVersion: serving.kserve.io/v1beta1
...

Kserve canary routes 10% of traffic to v2 model.
Monitor and promote to 100% when confident.`,
      explanation: 'The HPA scales the deployment based on CPU utilization (target 70%), memory utilization (target 80%), and custom metrics (requests per second). The canary InferenceService from Kserve routes 10% of traffic to version 2 while keeping 90% on version 1 — safe model rollout with automatic rollback if errors spike.',
    },
    {
      level: 'advanced',
      code: `# Kubeflow Pipeline YAML definition
import yaml

kubeflow_pipeline = {
    "apiVersion": "kubeflow.org/v1beta1",
    "kind": "Pipeline",
    "metadata": {"name": "ml-training-pipeline"},
    "spec": {
        "description": "End-to-end ML training pipeline",
        "tasks": [
            {
                "name": "data-ingestion",
                "template": "ingest-data",
                "arguments": {
                    "parameters": {
                        "data_url": "s3://datasets/customer-churn/",
                        "output_path": "/data/raw",
                    }
                },
            },
            {
                "name": "data-validation",
                "template": "validate-data",
                "depends_on": ["data-ingestion"],
                "arguments": {
                    "parameters": {
                        "input_path": "/data/raw",
                        "expectations_file": "/config/expectations.json",
                    }
                },
            },
            {
                "name": "feature-engineering",
                "template": "engineer-features",
                "depends_on": ["data-validation"],
                "arguments": {
                    "parameters": {
                        "input_path": "/data/raw",
                        "output_path": "/data/features",
                        "config_path": "/config/features.yaml",
                    }
                },
            },
            {
                "name": "hyperparameter-tuning",
                "template": "tune-hyperparameters",
                "depends_on": ["feature-engineering"],
                "arguments": {
                    "parameters": {
                        "data_path": "/data/features",
                        "output_path": "/artifacts/best-params.json",
                        "max_trials": 50,
                        "objective": "accuracy",
                    }
                },
            },
            {
                "name": "training",
                "template": "train-model",
                "depends_on": ["hyperparameter-tuning"],
                "arguments": {
                    "parameters": {
                        "data_path": "/data/features",
                        "params_path": "/artifacts/best-params.json",
                        "model_output": "/models/model.pkl",
                        "mlflow_uri": "http://mlflow-service:5000",
                    }
                },
            },
            {
                "name": "evaluation",
                "template": "evaluate-model",
                "depends_on": ["training"],
                "arguments": {
                    "parameters": {
                        "model_path": "/models/model.pkl",
                        "test_data_path": "/data/test",
                        "metrics_output": "/artifacts/metrics.json",
                        "threshold_accuracy": 0.95,
                    }
                },
            },
            {
                "name": "deploy-if-passed",
                "template": "deploy-model",
                "depends_on": ["evaluation"],
                "when": "{{tasks.evaluation.outputs.parameters.passed}} == true",
                "arguments": {
                    "parameters": {
                        "model_path": "/models/model.pkl",
                        "inference_service_name": "customer-churn-model",
                    }
                },
            },
            {
                "name": "notification",
                "template": "send-notification",
                "depends_on": ["deploy-if-passed"],
                "arguments": {
                    "parameters": {
                        "status": "{{tasks.deploy-if-passed.status}}",
                        "metrics": "{{tasks.evaluation.outputs.parameters.metrics}}",
                    }
                },
            },
        ],
    },
}

print("=== Kubeflow Pipeline Definition ===\\n")
pipeline_yaml = yaml.dump(kubeflow_pipeline, default_flow_style=False)
print(pipeline_yaml[:500] + "...\\n")
print("8-stage ML pipeline: ingest → validate → features → tune → train → evaluate → deploy → notify")`,
      output: `=== Kubeflow Pipeline Definition ===

apiVersion: kubeflow.org/v1beta1
kind: Pipeline
...

8-stage ML pipeline: ingest → validate → features → tune → train → evaluate → deploy → notify`,
      explanation: 'This Kubeflow Pipeline defines an end-to-end ML workflow with 8 stages. Each stage is a containerized component. The pipeline includes conditional execution (deploy only if evaluation passes), data validation with expectations, hyperparameter tuning with Katib, and automatic notification. Pipelines ensure reproducible, auditable ML workflows.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Cloud Providers', description: 'AWS, GCP, and Azure all offer managed Kubernetes services (EKS, GKE, AKS) for ML workloads. Customers deploy models using Kserve on top of these managed clusters with GPU auto-scaling.' },
      { industry: 'Finance', description: 'JPMorgan and Goldman Sachs run ML models on private Kubernetes clusters for risk assessment and trading. Strict security requires on-premises K8s with GPU scheduling and network policies.' },
      { industry: 'E-commerce', description: 'Shopify uses Kubernetes to serve recommendation models at scale. Pods autoscale from 10 to 500+ during Black Friday traffic spikes, with models pre-loaded on GPU nodes.' },
    ],
    caseStudy: {
      problem: 'A startup\'s ML serving infrastructure was fragile: a single EC2 instance ran all models. Deployments required SSH and manual process restarts. Scaling meant provisioning new instances manually. GPU utilization was 15% due to idle servers at night.',
      solution: 'They migrated to Amazon EKS with Kserve. Models were containerized and deployed as InferenceServices. HPA scaled pods based on request load. Cluster autoscaler added/removed GPU nodes. Spot instances reduced GPU costs by 60%.',
      results: 'Deployment time dropped from 1 hour to 30 seconds (kubectl apply). GPU utilization increased from 15% to 70% (autoscaling). Infrastructure costs reduced by 40% (spot instances + right-sizing). Zero-downtime deployments became standard.',
    },
    bestPractices: [
      'Always set resource requests AND limits for CPU, memory, and GPU',
      'Use node affinity and taints to isolate GPU workloads to GPU-enabled nodes',
      'Configure pod disruption budgets for critical serving pods',
      'Use namespaces to separate environments (dev, staging, prod)',
      'Implement network policies to restrict pod-to-pod communication',
      'Use persistent volumes with ReadWriteMany for shared model storage',
      'Set up cluster monitoring with Prometheus + Grafana',
    ],
    tools: ['Kubernetes', 'Kubeflow', 'Kserve', 'Helm', 'Docker', 'Prometheus / Grafana', 'Istio'],
    jobRoles: ['MLOps Engineer', 'Platform Engineer', 'DevOps Engineer (ML)', 'SRE (ML)'],
    furtherReading: [
      'Kubernetes documentation — GPU scheduling',
      'Kubeflow documentation',
      'Kserve documentation',
      'Kubernetes for ML: Production Best Practices',
    ],
  },
  quiz: [
    {
      id: 'p16-km-1', type: 'mcq',
      question: 'What Kubernetes resource is used to expose a set of pods as a stable network endpoint?',
      options: [
        'Deployment',
        'Service',
        'Ingress',
        'ConfigMap',
      ],
      correctAnswer: 'Service',
      explanation: 'A Service provides a stable IP address and DNS name for a set of pods. It load-balances traffic across the pods. Deployments manage pod replicas, Ingress handles external HTTP routing, and ConfigMap stores configuration.',
    },
    {
      id: 'p16-km-2', type: 'truefalse',
      question: 'Kubernetes can automatically scale pods based on GPU utilization metrics.',
      correctAnswer: 'True',
      explanation: 'Kubernetes HPA v2 supports custom and external metrics. With the NVIDIA GPU metrics exporter and Prometheus adapter, HPA can scale based on GPU utilization, memory, or temperature. However, GPU oversubscription requires MPS or MIG.',
    },
    {
      id: 'p16-km-3', type: 'fillblank',
      question: 'Kubeflow\'s hyperparameter tuning component is called ___.',
      correctAnswer: 'Katib',
      explanation: 'Katib is Kubeflow\'s hyperparameter tuning and neural architecture search component. It supports Bayesian optimization, random search, and grid search with early stopping.',
    },
    {
      id: 'p16-km-4', type: 'code',
      question: 'What does the following Kserve resource do?',
      code: `apiVersion: serving.kserve.io/v1beta1
kind: InferenceService
spec:
  predictor:
    canary:
      trafficPercent: 10
      pytorch:
        storageUri: s3://models/v2/`,
      options: [
        'Deploys only the canary version (v2) with 100% traffic',
        'Routes 10% of traffic to v2 and 90% to the default (v1) model',
        'Deletes the v1 model and replaces it with v2',
        'Creates an A/B test with 50/50 traffic split',
      ],
      correctAnswer: 'Routes 10% of traffic to v2 and 90% to the default (v1) model',
      explanation: 'Kserve canary deployments route a configurable percentage of traffic to a new model version. If the canary performs well (monitored metrics), you promote it to 100%. If errors increase, rollback is automatic or manual.',
    },
    {
      id: 'p16-km-5', type: 'match',
      question: 'Match each Kubernetes resource with its purpose:',
      pairs: [
        { left: 'Pod', right: 'Smallest deployable unit (one or more containers)' },
        { left: 'Deployment', right: 'Manages replica sets and rolling updates' },
        { left: 'Service', right: 'Stable network endpoint for a set of pods' },
        { left: 'HorizontalPodAutoscaler', right: 'Automatically scales pods based on metrics' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Pods run containers, Deployments manage pod lifecycles, Services provide networking, and HPA handles autoscaling. Together they form the foundation of scalable ML serving on Kubernetes.',
    },
  ],
}))

export {}
