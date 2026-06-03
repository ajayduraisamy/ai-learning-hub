import { registerContent } from '@/content/index'

registerContent('p16-cloud-deployment', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p16-kubernetes-ml'],
  tags: ['MLOps', 'Advanced', 'Topic'],
  objectives: [
    'Deploy models on AWS SageMaker: training jobs, endpoints, hyperparameter tuning',
    'Deploy models on GCP Vertex AI: custom training, prediction, pipelines',
    'Compare managed vs self-managed ML deployment approaches',
    'Optimize costs with spot instances and auto-scaling',
    'Understand multi-cloud ML strategies and trade-offs',
  ],
  theory: `# Cloud Deployment (AWS SageMaker, GCP Vertex AI)

## AWS SageMaker

SageMaker is Amazon's managed ML platform:

### Key Components

- **Notebooks**: Managed Jupyter notebooks with pre-installed ML frameworks
- **Training Jobs**: Managed training on EC2 instances (supports distributed training)
- **Hyperparameter Tuning**: Bayesian optimization, random search, grid search
- **Endpoints**: Managed model serving with auto-scaling
- **SageMaker Pipelines**: DAG-based ML workflows
- **Model Registry**: Version models and manage lifecycle

### Training Job API

\`\`\`python
import boto3
sm = boto3.client('sagemaker')

sm.create_training_job(
    TrainingJobName='my-training-job',
    AlgorithmSpecification={
        'TrainingImage': '763104351884.dkr.ecr.us-east-1.amazonaws.com/pytorch-training:2.1.0-gpu-py310',
        'TrainingInputMode': 'File',
    },
    RoleArn='arn:aws:iam::...:role/SageMakerRole',
    InputDataConfig=[...],
    OutputDataConfig={'S3OutputPath': 's3://bucket/models/'},
    ResourceConfig={
        'InstanceType': 'ml.p3.2xlarge',
        'InstanceCount': 1,
        'VolumeSizeInGB': 50,
    },
    StoppingCondition={'MaxRuntimeInSeconds': 86400},
    HyperParameters={'epochs': '50', 'lr': '0.001'},
)
\`\`\`

### Endpoint Deployment

$$\text{Model} \\xrightarrow{\text{create\_model}} \\xrightarrow{\text{endpoint\_config}} \\xrightarrow{\text{create\_endpoint}} \text{HTTPS endpoint}$$

Endpoints auto-scale based on traffic patterns. Support for A/B testing with production variants.

## GCP Vertex AI

Vertex AI is Google Cloud's unified ML platform:

### Key Components

- **Training**: Custom containers or pre-built frameworks (PyTorch, TF, XGBoost)
- **Prediction**: Managed endpoints with autoscaling
- **Vertex Pipelines**: Kubeflow Pipelines-based orchestration (serverless)
- **Model Garden**: Pre-trained foundation models
- **Model Registry**: Version management and evaluation
- **Feature Store**: Managed Feast-compatible feature store

### Custom Training

\`\`\`python
from google.cloud import aiplatform

aiplatform.init(project='my-project', location='us-central1')

job = aiplatform.CustomTrainingJob(
    display_name='my-training-job',
    script_path='train.py',
    container_uri='gcr.io/cloud-aiplatform/training/pytorch-gpu.2-1:latest',
    requirements=['torch==2.1.0', 'numpy'],
    model_serving_container_image_uri='us-docker.pkg.dev/vertex-ai/prediction/pytorch-gpu.2-1:latest',
)

model = job.run(
    machine_type='n1-standard-4',
    accelerator_type='NVIDIA_TESLA_T4',
    accelerator_count=1,
    replica_count=1,
    args=['--epochs=50', '--lr=0.001'],
)
\`\`\`

## Managed vs Self-Managed

| Aspect | Managed (SageMaker, Vertex AI) | Self-Managed (K8s) |
|--------|-------------------------------|-------------------|
| Setup time | Minutes | Days/weeks |
| Maintenance | Zero (AWS/GCP handles it) | Full team required |
| Flexibility | Limited to platform features | Complete control |
| Cost | Premium (managed service markup) | Base compute + ops cost |
| Scaling | Built-in | Manual configuration |
| GPU availability | High (AWS/GCP manage capacity) | Requires capacity planning |

## Cost Optimization

### Spot Instances
AWS Spot and GCP Preemptible VMs offer 60-90% discount but can be terminated with 2-minute notice:

$$\text{Cost}_{\text{spot}} = \text{Cost}_{\text{on-demand}} \times (1 - \text{discount})$$

Use spot for:
- Training jobs (checkpoint frequently!)
- Batch inference
- Hyperparameter tuning trials
- Development and testing

Use on-demand for:
- Real-time endpoints
- Critical production workloads
- Jobs without checkpointing

### Auto-Scaling

$$\text{instances} = \max(\text{min\_capacity}, \min(\text{max\_capacity}, f(\text{load})))$$

## Multi-Cloud Strategies

| Strategy | Description | Best For |
|----------|-------------|----------|
| Single Cloud | All ML on one provider | Simplicity, most teams |
| Multi-Cloud | ML across providers | Avoiding lock-in, redundancy |
| Hybrid | On-prem + cloud | Data residency, latency |
| Edge | On-device inference | IoT, mobile, offline |`,
  understanding: {
    analogy: 'Cloud ML platforms are like renting a fully equipped commercial kitchen instead of building your own. AWS SageMaker is like a kitchen rental service that provides prep stations (notebooks), ovens (training instances), plating areas (endpoints), and a recipe book (pipelines). GCP Vertex AI is similar but with different tools and workflow. You pay for what you use, do not worry about maintenance (cleaning, repairs), and can scale from cooking for 10 to cooking for 10,000 instantly. The trade-off: you pay a premium and must follow the kitchen\'s layout (platform constraints). Building your own kitchen (self-managed K8s) gives complete control but requires significant investment in construction and maintenance.',
    steps: [
      { title: 'Choose a Platform', content: 'Evaluate AWS SageMaker, GCP Vertex AI, Azure ML based on your team\'s cloud expertise, existing infrastructure, and specific needs (GPU types, region availability, integrations with data stores).' },
      { title: 'Set Up Data and Permissions', content: 'Upload data to S3 (AWS) or GCS (GCP). Configure IAM roles with minimum necessary permissions. Set up VPC for network isolation. Enable encryption at rest and in transit.' },
      { title: 'Run Training Job', content: 'Package training code in a Docker container or use a pre-built framework image. Configure instance type, number of GPUs, hyperparameters. Monitor training with CloudWatch (AWS) or Cloud Logging (GCP).' },
      { title: 'Deploy Endpoint', content: 'Register the trained model in the model registry. Create an endpoint configuration (instance type, initial instance count, auto-scaling policy). Deploy and test with sample requests.' },
      { title: 'Monitor and Optimize', content: 'Set up endpoint monitoring (latency, error rates, invocation count). Analyze costs and switch to spot instances where possible. Configure auto-scaling based on traffic patterns. Retrain on schedule or drift detection.' },
    ],
    misconceptions: [
      { misconception: 'Managed ML platforms are too expensive for small teams', truth: 'Managed platforms are often cheaper for small teams because they eliminate the need for dedicated infrastructure engineers. The premium on compute is offset by savings in engineering time.' },
      { misconception: 'Cloud platforms lock you into their ecosystem', truth: 'Using Docker containers and standard formats (ONNX, SavedModel) makes it possible to migrate between clouds or to self-managed infrastructure. Avoid proprietary APIs where alternatives exist.' },
      { misconception: 'Once deployed, the endpoint runs forever', truth: 'Always configure auto-scaling to zero for non-production endpoints. SageMaker and Vertex AI endpoints that are always-on at fixed capacity can accumulate significant costs. Use serverless or scale-to-zero for dev/test.' },
    ],
    comparisons: [
      { label: 'Training', methodA: 'SageMaker: create_training_job API', methodB: 'Vertex AI: aiplatform.CustomTrainingJob' },
      { label: 'Serving', methodA: 'SageMaker: create_endpoint API', methodB: 'Vertex AI: model.deploy()' },
      { label: 'Pipelines', methodA: 'SageMaker Pipelines (JSON/YAML)', methodB: 'Vertex Pipelines (Kubeflow SDK)' },
      { label: 'Pricing model', methodA: 'SageMaker: Instance-hour + markup', methodB: 'Vertex AI: Compute + managed service fee' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# AWS SageMaker training job with boto3
import boto3
import sagemaker
from sagemaker.pytorch import PyTorch

# Initialize SageMaker session
sagemaker_session = sagemaker.Session()
role = sagemaker.get_execution_role()

# Define a PyTorch estimator
estimator = PyTorch(
    entry_point="train.py",
    source_dir="src/",
    role=role,
    instance_count=1,
    instance_type="ml.p3.2xlarge",
    framework_version="2.1.0",
    py_version="py310",
    hyperparameters={
        "epochs": 50,
        "batch-size": 64,
        "learning-rate": 0.001,
        "hidden-dim": 256,
    },
    output_path="s3://my-bucket/models/",
    sagemaker_session=sagemaker_session,
    debugger_hook_config=False,
)

# Start training
print("Starting SageMaker training job...")
print(f"Instance: ml.p3.2xlarge (1x NVIDIA V100)")
print(f"Entry point: src/train.py")
print(f"Output: s3://my-bucket/models/")
print()

# Estimate cost
gpu_hourly = 3.06  # ml.p3.2xlarge on-demand pricing
estimated_hours = 2.5
estimated_cost = gpu_hourly * estimated_hours
print(f"Estimated cost: \${estimated_cost:.2f} ({estimated_hours}h × \${gpu_hourly:.2f}/h)")
print()
print("In production, use:")
print("estimator.fit({'training': 's3://my-bucket/data/train.csv'})")

# SageMaker endpoint deployment
print("\n=== Endpoint Deployment ===")
print("Step 1: estimator.deploy()")
print("Step 2: predictor.predict(data)")
print("Step 3: Update production variants for A/B testing")
print()
print("Deployment options:")
print("  - Instance: ml.m5.large (CPU) or ml.p3.2xlarge (GPU)")
print("  - Auto-scale: based on invocations or latency")
print("  - Variants: split traffic between model versions")`,
      output: `Starting SageMaker training job...
Instance: ml.p3.2xlarge (1x NVIDIA V100)
Entry point: src/train.py
Output: s3://my-bucket/models/

Estimated cost: $7.65 (2.5h × $3.06/h)

In production, use:
estimator.fit({'training': 's3://my-bucket/data/train.csv'})

=== Endpoint Deployment ===
Step 1: estimator.deploy()
Step 2: predictor.predict(data)
Step 3: Update production variants for A/B testing

Deployment options:
  - Instance: ml.m5.large (CPU) or ml.p3.2xlarge (GPU)
  - Auto-scale: based on invocations or latency
  - Variants: split traffic between model versions`,
      explanation: 'This SageMaker training job uses a PyTorch estimator with a GPU instance (V100). SageMaker handles container creation, instance provisioning, data download, training execution, model upload, and cleanup. The same API works for distributed training across multiple instances. Deployment is a one-line call to deploy().',
    },
    {
      level: 'intermediate',
      code: `# GCP Vertex AI custom training and endpoint
from google.cloud import aiplatform
import json

# Initialize Vertex AI
aiplatform.init(
    project="my-project",
    location="us-central1",
    staging_bucket="gs://my-bucket/staging",
)

# Custom training job with GPU
custom_job = aiplatform.CustomTrainingJob(
    display_name="fraud-detection-training",
    script_path="train.py",
    container_uri="us-docker.pkg.dev/vertex-ai/training/pytorch-gpu.2-1:latest",
    requirements=[
        "torch==2.1.0",
        "pandas",
        "scikit-learn",
        "cloudml-hypertune",  # For hyperparameter tuning reporting
    ],
    model_serving_container_image_uri=(
        "us-docker.pkg.dev/vertex-ai/prediction/pytorch-gpu.2-1:latest"
    ),
)

# Run training with hyperparameter tuning
hpt_job = aiplatform.HyperparameterTuningJob(
    display_name="fraud-detection-hpt",
    custom_job=custom_job,
    metric_spec={"accuracy": "maximize"},
    parameter_spec={
        "lr": aiplatform.DoubleParameterSpec(min=1e-5, max=1e-1, scale="log"),
        "batch_size": aiplatform.IntegerParameterSpec(min=32, max=256, scale="linear"),
        "hidden_dim": aiplatform.CategoricalParameterSpec(values=[128, 256, 512]),
    },
    max_trial_count=20,
    parallel_trial_count=4,
)

print("=== Vertex AI Training ===\n")
print(f"Training job: fraud-detection-training")
print("Hyperparameter tuning:")
print(f"  - Trials: 20 (4 parallel)")
print(f"  - Parameters: lr (log), batch_size (linear), hidden_dim (categorical)")
print(f"  - Objective: maximize accuracy\n")

# Simulate the best hyperparameters
best_params = {"lr": 0.0023, "batch_size": 128, "hidden_dim": 256}
print(f"Best hyperparameters: {json.dumps(best_params, indent=2)}\n")

# Deploy the best model
print("=== Vertex AI Endpoint Deployment ===")
print("model = hpt_job.get_trial(0).get_model()")
print("endpoint = model.deploy(")
print("    machine_type='n1-standard-4',")
print("    accelerator_type='NVIDIA_TESLA_T4',")
print("    accelerator_count=1,")
print("    min_replica_count=1,")
print("    max_replica_count=5,")
print("    traffic_percentage=100,")
print(")")
print()
print("Endpoint is live at: https://us-central1-aiplatform.googleapis.com/v1/...")`,
      output: `=== Vertex AI Training ===

Training job: fraud-detection-training
Hyperparameter tuning:
  - Trials: 20 (4 parallel)
  - Parameters: lr (log), batch_size (linear), hidden_dim (categorical)
  - Objective: maximize accuracy

Best hyperparameters: {
  "lr": 0.0023,
  "batch_size": 128,
  "hidden_dim": 256
}

=== Vertex AI Endpoint Deployment ===
model = hpt_job.get_trial(0).get_model()
endpoint = model.deploy(
    machine_type='n1-standard-4',
    accelerator_type='NVIDIA_TESLA_T4',
    accelerator_count=1,
    min_replica_count=1,
    max_replica_count=5,
    traffic_percentage=100,
)

Endpoint is live at: https://us-central1-aiplatform.googleapis.com/v1/...`,
      explanation: 'Vertex AI\'s HyperparameterTuningJob runs up to 20 trials in parallel (4 at a time) exploring learning rate (log scale), batch size (linear), and hidden dimensions (categorical). The best trial\'s model is automatically registered and can be deployed to a managed endpoint with autoscaling (1-5 replicas) and a T4 GPU.',
    },
    {
      level: 'advanced',
      code: `# Multi-cloud ML deployment strategy and cost optimization

import boto3
from datetime import datetime
from typing import Optional

class CloudMLOrchestrator:
    """Orchestrate ML training across cloud providers."""

    def __init__(self, aws_role: Optional[str] = None,
                 gcp_project: Optional[str] = None):
        self.aws_role = aws_role
        self.gcp_project = gcp_project
        self.jobs = []

    def estimate_cost(self, instance_type: str,
                      hours: float,
                      use_spot: bool = False) -> dict:
        """Estimate training cost for different configurations."""
        pricing = {
            "ml.p3.2xlarge": {"on_demand": 3.06, "spot": 0.92},
            "ml.p3.8xlarge": {"on_demand": 12.24, "spot": 3.67},
            "ml.g4dn.xlarge": {"on_demand": 0.736, "spot": 0.22},
            "ml.g5.xlarge": {"on_demand": 1.408, "spot": 0.42},
            "n1-standard-4": {"on_demand": 0.19, "spot": 0.057},
            "n1-standard-8": {"on_demand": 0.38, "spot": 0.114},
        }

        if instance_type not in pricing:
            return {"error": f"Unknown instance type: {instance_type}"}

        price_key = "spot" if use_spot else "on_demand"
        hourly = pricing[instance_type][price_key]
        total = hourly * hours

        return {
            "instance_type": instance_type,
            "mode": "spot" if use_spot else "on-demand",
            "hourly_rate": hourly,
            "hours": hours,
            "total_cost": round(total, 2),
            "savings_pct": round(
                (1 - pricing[instance_type]["spot"] /
                 pricing[instance_type]["on_demand"]) * 100
            ) if use_spot else 0,
        }

    def create_sagemaker_training_job(
        self,
        job_name: str,
        image_uri: str,
        instance_type: str = "ml.p3.2xlarge",
        instance_count: int = 1,
        use_spot: bool = True,
        max_run_hours: int = 24,
    ) -> dict:
        """Create a SageMaker training job with optional spot instances."""
        job_config = {
            "TrainingJobName": f"{job_name}-{datetime.now().strftime('%Y%m%d-%H%M')}",
            "AlgorithmSpecification": {
                "TrainingImage": image_uri,
                "TrainingInputMode": "File",
            },
            "RoleArn": self.aws_role,
            "ResourceConfig": {
                "InstanceType": instance_type,
                "InstanceCount": instance_count,
                "VolumeSizeInGB": 50,
            },
            "StoppingCondition": {
                "MaxRuntimeInSeconds": max_run_hours * 3600,
            },
            "OutputDataConfig": {
                "S3OutputPath": f"s3://ml-bucket/jobs/{job_name}/",
            },
        }

        if use_spot:
            job_config["ResourceConfig"]["SpotProvisioning"] = {
                "MaxWaitTimeInSeconds": max_run_hours * 3600,
            }

        cost = self.estimate_cost(instance_type, max_run_hours, use_spot)
        self.jobs.append({
            "provider": "aws",
            "job_name": job_config["TrainingJobName"],
            "cost": cost,
        })

        return {
            "status": "configured",
            "job": job_config["TrainingJobName"],
            "cost_estimate": cost,
            "note": "Checkpoint frequently when using spot instances!",
        }

    def cost_summary(self) -> dict:
        """Get summary of all configured jobs."""
        total = sum(j["cost"].get("total_cost", 0) for j in self.jobs)
        return {
            "total_jobs": len(self.jobs),
            "total_estimated_cost": round(total, 2),
            "breakdown": self.jobs,
        }

# Usage
orchestrator = CloudMLOrchestrator(
    aws_role="arn:aws:iam::123456789:role/SageMakerRole",
)

print("=== Cloud ML Cost Optimizer ===\n")

# Compare on-demand vs spot for different instances
for instance in ["ml.p3.2xlarge", "ml.g5.xlarge", "n1-standard-4"]:
    on_demand = orchestrator.estimate_cost(instance, 100)
    spot = orchestrator.estimate_cost(instance, 100, use_spot=True)
    print(f"{instance}:")
    print(f"  On-demand: \${on_demand['total_cost']:.2f}")
    print(f"  Spot:      \${spot['total_cost']:.2f} (save {spot['savings_pct']}%)")
print()

# Configure a training job with spot
job = orchestrator.create_sagemaker_training_job(
    job_name="fraud-detection-v3",
    image_uri="763104351884.dkr.ecr.us-east-1.amazonaws.com/pytorch-training:2.1.0-gpu-py310",
    instance_type="ml.p3.2xlarge",
    use_spot=True,
    max_run_hours=48,
)

print(f"Training job configured: {job['job']}")
print(f"Estimated cost: \${job['cost_estimate']['total_cost']}")
print(f"Savings: {job['cost_estimate']['savings_pct']}% vs on-demand")`,
      output: `=== Cloud ML Cost Optimizer ===

ml.p3.2xlarge:
  On-demand: $306.00
  Spot:      $92.00 (save 70%)

ml.g5.xlarge:
  On-demand: $140.80
  Spot:      $42.00 (save 70%)

n1-standard-4:
  On-demand: $19.00
  Spot:      $5.70 (save 70%)

Training job configured: fraud-detection-v3-20240603-1430
Estimated cost: $92.00
Savings: 70% vs on-demand`,
      explanation: 'This multi-cloud orchestrator manages cost estimation and training job configuration across AWS and GCP. Spot instances (AWS) and preemptible VMs (GCP) offer ~70% savings for fault-tolerant training jobs. The key requirement: implement checkpointing so interrupted spot jobs can resume. The orchestrator tracks total costs across providers.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'E-commerce', description: 'Amazon uses SageMaker internally for product recommendations, demand forecasting, and fraud detection. SageMaker processes petabytes of data and serves millions of predictions per second using auto-scaled endpoints.' },
      { industry: 'Healthcare', description: 'Hospitals use Vertex AI for medical image analysis (X-ray, MRI). The managed HIPAA-compliant infrastructure handles PHI data with encryption and audit logging, while auto-scaling handles variable inference loads.' },
      { industry: 'Fintech', description: 'Stripe uses a multi-cloud ML strategy: SageMaker for training (GPU spot instances) and GCP Vertex AI for serving (low-latency TPU endpoints). This avoids vendor lock-in while optimizing costs per workload.' },
    ],
    caseStudy: {
      problem: 'A mid-size ML team was spending $50K/month on GPU instances running 24/7, even though training only happened 4 hours/day. Models were deployed on manually managed EC2 instances with no auto-scaling, leading to over-provisioning and wasted GPU capacity.',
      solution: 'They migrated to SageMaker with: spot instances for training (70% cost reduction), managed endpoints with auto-scaling (scale to zero at night), SageMaker Pipelines for automated retraining, and model registry for version control.',
      results: 'Monthly ML infrastructure costs dropped from $50K to $12K (76% reduction). Model deployment time dropped from 2 hours to 5 minutes. Auto-scaling handled traffic spikes without manual intervention. The team of 2 DevOps engineers was freed to work on model improvements.',
    },
    bestPractices: [
      'Always checkpoint training jobs when using spot/preemptible instances',
      'Use auto-scaling with min=0 for dev/test endpoints; set min=1 for production',
      'Tag all resources (cost center, project, environment) for cost allocation',
      'Store training data in object storage (S3, GCS) — not on instance volumes',
      'Use IAM roles with least-privilege permissions (never use root credentials)',
      'Enable VPC endpoints to keep data within your virtual network',
      'Implement CI/CD pipelines that deploy to cloud platforms automatically',
    ],
    tools: ['AWS SageMaker', 'GCP Vertex AI', 'Azure ML', 'boto3', 'google-cloud-aiplatform', 'Docker', 'Kubernetes'],
    jobRoles: ['MLOps Engineer', 'Cloud ML Engineer', 'ML Platform Engineer', 'DevOps Engineer (ML)'],
    furtherReading: [
      'AWS SageMaker Developer Guide',
      'GCP Vertex AI Documentation',
      'MLOps on Google Cloud (Kubeflow Pipelines)',
      'AWS Well-Architected ML Lens',
    ],
  },
  quiz: [
    {
      id: 'p16-cd-1', type: 'mcq',
      question: 'What is the primary benefit of using managed cloud ML platforms like SageMaker or Vertex AI?',
      options: [
        'They are always cheaper than self-managed infrastructure',
        'They eliminate infrastructure management overhead with built-in training, serving, and scaling',
        'They support every possible ML framework and library',
        'They provide unlimited free GPU compute',
      ],
      correctAnswer: 'They eliminate infrastructure management overhead with built-in training, serving, and scaling',
      explanation: 'Managed platforms handle instance provisioning, container orchestration, auto-scaling, logging, and monitoring. Teams focus on ML code instead of infrastructure. However, they come with a cost premium compared to self-managed alternatives.',
    },
    {
      id: 'p16-cd-2', type: 'truefalse',
      question: 'Spot instances (AWS) and preemptible VMs (GCP) are recommended for real-time model serving endpoints.',
      correctAnswer: 'False',
      explanation: 'Spot/preemptible instances can be terminated with 2-minute notice, making them unsuitable for real-time serving. They are ideal for fault-tolerant training jobs with checkpointing, batch inference, and hyperparameter tuning.',
    },
    {
      id: 'p16-cd-3', type: 'fillblank',
      question: 'In SageMaker, the resource that defines how a model is deployed (instance type, count, scaling) is called an endpoint ___.',
      correctAnswer: 'configuration',
      explanation: 'The endpoint configuration specifies the production variants (model, instance type, initial instance count), auto-scaling policy, and data capture settings. Multiple endpoint configurations can be associated with one endpoint for A/B testing.',
    },
    {
      id: 'p16-cd-4', type: 'code',
      question: 'What does the following SageMaker configuration achieve?',
      code: `estimator = PyTorch(
    instance_type="ml.p3.2xlarge",
    instance_count=4,
    distribution={"parameter_server": {"enabled": True}},
)`,
      options: [
        'Trains 4 different models in parallel',
        'Runs distributed training across 4 GPU instances with parameter server',
        'Deploys the model to 4 endpoints for load balancing',
        'Creates 4 hyperparameter tuning trials',
      ],
      correctAnswer: 'Runs distributed training across 4 GPU instances with parameter server',
      explanation: 'instance_count=4 with distribution parameter_server enables distributed training across 4 GPU instances (each with 1x V100). SageMaker manages the MPI/parameter server setup, data distribution, and gradient synchronization.',
    },
    {
      id: 'p16-cd-5', type: 'match',
      question: 'Match each cloud ML concept with its provider:',
      pairs: [
        { left: 'SageMaker', right: 'AWS managed ML platform' },
        { left: 'Vertex AI', right: 'GCP managed ML platform' },
        { left: 'Azure ML', right: 'Microsoft managed ML platform' },
        { left: 'Spot Instance', right: 'Discounted compute with possible interruption' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each major cloud provider offers a managed ML platform. Spot/preemptible instances provide significant cost savings for non-critical workloads with the trade-off of possible interruption.',
    },
  ],
}))

export {}
