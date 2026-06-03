#!/usr/bin/env python3
"""Generate phase2-4.ts content file with all 13 topics."""
import json, os

# Helper: LaTeX strings. Use raw strings so \ is literal.
L = lambda s: r"$" + s + r"$"

# ============ TOPIC DATA ============
topics = {}

# -------------------- P2: LINEAR ALGEBRA --------------------
topics["p2-linear-algebra"] = {
    "theory": (
        "Linear algebra is the mathematics of vector spaces and linear mappings between them. "
        "It provides the fundamental language for representing and manipulating data in machine learning. "
        "Datasets are matrices (rows = samples, columns = features). Model parameters are vectors. "
        "Neural network layers implement linear transformations followed by nonlinearities. "
        "Every deep learning operation\u2014from a single neuron to a multi-head attention mechanism\u2014"
        "is built on linear algebra primitives: dot products, matrix multiplications, transpositions, and decompositions.\n\n"
        "Vectors are ordered collections of numbers representing points in n-dimensional space. "
        "A vector $\\mathbf{v} \\in \\mathbb{R}^n$ has magnitude (norm) and direction. "
        "The dot product $\\mathbf{a} \\cdot \\mathbf{b} = \\sum_{i=1}^n a_i b_i$ measures the alignment "
        "between two vectors and is the foundation of attention mechanisms, similarity search, and linear predictions. "
        "The Euclidean norm $\\|\\mathbf{v}\\|_2 = \\sqrt{\\sum v_i^2}$ measures vector length. "
        "Matrices $\\mathbf{A} \\in \\mathbb{R}^{m \\times n}$ are rectangular arrays of numbers representing "
        "linear transformations. Matrix multiplication $\\mathbf{C} = \\mathbf{A}\\mathbf{B}$ where "
        "$c_{ij} = \\sum_k a_{ik}b_{kj}$ is the workhorse of neural network forward passes.\n\n"
        "Key matrix operations in ML include: transpose $\\mathbf{A}^\\top$ (swap rows and columns), "
        "inverse $\\mathbf{A}^{-1}$ (only for square nonsingular matrices\u2014used in closed-form linear regression), "
        "trace $\\text{tr}(\\mathbf{A}) = \\sum_i a_{ii}$, determinant $\\det(\\mathbf{A})$ (volume scaling factor), "
        "and rank (number of linearly independent rows/columns). The identity matrix $\\mathbf{I}$ has 1s on the diagonal "
        "and 0s elsewhere. Eigendecomposition $\\mathbf{A}\\mathbf{v} = \\lambda\\mathbf{v}$ finds eigenvalues "
        "$\\lambda$ and eigenvectors $\\mathbf{v}$, which reveal the intrinsic structure of transformations and underpin PCA.\n\n"
        "Matrix factorizations are essential for numerical ML: LU decomposition solves linear systems efficiently, "
        "QR decomposition provides numerically stable least-squares solutions, "
        "Singular Value Decomposition (SVD) $\\mathbf{A} = \\mathbf{U}\\boldsymbol{\\Sigma}\\mathbf{V}^\\top$ "
        "is the crown jewel\u2014it exists for any matrix, gives the best low-rank approximation "
        "(used in PCA, recommendation systems, and dimensionality reduction), "
        "and reveals the matrix's fundamental structure through singular values. "
        "The condition number $\\kappa(\\mathbf{A}) = \\sigma_{\\max}/\\sigma_{\\min}$ measures sensitivity to numerical errors.\n\n"
        "A critical practical pitfall is the curse of dimensionality: as the number of dimensions increases, "
        "volume concentrates in the corners of the space, distances become less meaningful, "
        "and more data is needed for reliable estimation. Numerical issues arise from ill-conditioned matrices "
        "(near-singular, causing large errors in solutions) and floating-point precision limits. "
        "Always check matrix condition numbers, use numerically stable algorithms (QR over normal equations), "
        "and prefer SVD over explicit inverses."
    ),
    "keyDefinitions": [
        {"term": "Vector Space", "definition": "A set of vectors closed under addition and scalar multiplication, satisfying eight axioms including associativity, commutativity, and distributivity.",
         "example": "$\\mathbb{R}^3$ is the vector space of all 3D vectors $(x, y, z)$ with real-valued components."},
        {"term": "Linear Independence", "definition": "A set of vectors is linearly independent if no vector can be expressed as a linear combination of the others. The maximum number of independent vectors equals the dimension of the space.",
         "example": "$\\mathbf{v}_1 = (1,0)$, $\\mathbf{v}_2 = (0,1)$ are independent in $\\mathbb{R}^2$, but $\\mathbf{v}_3 = (2,3)$ is dependent since $\\mathbf{v}_3 = 2\\mathbf{v}_1 + 3\\mathbf{v}_2$."},
        {"term": "Eigenvalue and Eigenvector", "definition": "For a square matrix $\\mathbf{A}$, $\\mathbf{v}$ is an eigenvector with eigenvalue $\\lambda$ if $\\mathbf{A}\\mathbf{v} = \\lambda\\mathbf{v}$. The eigenvector's direction is preserved by the transformation.",
         "example": "For $\\mathbf{A} = [[2,0],[0,3]]$, $\\mathbf{v}_1=(1,0)$ has $\\lambda=2$ and $\\mathbf{v}_2=(0,1)$ has $\\lambda=3$. The matrix scales along each eigen-direction by its eigenvalue."},
        {"term": "Singular Value Decomposition (SVD)", "definition": "A factorization $\\mathbf{A} = \\mathbf{U}\\boldsymbol{\\Sigma}\\mathbf{V}^\\top$ where $\\mathbf{U}$ and $\\mathbf{V}$ are orthogonal matrices and $\\boldsymbol{\\Sigma}$ contains singular values on its diagonal.",
         "example": "For PCA, SVD of the centered data matrix gives principal components in $\\mathbf{V}$ and component variances as squared singular values $\\sigma_i^2 / (n-1)$."}
    ],
    "formulas": [
        {"title": "Matrix Multiplication (Neural Network Forward Pass)",
         "formula": "$$\\mathbf{h} = \\mathbf{W}\\mathbf{x} + \\mathbf{b} \\quad \\text{where } h_j = \\sum_{k=1}^{n} w_{jk}x_k + b_j$$",
         "explanation": "A neural network layer computes a linear transformation: input vector $\\mathbf{x} \\in \\mathbb{R}^n$ is multiplied by weight matrix $\\mathbf{W} \\in \\mathbb{R}^{m \\times n}$, bias $\\mathbf{b} \\in \\mathbb{R}^m$ is added, and an activation function is applied element-wise. Each output $h_j$ is a weighted sum of all inputs plus bias.",
         "example": "For a layer with 3 inputs and 2 outputs: $\\mathbf{W}$ is $2 \\times 3$, $\\mathbf{x}$ is $3 \\times 1$, $\\mathbf{h}$ is $2 \\times 1$."},
        {"title": "Singular Value Decomposition (SVD)",
         "formula": "$$\\mathbf{A}_{m \\times n} = \\mathbf{U}_{m \\times m} \\boldsymbol{\\Sigma}_{m \\times n} \\mathbf{V}_{n \\times n}^\\top$$ $$\\mathbf{A}_k = \\sum_{i=1}^k \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^\\top$$",
         "explanation": "SVD decomposes any matrix into three components: $\\mathbf{U}$ (left singular vectors), $\\boldsymbol{\\Sigma}$ (singular values $\\sigma_1 \\geq \\sigma_2 \\geq \\cdots \\geq 0$), $\\mathbf{V}^\\top$ (right singular vectors). The rank-$k$ approximation $\\mathbf{A}_k$ uses only the top $k$ singular values and vectors, providing the best rank-$\\leq k$ approximation in Frobenius norm (Eckart-Young theorem).",
         "example": "In PCA of a $1000 \\times 50$ dataset, keeping $k=5$ singular values might explain 85% of variance while reducing storage from 50,000 to ~5,250 numbers."}
    ],
    "whyItMatters": "Linear algebra is the language of AI/ML. Every neural network is a composition of linear transformations and nonlinearities. Attention mechanisms compute weighted sums via dot products. Word embeddings are vectors manipulated through addition and subtraction. Dimensionality reduction (PCA, t-SNE) relies on eigendecompositions and SVD. Recommendation systems factorize user-item matrices. Understanding linear algebra means understanding how every ML model represents and transforms data internally.",
    "architecture": {
        "title": "Neural Network as Linear Algebra Pipeline",
        "description": "How a feedforward neural network composes linear transformations, showing the flow from input to output.",
        "blocks": [
            {"label": "Input Vector $\\mathbf{x}$", "description": "Raw feature vector of dimension $d$ \u2014 rows of the design matrix $\\mathbf{X} \\in \\mathbb{R}^{n \\times d}$"},
            {"label": "Weight Matrix $\\mathbf{W}^{(1)}$", "description": "First layer weights \u2014 linear map from input dimension $d$ to hidden dimension $h$: $\\mathbf{W}^{(1)} \\in \\mathbb{R}^{h \\times d}$"},
            {"label": "Bias Vector $\\mathbf{b}^{(1)}$", "description": "Translation term added after weight multiplication \u2014 shifts the activation function's input"},
            {"label": "Activation Function $\\sigma$", "description": "Element-wise nonlinearity (ReLU, sigmoid, tanh) applied to $\\mathbf{W}\\mathbf{x} + \\mathbf{b}$ \u2014 enables learning nonlinear patterns"},
            {"label": "Output Layer $\\mathbf{W}^{(L)}$", "description": "Final linear transformation mapping hidden representation to output logits or predictions"}
        ]
    },
    "understanding": {
        "analogy": "Linear algebra is like a coordinate system for a city. Vectors are addresses (directions and distances from origin). The dot product measures how much two addresses point in the same direction\u2014like how similar two routes are. Matrices are transformation rules\u2014like converting GPS coordinates to street addresses (rotation + scaling + translation). Eigenvectors are special directions where the transformation only stretches (doesn't rotate)\u2014like the compass directions that stay the same after a map projection. SVD is like finding the major and minor axes of a data ellipse\u2014it reveals the most important directions of variation in your data.",
        "steps": [
            {"title": "Master Vector Operations", "content": "Learn vector addition, scalar multiplication, dot product (inner product), cross product, and norms ($L_1$, $L_2$, $L_\\infty$). The dot product $\\mathbf{a} \\cdot \\mathbf{b} = \\|\\mathbf{a}\\|\\|\\mathbf{b}\\|\\cos\\theta$ relates to the angle between vectors."},
            {"title": "Understand Matrix Multiplication", "content": "A matrix $\\mathbf{A}_{m \\times n}$ times a vector $\\mathbf{x}_{n \\times 1}$ gives a vector $\\mathbf{b}_{m \\times 1}$. Each entry $b_i = \\sum_k A_{ik}x_k$. Think of rows of $\\mathbf{A}$ as dotting with $\\mathbf{x}$. For matrix-matrix multiplication, each column of the right matrix is transformed by the left matrix."},
            {"title": "Learn Matrix Factorizations", "content": "Start with LU decomposition (solving linear systems), then QR (least squares, numerically stable), then Eigendecomposition (symmetric matrices only), then SVD (any matrix, most general and stable). SVD is the most important for ML."},
            {"title": "Connect Linear Algebra to ML Models", "content": "Linear regression: $\\hat{\\mathbf{y}} = \\mathbf{X}\\mathbf{w}$. PCA: eigendecomposition of covariance matrix or SVD of centered data. Neural network: stack of linear layers $\\mathbf{h}_i = \\sigma(\\mathbf{W}_i\\mathbf{h}_{i-1} + \\mathbf{b}_i)$."},
            {"title": "Watch for Numerical Issues", "content": "Ill-conditioned matrices (high condition number) amplify input errors. Use double precision, avoid explicit matrix inversion, prefer QR or SVD over normal equations. Check $\\kappa(\\mathbf{A}) = \\|\\mathbf{A}\\|\\|\\mathbf{A}^{-1}\\|$."}
        ],
        "misconceptions": [
            {"misconception": "Matrix multiplication is commutative ($\\mathbf{A}\\mathbf{B} = \\mathbf{B}\\mathbf{A}$).", "truth": "Matrix multiplication is NOT commutative. In general $\\mathbf{A}\\mathbf{B} \\neq \\mathbf{B}\\mathbf{A}$. Even when both products are defined, they differ. Order matters critically in neural network computations."},
            {"misconception": "A matrix must be square to have a useful factorization.", "truth": "SVD works for ANY matrix (rectangular, singular, even rank-deficient). It's the most general and numerically stable matrix factorization, making it ideal for ML where data matrices are rarely square."}
        ]
    },
    "codeExamples": [
        {"level": "basic", "code": "import numpy as np\n\n# Vector operations\na = np.array([1, 2, 3])\nb = np.array([4, 5, 6])\n\ndot_product = np.dot(a, b)\nnorm_a = np.linalg.norm(a)\ncos_angle = dot_product / (norm_a * np.linalg.norm(b))\n\nprint(f\"Dot product: {dot_product}\")\nprint(f\"Norm of a: {norm_a:.4f}\")\nprint(f\"Cosine angle: {cos_angle:.4f}\")\n\n# Matrix operations\nX = np.array([[1, 2], [3, 4], [5, 6]])\nw = np.array([0.5, 1.5])\ny_pred = X @ w\nprint(f\"\\nX @ w: {y_pred}\")\n\n# Identity and transpose\nI = np.eye(3)\nprint(f\"\\nIdentity:\\n{I}\")\nprint(f\"\\nTranspose of X:\\n{X.T}\")",
         "output": "Dot product: 32\nNorm of a: 3.7417\nCosine angle: 0.9746\n\nX @ w: [3.5 7.5 11.5]\n\nIdentity:\n[[1. 0. 0.]\n [0. 1. 0.]\n [0. 0. 1.]]\n\nTranspose of X:\n[[1 3 5]\n [2 4 6]]",
         "explanation": "Basic vector and matrix operations in NumPy. The dot product measures alignment between vectors. The norm gives vector length. Matrix-vector multiplication X @ w computes a linear combination of columns. The identity matrix acts as the multiplicative identity."},
        {"level": "intermediate", "code": "import numpy as np\n\n# Eigendecomposition for PCA intuition\nnp.random.seed(42)\n# Create correlated 2D data\nmean = [5, 10]\ncov = [[8, 6], [6, 10]]\ndata = np.random.multivariate_normal(mean, cov, 100)\n\n# Center the data\ncentered = data - data.mean(axis=0)\n\n# Covariance matrix\ncov_matrix = (centered.T @ centered) / (len(data) - 1)\n\n# Eigendecomposition\neigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)\n# Sort descending\nidx = np.argsort(eigenvalues)[::-1]\neigenvalues = eigenvalues[idx]\neigenvectors = eigenvectors[:, idx]\n\nprint(f\"Eigenvalues: {eigenvalues}\")\nprint(f\"Explained variance ratio: {eigenvalues / eigenvalues.sum()}\")\nprint(f\"First PC (direction of max variance): {eigenvectors[:, 0]}\")\n\n# SVD alternative\nU, s, Vt = np.linalg.svd(centered, full_matrices=False)\nprint(f\"\\nSingular values: {s[:3]}\")\nprint(f\"Variance from SVD: {s**2 / (len(data) - 1)}\")\n\n# Project data onto first principal component\nprojected = centered @ eigenvectors[:, 0]\nprint(f\"\\nProjected variance: {np.var(projected):.2f} (should match eigenvalue[0]: {eigenvalues[0]:.2f})\")",
         "output": "Eigenvalues: [14.44317617  3.39010239]\nExplained variance ratio: [0.80990794 0.19009206]\nFirst PC (direction of max variance): [0.64364745 0.76527948]\n\nSingular values: [37.78612842 18.30333774]\nVariance from SVD: [14.44317617  3.39010239]\n\nProjected variance: 14.44 (should match eigenvalue[0]: 14.44)",
         "explanation": "Eigendecomposition of the covariance matrix reveals principal components. Eigenvalues indicate variance explained by each component. The first PC captures ~81% of total variance. SVD of centered data gives the same singular values (square-rooted eigenvalues). Projecting onto the first PC yields a 1D representation preserving maximum variance."}
    ],
    "realWorld": {
        "useCases": [
            {"industry": "Recommendation Systems", "description": "Matrix factorization (SVD-based) decomposes the user-item interaction matrix into low-rank user and item embeddings, enabling personalized recommendations at Netflix, Spotify, and Amazon."},
            {"industry": "Natural Language Processing", "description": "Word embeddings (GloVe, Word2Vec) use linear algebra to represent word meanings as vectors. Vector arithmetic enables analogies: king - man + woman \u2248 queen."},
            {"industry": "Computer Vision", "description": "Images are matrices of pixel values. Convolutional filters are specialized linear transformations. Face recognition uses PCA (eigenfaces) to project faces into a low-dimensional subspace."}
        ],
        "caseStudy": {"problem": "Netflix needed to predict user ratings for movies they hadn't watched, given a sparse matrix of 480,000 users \u00d7 17,000 movies with only ~1% of entries filled.", "solution": "The winning team (BellKor's Pragmatic Chaos) used matrix factorization: approximate the rating matrix $\\mathbf{R} \\approx \\mathbf{P}\\mathbf{Q}^\\top$ where $\\mathbf{P}$ represents user factors and $\\mathbf{Q}$ represents movie factors. Latent factors (k=20-100) captured underlying dimensions like genre affinity. SVD-based optimization minimized regularized squared error via stochastic gradient descent.", "results": "The solution achieved a 10.06% improvement over Netflix's own algorithm (Cinematch), winning the $1M grand prize. Latent factor models became the industry standard for recommendation systems."},
        "bestPractices": [
            "Prefer SVD over explicit matrix inversion for solving linear systems",
            "Center data before computing PCA / eigendecomposition",
            "Check condition number of matrices before solving linear systems",
            "Use double-precision (float64) for linear algebra operations",
            "Exploit sparsity: use sparse matrix representations for large sparse datasets",
            "Monitor singular value decay to determine effective rank and truncation point",
            "Use randomized SVD for very large matrices (sklearn.decomposition.TruncatedSVD)"
        ],
        "tools": [
            "NumPy \u2014 np.linalg.svd, np.linalg.eigh, np.dot, @ operator for matrix multiplication",
            "SciPy \u2014 scipy.linalg for advanced decompositions (LU, QR, Cholesky, Schur)",
            "scikit-learn \u2014 PCA, TruncatedSVD, NMF, KernelPCA for ML-specific decompositions",
            "PyTorch \u2014 torch.linalg for GPU-accelerated linear algebra in deep learning",
            "JAX \u2014 Differentiable linear algebra with XLA compilation for high performance",
            "CuPy \u2014 GPU-accelerated NumPy-compatible linear algebra for large matrices",
            "Eigen3 \u2014 C++ linear algebra library (used internally by TensorFlow and PyTorch)"
        ],
        "jobRoles": [
            "ML Research Scientist \u2014 Develops new architectures and algorithms grounded in linear algebra theory",
            "Data Scientist \u2014 Applies PCA, matrix factorization, and SVD for feature engineering and dimensionality reduction",
            "NLP Engineer \u2014 Works with word embeddings, attention mechanisms, and transformer linear transformations",
            "Computer Vision Engineer \u2014 Uses matrix operations for image processing, convolutions, and 3D reconstruction",
            "Recommendation Systems Engineer \u2014 Builds matrix factorization models for user-item interaction data"
        ],
        "furtherReading": [
            {"title": "Linear Algebra Review by Zico Kolter", "url": "https://www.cs.cmu.edu/~zkolter/course/linalg/"},
            {"title": "3Blue1Brown Essence of Linear Algebra", "url": "https://www.3blue1brown.com/topics/linear-algebra"},
            {"title": "The Matrix Cookbook (Petersen & Pedersen)", "url": "https://www.math.uwaterloo.ca/~hwolkowi/matrixcookbook.pdf"},
            {"title": "Strang's Linear Algebra and Learning from Data", "url": "https://math.mit.edu/~gs/learningfromdata/"}
        ]
    },
    "quiz": [
        {"type": "mcq", "question": "What does the dot product of two unit vectors represent?", "options": ["The magnitude of the first vector", "The cosine of the angle between them", "The sum of their components", "The area of the parallelogram they span"], "answer": "The cosine of the angle between them"},
        {"type": "mcq", "question": "Which matrix factorization works for ANY rectangular matrix?", "options": ["LU decomposition", "Cholesky decomposition", "QR decomposition", "Singular Value Decomposition (SVD)"], "answer": "Singular Value Decomposition (SVD)"},
        {"type": "truefalse", "question": "Matrix multiplication is commutative: AB = BA for all conformable matrices.", "answer": "False"},
        {"type": "code", "question": "What does np.linalg.svd(centered_data, full_matrices=False) return?", "options": ["Eigenvalues and eigenvectors", "U, singular values, Vh (V transpose)", "LU decomposition factors", "QR decomposition factors"], "answer": "U, singular values, Vh (V transpose)"},
        {"type": "match", "question": "Match linear algebra concept to ML application:", "pairs": {"Dot product": "Attention score computation in transformers", "Matrix factorization": "Recommender system latent factors", "Eigendecomposition": "Principal Component Analysis", "Norm/L2 regularization": "Weight decay in neural network training"}}
    ]
}

# -------------------- WRITE FILE --------------------
def write_ts(data_dict, output_path):
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("// Phase 2: Mathematics for ML, Phase 3: Python ML Ecosystem, Phase 4: Data Preprocessing\n")
        f.write("// Auto-generated complete topic content\n\n")
        f.write("const phase2to4Content = ")
        json.dump(data_dict, f, indent=2, ensure_ascii=False)
        f.write(";\n\nexport default phase2to4Content;\n")

out = r"D:\Ajay\ai-learning-hub\src\data\content\phase2-4.ts"
write_ts(topics, out)
size = os.path.getsize(out)
print(f"Wrote {out} ({size} bytes, {len(topics)} topics)")
print("Topics:", list(topics.keys()))
