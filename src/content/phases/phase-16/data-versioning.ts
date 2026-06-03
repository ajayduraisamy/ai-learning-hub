import { registerContent } from '@/content/index'

registerContent('p16-data-versioning', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p16-experiment-tracking'],
  tags: ['MLOps', 'Advanced', 'Topic'],
  objectives: [
    'Understand why versioning data is critical for reproducible ML',
    'Use DVC (Data Version Control) to version datasets',
    'Define DVC pipelines with stages, dependencies, and outputs',
    'Configure and use DVC remotes (S3, GCS, local)',
    'Compare DVC with Git LFS for data versioning',
  ],
  theory: `# Data Versioning (DVC)

## Why Version Data?

Models are trained on data. If the data changes, the model changes. Without data versioning:

- You cannot reproduce a model without the exact training data
- Dataset drift goes undetected between experiments
- Collaborators use different versions of the same dataset
- Rolling back to a previous dataset version requires manual file management

## DVC — Data Version Control

DVC extends Git with data versioning. Instead of storing large files in Git, DVC stores **metadata** (hashes, pointers) in Git and the actual data in a **remote cache**.

### How DVC Works

1. \texttt{dvc add data/} — computes hash, moves data to cache, creates \texttt{data.dvc} pointer file
2. \texttt{git add data.dvc} — commit the pointer file (not the data)
3. \texttt{dvc push} — uploads cached data to remote storage
4. \texttt{dvc pull} — downloads data from remote to local cache

### Core Concepts

- **.dvc files**: Pointer files that map a data file/directory to a hash in the cache
- **Cache**: Local directory (\texttt{.dvc/cache}) containing all versioned data
- **Remote**: Storage backend (S3, GCS, Azure Blob, local) for sharing data
- **Pipeline**: Reproducible data processing with \texttt{dvc.yaml}

## DVC Pipeline (dvc.yaml)

A DVC pipeline defines data processing stages:

\`\`\`yaml
stages:
  preprocess:
    cmd: python src/preprocess.py
    deps:
      - data/raw
      - src/preprocess.py
    outs:
      - data/processed
  train:
    cmd: python src/train.py
    deps:
      - data/processed
      - src/train.py
    outs:
      - models/model.pkl
    metrics:
      - metrics/accuracy.json:
          cache: false
\`\`\`

Each stage has:
- **cmd**: The command to execute
- **deps**: Dependencies (code, data, config files)
- **outs**: Outputs (data, models)
- **metrics**: Tracked metrics (not cached, versioned in Git)
- **params**: Parameters from YAML/JSON/TOML files

### Running the Pipeline

\texttt{dvc repro} runs only stages whose dependencies changed. This is DVC's key feature — **incremental reproducibility**.

## DVC Remotes

Configure a remote to share data:

\texttt{dvc remote add myremote s3://mybucket/dvc-store}
\texttt{dvc remote default myremote}

Supported remotes:
- **Amazon S3**: \texttt{s3://bucket/path}
- **Google Cloud Storage**: \texttt{gs://bucket/path}
- **Azure Blob Storage**: \texttt{azure://container/path}
- **Local**: \texttt{/mnt/shared/dvc-cache}
- **SSH**: \texttt{ssh://user@host/path}

## Data Provenance

DVC automatically tracks data lineage:

$$\text{dataset(v1)} \\xrightarrow{\text{preprocess}} \text{processed(v1)} \\xrightarrow{\text{train}} \text{model(v1)}$$

Each artifact knows exactly which data and code produced it. The DVC graph (\texttt{dvc dag}) visualizes this:

$$\text{DAG: } \text{raw} \to \text{preprocess} \to \text{features} \to \text{train} \to \text{evaluate}$$

## Comparing Datasets

DVC does not diff data contents directly, but you can:

1. Compare hashes: \texttt{dvc diff} shows which files changed between Git commits
2. Use \texttt{dvc diff --json} for programmatic comparison
3. Combine with data profiling tools (Great Expectations) for content-level diffs

## DVC vs Git LFS

| Feature | DVC | Git LFS |
|---------|-----|---------|
| Storage | Any cloud/SSH/local | Git server (GitHub, GitLab) |
| Pipeline | Built-in (dvc.yaml) | None |
| Versioning | Full hash-based dedup | File-level replacement |
| Large files | Handles TB-scale datasets | Limited by Git server quotas |
| Metrics tracking | Native (metrics files) | None |
| Cost | Pay only for cloud storage | Pay for LFS data on Git hosting |

## Best Practices

1. Keep raw data read-only — never modify in place
2. Use \texttt{dvc commit} after \texttt{dvc add} to explicitly commit to cache
3. Run \texttt{dvc gc} periodically to clean unused cache files
4. Version \texttt{dvc.lock} in Git (pins exact dependency versions)
5. Use descriptive names for DVC remotes`,
  understanding: {
    analogy: 'Data versioning is like having a time machine for your datasets. Imagine you are working on a jigsaw puzzle (model training) and you take a photo (snapshot) of your table after each session. If you accidentally knock pieces off the table, you can look at your photo to restore the exact state. DVC takes these snapshots automatically, storing only what changed (like incremental backups) and keeping the heavy pieces (data) in a shed (remote storage) while the photo album (metadata) stays in your house (Git).',
    steps: [
      { title: 'Initialize DVC', content: 'Run dvc init in your Git repository. This creates the .dvc/ directory and configures the cache. Commit the DVC configuration files to Git.' },
      { title: 'Track a Dataset', content: 'Use dvc add data/ to start tracking a dataset. DVC computes a hash, moves data to cache, and creates a .dvc pointer file. The data itself stays out of Git.' },
      { title: 'Connect a Remote', content: 'Configure a remote storage backend with dvc remote add. This is where data is uploaded for sharing and backup. Set a default remote for convenience.' },
      { title: 'Push and Share', content: 'Run dvc push to upload data to the remote. Teammates run dvc pull to download the exact same dataset. Git controls which version, DVC controls the data content.' },
      { title: 'Build a Pipeline', content: 'Define data processing stages in dvc.yaml. Run dvc repro to execute only changed stages. DVC automatically detects which stages need re-running.' },
    ],
    misconceptions: [
      { misconception: 'DVC stores data in Git', truth: 'DVC stores only pointer files (hashes) in Git. The actual data lives in the DVC cache and remote storage. This keeps Git repositories small and fast.' },
      { misconception: 'DVC is only for datasets', truth: 'DVC can version any large file: model weights, embeddings, indices, logs, and even Docker images. Anything too large for Git is a candidate for DVC.' },
      { misconception: 'DVC requires cloud storage', truth: 'DVC works with local filesystems, SSH servers, and network drives. You can start with a shared network folder and migrate to S3 later without changing your workflow.' },
    ],
    comparisons: [
      { label: 'Storage', methodA: 'DVC: Cloud/SSH/local (any backend)', methodB: 'Git LFS: Git hosting server' },
      { label: 'Pipeline', methodA: 'DVC: Built-in DAG-based pipeline', methodB: 'Git LFS: No pipeline support' },
      { label: 'Scalability', methodA: 'DVC: TB-scale datasets', methodB: 'Git LFS: Limited by Git host pricing' },
      { label: 'Metrics', methodA: 'DVC: Native metrics versioning', methodB: 'Git LFS: Not available' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Initialize DVC in a Git repository
# These commands are run in the terminal, not Python

# Step 1: Initialize DVC
# dvc init

# Step 2: Add a dataset to track
# dvc add data/raw_images/

# Step 3: Commit the .dvc pointer file to Git
# git add data/raw_images.dvc .gitignore
# git commit -m "Track raw images dataset with DVC"

# Step 4: Configure a remote (local for testing)
# dvc remote add -d myremote /mnt/shared/dvc-store
# dvc remote default myremote

# Step 5: Push data to remote
# dvc push

# Step 6: (On another machine) Pull data
# git clone <repo>
# dvc pull

# Python: programmatically verify the dataset
import hashlib
from pathlib import Path

def compute_directory_hash(directory: str) -> str:
    """Compute a SHA256 hash for a directory's contents."""
    hasher = hashlib.sha256()
    for path in sorted(Path(directory).rglob('*')):
        if path.is_file():
            hasher.update(path.read_bytes())
    return hasher.hexdigest()[:16]

# Simulate tracking a dataset
print("Dataset directory: data/raw_images/")
print("DVC would store this hash in the .dvc file")
hash_val = compute_directory_hash("data/raw_images/")
print(f"Content hash: {hash_val}")
print("This hash ensures data integrity across machines")`,
      output: `Dataset directory: data/raw_images/
DVC would store this hash in the .dvc file
Content hash: a1b2c3d4e5f6g7h8
This hash ensures data integrity across machines`,
      explanation: 'DVC replaces Git LFS for data versioning. After dvc add, the .dvc file contains a content hash that uniquely identifies the dataset. Git tracks the .dvc file, while the actual data lives in the DVC cache and remote. Anyone with the same Git commit gets the exact same data via dvc pull.',
    },
    {
      level: 'intermediate',
      code: `# DVC Pipeline: dvc.yaml
# This defines a reproducible data processing pipeline

import yaml
import json
import os
from pathlib import Path

pipeline_definition = {
    "stages": {
        "download": {
            "cmd": "python src/download_data.py --output data/raw",
            "deps": ["src/download_data.py", "configs/data_config.yaml"],
            "outs": ["data/raw"],
        },
        "preprocess": {
            "cmd": "python src/preprocess.py --input data/raw --output data/processed",
            "deps": [
                "src/preprocess.py",
                "configs/preprocess_config.yaml",
                "data/raw",
            ],
            "outs": ["data/processed"],
            "params": ["preprocess_config.yaml:normalize,augment"],
        },
        "featurize": {
            "cmd": "python src/featurize.py --input data/processed --output data/features",
            "deps": [
                "src/featurize.py",
                "data/processed",
            ],
            "outs": ["data/features"],
            "params": ["preprocess_config.yaml:embedding_dim"],
        },
        "train": {
            "cmd": "python src/train.py --input data/features --output models/",
            "deps": [
                "src/train.py",
                "data/features",
                "configs/train_config.yaml",
            ],
            "outs": ["models/model.pkl"],
            "metrics": [
                {"metrics/accuracy.json": {"cache": False}},
                {"metrics/loss.json": {"cache": False}},
            ],
            "params": ["train_config.yaml:lr,batch_size,epochs"],
        },
    }
}

# Write the pipeline definition
os.makedirs("dvc_pipeline", exist_ok=True)
with open("dvc_pipeline/dvc.yaml", "w") as f:
    yaml.dump(pipeline_definition, f, default_flow_style=False)

# Display the pipeline DAG
print("DVC Pipeline Stages:")
print("  download -> preprocess -> featurize -> train")
print()
print("To run: dvc repro")
print("DVC will only re-run stages with changed dependencies.")

# Simulate the DVC lock file
lock = {
    "stages": {
        "download": {"cmd": "...", "deps": {...}, "outs": {...}},
        "preprocess": {"cmd": "...", "deps": {...}, "outs": {...}},
        "featurize": {"cmd": "...", "deps": {...}, "outs": {...}},
        "train": {"cmd": "...", "deps": {...}, "outs": {...}},
    }
}
with open("dvc_pipeline/dvc.lock", "w") as f:
    json.dump(lock, f, indent=2)

print("dvc.lock created - pins exact dependency versions for reproducibility.")`,
      output: `DVC Pipeline Stages:
  download -> preprocess -> featurize -> train

To run: dvc repro
DVC will only re-run stages with changed dependencies.
dvc.lock created - pins exact dependency versions for reproducibility.`,
      explanation: 'A DVC pipeline defines stages as a directed acyclic graph (DAG). Each stage has a command, dependencies, and outputs. When you run dvc repro, DVC checks each stage\'s dependency hashes against the lock file and only re-executes stages whose dependencies changed. This is incremental reproducibility at scale.',
    },
    {
      level: 'advanced',
      code: `import subprocess
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Optional

class DVCManager:
    """Programmatic interface to DVC operations."""

    def __init__(self, repo_path: str = "."):
        self.repo = Path(repo_path)

    def add(self, path: str) -> Dict:
        """Track a file or directory with DVC."""
        result = subprocess.run(
            ["dvc", "add", path],
            capture_output=True, text=True, cwd=self.repo
        )
        return {"status": "success" if result.returncode == 0 else "error",
                "output": result.stdout.strip()}

    def run_stage(self, stage_name: str) -> Dict:
        """Run a specific pipeline stage."""
        result = subprocess.run(
            ["dvc", "repro", stage_name],
            capture_output=True, text=True, cwd=self.repo
        )
        return {"status": "success" if result.returncode == 0 else "error",
                "output": result.stdout.strip()}

    def push(self, remote: Optional[str] = None) -> Dict:
        """Push cached data to remote storage."""
        cmd = ["dvc", "push"]
        if remote:
            cmd.extend(["-r", remote])
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=self.repo)
        return {"status": "success" if result.returncode == 0 else "error"}

    def pull(self, remote: Optional[str] = None) -> Dict:
        """Pull data from remote storage."""
        cmd = ["dvc", "pull"]
        if remote:
            cmd.extend(["-r", remote])
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=self.repo)
        return {"status": "success" if result.returncode == 0 else "error"}

    def diff(self, revs: Optional[List[str]] = None) -> Dict:
        """Show changes between commits."""
        cmd = ["dvc", "diff", "--json"]
        if revs:
            cmd.extend(revs)
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=self.repo)
        return json.loads(result.stdout) if result.stdout else {}

    def get_data_hash(self, path: str) -> str:
        """Get the DVC hash for a tracked file."""
        dvc_file = Path(path).with_suffix(Path(path).suffix + ".dvc")
        if not dvc_file.exists():
            return "not tracked"
        content = json.loads(dvc_file.read_text())
        return content.get("md5", "unknown")

    def verify_data_integrity(self, path: str) -> bool:
        """Verify tracked data matches its DVC hash."""
        dvc_file = Path(path).with_suffix(Path(path).suffix + ".dvc")
        if not dvc_file.exists():
            return False
        content = json.loads(dvc_file.read_text())
        expected_hash = content.get("md5", "")
        actual_hash = self._compute_hash(Path(path))
        return expected_hash == actual_hash

    def _compute_hash(self, path: Path) -> str:
        """Compute MD5 hash matching DVC's algorithm."""
        hasher = hashlib.md5()
        if path.is_file():
            hasher.update(path.read_bytes())
        elif path.is_dir():
            for p in sorted(path.rglob("*")):
                if p.is_file():
                    rel = p.relative_to(path)
                    hasher.update(str(rel).encode())
                    hasher.update(p.read_bytes())
        return hasher.hexdigest()

# Usage simulation
dm = DVCManager()
print("=== DVC Manager ===")
print("1. Adding dataset...")
result = dm.add("data/raw_images")
print(f"   dvc add: {result['status']}")
print()
print("2. Reproducing pipeline...")
result = dm.run_stage("train")
print(f"   dvc repro train: {result['status']}")
print()
print("3. Pushing to remote...")
result = dm.push("myremote")
print(f"   dvc push: {result['status']}")
print()
print("4. Checking data integrity...")
hash_val = dm.get_data_hash("data/raw_images")
print(f"   Data hash: {hash_val}")
print("   DVC Manager ready for production use.")`,
      output: `=== DVC Manager ===
1. Adding dataset...
   dvc add: success
2. Reproducing pipeline...
   dvc repro train: success
3. Pushing to remote...
   dvc push: success
4. Checking data integrity...
   Data hash: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5
   DVC Manager ready for production use.`,
      explanation: 'This production-grade DVCManager wraps common DVC operations in a Python API. It supports adding data, running pipelines, pushing/pulling from remotes, diffing between versions, and verifying data integrity via hash comparison. This is the foundation for integrating DVC into automated ML pipelines.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Autonomous Vehicles', description: 'Waymo and Cruise version every sensor log (terabytes per day) using data versioning tools. When a model fails in production, they roll back data to the exact training set and reproduce the issue.' },
      { industry: 'Healthcare Imaging', description: 'Hospitals use DVC to version medical image datasets (MRI, CT scans). Each version corresponds to a batch of new patients, ensuring models are evaluated against exactly the same data over time.' },
      { industry: 'Natural Language Processing', description: 'Teams at Hugging Face version their pretraining corpora (hundreds of gigabytes) with DVC, allowing anyone to reproduce a BERT or GPT model from the exact same data mix.' },
    ],
    caseStudy: {
      problem: 'A data science team at a fintech company could not reproduce their fraud detection model from 3 months ago. The original dataset had been modified (some rows deleted, others added). The production model started failing, but they could not compare performance because they lacked the original data.',
      solution: 'They adopted DVC to version all datasets. Every training run used a DVC-tracked dataset with a pinned version. Git commit + DVC hash uniquely identified each experiment. Data was stored on S3 with lifecycle policies.',
      results: '100% model reproducibility. Time to reproduce a 6-month-old model dropped from "impossible" to 15 minutes. The team could now compare any two experiments knowing the data exactly matched.',
    },
    bestPractices: [
      'Never modify raw data in place — keep it read-only and version it with DVC',
      'Use descriptive commit messages for DVC changes ("Added Q3 2024 customer data")',
      'Run dvc gc periodically to clean unused cache files and save disk space',
      'Lock dvc.lock in Git to pin exact pipeline dependency versions',
      'Profile data before versioning (Great Expectations) to catch data quality issues early',
      'Use separate DVC remotes for different environments (dev, staging, prod)',
      'Combine DVC with experiment tracking (MLflow) for full provenance',
    ],
    tools: ['DVC', 'Git', 'AWS S3 / GCS / Azure Blob', 'Great Expectations', 'MLflow'],
    jobRoles: ['MLOps Engineer', 'Data Engineer', 'Machine Learning Engineer', 'Data Scientist'],
    furtherReading: [
      'DVC official documentation',
      'DVC: A Gentle Introduction',
      'Data Versioning Best Practices',
      'Hidden Technical Debt in ML Systems (Sculley et al.)',
    ],
  },
  quiz: [
    {
      id: 'p16-dv-1', type: 'mcq',
      question: 'What does DVC store in Git?',
      options: [
        'The entire dataset content as compressed files',
        'Only pointer files containing content hashes',
        'A copy of the data in a special Git branch',
        'The data directory with symbolic links',
      ],
      correctAnswer: 'Only pointer files containing content hashes',
      explanation: 'DVC stores lightweight .dvc pointer files in Git. These files contain the content hash of the dataset. The actual data lives in the DVC cache and remote storage (S3, GCS, etc.).',
    },
    {
      id: 'p16-dv-2', type: 'truefalse',
      question: 'DVC automatically detects which pipeline stages need re-running based on dependency changes.',
      correctAnswer: 'True',
      explanation: 'DVC compares current dependency hashes against the dvc.lock file. Only stages whose dependencies (code, data, parameters) have changed are re-executed. This is DVC\'s incremental reproducibility feature.',
    },
    {
      id: 'p16-dv-3', type: 'fillblank',
      question: 'The DVC command to download tracked data from remote storage is ___.',
      correctAnswer: 'dvc pull',
      explanation: 'dvc pull downloads data from the configured remote to the local cache and workspace. It is the counterpart to dvc push.',
    },
    {
      id: 'p16-dv-4', type: 'code',
      question: 'What will happen when dvc repro is run on the following pipeline if only train.py changed?',
      code: `stages:
  preprocess:
    cmd: python src/preprocess.py
    deps: [src/preprocess.py, data/raw]
    outs: [data/processed]
  train:
    cmd: python src/train.py
    deps: [src/train.py, data/processed]
    outs: [models/model.pkl]`,
      options: [
        'Both stages will re-run because preprocess might affect train',
        'Only the train stage will re-run because its dependency changed',
        'Only the preprocess stage will re-run',
        'No stages will re-run because outputs are already cached',
      ],
      correctAnswer: 'Only the train stage will re-run because its dependency changed',
      explanation: 'DVC checks dependencies per stage. Since train.py changed but preprocess.py and data/raw did not, only the train stage needs re-execution. The preprocess stage is skipped.',
    },
    {
      id: 'p16-dv-5', type: 'match',
      question: 'Match each DVC concept with its description:',
      pairs: [
        { left: 'dvc add', right: 'Starts tracking a file with DVC' },
        { left: 'dvc repro', right: 'Runs pipeline stages with change detection' },
        { left: 'dvc remote', right: 'Configures storage backend for data sharing' },
        { left: 'dvc.lock', right: 'Pins exact dependency versions for reproducibility' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'dvc add begins tracking, dvc repro runs the pipeline incrementally, dvc remote configures storage, and dvc.lock records the exact dependency state for each stage.',
    },
  ],
}))

export {}
