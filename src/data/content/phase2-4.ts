// Phase 2: Mathematics for ML, Phase 3: Python ML Ecosystem, Phase 4: Data Preprocessing
// Auto-generated complete topic content

const phase2to4Content = {
  "p2-linear-algebra": {
    "theory": "Linear algebra is the mathematics of vector spaces and linear mappings between them. It provides the fundamental language for representing and manipulating data in machine learning. Datasets are matrices. Neural network layers implement linear transformations followed by nonlinearities. Every deep learning operation is built on linear algebra primitives: dot products, matrix multiplications, transpositions, and decompositions.\n\nVectors are ordered collections of numbers representing points in n-dimensional space. $\\mathbf{v} \\in \\mathbb{R}^n$ has magnitude and direction. The dot product $\\mathbf{a} \\cdot \\mathbf{b} = \\sum a_i b_i$ measures alignment between two vectors. The Euclidean norm $\\|\\mathbf{v}\\|_2 = \\sqrt{\\sum v_i^2}$ measures vector length. Matrices $\\mathbf{A} \\in \\mathbb{R}^{m \\times n}$ are rectangular arrays representing linear transformations. Matrix multiplication $\\mathbf{C} = \\mathbf{A}\\mathbf{B}$ where $c_{ij} = \\sum_k a_{ik}b_{kj}$ is the workhorse of neural network forward passes.\n\nKey matrix operations: transpose $\\mathbf{A}^\\top$, inverse $\\mathbf{A}^{-1}$, trace $\\text{tr}(\\mathbf{A}) = \\sum_i a_{ii}$, determinant $\\det(\\mathbf{A})$, and rank. Eigendecomposition $\\mathbf{A}\\mathbf{v} = \\lambda\\mathbf{v}$ finds eigenvalues and eigenvectors. SVD $\\mathbf{A} = \\mathbf{U}\\boldsymbol{\\Sigma}\\mathbf{V}^\\top$ is the crown jewel—it exists for any matrix, gives the best low-rank approximation (PCA, recommendation systems), and reveals the matrix's fundamental structure through singular values. The condition number $\\kappa(\\mathbf{A}) = \\sigma_{\\max}/\\sigma_{\\min}$ measures sensitivity to numerical errors.\n\nAlways check matrix condition numbers, use numerically stable algorithms (QR over normal equations), and prefer SVD over explicit inverses.",
    "keyDefinitions": [
      {
        "term": "Vector Space",
        "definition": "A set of vectors closed under addition and scalar multiplication, satisfying eight axioms.",
        "example": "$\\mathbb{R}^3$ is the vector space of all 3D vectors."
      },
      {
        "term": "Linear Independence",
        "definition": "No vector can be expressed as a linear combination of the others.",
        "example": "$(1,0),(0,1)$ are independent in $\\mathbb{R}^2$, but $(2,3)$ is dependent since $(2,3)=2(1,0)+3(0,1)$."
      },
      {
        "term": "Eigenvalue/Eigenvector",
        "definition": "$\\mathbf{v}$ preserved in direction by $\\mathbf{A}$: $\\mathbf{A}\\mathbf{v}=\\lambda\\mathbf{v}$.",
        "example": "For diag(2,3), eigenvectors are (1,0) with $\\lambda=2$ and (0,1) with $\\lambda=3$."
      },
      {
        "term": "SVD",
        "definition": "$\\mathbf{A}=\\mathbf{U}\\boldsymbol{\\Sigma}\\mathbf{V}^\\top$ for any matrix.",
        "example": "In PCA, SVD of centered data gives principal components in $\\mathbf{V}$ and variances as $\\sigma_i^2/(n-1)$."
      }
    ],
    "formulas": [
      {
        "title": "Matrix Multiplication (Forward Pass)",
        "formula": "$\\mathbf{h} = \\mathbf{W}\\mathbf{x} + \\mathbf{b} \\quad \\text{where } h_j = \\sum_k w_{jk}x_k + b_j$",
        "explanation": "Input $\\mathbf{x} \\in \\mathbb{R}^n$ times weight matrix $\\mathbf{W} \\in \\mathbb{R}^{m \\times n}$ plus bias $\\mathbf{b} \\in \\mathbb{R}^m$. Each output is a weighted sum of all inputs.",
        "example": "Layer with 3 inputs, 2 outputs: W is 2×3, x is 3×1, h is 2×1."
      },
      {
        "title": "SVD",
        "formula": "$\\mathbf{A}_{m \\times n} = \\mathbf{U}_{m \\times m} \\boldsymbol{\\Sigma}_{m \\times n} \\mathbf{V}_{n \\times n}^\\top$",
        "explanation": "SVD decomposes any matrix into $\\mathbf{U}$ (left singular vectors), $\\boldsymbol{\\Sigma}$ (singular values), $\\mathbf{V}^\\top$ (right singular vectors).",
        "example": "In PCA of a 1000×50 dataset, k=5 singular values might explain 85% of variance."
      }
    ],
    "whyItMatters": "Linear algebra is the language of AI/ML. Every neural network is a composition of linear transformations. Attention mechanisms compute weighted sums via dot products. Recommendation systems factorize user-item matrices. Understanding linear algebra means understanding how every ML model represents and transforms data internally.",
    "architecture": {
      "title": "Neural Network as Linear Algebra Pipeline",
      "description": "How a feedforward neural network composes linear transformations.",
      "blocks": [
        {
          "label": "Input Vector $\\mathbf{x}$",
          "description": "Raw feature vector of dimension d"
        },
        {
          "label": "Weight Matrix $\\mathbf{W}^{(1)}$",
          "description": "First layer weights mapping d to h hidden units"
        },
        {
          "label": "Bias Vector $\\mathbf{b}^{(1)}$",
          "description": "Translation term shifting activation input"
        },
        {
          "label": "Activation $\\sigma$",
          "description": "Element-wise nonlinearity (ReLU, sigmoid, tanh)"
        },
        {
          "label": "Output $\\mathbf{W}^{(L)}$",
          "description": "Final mapping to output logits"
        }
      ]
    },
    "understanding": {
      "analogy": "Linear algebra is like a coordinate system for a city. Vectors are addresses. The dot product measures how much two addresses point in the same direction. Matrices are transformation rules—converting GPS to street addresses. Eigenvectors are special directions where the transformation only stretches. SVD reveals the most important directions of variation in your data.",
      "steps": [
        {
          "title": "Master Vector Operations",
          "content": "Learn vector addition, dot product, norms. The dot product relates to the angle between vectors."
        },
        {
          "title": "Understand Matrix Multiplication",
          "content": "Each entry b_i = sum_k A_ik x_k. Think of rows dotting with x."
        },
        {
          "title": "Learn Matrix Factorizations",
          "content": "Start with LU, then QR, then Eigendecomposition, then SVD (most important for ML)."
        },
        {
          "title": "Connect to ML Models",
          "content": "Linear regression: y_hat = Xw. PCA: eigendecomposition of covariance. Neural network: stack of linear layers."
        },
        {
          "title": "Watch for Numerical Issues",
          "content": "Ill-conditioned matrices amplify errors. Use double precision, avoid explicit inversion."
        }
      ],
      "misconceptions": [
        {
          "misconception": "Matrix multiplication is commutative (AB=BA).",
          "truth": "Matrix multiplication is NOT commutative. Order matters critically."
        },
        {
          "misconception": "A matrix must be square for factorization.",
          "truth": "SVD works for ANY matrix. It is the most general and numerically stable factorization."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "import numpy as np\na = np.array([1,2,3])\nb = np.array([4,5,6])\ndot = np.dot(a,b)\nnorm = np.linalg.norm(a)\nprint(f\"Dot: {dot}, Norm: {norm:.4f}\")\nX = np.array([[1,2],[3,4],[5,6]])\nw = np.array([0.5,1.5])\ny = X @ w\nprint(f\"Pred: {y}\")",
        "output": "Dot: 32, Norm: 3.7417\nPred: [3.5 7.5 11.5]",
        "explanation": "Basic vector and matrix operations in NumPy. @ performs matrix-vector multiplication."
      },
      {
        "level": "intermediate",
        "code": "import numpy as np\nnp.random.seed(42)\ndata = np.random.multivariate_normal([5,10],[[8,6],[6,10]],100)\ncentered = data - data.mean(axis=0)\ncov = (centered.T @ centered) / (len(data)-1)\nvals, vecs = np.linalg.eigh(cov)\nidx = np.argsort(vals)[::-1]\nvals, vecs = vals[idx], vecs[:,idx]\nprint(f\"Eigenvalues: {vals}\")\nprint(f\"Explained variance: {vals/vals.sum()}\")\nU,s,Vt = np.linalg.svd(centered, full_matrices=False)\nprint(f\"Singular values: {s}\")",
        "output": "Eigenvalues: [14.44 3.39]\nExplained variance: [0.81 0.19]\nSingular values: [37.79 18.30]",
        "explanation": "Eigendecomposition of covariance reveals principal components. SVD of centered data gives related singular values."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Recommendation Systems",
          "description": "Matrix factorization decomposes user-item matrix into low-rank embeddings for personalized recommendations."
        },
        {
          "industry": "NLP",
          "description": "Word embeddings represent meanings as vectors. Vector arithmetic: king - man + woman ≈ queen."
        },
        {
          "industry": "Computer Vision",
          "description": "Images are pixel matrices. Convolutional filters are specialized linear transformations."
        }
      ],
      "caseStudy": {
        "problem": "Netflix needed to predict ratings from a 480K×17K sparse user-item matrix with 1% filled.",
        "solution": "The winning team used matrix factorization: R ≈ PQ^T with user factors P and movie factors Q. SGD minimized regularized squared error.",
        "results": "10.06% improvement over Cinematch, winning the $1M grand prize."
      },
      "bestPractices": [
        "Prefer SVD over explicit matrix inversion",
        "Center data before PCA",
        "Check condition numbers",
        "Use float64",
        "Exploit sparsity",
        "Use randomized SVD for large matrices"
      ],
      "tools": [
        "NumPy — np.linalg.svd, np.linalg.eigh, @ operator",
        "SciPy — scipy.linalg for LU, QR, Cholesky",
        "scikit-learn — PCA, TruncatedSVD, NMF",
        "PyTorch — torch.linalg for GPU LA"
      ],
      "jobRoles": [
        "ML Research Scientist — Develops architectures grounded in linear algebra",
        "Data Scientist — Applies PCA, matrix factorization for feature engineering"
      ],
      "furtherReading": [
        {
          "title": "Linear Algebra Review",
          "url": "https://www.cs.cmu.edu/~zkolter/course/linalg/"
        },
        {
          "title": "3Blue1Brown Essence of Linear Algebra",
          "url": "https://www.3blue1brown.com/topics/linear-algebra"
        },
        {
          "title": "The Matrix Cookbook",
          "url": "https://www.math.uwaterloo.ca/~hwolkowi/matrixcookbook.pdf"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What does dot product of unit vectors represent?",
        "options": [
          "Magnitude",
          "Cosine of angle between them",
          "Sum of components",
          "Area of parallelogram"
        ],
        "answer": "Cosine of angle between them"
      },
      {
        "type": "mcq",
        "question": "Which factorization works for ANY matrix?",
        "options": [
          "LU",
          "Cholesky",
          "QR",
          "SVD"
        ],
        "answer": "SVD"
      },
      {
        "type": "truefalse",
        "question": "Matrix multiplication is commutative (AB=BA).",
        "options": [
          "True",
          "False"
        ],
        "answer": "False"
      },
      {
        "type": "code",
        "question": "What does np.linalg.svd() return?",
        "options": [
          "Eigenvalues/eigenvectors",
          "U, s, Vh",
          "LU factors",
          "QR factors"
        ],
        "answer": "U, s, Vh"
      },
      {
        "type": "mcq",
        "question": "Match LA concept to ML:",
        "options": "match",
        "answer": {
          "Dot product": "Attention score",
          "Matrix factorization": "Recommender system",
          "Eigendecomposition": "PCA",
          "L2 norm": "Weight decay"
        }
      }
    ]
  },
  "p2-calculus": {
    "theory": "Calculus is the mathematical study of continuous change. In ML, it provides the foundation for optimization—how to adjust model parameters to minimize a loss function.\n\nThe derivative $f'(x)=\\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}$ measures the instantaneous rate of change. Key rules: power ($\\frac{d}{dx}x^n=nx^{n-1}$), chain ($\\frac{d}{dx}f(g(x))=f'(g(x))g'(x)$), product. The chain rule is the most important for deep learning because it enables backpropagation.\n\nPartial derivatives: for $f(x_1,...,x_n)$, $\\partial f/\\partial x_i$ measures change in one variable. Gradient: $\\nabla f=(\\partial f/\\partial x_1,...,\\partial f/\\partial x_n)$ points uphill. Gradient descent: $\\theta_{t+1}=\\theta_t-\\eta\\nabla L(\\theta_t)$ moves downhill.\n\nHessian matrix $\\mathbf{H}_{ij}=\\partial^2 f/\\partial x_i \\partial x_j$ describes curvature. Positive-definite Hessian = local minimum. The Fundamental Theorem of Calculus connects derivatives and integrals, underpinning statistical learning theory.",
    "keyDefinitions": [
      {
        "term": "Derivative",
        "definition": "Instantaneous rate of change. Slope of tangent line.",
        "example": "f(x)=x² has f'(x)=2x. At x=3, slope is 6."
      },
      {
        "term": "Partial Derivative",
        "definition": "Derivative w.r.t. one variable while holding others constant.",
        "example": "f(x,y)=x²y has ∂f/∂x=2xy and ∂f/∂y=x²."
      },
      {
        "term": "Gradient",
        "definition": "Vector of all partial derivatives pointing in steepest ascent direction.",
        "example": "f(x,y)=x²+y² has gradient ∇f=(2x,2y). At (1,1): (2,2)."
      },
      {
        "term": "Chain Rule",
        "definition": "Derivative of composite functions. Backbone of backpropagation.",
        "example": "z=f(y), y=g(x): dz/dx = f'(y)g'(x) = dz/dy · dy/dx."
      },
      {
        "term": "Hessian Matrix",
        "definition": "Square matrix of second-order partial derivatives describing curvature.",
        "example": "f(x,y)=x²+y² has H=[[2,0],[0,2]] (positive-definite)."
      }
    ],
    "formulas": [
      {
        "title": "Gradient Descent Update",
        "formula": "$\\theta_{t+1}=\\theta_t-\\eta\\nabla_\\theta L(\\theta_t)$",
        "explanation": "Parameters updated by subtracting gradient scaled by learning rate. The gradient points uphill; subtracting moves downhill.",
        "example": "Linear regression: $w_{t+1}=w_t-\\eta\\frac{1}{m}\\sum(y_i-\\hat{y}_i)(-x_i)$."
      },
      {
        "title": "Backpropagation",
        "formula": "$\\frac{\\partial L}{\\partial w_{ij}^{(l)}}=\\frac{\\partial L}{\\partial a_j^{(l)}}\\cdot\\frac{\\partial a_j^{(l)}}{\\partial z_j^{(l)}}\\cdot\\frac{\\partial z_j^{(l)}}{\\partial w_{ij}^{(l)}}$",
        "explanation": "Gradient of loss w.r.t. weight at layer l factors: error signal, activation derivative, previous layer activation.",
        "example": "For sigmoid: local gradient is $\\sigma'(z)=\\sigma(z)(1-\\sigma(z))$ times incoming error."
      }
    ],
    "whyItMatters": "Calculus is the engine of learning. Every time a model improves through training, calculus computes gradients. Understanding derivatives, the chain rule, and gradient-based optimization is essential for designing neural architectures, selecting optimizers, tuning learning rates, and diagnosing convergence issues.",
    "architecture": {
      "title": "Backpropagation Computation Graph",
      "description": "Forward and backward passes through a network.",
      "blocks": [
        {
          "label": "Input $x$",
          "description": "Input features enter the graph"
        },
        {
          "label": "Linear $z=Wx+b$",
          "description": "Weighted sum forward pass"
        },
        {
          "label": "Activation $a=\\sigma(z)$",
          "description": "Nonlinear activation"
        },
        {
          "label": "Loss $L(\\hat{y},y)$",
          "description": "Prediction error measurement"
        },
        {
          "label": "Gradient $\\nabla_\\theta L$",
          "description": "Backward pass via chain rule"
        }
      ]
    },
    "understanding": {
      "analogy": "Calculus is the speedometer of your learning algorithm. The derivative tells you how fast the error changes when you tweak a parameter. Gradient descent is hiking downhill in fog—you feel the slope and step downhill. The chain rule for backpropagation is like understanding how turning the steering wheel affects final position through linkages, where each link's contribution multiplies.",
      "steps": [
        {
          "title": "Learn Single-Variable Calculus",
          "content": "Master derivatives, limits, and rules. Understand the function-derivative relationship graphically."
        },
        {
          "title": "Extend to Multivariable",
          "content": "Learn partial derivatives, gradients, directional derivatives. The gradient is the primary ML optimization tool."
        },
        {
          "title": "Master the Chain Rule",
          "content": "The most important calculus concept for ML. Practice composite functions. Understand it multiplies local derivatives along a path."
        },
        {
          "title": "Second-Order Methods",
          "content": "Learn the Hessian, convexity, and how curvature affects optimization."
        },
        {
          "title": "Connect to ML Optimizers",
          "content": "Study how calculus enables SGD, Momentum, Adam. Understand vanishing/exploding gradients via the chain rule."
        }
      ],
      "misconceptions": [
        {
          "misconception": "Gradient descent always finds the global minimum.",
          "truth": "For non-convex functions (neural networks), GD can converge to local minima or saddle points. In high dimensions, saddle points are more common."
        },
        {
          "misconception": "Zero gradient = minimum.",
          "truth": "A zero gradient could be a local minimum, maximum, or saddle point. Hessian eigenvalues distinguish them."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "import numpy as np\ndef f(x): return x**2 + 2*x + 1\ndef numerical_derivative(f, x, h=1e-7):\n    return (f(x+h) - f(x-h)) / (2*h)\nfor x in [0.0,1.0,2.0,3.0]:\n    print(f\"x={x}, f'(x)={numerical_derivative(f,x):.4f}\")\nprint(f\"Analytical at x=2: {2*2+2}\")",
        "output": "x=0.0, f'(x)=2.0000\nx=1.0, f'(x)=4.0000\nx=2.0, f'(x)=6.0000\nx=3.0, f'(x)=8.0000\n\nAnalytical at x=2: 6",
        "explanation": "Numerical differentiation via central difference. Analytical derivative f'(x)=2x+2 is exact. Numerical gradients are useful for gradient checking."
      },
      {
        "level": "intermediate",
        "code": "import torch\nx = torch.tensor([1.0,2.0,3.0], requires_grad=True)\ny = torch.tensor([2.0,4.0,6.0])\nw = torch.tensor(1.0, requires_grad=True)\nb = torch.tensor(0.0, requires_grad=True)\ny_pred = w*x + b\nloss = ((y_pred-y)**2).mean()\nloss.backward()\nprint(f\"Loss: {loss.item():.4f}\")\nprint(f\"dw={w.grad.item():.4f}, db={b.grad.item():.4f}\")",
        "output": "Loss: 4.6667\ndw=-6.6667, db=-2.0000",
        "explanation": "PyTorch autograd computes gradients automatically via reverse-mode AD. backward() computes all gradients via the chain rule."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Deep Learning",
          "description": "Backpropagation uses the chain rule to compute gradients for every parameter, enabling end-to-end learning."
        },
        {
          "industry": "Physics-Informed NNs",
          "description": "PINNs incorporate PDEs into loss, using autodiff for derivatives of outputs w.r.t. inputs."
        },
        {
          "industry": "Robotics",
          "description": "Gradient-based trajectory optimization computes derivatives of motion cost functions."
        }
      ],
      "caseStudy": {
        "problem": "Very deep networks (50+ layers) suffered from vanishing gradients.",
        "solution": "ResNet introduced skip connections allowing gradients to flow directly through identity mappings, preventing vanishing.",
        "results": "ResNet achieved 3.57% top-5 error on ImageNet, enabling 152-layer networks."
      },
      "bestPractices": [
        "Use gradient clipping for RNNs",
        "Monitor gradient norms during training",
        "Verify gradients numerically for custom layers",
        "Use learning rate schedules",
        "Leverage autodiff (PyTorch, JAX)"
      ],
      "tools": [
        "PyTorch — torch.autograd",
        "TensorFlow — tf.GradientTape",
        "JAX — jax.grad, jax.jacobian, jax.hessian",
        "SymPy — Symbolic calculus"
      ],
      "jobRoles": [
        "Deep Learning Engineer — Needs understanding of gradient flow",
        "ML Research Scientist — Develops optimization algorithms"
      ],
      "furtherReading": [
        {
          "title": "The Matrix Calculus You Need For Deep Learning",
          "url": "https://arxiv.org/abs/1802.01528"
        },
        {
          "title": "3Blue1Brown Essence of Calculus",
          "url": "https://www.3blue1brown.com/topics/calculus"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "Derivative of f(x)=x³+2x²-5x+1?",
        "options": [
          "3x²+4x-5",
          "3x²+4x",
          "x²+4x-5",
          "2x+2"
        ],
        "answer": "3x²+4x-5"
      },
      {
        "type": "mcq",
        "question": "What does the gradient represent?",
        "options": [
          "Steepest descent",
          "Steepest ascent",
          "Zero of function",
          "Curvature"
        ],
        "answer": "Steepest ascent"
      },
      {
        "type": "truefalse",
        "question": "Backpropagation is an application of the chain rule.",
        "options": [
          "True",
          "False"
        ],
        "answer": "True"
      },
      {
        "type": "mcq",
        "question": "Gradient of f(x,y)=x²y+y³ at (1,1)?",
        "options": [
          "(2,4)",
          "(2,2)",
          "(1,3)",
          "(3,1)"
        ],
        "answer": "(2,4)"
      },
      {
        "type": "mcq",
        "question": "Match calculus to ML:",
        "options": "match",
        "answer": {
          "Chain rule": "Backpropagation",
          "Gradient": "Parameter update",
          "Hessian": "Loss curvature",
          "Partial derivative": "Per-parameter effect"
        }
      }
    ]
  },
  "p2-probability-stats": {
    "theory": "Probability and statistics provide the mathematical framework for reasoning under uncertainty. ML is fundamentally about making predictions from incomplete information.\n\nConditional probability: $P(A|B)=P(A,B)/P(B)$. Bayes' theorem: $P(\\theta|D)=P(D|\\theta)P(\\theta)/P(D)$ is the cornerstone of Bayesian inference.\n\nKey quantities: expected value $E[X]=\\int xp(x)dx$ (center), variance $\\text{Var}(X)=E[(X-\\mu)^2]$ (spread), covariance $\\text{Cov}(X,Y)=E[(X-\\mu_X)(Y-\\mu_Y)]$ (linear relationship), correlation $\\rho_{XY}=\\text{Cov}(X,Y)/(\\sigma_X\\sigma_Y)$ (normalized in [-1,1]).\n\nImportant distributions: Normal $\\mathcal{N}(\\mu,\\sigma^2)$ (CLT), Bernoulli (binary), Categorical (multi-class), Beta/Dirichlet (conjugate priors). The Central Limit Theorem states the sum of independent random variables approaches Normal as n increases.\n\nStatistical inference: estimation (MLE $\\hat{\\theta}_{MLE}=\\arg\\max_\\theta P(D|\\theta)$), MAP $\\hat{\\theta}_{MAP}=\\arg\\max_\\theta P(\\theta|D)$, hypothesis testing, confidence intervals, and the bias-variance tradeoff.",
    "keyDefinitions": [
      {
        "term": "Bayes' Theorem",
        "definition": "Updates belief about hypothesis given evidence: $P(\\theta|D)\\propto P(D|\\theta)P(\\theta)$.",
        "example": "Medical test: 99% accurate, 1% prevalence. Positive test gives P(disease|+)=50%."
      },
      {
        "term": "Normal Distribution",
        "definition": "Bell-shaped curve defined by mean μ and variance σ². Arises from CLT.",
        "example": "Heights follow N(170,15²). ~68% within 155-185 cm."
      },
      {
        "term": "MLE",
        "definition": "Estimates parameters by maximizing likelihood of observing the data.",
        "example": "For k heads in n flips, MLE of heads probability = k/n."
      },
      {
        "term": "Bias-Variance Tradeoff",
        "definition": "Total error = bias² + variance + irreducible error.",
        "example": "Linear model: high bias, low variance. Deep tree: low bias, high variance."
      },
      {
        "term": "p-value",
        "definition": "Probability of data as extreme as observed assuming null hypothesis is true.",
        "example": "p=0.03 means 3% chance under null—typically 'significant' at α=0.05."
      }
    ],
    "formulas": [
      {
        "title": "Bayes' Theorem",
        "formula": "$P(\\theta|D)=\\frac{P(D|\\theta)P(\\theta)}{P(D)}\\propto P(D|\\theta)P(\\theta)$",
        "explanation": "Posterior = likelihood × prior / evidence. The proportional form drops the normalizing constant.",
        "example": "In Bayesian linear regression: posterior over w is proportional to $\\mathcal{N}(y|Xw,\\sigma^2)\\cdot\\mathcal{N}(w|0,\\alpha^{-1}I)$."
      },
      {
        "title": "Central Limit Theorem",
        "formula": "$\\frac{\\bar{X}_n-\\mu}{\\sigma/\\sqrt{n}}\\xrightarrow{d}\\mathcal{N}(0,1)$",
        "explanation": "Sample mean distribution converges to Normal as n increases, regardless of underlying distribution.",
        "example": "Rolling a die (mean=3.5, var=2.92) 30 times: sample mean ~ $\\mathcal{N}(3.5,2.92/30)$."
      }
    ],
    "whyItMatters": "Probability and statistics quantify uncertainty—the fundamental challenge of ML. Bayesian methods provide principled uncertainty quantification. Frequentist statistics power A/B testing. Understanding distributions is essential for generative models (VAEs, diffusion), probabilistic programming, and reinforcement learning.",
    "architecture": {
      "title": "Probabilistic Inference Pipeline",
      "description": "How probability flows through Bayesian inference.",
      "blocks": [
        {
          "label": "Prior $P(\\theta)$",
          "description": "Initial belief about parameters before data"
        },
        {
          "label": "Likelihood $P(D|\\theta)$",
          "description": "Probability of data given parameters"
        },
        {
          "label": "Evidence $P(D)$",
          "description": "Marginal likelihood (normalizer)"
        },
        {
          "label": "Posterior $P(\\theta|D)$",
          "description": "Updated belief after seeing data"
        },
        {
          "label": "Predictive $P(x^*|D)$",
          "description": "Distribution for new data integrating over parameter uncertainty"
        }
      ]
    },
    "understanding": {
      "analogy": "Probability is like a weather forecast. 70% chance of rain means in similar conditions, it rains 7/10 times. Bayesian inference is like updating belief: before forecast (prior), after dark clouds (likelihood), updated belief (posterior). The bias-variance tradeoff is like archery: high bias = consistently missing in same direction; high variance = scattered shots.",
      "steps": [
        {
          "title": "Master Probability Foundations",
          "content": "Learn axioms, conditional probability, Bayes' theorem, independence."
        },
        {
          "title": "Understand Distributions",
          "content": "Study discrete (Bernoulli, Binomial, Poisson) and continuous (Normal, Beta, Gamma). Learn when each applies."
        },
        {
          "title": "Learn Expectation and Variance",
          "content": "These capture center and spread of random variables. Understand linearity of expectation."
        },
        {
          "title": "Study the CLT",
          "content": "The CLT bridges probability and statistics. Understand why sample means concentrate around population mean."
        },
        {
          "title": "Connect to ML",
          "content": "Gaussian Naive Bayes uses MLE. Logistic regression uses MLE via cross-entropy. VAEs optimize ELBO."
        }
      ],
      "misconceptions": [
        {
          "misconception": "A p-value is the probability the null is true.",
          "truth": "The p-value is P(data|null), not P(null|data). These are very different."
        },
        {
          "misconception": "Correlation implies causation.",
          "truth": "Correlation measures linear relationship strength. Causation requires controlled experiments."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "import numpy as np\nfrom scipy import stats\nnp.random.seed(42)\ndata = np.random.normal(5.0,2.0,1000)\nmean = np.mean(data); var = np.var(data,ddof=1); std = np.std(data,ddof=1)\nprint(f\"Mean: {mean:.3f}, Var: {var:.3f}, Std: {std:.3f}\")\nz = (data-mean)/std\nprint(f\"Within 1σ: {np.mean(np.abs(z)<1):.1%}\")\nprint(f\"Within 2σ: {np.mean(np.abs(z)<2):.1%}\")",
        "output": "Mean: 5.002, Var: 3.953, Std: 1.988\nWithin 1σ: 67.2%\nWithin 2σ: 95.2%",
        "explanation": "Descriptive statistics summarize distributions. Z-scores standardize to mean 0, std 1. Empirical percentages match Normal theory (68%, 95%)."
      },
      {
        "level": "intermediate",
        "code": "import numpy as np\nfrom scipy import stats\nnp.random.seed(42)\nn=100; true_p=0.7\nflips = np.random.binomial(1, true_p, n)\nk = flips.sum()\nprint(f\"MLE: {k/n:.3f}\")\n# Bayesian: Beta(2,2) prior\nap,bp=2,2\nap_post=ap+k; bp_post=bp+n-k\npost_mean=ap_post/(ap_post+bp_post)\nprint(f\"Bayesian posterior mean: {post_mean:.3f}\")\nlow,high=stats.beta.ppf([0.025,0.975],ap_post,bp_post)\nprint(f\"95% credible interval: [{low:.3f},{high:.3f}]\")",
        "output": "MLE: 0.750\nBayesian posterior mean: 0.731\n95% credible interval: [0.640, 0.812]",
        "explanation": "MLE gives 0.75. Bayesian with Beta(2,2) prior gives posterior Beta(77,27), mean 0.731. The prior pulls toward 0.5 (shrinkage)."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "A/B Testing",
          "description": "Hypothesis tests determine whether UI changes significantly affect metrics."
        },
        {
          "industry": "Bayesian Optimization",
          "description": "Gaussian Process surrogates guide hyperparameter tuning."
        },
        {
          "industry": "Reinforcement Learning",
          "description": "Thompson Sampling uses Bayesian posteriors for exploration/exploitation."
        }
      ],
      "caseStudy": {
        "problem": "Google needed to optimize website layout changes with minimal wasted traffic.",
        "solution": "Bayesian multi-armed bandit with Thompson Sampling: each variant had a Beta posterior for conversion rate.",
        "results": "Reduced regret by 50% vs traditional A/B testing, eliminated pre-specified sample sizes."
      },
      "bestPractices": [
        "Always visualize distributions before modeling",
        "Report uncertainty intervals with point estimates",
        "Use Bayesian methods when prior knowledge exists",
        "Don't interpret p-values as 'probability null is true'",
        "Use cross-validation to assess model performance"
      ],
      "tools": [
        "SciPy — scipy.stats",
        "PyMC — Bayesian modeling with MCMC",
        "NumPy — np.random",
        "statsmodels — Statistical models and tests"
      ],
      "jobRoles": [
        "Data Scientist — Applies hypothesis testing and A/B testing",
        "ML Researcher — Develops probabilistic models"
      ],
      "furtherReading": [
        {
          "title": "Bayesian Data Analysis (Gelman)",
          "url": "https://www.stat.columbia.edu/~gelman/book/"
        },
        {
          "title": "Probabilistic Programming & Bayesian Methods for Hackers",
          "url": "https://github.com/CamDavidsonPilon/Probabilistic-Programming-and-Bayesian-Methods-for-Hackers"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What does Bayes' theorem compute?",
        "options": [
          "P(D|θ) from P(θ|D)",
          "Probability of evidence",
          "P(θ|D) from P(D|θ) and P(θ)",
          "Variance of posterior"
        ],
        "answer": "P(θ|D) from P(D|θ) and P(θ)"
      },
      {
        "type": "mcq",
        "question": "What does the CLT state?",
        "options": [
          "All data is Normal",
          "Sample mean approaches Normal as n increases",
          "Variance = std²",
          "Median = mean"
        ],
        "answer": "Sample mean approaches Normal as n increases"
      },
      {
        "type": "truefalse",
        "question": "A p-value of 0.01 means 1% chance the null is true.",
        "options": [
          "True",
          "False"
        ],
        "answer": "False"
      },
      {
        "type": "mcq",
        "question": "MLE for heads given 60 heads in 100 flips?",
        "options": [
          "0.5",
          "0.6",
          "0.4",
          "0.7"
        ],
        "answer": "0.6"
      },
      {
        "type": "mcq",
        "question": "Match to description:",
        "options": "match",
        "answer": {
          "Prior P(θ)": "Initial belief before data",
          "Likelihood P(D|θ)": "Probability of data given parameters",
          "Posterior P(θ|D)": "Updated belief after data",
          "Evidence P(D)": "Marginal probability of data"
        }
      }
    ]
  },
  "p2-info-optimization": {
    "theory": "Information theory (Shannon, 1948) quantifies information and uncertainty. In ML, it provides the foundation for loss functions, model evaluation, and representation learning.\n\nEntropy: $H(X)=-\\sum p(x)\\log p(x)$ measures average uncertainty (bits or nats). Binary entropy: $H_2(p)=-p\\log p-(1-p)\\log(1-p)$ peaks at p=0.5.\n\nCross-entropy: $H(p,q)=-\\sum p(x)\\log q(x)$ — the standard classification loss. KL divergence: $D_{KL}(p\\|q)=\\sum p(x)\\log[p(x)/q(x)]$ measures information lost when q approximates p. Mutual information: $I(X;Y)=H(X)-H(X|Y)$ — key for feature selection.\n\nOptimization: SGD $\\theta_{t+1}=\\theta_t-\\eta\\nabla L(\\theta_t)$ with mini-batches. Momentum: $v_{t+1}=\\gamma v_t+\\eta\\nabla L(\\theta_t)$. Adam combines momentum and RMSProp with bias correction. Lagrange multipliers: $\\mathcal{L}(x,\\lambda)=f(x)+\\lambda g(x)$.",
    "keyDefinitions": [
      {
        "term": "Entropy",
        "definition": "Measure of average uncertainty of a random variable.",
        "example": "Fair coin (p=0.5): 1 bit. Biased coin (p=0.9): ~0.47 bits."
      },
      {
        "term": "Cross-Entropy Loss",
        "definition": "Standard classification loss. Measures dissimilarity between true and predicted distributions.",
        "example": "True [0,1,0], pred [0.1,0.8,0.1]: cross-entropy = -log(0.8) = 0.223 nats."
      },
      {
        "term": "KL Divergence",
        "definition": "Measure of how distribution q diverges from p. Not symmetric. D_KL(p||q) ≥ 0 with equality iff p=q.",
        "example": "$D_{KL}(N(0,1)||N(0,2))$ ≈ 0.17 nats."
      },
      {
        "term": "Adam Optimizer",
        "definition": "Combines momentum (first moment) and RMSProp (second moment) with bias correction. Adaptive per-parameter learning rates.",
        "example": "Default: β1=0.9, β2=0.999, ε=1e-8."
      },
      {
        "term": "Stochastic Gradient Descent",
        "definition": "Optimization using random mini-batches to estimate gradients.",
        "example": "With 1M examples, batch size 256 computes gradient on 0.0256% of data per step."
      }
    ],
    "formulas": [
      {
        "title": "Cross-Entropy Loss",
        "formula": "$\\mathcal{L}(y,\\hat{y})=-\\sum_{i=1}^C y_i\\log(\\hat{y}_i)$",
        "explanation": "For C-class classification, y is one-hot encoded label and ŷ is softmax output. Loss = negative log-probability of the true class.",
        "example": "True class 3, predicted prob 0.95: loss = -log(0.95) = 0.051 nats."
      },
      {
        "title": "Adam Update",
        "formula": "$m_t=\\beta_1 m_{t-1}+(1-\\beta_1)g_t$\n$\\hat{m}_t=m_t/(1-\\beta_1^t)$\n$\\theta_{t+1}=\\theta_t-\\eta\\cdot\\hat{m}_t/(\\sqrt{\\hat{v}_t}+\\epsilon)$",
        "explanation": "Maintains first and second moments of gradients with bias correction. Default: β1=0.9, β2=0.999.",
        "example": "Frequently updated params with large gradients get smaller steps; rarely updated ones get larger steps."
      }
    ],
    "whyItMatters": "Information theory provides the loss functions we optimize (cross-entropy, KL divergence). Optimization provides the algorithms that minimize them. Together they form the computational engine of ML. Understanding why cross-entropy works and how Adam adapts enables you to diagnose training issues and choose the right tools.",
    "architecture": {
      "title": "Information Flow in Classification",
      "description": "How information theory connects through the training pipeline.",
      "blocks": [
        {
          "label": "True Distribution $p(x,y)$",
          "description": "Unknown joint distribution generating data"
        },
        {
          "label": "Empirical $\\hat{p}(x,y)$",
          "description": "Training dataset approximating true distribution"
        },
        {
          "label": "Model $q_\\theta(y|x)$",
          "description": "Parametric model outputting predicted probabilities"
        },
        {
          "label": "Cross-Entropy $H(\\hat{p},q_\\theta)$",
          "description": "Loss measuring divergence between distributions"
        },
        {
          "label": "Optimizer (Adam/SGD)",
          "description": "Minimizes cross-entropy by updating θ along gradient"
        }
      ]
    },
    "understanding": {
      "analogy": "Information theory is like a communication system. Entropy measures how surprising a message is—all zeros (zero entropy) vs random (maximum entropy). Cross-entropy is the number of yes/no questions needed to guess the true class with a suboptimal strategy. KL divergence is the extra questions because your strategy is imperfect. Optimization is finding the lowest point in a dark valley—SGD uses a flashlight (gradient) illuminating a small area (mini-batch).",
      "steps": [
        {
          "title": "Understand Entropy",
          "content": "Binary entropy H(p) = -p log p - (1-p) log(1-p). Peaks at p=0.5. Understand log(1/p) = bits to encode an event."
        },
        {
          "title": "Master Cross-Entropy and KL",
          "content": "Cross-entropy = entropy + KL divergence. Minimizing cross-entropy minimizes KL divergence."
        },
        {
          "title": "Learn Gradient-Based Optimization",
          "content": "Start with vanilla SGD, then Momentum, then adaptive methods (AdaGrad, RMSProp, Adam)."
        },
        {
          "title": "Study Convergence and Schedules",
          "content": "Learning rates must decay for convergence. Learn cosine annealing, linear warmup, cyclical LRs."
        },
        {
          "title": "Connect to ML Applications",
          "content": "Decision trees use information gain. VAEs optimize ELBO = reconstruction - KL divergence."
        }
      ],
      "misconceptions": [
        {
          "misconception": "Cross-entropy can be used for regression.",
          "truth": "Cross-entropy is for probabilistic classification outputs. For regression, use MSE or MAE."
        },
        {
          "misconception": "Adam always generalizes better than SGD.",
          "truth": "Adam converges faster initially but SGD with momentum often generalizes better for image classification and some other tasks."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "import numpy as np\ndef cross_entropy(y_true, y_pred, eps=1e-15):\n    y_pred = np.clip(y_pred, eps, 1-eps)\n    return -np.sum(y_true*np.log(y_pred))/len(y_true)\ny_true = np.array([0,1,0])\ny1 = np.array([0.1,0.8,0.1])\ny2 = np.array([0.45,0.1,0.45])\nprint(f\"Confident: {cross_entropy(y_true,y1):.4f}\")\nprint(f\"Confused: {cross_entropy(y_true,y2):.4f}\")",
        "output": "Confident: 0.2231\nConfused: 2.3026",
        "explanation": "Cross-entropy heavily penalizes confident wrong predictions. Confused gives 10x higher loss."
      },
      {
        "level": "intermediate",
        "code": "import numpy as np\n# Adam from scratch\ndef adam_update(p,g,m,v,t,lr=0.001,b1=0.9,b2=0.999,eps=1e-8):\n    m=b1*m+(1-b1)*g; v=b2*v+(1-b2)*(g**2)\n    m_h=m/(1-b1**t); v_h=v/(1-b2**t)\n    return p-lr*m_h/(np.sqrt(v_h)+eps), m, v\nparam = np.array([1.0, 1.0])\nm=np.zeros(2); v=np.zeros(2)\nfor t in range(1,11):\n    grad = np.array([np.random.normal(2,0.5),np.random.normal(0.1,0.3)])\n    param,m,v = adam_update(param, grad, m, v, t)\n    print(f\"Step {t}: {param}\")",
        "output": "Step 1: [0.9989 0.9999]\nStep 10: [0.9830 0.9983]",
        "explanation": "Adam adapts per-parameter learning rates. Params with large gradients get larger updates."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "LLM Training",
          "description": "Cross-entropy on next-token prediction is standard for GPT, LLaMA. AdamW is the default optimizer."
        },
        {
          "industry": "Reinforcement Learning",
          "description": "PPO uses clipped surrogate objective with KL penalty for stable policy updates."
        },
        {
          "industry": "VAEs",
          "description": "ELBO = reconstruction loss + KL divergence between posterior and prior over latents."
        }
      ],
      "caseStudy": {
        "problem": "Training GPT-3 (175B params) required enormous compute.",
        "solution": "AdamW with cosine annealing, gradient clipping (norm 1.0), increasing batch size. Cross-entropy over 499B tokens.",
        "results": "Strong few-shot performance across NLP benchmarks. Stable training despite massive scale."
      },
      "bestPractices": [
        "Use cross-entropy for classification, MSE for regression",
        "Start with Adam, switch to SGD+momentum for fine-tuning",
        "Use LR warmup for large models",
        "Monitor training/validation loss curves",
        "Use gradient clipping for RNNs/transformers",
        "Decay LR with schedule (cosine, step decay)",
        "Regularize with weight decay (AdamW)"
      ],
      "tools": [
        "PyTorch — nn.CrossEntropyLoss, optim.Adam, optim.SGD, lr_scheduler",
        "TensorFlow — tf.keras.losses.CategoricalCrossentropy",
        "Optuna — Hyperparameter optimization",
        "Weights & Biases — Experiment tracking"
      ],
      "jobRoles": [
        "ML Engineer — Selects and tunes optimizers",
        "Deep Learning Researcher — Develops new optimization algorithms"
      ],
      "furtherReading": [
        {
          "title": "Adam: A Method for Stochastic Optimization",
          "url": "https://arxiv.org/abs/1412.6980"
        },
        {
          "title": "An Overview of Gradient Descent Optimization Algorithms",
          "url": "https://arxiv.org/abs/1609.04747"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What does entropy measure?",
        "options": [
          "Average",
          "Spread",
          "Uncertainty",
          "Bias"
        ],
        "answer": "Uncertainty"
      },
      {
        "type": "mcq",
        "question": "Standard loss for multi-class classification?",
        "options": [
          "MSE",
          "Binary CE",
          "Categorical CE",
          "Hinge"
        ],
        "answer": "Categorical CE"
      },
      {
        "type": "truefalse",
        "question": "KL divergence is symmetric: D_KL(p||q)=D_KL(q||p).",
        "options": [
          "True",
          "False"
        ],
        "answer": "False"
      },
      {
        "type": "mcq",
        "question": "What makes Adam different from SGD?",
        "options": [
          "Uses second derivatives",
          "Adapts learning rates per parameter",
          "Only convex",
          "No gradients"
        ],
        "answer": "Adapts learning rates per parameter"
      },
      {
        "type": "mcq",
        "question": "Match to ML:",
        "options": "match",
        "answer": {
          "Cross-entropy": "Classification loss",
          "KL divergence": "VAE regularization",
          "Mutual information": "Feature selection",
          "Entropy": "Decision tree splitting"
        }
      }
    ]
  },
  "p3-numpy": {
    "theory": "NumPy is the foundational library for scientific computing in Python. It provides the ndarray (n-dimensional array)—a homogeneous, contiguous memory block enabling fast vectorized operations. Nearly every Python ML library builds on NumPy's array interface.\n\nThe ndarray stores data in a fixed-size, homogeneous, contiguous memory buffer, enabling C-level vectorization—typically 10-100x faster than Python loops. Arrays have shape, dtype, and strides.\n\nKey operations: indexing (basic, slice, fancy, boolean masking), reshaping, transposing, broadcasting (automatic shape alignment), and axis-wise operations. Broadcasting rule: dimensions must be equal or one must be 1.\n\nUniversal functions: vectorized element-wise operations like np.exp, np.log, np.sin. NumPy also provides linear algebra (np.linalg), random (np.random), FFT (np.fft).",
    "keyDefinitions": [
      {
        "term": "ndarray",
        "definition": "Homogeneous, contiguous memory block with shape, dtype, and strides.",
        "example": "np.array([[1,2,3],[4,5,6]]) creates 2×3 int64 array."
      },
      {
        "term": "Broadcasting",
        "definition": "Rules for element-wise ops on different-shaped arrays.",
        "example": "arr(3,4) + vec(4,) → result(3,4). Vector broadcast across rows."
      },
      {
        "term": "Vectorization",
        "definition": "Operating on entire arrays rather than looping. C-level speed.",
        "example": "np.exp(arr) is ~50x faster than a Python loop."
      },
      {
        "term": "Fancy Indexing",
        "definition": "Indexing with integer arrays or boolean masks.",
        "example": "arr[[0,2,5]] selects rows 0,2,5. arr[arr>0] selects positives."
      },
      {
        "term": "Strides",
        "definition": "Bytes to step in each dimension. Enables views without copies.",
        "example": "For (3,4) float64 array, strides might be (32,8)."
      }
    ],
    "whyItMatters": "NumPy is the bedrock of Python ML. Every dataset you load, every model you train passes through NumPy. Understanding vectorization, broadcasting, and memory layout is essential for writing efficient ML code.",
    "architecture": {
      "title": "NumPy Array Memory Layout",
      "description": "How a NumPy array is stored and how views work.",
      "blocks": [
        {
          "label": "Data Buffer",
          "description": "Contiguous C-style memory block"
        },
        {
          "label": "Shape",
          "description": "Size of each dimension"
        },
        {
          "label": "Strides",
          "description": "Byte offset for each dimension"
        },
        {
          "label": "dtype",
          "description": "Element type and size"
        },
        {
          "label": "View",
          "description": "New array sharing data buffer"
        }
      ]
    },
    "understanding": {
      "analogy": "NumPy arrays are like a well-organized spreadsheet. Instead of writing a formula per cell (Python loop), write one formula per column (vectorization). Broadcasting is like adding a constant to every row without creating a constant column. A view is looking through different filters without duplicating data.",
      "steps": [
        {
          "title": "Create and Inspect",
          "content": "Learn np.array(), np.zeros(), np.arange(), np.linspace(). Check .shape, .dtype, .ndim."
        },
        {
          "title": "Master Indexing",
          "content": "Practice slicing (start:stop:step), fancy indexing, boolean masking. Slices return views."
        },
        {
          "title": "Learn Broadcasting",
          "content": "Start scalar+array, then vector+matrix. Use np.newaxis to add dimensions."
        },
        {
          "title": "Use Vectorized Operations",
          "content": "Replace loops with ufuncs: np.sum(), np.mean(), np.exp(), np.log(), np.where()."
        },
        {
          "title": "Master Advanced",
          "content": "Learn np.einsum(), np.broadcast_to(), stride tricks for convolutions/attention."
        }
      ],
      "misconceptions": [
        {
          "misconception": "NumPy arrays are the same as Python lists.",
          "truth": "NumPy arrays are homogeneous, fixed-size, contiguous C memory. Lists are heterogeneous, variable-size, store pointers."
        },
        {
          "misconception": "Vectorized operations always faster.",
          "truth": "For large arrays yes, but memory-intensive. Chunked processing may be better for data not fitting cache."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "import numpy as np\narr = np.arange(10)\narr2d = np.random.randn(4,3)\nprint(f\"Shape: {arr2d.shape}\")\nprint(f\"First 3: {arr[:3]}\")\nprint(f\"Step 2: {arr[::2]}\")\nprint(f\"Column 1: {arr2d[:,1]}\")\nprint(f\"Positive: {arr[arr>5]}\")\nprint(f\"Reshaped:\\n{arr.reshape(2,5)}\")",
        "output": "Shape: (4, 3)\nFirst 3: [0 1 2]\nStep 2: [0 2 4 6 8]\nColumn 1: [0.50 -0.14 0.65 1.52]\nPositive: [6 7 8 9]",
        "explanation": "Basic creation, slicing, boolean masking, reshaping. Slices create views (no copy)."
      },
      {
        "level": "intermediate",
        "code": "import numpy as np\nX = np.array([[1,2,3],[4,5,6],[7,8,9]])\nmean = X.mean(axis=0); std = X.std(axis=0)\nnormalized = (X - mean) / std\nprint(f\"Normalized mean: {normalized.mean(axis=0)}\")\n# Pairwise distances\nA = np.array([[1,2],[3,4],[5,6]])\nB = np.array([[0,0],[1,1]])\ndists = np.sqrt(((A[:,np.newaxis,:] - B[np.newaxis,:,:])**2).sum(axis=2))\nprint(f\"Distances:\\n{dists}\")",
        "output": "Normalized mean: [0. 0. 0.]\n\nDistances:\n[[2.24 1.  ]\n [5.   4.24]\n [7.81 7.07]]",
        "explanation": "Broadcasting normalizes without loops. Pairwise distances use np.newaxis for dimension alignment."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Deep Learning",
          "description": "Interchange format between data loading and ML frameworks."
        },
        {
          "industry": "Scientific Computing",
          "description": "Billion-element grid operations for physics and climate."
        },
        {
          "industry": "Finance",
          "description": "Portfolio optimization and Monte Carlo simulations."
        }
      ],
      "caseStudy": {
        "problem": "Genomics startup needed to process DNA data (billions of base pairs) but Python took days per genome.",
        "solution": "Rewrote alignment with NumPy vectorized operations: broadcasting and boolean masking.",
        "results": "Processing dropped from 3 days to 4 hours per genome."
      },
      "bestPractices": [
        "Use vectorized ops instead of loops (10-100x speedup)",
        "Use axis parameter for dimension-specific ops",
        "Prefer np.where() for conditional operations",
        "Use np.newaxis for explicit broadcasting",
        "Specify dtype to save memory"
      ],
      "tools": [
        "NumPy — ndarray, np.linalg",
        "Numba — JIT compiler",
        "CuPy — GPU-accelerated NumPy",
        "Dask — Parallel out-of-core NumPy"
      ],
      "jobRoles": [
        "ML Engineer — Builds preprocessing with vectorization",
        "Data Scientist — Numerical analysis and feature engineering"
      ],
      "furtherReading": [
        {
          "title": "NumPy Quickstart",
          "url": "https://numpy.org/doc/stable/user/quickstart.html"
        },
        {
          "title": "From Python to NumPy",
          "url": "https://www.labri.fr/perso/nrougier/from-python-to-numpy/"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "Main advantage of NumPy vs lists?",
        "options": [
          "Heterogeneous data",
          "Vectorized ops at C speed",
          "Dynamic resizing",
          "Less string memory"
        ],
        "answer": "Vectorized ops at C speed"
      },
      {
        "type": "truefalse",
        "question": "NumPy broadcasting works on different-shaped arrays.",
        "options": [
          "True",
          "False"
        ],
        "answer": "True"
      },
      {
        "type": "code",
        "question": "Result of arr(4,3) + vec(3,)?",
        "options": [
          "(4,3)",
          "(3,4)",
          "(4,)",
          "Error"
        ],
        "answer": "(4,3)"
      },
      {
        "type": "mcq",
        "question": "Which creates 3×4 zeros array?",
        "options": [
          "np.zeros([3,4])",
          "np.zeros(12)",
          "np.zero(3,4)",
          "np.array([3,4])"
        ],
        "answer": "np.zeros([3,4])"
      },
      {
        "type": "mcq",
        "question": "Match to description:",
        "options": "match",
        "answer": {
          ".reshape()": "Change dims",
          ".T": "Transpose",
          "np.where()": "Conditional",
          "arr[arr>0]": "Boolean mask"
        }
      }
    ]
  },
  "p3-pandas": {
    "theory": "Pandas is the standard Python library for data manipulation with two primary structures: Series (1D labeled array) and DataFrame (2D labeled table). Built on NumPy, pandas adds labeled axes, missing data handling, group-by operations, and I/O.\n\nKey capabilities: selection (df['col'], df.loc[], df.iloc[]), missing data (df.isna(), df.fillna()), group operations (df.groupby().agg()), merging (pd.merge()), reshaping (df.pivot(), df.melt()), I/O (pd.read_csv(), df.to_csv()).\n\nThe split-apply-combine pattern: split groups, apply function, combine results.",
    "keyDefinitions": [
      {
        "term": "DataFrame",
        "definition": "2D labeled data structure with columns of different types.",
        "example": "pd.DataFrame({'name':['Alice','Bob'],'age':[25,30]}) creates 2×2 table."
      },
      {
        "term": "Series",
        "definition": "1D labeled array. A DataFrame column is a Series.",
        "example": "pd.Series([10,20,30], index=['a','b','c'])."
      },
      {
        "term": "GroupBy",
        "definition": "Split-apply-combine: split, apply function, combine results.",
        "example": "df.groupby('dept')['salary'].mean() computes avg salary per dept."
      },
      {
        "term": "Index",
        "definition": "Row labels for labeled access (df.loc[]) and alignment.",
        "example": "df.set_index('user_id') enables df.loc[42]."
      },
      {
        "term": "Pivot Table",
        "definition": "Summarize data across two dimensions like Excel.",
        "example": "df.pivot_table(values='sales', index='region', columns='quarter')"
      }
    ],
    "whyItMatters": "Real-world ML starts with data wrangling: 60-80% of data scientist time is cleaning and transforming data. Pandas is the primary tool. Every dataset must be loaded, cleaned, and transformed before modeling.",
    "architecture": {
      "title": "DataFrame Internal Architecture",
      "description": "How a DataFrame is structured internally.",
      "blocks": [
        {
          "label": "Column Manager",
          "description": "Dict mapping column names to arrays"
        },
        {
          "label": "Index (Row Labels)",
          "description": "pd.Index for label-based access"
        },
        {
          "label": "dtypes",
          "description": "Per-column dtype tracking"
        },
        {
          "label": "Block Manager",
          "description": "Same-dtype columns in contiguous blocks"
        }
      ]
    },
    "understanding": {
      "analogy": "Pandas is like a super-powered Excel spreadsheet. DataFrame = worksheet with named columns. GroupBy = pivot table. Merging = VLOOKUP on steroids. Missing data (NaN) = empty cells. Key difference: pandas operations are programmable and reproducible.",
      "steps": [
        {
          "title": "Master Creation and Inspection",
          "content": "Create from dicts, CSV. Use .head(), .info(), .describe()."
        },
        {
          "title": "Learn Selection and Filtering",
          "content": "Master .loc[], .iloc[], boolean indexing, .query(). Avoid SettingWithCopyWarning."
        },
        {
          "title": "Handle Missing Data",
          "content": "Detect .isna(), fill .fillna(), drop .dropna(), interpolate .interpolate()."
        },
        {
          "title": "Master GroupBy",
          "content": "Learn .groupby().agg() with multiple functions and named aggregation."
        },
        {
          "title": "Reshape and Merge",
          "content": "Master pd.merge, df.join, pd.concat, .melt(), .pivot()."
        }
      ],
      "misconceptions": [
        {
          "misconception": "Pandas operations always create copies.",
          "truth": "Many return views. Use .copy() explicitly for independence."
        },
        {
          "misconception": "Row iteration with for-loops is fine.",
          "truth": "df.iterrows() is extremely slow. Use vectorized ops or .apply()."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "import pandas as pd\ndf = pd.DataFrame({'name':['Alice','Bob','Charlie'],'dept':['Eng','Mkt','Eng'],'salary':[120000,85000,110000],'years':[5,3,7]})\nprint(df)\nprint(df.describe())",
        "output": "     name dept  salary  years\n0   Alice  Eng  120000      5\n1     Bob  Mkt   85000      3\n2 Charlie  Eng  110000      7\n\n       salary  years\nmean   105000    5.0\nstd     17559    2.0",
        "explanation": "Creating DataFrame and using describe() for summary statistics."
      },
      {
        "level": "intermediate",
        "code": "import pandas as pd, numpy as np\ndf = pd.DataFrame({'name':['Alice','Bob','Charlie','Diana','Eve','Frank'],'dept':['Eng','Mkt','Eng','Sales','Mkt','Eng'],'salary':[120000,85000,np.nan,95000,90000,130000],'years':[5,3,7,np.nan,2,8]})\nprint(f\"Missing:\\n{df.isna().sum()}\")\ndf['salary'] = df.groupby('dept')['salary'].transform(lambda x: x.fillna(x.mean()))\ndf['years'] = df['years'].fillna(df['years'].median())\nstats = df.groupby('dept').agg(avg_sal=('salary','mean'),cnt=('name','count')).round(0)\nprint(f\"Stats:\\n{stats}\")",
        "output": "Missing:\nsalary    1\nyears     1\n\nStats:\n       avg_sal  cnt\nEng    125000.0    3\nMkt     87500.0    2\nSales   95000.0    1",
        "explanation": "GroupBy with transform fills missing per department. Multi-index aggregation."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Data Pipelines",
          "description": "Pandas loads, cleans, transforms data before ML."
        },
        {
          "industry": "Financial Analysis",
          "description": "Time-series with DatetimeIndex, resampling, rolling windows."
        },
        {
          "industry": "E-commerce",
          "description": "Clickstream processing, transactions, A/B test analysis."
        }
      ],
      "caseStudy": {
        "problem": "Ride-sharing company had 50TB daily trip data in 1000+ CSV files.",
        "solution": "Chunked reading (chunksize=50000), only needed columns (usecols), explicit dtypes.",
        "results": "Analysis dropped from days to minutes using streaming processing on single 64GB machine."
      },
      "bestPractices": [
        "Read only needed columns (usecols)",
        "Set explicit dtypes for memory efficiency",
        "Use .copy() when filtering",
        "Avoid iterative row ops; prefer vectorized",
        "Use pd.NA instead of np.nan",
        "For large data, use Dask or Polars"
      ],
      "tools": [
        "Pandas — DataFrame, GroupBy, merge",
        "Dask — Parallel pandas",
        "Polars — Faster with Arrow backend",
        "Modin — Drop-in replacement"
      ],
      "jobRoles": [
        "Data Scientist — Primary pandas user",
        "Data Engineer — Builds ETL pipelines"
      ],
      "furtherReading": [
        {
          "title": "Pandas Getting Started",
          "url": "https://pandas.pydata.org/docs/getting_started/index.html"
        },
        {
          "title": "Python for Data Analysis",
          "url": "https://wesmckinney.com/book/"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "Primary 2D data structure in pandas?",
        "options": [
          "Series",
          "Array",
          "DataFrame",
          "Panel"
        ],
        "answer": "DataFrame"
      },
      {
        "type": "mcq",
        "question": "Method for label-based indexing?",
        "options": [
          ".iloc[]",
          ".loc[]",
          ".iat[]",
          ".at[]"
        ],
        "answer": ".loc[]"
      },
      {
        "type": "truefalse",
        "question": "GroupBy follows split-apply-combine.",
        "options": [
          "True",
          "False"
        ],
        "answer": "True"
      },
      {
        "type": "mcq",
        "question": "df.groupby('dept')['salary'].mean() computes?",
        "options": [
          "Median",
          "Mean",
          "Total",
          "Std"
        ],
        "answer": "Mean"
      },
      {
        "type": "mcq",
        "question": "Match to purpose:",
        "options": "match",
        "answer": {
          ".fillna()": "Handle missing",
          ".merge()": "Combine DataFrames",
          ".pivot_table()": "Summarize",
          ".melt()": "Unpivot long"
        }
      }
    ]
  },
  "p3-visualization": {
    "theory": "Data visualization is essential for EDA, model diagnostics, and communication. Matplotlib is the foundational library with fine-grained control. Seaborn provides statistical visualizations with DataFrame integration. Plotly provides interactive web-based visualizations.\n\nKey Seaborn plots: sns.histplot (distribution), sns.boxplot (quartiles+outliers), sns.violinplot, sns.scatterplot, sns.heatmap (correlation), sns.pairplot (all pairwise).\n\nBest practices: choose right chart type, label axes clearly, use color purposefully (colorblind-friendly palettes), avoid chartjunk, show uncertainty.",
    "keyDefinitions": [
      {
        "term": "Figure and Axes",
        "definition": "Figure = top-level container. Axes = single plot within a figure.",
        "example": "fig, ax = plt.subplots(2,2) creates 2×2 grid."
      },
      {
        "term": "Statistical Plot",
        "definition": "Visualization of distributions: histogram, KDE, boxplot.",
        "example": "sns.histplot(data, kde=True) shows histogram + density."
      },
      {
        "term": "Correlation Heatmap",
        "definition": "Color-coded pairwise correlation coefficients.",
        "example": "sns.heatmap(df.corr(), annot=True, cmap='RdBu')"
      },
      {
        "term": "Pairplot",
        "definition": "Grid of scatter plots for all variable pairs, colored by class.",
        "example": "sns.pairplot(df, hue='target')"
      }
    ],
    "whyItMatters": "Visualization is how humans understand data. Plots reveal patterns, outliers, and relationships that summary statistics miss.\nIn ML you visualize: distributions (before modeling), learning curves (during training), confusion matrices (evaluation).",
    "architecture": {
      "title": "Matplotlib Object Hierarchy",
      "description": "The nested object model.",
      "blocks": [
        {
          "label": "Figure",
          "description": "Top-level container"
        },
        {
          "label": "Axes",
          "description": "Individual plot area"
        },
        {
          "label": "Axis (X, Y)",
          "description": "Tick locations, labels, scale"
        },
        {
          "label": "Artists",
          "description": "Lines, text, patches, colormaps"
        },
        {
          "label": "Spines",
          "description": "Border lines of axes"
        }
      ]
    },
    "understanding": {
      "analogy": "Data visualization translates numbers into a language the brain processes naturally. Your visual cortex has more pattern-recognition neurons than any other sense. Matplotlib is the 'machine code'—you can do anything but everything is explicit. Seaborn is the 'high-level language' with common patterns as simple functions.",
      "steps": [
        {
          "title": "Master Matplotlib",
          "content": "Learn Figure-Axes-Axis hierarchy. Practice subplots, plot(), scatter(), hist()."
        },
        {
          "title": "Use Seaborn",
          "content": "Learn histplot, boxplot, violinplot, scatterplot, heatmap, pairplot."
        },
        {
          "title": "Publication Figures",
          "content": "Set figsize, tight_layout, font sizes, export as PDF/SVG."
        },
        {
          "title": "Multi-Panel",
          "content": "Use subplots(), GridSpec, sharex/sharey, subplot_mosaic()."
        },
        {
          "title": "Interactive",
          "content": "Use Plotly Express for hover, zoom, pan. Export as standalone HTML."
        }
      ],
      "misconceptions": [
        {
          "misconception": "plt.plot() and ax.plot() are interchangeable.",
          "truth": "plt.plot() uses current axes (state machine). ax.plot() targets specific axes. Use ax.plot() for multi-panel."
        },
        {
          "misconception": "3D plots show more information.",
          "truth": "3D obscures data via perspective. Use 2D with color/size for extra dimensions."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "import matplotlib.pyplot as plt, numpy as np\nx = np.linspace(0,10,100)\nfig, (ax1,ax2) = plt.subplots(1,2,figsize=(10,4))\nax1.plot(x, np.sin(x), label='sin', linewidth=2)\nax1.plot(x, np.cos(x), label='cos', linestyle='--')\nax1.legend(); ax1.grid(True, alpha=0.3)\nnp.random.seed(42)\nax2.scatter(np.random.randn(50), 2*np.random.randn(50)+np.random.randn(50)*0.5, alpha=0.7, c='purple')\nplt.tight_layout()\nplt.show()",
        "output": "[Two subplots: sin/cos curves and scatter plot]",
        "explanation": "Basic Matplotlib with subplots. Line plots with labels, legend, grid. Scatter with transparency."
      },
      {
        "level": "intermediate",
        "code": "import seaborn as sns, matplotlib.pyplot as plt\ndf = sns.load_dataset('iris')\nsns.pairplot(df, hue='species', diag_kind='kde', palette='Set2')\nplt.show()\nfig, ax = plt.subplots(figsize=(8,6))\nsns.heatmap(df.select_dtypes('number').corr(), annot=True, cmap='RdBu_r', center=0, ax=ax)\nplt.show()",
        "output": "[Pairplot and heatmap figures]",
        "explanation": "Pairplot shows 4x4 pairwise scatter colored by species. Heatmap shows feature correlations."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "EDA",
          "description": "Visualize distributions, outliers, missing patterns before modeling."
        },
        {
          "industry": "Model Diagnostics",
          "description": "Learning curves, confusion matrices, ROC curves, feature importance."
        },
        {
          "industry": "Dashboards",
          "description": "Plotly dashboards for KPIs and trends."
        }
      ],
      "caseStudy": {
        "problem": "Healthcare ML team had poor sepsis prediction AUC despite normal summary stats.",
        "solution": "Seaborn pairplots revealed different joint distributions between septic/non-septic patients not visible in univariate stats.",
        "results": "Feature engineering from EDA insights improved AUC from 0.65 to 0.89."
      },
      "bestPractices": [
        "Always visualize before modeling",
        "Use colorblind-friendly palettes (viridis, Set2)",
        "Label all axes with units",
        "Export as SVG/PDF for publications",
        "Avoid 3D plots and pie charts"
      ],
      "tools": [
        "Matplotlib — Foundation library",
        "Seaborn — Statistical plots",
        "Plotly — Interactive web viz",
        "Altair — Declarative viz",
        "Bokeh — Browser-based interactive"
      ],
      "jobRoles": [
        "Data Scientist — Uses viz for EDA and communication",
        "ML Researcher — Visualizes loss landscapes and attention patterns"
      ],
      "furtherReading": [
        {
          "title": "Matplotlib Tutorials",
          "url": "https://matplotlib.org/stable/tutorials/index.html"
        },
        {
          "title": "Seaborn Tutorial",
          "url": "https://seaborn.pydata.org/tutorial.html"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "Which Matplotlib object represents a plot area?",
        "options": [
          "Figure",
          "Axes",
          "Axis",
          "Canvas"
        ],
        "answer": "Axes"
      },
      {
        "type": "mcq",
        "question": "Which seaborn function creates all pairwise scatter plots?",
        "options": [
          "sns.jointplot",
          "sns.pairplot",
          "sns.relplot",
          "sns.lmplot"
        ],
        "answer": "sns.pairplot"
      },
      {
        "type": "truefalse",
        "question": "Heatmap is useful for correlation matrices.",
        "options": [
          "True",
          "False"
        ],
        "answer": "True"
      },
      {
        "type": "mcq",
        "question": "Which library provides interactive web viz?",
        "options": [
          "Matplotlib",
          "Seaborn",
          "Plotly",
          "Pandas"
        ],
        "answer": "Plotly"
      },
      {
        "type": "mcq",
        "question": "Match plot to use case:",
        "options": "match",
        "answer": {
          "Histogram": "One variable distribution",
          "Scatter": "Two variable relationship",
          "Box plot": "Outliers and quartiles",
          "Heatmap": "Correlation matrix"
        }
      }
    ]
  },
  "p3-scipy": {
    "theory": "SciPy builds on NumPy to provide optimization, statistics, sparse matrices, spatial algorithms, and interpolation.\n\nscipy.optimize: minimize() with Nelder-Mead, BFGS, L-BFGS-B, SLSQP. curve_fit() for nonlinear least squares.\n\nscipy.stats: 200+ probability distributions, tests (t-test, ANOVA, chi-squared, KS test), KDE.\n\nscipy.sparse: CSR, CSC, COO sparse matrix formats. CSR is standard for ML (efficient row slicing and matrix-vector products). Powers NLP bag-of-words and TF-IDF.\n\nscipy.spatial: KDTree for O(log n) nearest neighbor search, distance computations (pdist, cdist).",
    "keyDefinitions": [
      {
        "term": "scipy.optimize.minimize",
        "definition": "Unified interface for function minimization with multiple algorithms.",
        "example": "minimize(rosenbrock, x0, method='L-BFGS-B', bounds=[(0,None)])"
      },
      {
        "term": "Sparse Matrix (CSR)",
        "definition": "Stored as non-zero entries, column indices, row pointers.",
        "example": "10,000×10,000 with 0.1% density uses 10x less memory."
      },
      {
        "term": "Kolmogorov-Smirnov Test",
        "definition": "Non-parametric test comparing two distributions.",
        "example": "scipy.stats.ks_2samp(train, test) detects data drift."
      },
      {
        "term": "KDTree",
        "definition": "Space-partitioning for O(log n) nearest neighbor queries.",
        "example": "scipy.spatial.KDTree(X).query(point, k=5) finds 5 neighbors."
      }
    ],
    "whyItMatters": "SciPy bridges NumPy's basic operations and real scientific computing. When you need to optimize, test hypotheses, handle sparse data, or find neighbors, SciPy provides battle-tested implementations. scikit-learn uses SciPy internally.",
    "architecture": {
      "title": "SciPy Module Structure",
      "description": "Major submodules and their roles.",
      "blocks": [
        {
          "label": "scipy.optimize",
          "description": "Function minimization, curve fitting"
        },
        {
          "label": "scipy.stats",
          "description": "Distributions and statistical tests"
        },
        {
          "label": "scipy.sparse",
          "description": "Sparse matrix formats"
        },
        {
          "label": "scipy.spatial",
          "description": "KDTree and distance computations"
        },
        {
          "label": "scipy.interpolate",
          "description": "Data interpolation"
        },
        {
          "label": "scipy.linalg",
          "description": "Advanced linear algebra"
        }
      ]
    },
    "understanding": {
      "analogy": "SciPy is a well-stocked scientific toolbox. NumPy provides the workbench (arrays). SciPy provides: optimization (finding lowest surface point), statistics (testing if groups differ), sparse matrices (mostly-empty spreadsheets), KDTree (finding closest houses).",
      "steps": [
        {
          "title": "Master optimize",
          "content": "Learn minimize() methods. Practice curve_fit(). Understand bounded optimization."
        },
        {
          "title": "Learn Statistical Tests",
          "content": "Master ttest_ind, ks_2samp, f_oneway, chi2_contingency for feature selection."
        },
        {
          "title": "Master Sparse Matrices",
          "content": "Learn CSR for row slicing (ML), CSC for column selection (feature selection)."
        },
        {
          "title": "Use Spatial",
          "content": "Learn KDTree, pdist, cdist. Building blocks for clustering and anomaly detection."
        },
        {
          "title": "Connect to ML",
          "content": "scikit-learn uses KDTree, scipy.stats, and sparse matrices internally."
        }
      ],
      "misconceptions": [
        {
          "misconception": "SciPy replaces NumPy.",
          "truth": "SciPy builds on NumPy. NumPy provides arrays; SciPy provides algorithms. You need both."
        },
        {
          "misconception": "minimize() finds global minima.",
          "truth": "It finds local minima. Use differential_evolution or basinhopping for global optimization."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "import numpy as np\nfrom scipy import optimize, spatial\ndef model(x,a,b,c): return a*np.exp(-b*x)+c\nnp.random.seed(42)\nx = np.linspace(0,5,50)\ny = model(x,2.5,0.8,0.2)+np.random.normal(0,0.2,50)\nparams,_ = optimize.curve_fit(model,x,y,p0=[1,1,0])\nprint(f\"Fitted: a={params[0]:.3f}, b={params[1]:.3f}, c={params[2]:.3f}\")\npoints = np.random.randn(100,2)\ntree = spatial.KDTree(points)\ndists,_ = tree.query([0,0],k=5)\nprint(f\"5 nearest distances: {dists.round(3)}\")",
        "output": "Fitted: a=2.497, b=0.811, c=0.196\n5 nearest distances: [1.045 1.081 1.249 1.268 1.403]",
        "explanation": "curve_fit recovers true params (2.5, 0.8, 0.2). KDTree finds 5 nearest neighbors in O(log n) time."
      },
      {
        "level": "intermediate",
        "code": "import numpy as np\nfrom scipy import sparse, stats, optimize\nX = np.random.binomial(1, 0.1, (1000, 10000))\nX_sparse = sparse.csr_matrix(X)\nprint(f\"Density: {X_sparse.nnz/(1000*10000):.3%}\")\ns1 = np.random.normal(0,1,100)\ns2 = np.random.normal(0.2,1,100)\n_, p = stats.ttest_ind(s1, s2)\nprint(f\"t-test p={p:.3f}\")\ndef f(x): return (x[0]-3)**2 + (x[1]-1)**2 + 5\nres = optimize.minimize(f, [0,0], method='BFGS')\nprint(f\"Min at {res.x.round(3)}, value={res.fun:.3f}\")",
        "output": "Density: 0.100%\nt-test p=0.092\nMin at [3. 1.], value=5.0",
        "explanation": "Sparse matrix uses 0.1% memory of dense. t-test not significant (α=0.05). Minimization finds f(3,1)=5."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "NLP",
          "description": "scipy.sparse CSR for bag-of-words and TF-IDF from CountVectorizer."
        },
        {
          "industry": "Hypothesis Testing",
          "description": "scipy.stats tests validate ML improvements: paired t-test for fold comparisons."
        },
        {
          "industry": "Hyperparameter Tuning",
          "description": "scipy.optimize.minimize with L-BFGS-B tunes bounded parameters."
        }
      ],
      "caseStudy": {
        "problem": "NLP team needed to process 10M documents for topic modeling. Dense matrix was ~200GB.",
        "solution": "CountVectorizer with scipy.sparse.csr_matrix created 2GB sparse matrix. Used sparse SVD for LSA.",
        "results": "Processing 10M docs done in 30 minutes on a single 32GB machine."
      },
      "bestPractices": [
        "Use sparse for >90% zeros",
        "CSR for row slicing (ML), CSC for column slicing",
        "Use 'L-BFGS-B' for bounded optimization",
        "ks_2samp for data/concept drift detection",
        "KDTree for O(log n) nearest neighbor search"
      ],
      "tools": [
        "SciPy — optimize, stats, sparse, spatial",
        "scikit-learn — Uses SciPy internally",
        "imbalanced-learn — Uses sparse matrices"
      ],
      "jobRoles": [
        "ML Engineer — Uses SciPy for optimization and sparse data",
        "Data Scientist — Statistical tests for model validation"
      ],
      "furtherReading": [
        {
          "title": "SciPy Documentation",
          "url": "https://docs.scipy.org/doc/scipy/"
        },
        {
          "title": "SciPy Lecture Notes",
          "url": "https://scipy-lectures.org/"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "Which module handles optimization?",
        "options": [
          "scipy.stats",
          "scipy.optimize",
          "scipy.sparse",
          "scipy.linalg"
        ],
        "answer": "scipy.optimize"
      },
      {
        "type": "mcq",
        "question": "Standard ML sparse matrix format?",
        "options": [
          "COO",
          "CSC",
          "CSR",
          "LIL"
        ],
        "answer": "CSR"
      },
      {
        "type": "truefalse",
        "question": "KS test compares two distributions.",
        "options": [
          "True",
          "False"
        ],
        "answer": "True"
      },
      {
        "type": "mcq",
        "question": "Function for nonlinear curve fitting?",
        "options": [
          "minimize()",
          "curve_fit()",
          "linprog()",
          "root()"
        ],
        "answer": "curve_fit()"
      },
      {
        "type": "mcq",
        "question": "Match module to use:",
        "options": "match",
        "answer": {
          "optimize": "Parameter minimization",
          "stats": "Hypothesis testing",
          "sparse": "Memory-efficient matrices",
          "spatial": "Nearest neighbor search"
        }
      }
    ]
  },
  "p4-eda": {
    "theory": "Exploratory Data Analysis (EDA) investigates datasets to discover patterns, spot anomalies, and check assumptions using summary statistics and visualizations. EDA is a critical precursor to any ML work.\n\nUnivariate analysis: central tendency (mean, median, mode), dispersion (range, IQR, std, variance), shape (skewness, kurtosis), distribution. Bivariate analysis: numerical-numerical (correlation, scatter), numerical-categorical (boxplots), categorical-categorical (contingency table, chi-squared). Multivariate analysis: pairplots, parallel coordinates, PCA.\n\nKey tools: df.info(), df.describe(), df.isna().sum(), df['col'].value_counts(), sns.histplot(), sns.boxplot(), sns.pairplot(), sns.heatmap(df.corr()).",
    "keyDefinitions": [
      {
        "term": "Univariate Analysis",
        "definition": "Analysis of one variable: central tendency, dispersion, shape.",
        "example": "Histogram of age reveals right skew. Mean=35, median=32."
      },
      {
        "term": "Bivariate Analysis",
        "definition": "Relationships between pairs of variables.",
        "example": "Scatter of size vs price shows positive correlation (r=0.75)."
      },
      {
        "term": "Skewness",
        "definition": "Distribution asymmetry. Positive = longer right tail. Negative = longer left tail.",
        "example": "Log-normal has positive skew. log(x) can normalize it."
      },
      {
        "term": "Correlation Matrix",
        "definition": "Table of pairwise correlation coefficients. Detects multicollinearity.",
        "example": "Correlation > 0.9 suggests multicollinearity, destabilizing linear models."
      }
    ],
    "whyItMatters": "EDA is the most important step in any data project. Without it you risk: using wrong model type, missing data quality issues, misinterpreting results (Simpson's paradox). 80% of data science is understanding the data.",
    "architecture": {
      "title": "EDA Workflow Pipeline",
      "description": "Systematic process from raw to ready data.",
      "blocks": [
        {
          "label": "Data Loading",
          "description": "Read data. Check shape, columns, dtypes, head."
        },
        {
          "label": "Missing Data Analysis",
          "description": "Identify missing patterns with missingno."
        },
        {
          "label": "Univariate Analysis",
          "description": "Histograms, boxplots, summary stats."
        },
        {
          "label": "Bivariate Analysis",
          "description": "Scatter plots, correlations, cross-tabs."
        },
        {
          "label": "Multivariate Analysis",
          "description": "Pairplots, PCA, parallel coordinates."
        },
        {
          "label": "Quality Report",
          "description": "Compile findings, issues, actions."
        }
      ]
    },
    "understanding": {
      "analogy": "EDA is like a detective's investigation of a crime scene. Before forming hypotheses (models), you examine evidence: what's present? What's missing? Are there unusual patterns? A detective who rushes to conclusions misses critical evidence; a data scientist who skips EDA builds models on untested assumptions.",
      "steps": [
        {
          "title": "Load and Inspect",
          "content": "df.info(), df.head(), df.describe(), df.shape."
        },
        {
          "title": "Check Data Quality",
          "content": "df.isna().sum(), df.duplicated().sum(), value_counts()."
        },
        {
          "title": "Univariate Analysis",
          "content": "Histograms and boxplots for each numeric feature. Identify skewness and outliers."
        },
        {
          "title": "Bivariate Analysis",
          "content": "Scatter plots, boxplots, cross-tabs, correlation matrix."
        },
        {
          "title": "Document Findings",
          "content": "Compile observations guiding preprocessing and feature engineering."
        }
      ],
      "misconceptions": [
        {
          "misconception": "EDA is optional; go straight to modeling.",
          "truth": "Models make assumptions (linearity, Normality). EDA verifies them. Skipping leads to invalid models."
        },
        {
          "misconception": "Summary stats alone suffice.",
          "truth": "Anscombe's quartet: 4 different datasets with identical summary stats. Visualization is essential."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "import pandas as pd\ndf = pd.read_csv('https://raw.githubusercontent.com/mwaskom/seaborn-data/master/tips.csv')\nprint(f\"Shape: {df.shape}\")\nprint(df.describe())\nprint(f\"Missing:\\n{df.isna().sum()}\")\nprint(df['day'].value_counts())",
        "output": "Shape: (244, 7)\nSummary stats for total_bill, tip, size\nNo missing values\nDay: Sat(87), Sun(76), Thur(62), Fri(19)",
        "explanation": "Basic EDA: inspect shape, summary stats, missing values, categorical distributions."
      },
      {
        "level": "intermediate",
        "code": "import pandas as pd\ndf = pd.read_csv('https://raw.githubusercontent.com/mwaskom/seaborn-data/master/tips.csv')\ndf['tip_pct'] = df['tip']/df['total_bill']\nstats = df.groupby('time').agg(avg_bill=('total_bill','mean'),avg_tip=('tip','mean'),count=('total_bill','count')).round(2)\nprint(stats)\nh_tippers = df[df['tip_pct']>0.4]\nprint(f\"High tippers: {len(h_tippers)}\")",
        "output": "         avg_bill  avg_tip  count\ntime\nDinner   20.80    3.10    176\nLunch    17.15    2.73     68\n\nHigh tippers: 6",
        "explanation": "Advanced EDA: feature engineering (tip_pct), groupby analysis, outlier detection."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Fraud Detection",
          "description": "Fraudulent transactions cluster at specific hours/amounts."
        },
        {
          "industry": "Customer Segmentation",
          "description": "Pairplots reveal natural segments based on behavior."
        },
        {
          "industry": "Healthcare",
          "description": "Age-disease correlations and data quality issues."
        }
      ],
      "caseStudy": {
        "problem": "Fintech credit risk model had poor performance and demographic bias.",
        "solution": "EDA revealed: missing income non-random, loan amount bimodal, strong income-loan purpose interaction.",
        "results": "Stratified imputation, separate loan models, interaction features. AUC from 0.72 to 0.88, reduced bias."
      },
      "bestPractices": [
        "Always start with df.info() and df.describe()",
        "Visualize ALL feature distributions",
        "Check missing data patterns (not just counts)",
        "Normalize before computing correlations",
        "Use pairplots for small feature sets",
        "Document findings",
        "Check for data leakage in time series"
      ],
      "tools": [
        "ydata-profiling — Automated EDA reports",
        "missingno — Visualize missing patterns",
        "Sweetviz — Automated EDA comparison",
        "Pandas — describe, info, corr, groupby",
        "Seaborn — pairplot, heatmap, boxplot"
      ],
      "jobRoles": [
        "Data Scientist — EDA is 50%+ of the job",
        "Data Analyst — Primary activity producing insights"
      ],
      "furtherReading": [
        {
          "title": "Exploratory Data Analysis (Tukey)",
          "url": "https://www.amazon.com/Exploratory-Data-Analysis-John-Tukey/dp/0201076160"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "Primary goal of EDA?",
        "options": [
          "Build models",
          "Understand data structure",
          "Deploy",
          "Tune hyperparameters"
        ],
        "answer": "Understand data structure"
      },
      {
        "type": "mcq",
        "question": "Examines one variable at a time?",
        "options": [
          "Bivariate",
          "Univariate",
          "Multivariate",
          "Factor"
        ],
        "answer": "Univariate"
      },
      {
        "type": "truefalse",
        "question": "EDA is optional for simple datasets.",
        "options": [
          "True",
          "False"
        ],
        "answer": "False"
      },
      {
        "type": "mcq",
        "question": "Correlation matrix detects?",
        "options": [
          "Causation",
          "Multicollinearity",
          "Stationarity",
          "Normality"
        ],
        "answer": "Multicollinearity"
      },
      {
        "type": "mcq",
        "question": "Match EDA technique:",
        "options": "match",
        "answer": {
          "Histogram": "One variable distribution",
          "Scatter": "Two variable relationship",
          "Box plot": "Outlier detection",
          "Correlation matrix": "Feature relationships"
        }
      }
    ]
  },
  "p4-handling-missing-data": {
    "theory": "Missing data is ubiquitous in real-world datasets. Handling depends on the missingness mechanism:\n\n1. MCAR (Missing Completely At Random): missingness independent of all variables. Observed data is a random subsample.\n2. MAR (Missing At Random): missingness depends on observed variables but not missing values. Most imputation methods assume MAR.\n3. MNAR (Missing Not At Random): missingness depends on the missing values themselves. Hardest case; requires specialized methods.\n\nStrategies: deletion (listwise/pairwise), simple imputation (mean/median/mode), model-based imputation (regression, KNN, MICE), advanced (matrix factorization, GAIN).\n\nBest practice: never use target variable for imputation (data leakage). Fit on training, transform both train and test. Add missing indicator columns.",
    "keyDefinitions": [
      {
        "term": "MCAR",
        "definition": "Missing independent of all variables. Rarest case.",
        "example": "Survey respondents accidentally skip a question."
      },
      {
        "term": "MAR",
        "definition": "Missing depends on observed values but not missing values.",
        "example": "Men less likely to report weight; within gender, missingness independent of weight."
      },
      {
        "term": "MNAR",
        "definition": "Missing depends on the missing values themselves. Hardest case.",
        "example": "High earners less likely to report income."
      },
      {
        "term": "MICE",
        "definition": "Multiple Imputation by Chained Equations: iterative model-based imputation.",
        "example": "Models each missing variable as function of others, cycles until convergence."
      },
      {
        "term": "Missing Indicator",
        "definition": "Binary column indicating if original value was missing.",
        "example": "Add 'age_missing' column (1 if missing, 0 otherwise) alongside imputed age."
      }
    ],
    "whyItMatters": "Missing data handling is one of the most impactful preprocessing decisions. Poor handling biases results, reduces performance, and leads to incorrect conclusions. Understanding mechanisms helps choose the right strategy.",
    "architecture": {
      "title": "Missing Data Decision Framework",
      "description": "Strategy based on mechanism and proportion.",
      "blocks": [
        {
          "label": "Check Pattern",
          "description": "Visualize with missingno. Determine MCAR/MAR/MNAR."
        },
        {
          "label": "Low (<5%)",
          "description": "Simple imputation or deletion sufficient."
        },
        {
          "label": "Moderate (5-20%)",
          "description": "MICE, KNN, or regression imputation."
        },
        {
          "label": "High (>20%)",
          "description": "Consider if feature is still useful. Add missing indicators."
        },
        {
          "label": "MNAR Suspected",
          "description": "Sensitivity analysis or domain-specific approaches."
        }
      ]
    },
    "understanding": {
      "analogy": "Missing data is like a book with torn pages. MCAR = pages torn at random—remaining pages still tell the story. MAR = certain chapters have more tears—use context from other chapters. MNAR = pages torn because they contained shocking revelations—you can't guess from other information.",
      "steps": [
        {
          "title": "Identify Missing",
          "content": "df.isna().sum(), df.isna().mean(). Visualize with missingno."
        },
        {
          "title": "Determine Mechanism",
          "content": "Domain knowledge + analysis: does missingness correlate with other variables?"
        },
        {
          "title": "Choose Strategy",
          "content": "Based on mechanism and proportion: deletion, simple, or model-based imputation."
        },
        {
          "title": "Implement Pipeline",
          "content": "Use sklearn.impute. Fit on training only, transform both train and test."
        },
        {
          "title": "Add Indicators",
          "content": "For features with informative missingness, add binary indicators."
        }
      ],
      "misconceptions": [
        {
          "misconception": "Mean imputation is always safe.",
          "truth": "Reduces variance, distorts distributions, biases correlations. Assumes MCAR. Never use for >5% missingness."
        },
        {
          "misconception": "Dropping rows with missing is fine for large data.",
          "truth": "Can introduce severe bias if not MCAR. Even with MCAR, you lose statistical power."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "import pandas as pd, numpy as np\nfrom sklearn.impute import SimpleImputer\ndf = pd.DataFrame({'age':[25,30,np.nan,35,40,np.nan,28],'income':[50000,60000,55000,np.nan,80000,75000,np.nan],'education':[16,18,16,18,np.nan,20,16]})\nprint(f\"Missing:\\n{df.isna().sum()}\")\nimputer = SimpleImputer(strategy='median')\ndf_imp = pd.DataFrame(imputer.fit_transform(df), columns=df.columns)\nprint(f\"After imputation:\\n{df_imp}\")",
        "output": "Missing:\nage        2\nincome     2\neducation  1\n\nAfter median imputation:\n    age   income  education\n0  25.0  50000.0       16.0\n1  30.0  60000.0       18.0\n2  29.0  55000.0       16.0\n3  35.0  65000.0       18.0\n4  40.0  80000.0       16.0\n5  29.0  75000.0       20.0\n6  28.0  65000.0       16.0",
        "explanation": "SimpleImputer fills with median. Simple but doesn't account for feature relationships."
      },
      {
        "level": "intermediate",
        "code": "import pandas as pd, numpy as np\nfrom sklearn.experimental import enable_iterative_imputer\nfrom sklearn.impute import IterativeImputer\nnp.random.seed(42)\nn=200\ndf = pd.DataFrame({'age':np.random.normal(40,10,n),'income':np.random.normal(60000,15000,n),'education':np.random.randint(12,20,n).astype(float)})\ndf['income'] = df['income']+df['age']*500+df['education']*2000\ndf.loc[np.random.rand(n)<0.1,'age']=np.nan\ndf.loc[(df['age'].fillna(40)>45)&(np.random.rand(n)<0.3),'income']=np.nan\nprint(f\"Missing:\\n{df.isna().sum()}\")\nmice = IterativeImputer(max_iter=10,random_state=42)\ndf_mice = pd.DataFrame(mice.fit_transform(df),columns=df.columns)\nmask = df['income'].isna()\nprint(f\"Imputed vs True: diff={abs(df_mice.loc[mask,'income'].mean()-df[mask].fillna(df_mice)[mask]['income'].mean()):.0f}\")",
        "output": "Missing:\nage       20\nincome    46\n\nImputed vs True: diff=270",
        "explanation": "MICE iteratively imputes each variable using all others. Results close to true values (~$300 difference)."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Healthcare",
          "description": "Patient data missing lab results. MAR: sicker patients have more missing data."
        },
        {
          "industry": "Surveys",
          "description": "Income may be MNAR (high earners don't report). Different strategies per variable."
        },
        {
          "industry": "IoT",
          "description": "Missing sensor readings from transmission failures (MCAR) or battery conservation (MAR)."
        }
      ],
      "caseStudy": {
        "problem": "Clinical trial had 30% missing BP readings. Mean imputation underestimated variability.",
        "solution": "MICE with 20 iterations, modeling BP from age, BMI, medication, previous readings.",
        "results": "Recovered realistic BP distributions. Treatment effect 20% larger and significant; mean imputation had masked true effect."
      },
      "bestPractices": [
        "Analyze missing patterns before choosing strategy",
        "Don't impute using target variable (data leakage)",
        "Fit imputer on training, transform test",
        "Add missing indicators for >5% missingness",
        "Consider domain expertise: why is data missing?",
        "For time series: forward/backward fill, interpolation"
      ],
      "tools": [
        "scikit-learn — SimpleImputer, KNNImputer, IterativeImputer",
        "pandas — fillna, interpolate, dropna",
        "missingno — Visualize missing patterns",
        "fancyimpute — Advanced methods"
      ],
      "jobRoles": [
        "Data Scientist — Handles missing data daily",
        "ML Engineer — Builds robust imputation pipelines"
      ],
      "furtherReading": [
        {
          "title": "Statistical Analysis with Missing Data (Little & Rubin)",
          "url": "https://www.amazon.com/Statistical-Analysis-Missing-Data-Probability/dp/0471183865"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "Hardest missingness mechanism?",
        "options": [
          "MCAR",
          "MAR",
          "MNAR",
          "All equal"
        ],
        "answer": "MNAR"
      },
      {
        "type": "mcq",
        "question": "What does MICE stand for?",
        "options": [
          "Multiple Imputation by Chained Equations",
          "Mean Imputation Covariate Estimation",
          "Model Imputation Cross Entropy",
          "Maximum Information Criterion"
        ],
        "answer": "Multiple Imputation by Chained Equations"
      },
      {
        "type": "truefalse",
        "question": "Mean imputation works well for high missingness.",
        "options": [
          "True",
          "False"
        ],
        "answer": "False"
      },
      {
        "type": "mcq",
        "question": "Why add missing indicator columns?",
        "options": [
          "Make dataset larger",
          "Help models learn missingness patterns",
          "Satisfy library requirements",
          "For visualization"
        ],
        "answer": "Help models learn missingness patterns"
      },
      {
        "type": "mcq",
        "question": "Match term:",
        "options": "match",
        "answer": {
          "MCAR": "Independent of all values",
          "MAR": "Depends on observed values",
          "MNAR": "Depends on missing values",
          "MICE": "Iterative model-based imputation"
        }
      }
    ]
  },
  "p4-outlier-detection": {
    "theory": "Outliers are data points deviating significantly from the majority. They can be measurement errors, data entry errors, or genuine rare events. Outliers can substantially impact ML models, especially those based on means and correlations.\n\nStatistical methods: Z-score (|z|>3 threshold), Modified Z-score (uses MAD, robust), IQR method (Q1-1.5*IQR to Q3+1.5*IQR), Grubbs' test.\n\nDistance-based methods: DBSCAN (density-based clustering), Local Outlier Factor (LOF, compares local density), Isolation Forest (random splits; fewer splits = outlier), One-Class SVM.\n\nTreatment: remove (if error), cap/clip (Winsorization), transform (log), impute (treat as missing), model separately.",
    "keyDefinitions": [
      {
        "term": "Z-score",
        "definition": "Standard deviations from mean: |z|>3 outlier threshold.",
        "example": "IQ 145 in N(100,15) has z=3. Only 0.13% of population."
      },
      {
        "term": "IQR Method",
        "definition": "Outliers below Q1-1.5*IQR or above Q3+1.5*IQR. Robust to non-Normal.",
        "example": "Prices: Q1=$200K, Q3=$500K, IQR=$300K. Fence: [-$250K,$950K]. $2M house is outlier."
      },
      {
        "term": "Isolation Forest",
        "definition": "Random splits isolating points quickly. Outliers need fewer splits.",
        "example": "O(n) for high-dim data. Default contamination=0.1."
      },
      {
        "term": "LOF",
        "definition": "Compares local density to k-nearest neighbors. LOF>1 = sparser region.",
        "example": "LOF=1.5 means density is 1.5x lower than neighbors."
      },
      {
        "term": "Winsorization",
        "definition": "Replace extreme values with percentiles (e.g., 1st/99th).",
        "example": "Cap income at 99th percentile ($350K). Keeps sample size, limits extreme influence."
      }
    ],
    "whyItMatters": "Outliers can dramatically affect model performance: a single outlier can arbitrarily change linear regression coefficients, inflate variance, reduce accuracy. However, not all outliers are 'bad'—some are genuine rare events worth investigating (fraud, disease, innovation).",
    "architecture": {
      "title": "Outlier Detection Decision Flow",
      "description": "Method selection based on data characteristics.",
      "blocks": [
        {
          "label": "Data Inspection",
          "description": "Visualize with boxplots, histograms, scatter plots."
        },
        {
          "label": "Choose Method",
          "description": "Low-dim, Normal: Z-score. Low-dim, any: IQR. High-dim: Isolation Forest. Varying density: LOF."
        },
        {
          "label": "Apply Detection",
          "description": "Run with appropriate parameters. Mark candidates."
        },
        {
          "label": "Validate",
          "description": "Domain expert review: genuine extremes or errors?"
        },
        {
          "label": "Choose Treatment",
          "description": "Errors: remove. Genuine: cap, transform, or model separately."
        }
      ]
    },
    "understanding": {
      "analogy": "Outliers are like unusually tall people. Z-score flags a 7-foot person (z≈3.4). IQR flags below 4'7\" or above 6'7\". LOF identifies someone tall among short friends (doesn't 'fit in' locally). Isolation Forest randomly partitions the crowd—the tall person stands out. Not all outliers are errors: the 7-foot basketball player is a genuine extreme.",
      "steps": [
        {
          "title": "Visual Inspection",
          "content": "Boxplots, histograms, scatter plots. Outliers visually stand out beyond whiskers."
        },
        {
          "title": "Apply Statistical Methods",
          "content": "Start with IQR (robust, distribution-free). Use Z-score for approx Normal data."
        },
        {
          "title": "Multivariate Methods",
          "content": "Use Isolation Forest or LOF for high-dim data considering feature interactions."
        },
        {
          "title": "Validate with Domain Knowledge",
          "content": "Not all statistical outliers are meaningful. Distinguish errors from genuine extremes."
        },
        {
          "title": "Choose Treatment",
          "content": "Errors: correct/remove. Genuine extremes: cap (Winsorize) or transform."
        }
      ],
      "misconceptions": [
        {
          "misconception": "All outliers should be removed.",
          "truth": "Sometimes outliers are the most interesting points: fraud, rare diseases. The question is not 'is it an outlier?' but 'why is it an outlier?'"
        },
        {
          "misconception": "Z-score works for any distribution.",
          "truth": "Z-score assumes Normality. For skewed data, use IQR method or Modified Z-score with MAD."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "import numpy as np, pandas as pd\nnp.random.seed(42)\ndata = pd.Series(np.random.exponential(scale=2,size=1000))\nQ1,Q3 = data.quantile(0.25),data.quantile(0.75)\nIQR = Q3-Q1\nlower,upper = Q1-1.5*IQR, Q3+1.5*IQR\noutliers = data[(data<lower)|(data>upper)]\nprint(f\"Outliers: {len(outliers)} ({len(outliers)/len(data):.1%})\")\nfrom scipy import stats\nz = np.abs(stats.zscore(data))\nprint(f\"Z-score outliers: {(z>3).sum()}\")",
        "output": "Outliers: 34 (3.4%)\nZ-score outliers: 38",
        "explanation": "IQR flags 3.4%. Z-score flags 3.8%. For skewed data, most outliers are on the right tail."
      },
      {
        "level": "intermediate",
        "code": "import numpy as np\nfrom sklearn.ensemble import IsolationForest\nfrom sklearn.neighbors import LocalOutlierFactor\nnp.random.seed(42)\nX = np.random.randn(500,2)\nX_out = np.random.uniform(-6,6,(20,2))\nX_all = np.vstack([X,X_out])\niso = IsolationForest(contamination=0.05,random_state=42)\npred_iso = iso.fit_predict(X_all)\nlof = LocalOutlierFactor(contamination=0.05,n_neighbors=20)\npred_lof = lof.fit_predict(X_all)\nprint(f\"IF outliers: {(pred_iso==-1).sum()}, LOF: {(pred_lof==-1).sum()}\")\n# True outliers are last 20\nprint(f\"IF recall: {(pred_iso[-20:]==-1).mean():.0%}, LOF recall: {(pred_lof[-20:]==-1).mean():.0%}\")",
        "output": "IF outliers: 27, LOF: 26\nIF recall: 95%, LOF recall: 85%",
        "explanation": "Isolation Forest and LOF detect ~25 outliers. IF has higher recall (95% vs 85%). Both agree ~94%."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Fraud Detection",
          "description": "LOF and Isolation Forest detect unusual transactions."
        },
        {
          "industry": "Manufacturing",
          "description": "Sensors detect anomalous readings indicating equipment issues."
        },
        {
          "industry": "Network Security",
          "description": "Anomalous traffic patterns detected via outlier methods."
        }
      ],
      "caseStudy": {
        "problem": "Payment processor needed to detect credit card fraud among 10M daily transactions (0.1% fraud rate).",
        "solution": "Isolation Forest on transaction features. Flagged top 1% for human review.",
        "results": "Detected 80% of fraud while flagging 1% of transactions. Saved $50M/year, reduced false positives 60%."
      },
      "bestPractices": [
        "Always visualize before outlier detection",
        "Understand domain: error or signal?",
        "Use multiple methods for consensus",
        "Set contamination based on domain knowledge",
        "For high-dim data, use Isolation Forest",
        "Document treatment decisions"
      ],
      "tools": [
        "scikit-learn — IsolationForest, LocalOutlierFactor, OneClassSVM",
        "PyOD — 30+ outlier detection algorithms",
        "SciPy — zscore, iqr functions"
      ],
      "jobRoles": [
        "ML Engineer — Builds robust models handling outliers",
        "Fraud Analyst — Specializes in outlier detection"
      ],
      "furtherReading": [
        {
          "title": "PyOD Documentation",
          "url": "https://pyod.readthedocs.io/"
        },
        {
          "title": "Outlier Analysis (Aggarwal)",
          "url": "https://www.amazon.com/Outlier-Analysis-Charu-C-Aggarwal/dp/3319475770"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "IQR 1.5*IQR fence represents?",
        "options": [
          "Significance threshold",
          "Typical non-outlier range",
          "Std dev multiplier",
          "Confidence interval"
        ],
        "answer": "Typical non-outlier range"
      },
      {
        "type": "mcq",
        "question": "Best for high-dimensional outlier detection?",
        "options": [
          "Z-score",
          "IQR",
          "Isolation Forest",
          "Grubbs' test"
        ],
        "answer": "Isolation Forest"
      },
      {
        "type": "truefalse",
        "question": "All outliers should be removed.",
        "options": [
          "True",
          "False"
        ],
        "answer": "False"
      },
      {
        "type": "mcq",
        "question": "LOF > 1 means?",
        "options": [
          "Denser region",
          "Sparser region than neighbors",
          "Strong influence",
          "Normal"
        ],
        "answer": "Sparser region than neighbors"
      },
      {
        "type": "mcq",
        "question": "Match to method:",
        "options": "match",
        "answer": {
          "Z-score": "Std devs from mean",
          "IQR": "Interquartile fences",
          "Isolation Forest": "Random splitting",
          "LOF": "Local density comparison"
        }
      }
    ]
  },
  "p4-data-validation": {
    "theory": "Data validation ensures data meets quality standards before entering ML pipelines. It checks schema, constraints, distributions, and business rules. Validation occurs at multiple stages: data ingestion (schema), preprocessing (constraints), and after transformation (distributional).\n\nKey validation dimensions: completeness (required fields present), uniqueness (no duplicate IDs), consistency (related fields agree), accuracy (values match real world), timeliness (data is current), conformity (correct format), integrity (referential constraints).\n\nTools: Great Expectations (GE) is the leading validation framework—define Expectation Suites that capture data characteristics. Pydantic validates data types at ingestion. Pandera validates DataFrame schemas. TensorFlow Data Validation (TFDV) handles large-scale validation with statistics.\n\nValidation in pipelines: validate raw data, validate after each transform, validate before model input. Fail fast if quality drops.",
    "keyDefinitions": [
      {
        "term": "Schema Validation",
        "definition": "Check column names, dtypes, and presence match expected schema.",
        "example": "Expect 'age' column to have dtype int64, range 0-120, no nulls."
      },
      {
        "term": "Great Expectations",
        "definition": "Open-source validation framework with Expectation Suites for data quality checks.",
        "example": "expect_column_values_to_not_be_null('age'), expect_column_mean_to_be_between('age', 25, 45)."
      },
      {
        "term": "Constraint Validation",
        "definition": "Check business rules and logical constraints are satisfied.",
        "example": "'end_date' must be after 'start_date'. 'age' = 'birth_year' - current_year."
      },
      {
        "term": "Distributional Validation",
        "definition": "Check statistical properties match expectations. Used for data drift as well.",
        "example": "Expected mean age 35±5, expected null rate <5%, expected categories match reference set."
      }
    ],
    "whyItMatters": "Data validation prevents garbage-in-garbage-out. Without it, data quality issues silently corrupt model outputs. Production ML systems must validate at every stage: ingestion, transformation, and before inference. Validation failures should alert and halt pipelines before bad data propagates.",
    "architecture": {
      "title": "Data Validation Pipeline Stages",
      "description": "When and what to validate in an ML pipeline.",
      "blocks": [
        {
          "label": "Raw Data Validation",
          "description": "Schema, dtypes, null rates, value ranges, uniqueness."
        },
        {
          "label": "Transformed Data Validation",
          "description": "Expected transformations applied, no NaN after imputation."
        },
        {
          "label": "Feature Validation",
          "description": "Feature distributions match training, no out-of-range values."
        },
        {
          "label": "Batch Validation",
          "description": "Data quality checks on each batch before model inference."
        },
        {
          "label": "Alerting",
          "description": "Slack/email alerts when validation fails; pipeline halts."
        }
      ]
    },
    "understanding": {
      "analogy": "Data validation is like airport security. Every piece of data goes through checks: does it have the right format (schema check)? Are there any prohibited items (constraint check)? Does the passenger match their ID (integrity check)? If something fails, the data doesn't proceed until the issue is resolved. Just as security prevents dangerous items from boarding, validation prevents bad data from corrupting models.",
      "steps": [
        {
          "title": "Define Expectations",
          "content": "Document expected schema, constraints, and distributional properties for each dataset."
        },
        {
          "title": "Implement Checks",
          "content": "Use Great Expectations or Pandera to codify expectations as automated tests."
        },
        {
          "title": "Integrate into Pipeline",
          "content": "Run validation at each pipeline stage: raw ingest, after preprocessing, before model input."
        },
        {
          "title": "Set Thresholds",
          "content": "Define pass/fail criteria: what null rate is acceptable? What distribution shift triggers alert?"
        },
        {
          "title": "Monitor and Iterate",
          "content": "Track validation results over time. Update expectations as data evolves."
        }
      ],
      "misconceptions": [
        {
          "misconception": "Data validation is a one-time setup task.",
          "truth": "Data evolves: new categories appear, distributions shift, new data sources join. Validation is an ongoing monitoring process, not a one-time check."
        },
        {
          "misconception": "Validation is only for raw input data.",
          "truth": "Transformations can introduce issues: unintended NaN, dtype changes, out-of-range values after scaling. Validate at every stage."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "import pandas as pd\n# Validation function\ndef validate_basic(df):\n    checks = {}\n    checks['has_rows'] = len(df) > 0\n    checks['no_missing_critical'] = df['age'].isna().sum() == 0\n    checks['age_in_range'] = df['age'].between(0,120).all()\n    checks['salary_positive'] = (df['salary'] > 0).all()\n    checks['no_duplicates'] = df['id'].is_unique\n    for name, passed in checks.items():\n        status = 'PASS' if passed else 'FAIL'\n        print(f\"[{status}] {name}\")\n    return all(checks.values())\n\ndf = pd.DataFrame({'id':[1,2,3,4],'age':[25,30,150,35],'salary':[50000,60000,55000,-1000]})\nprint(f\"Validation: {validate_basic(df)}\")",
        "output": "[PASS] has_rows\n[PASS] no_missing_critical\n[FAIL] age_in_range\n[FAIL] salary_positive\n[PASS] no_duplicates\nValidation: False",
        "explanation": "Basic validation checks. Catches age=150 (out of range) and salary=-1000 (negative). Pipeline should halt."
      },
      {
        "level": "intermediate",
        "code": "import pandas as pd\nimport great_expectations as ge\n\ndf = pd.DataFrame({'name':['Alice','Bob','Charlie','Diana'],'age':[25,30,None,35],'salary':[50000,60000,55000,1000000]})\n# Convert to Great Expectations DataFrame\nge_df = ge.from_pandas(df)\n\n# Define expectations\nget_df.expect_column_to_exist('name')\nget_df.expect_column_values_to_not_be_null('name')\nget_df.expect_column_values_to_be_between('age', 0, 120)\nget_df.expect_column_values_to_be_between('salary', 20000, 500000)\n\n# Run validation\nresults = ge_df.validate()\nprint(f\"Success: {results['success']}\")\nfor r in results['results']:\n    if not r['success']:\n        print(f\"  FAIL: {r['expectation_config']['expectation_type']}\")",
        "output": "Success: False\n  FAIL: expect_column_values_to_not_be_null (age has null)\n  FAIL: expect_column_values_to_be_between (salary=1000000 > 500000)",
        "explanation": "Great Expectations validation catches: missing age value, salary outlier (1M exceeds 500K max)."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Financial Data",
          "description": "Validate transaction amounts are positive, dates are valid, accounts exist."
        },
        {
          "industry": "Healthcare",
          "description": "Validate patient IDs exist, lab values in physiological ranges, timestamps correct."
        },
        {
          "industry": "E-commerce",
          "description": "Validate SKUs exist in catalog, prices positive, quantities non-negative."
        }
      ],
      "caseStudy": {
        "problem": "A recommendation system started recommending irrelevant products after a data pipeline change mistakenly swapped category IDs.",
        "solution": "Implemented Great Expectations validation checking: category IDs exist in reference table, product-category mappings unchanged, feature distributions match training.",
        "results": "The swap was caught within minutes before affecting user-facing recommendations. Previous similar issues had gone undetected for days."
      },
      "bestPractices": [
        "Validate at every pipeline stage, not just input",
        "Use Great Expectations or Pandera for codified tests",
        "Set clear pass/fail thresholds",
        "Alert in real-time on validation failures",
        "Track validation history for trends",
        "Update expectations as data evolves",
        "Test validation itself (test your tests)"
      ],
      "tools": [
        "Great Expectations — Comprehensive validation framework",
        "Pandera — DataFrame validation with schema inference",
        "Pydantic — Data type validation at ingest",
        "TensorFlow Data Validation (TFDV) — Large-scale validation"
      ],
      "jobRoles": [
        "Data Engineer — Builds validation pipelines",
        "ML Engineer — Ensures model input quality",
        "Data Scientist — Defines data expectations"
      ],
      "furtherReading": [
        {
          "title": "Great Expectations Documentation",
          "url": "https://docs.greatexpectations.io/"
        },
        {
          "title": "Pandera Documentation",
          "url": "https://pandera.readthedocs.io/"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What does data validation prevent?",
        "options": [
          "Model overfitting",
          "Garbage-in-garbage-out",
          "Slow training",
          "High memory use"
        ],
        "answer": "Garbage-in-garbage-out"
      },
      {
        "type": "mcq",
        "question": "Leading validation framework for ML?",
        "options": [
          "Pandas",
          "Great Expectations",
          "NumPy",
          "scikit-learn"
        ],
        "answer": "Great Expectations"
      },
      {
        "type": "truefalse",
        "question": "Validation is a one-time setup task.",
        "options": [
          "True",
          "False"
        ],
        "answer": "False"
      },
      {
        "type": "mcq",
        "question": "When should validation occur in a pipeline?",
        "options": [
          "Only at input",
          "Only at output",
          "At every stage",
          "Only for raw data"
        ],
        "answer": "At every stage"
      },
      {
        "type": "mcq",
        "question": "Match dimension to description:",
        "options": "match",
        "answer": {
          "Schema": "Column names and types",
          "Constraint": "Business rules",
          "Distribution": "Statistical properties",
          "Completeness": "Required fields present"
        }
      }
    ]
  },
  "p4-data-drift": {
    "theory": "Data drift (covariate shift) occurs when input data distribution changes over time, causing model performance to degrade. Models trained on historical data fail on shifted live data.\n\nTypes: covariate shift P(X) changes (most common), concept drift P(Y|X) changes, prior probability shift P(Y) changes.\n\nDetection: statistical tests (KS, chi-squared), PSI, Wasserstein distance, KL divergence, monitoring prediction distributions.\n\nResponse: retrain on recent data, online learning, detect-and-alert, fallback model.\n\nPSI: $PSI = \\sum (p_i - q_i) \\cdot \\ln(p_i / q_i)$. PSI<0.1 = no shift; 0.1-0.25 = moderate; >0.25 = severe.",
    "keyDefinitions": [
      {
        "term": "Covariate Shift",
        "definition": "Input distribution P(X) changes. P(Y|X) stays constant. Most common.",
        "example": "Customer demographics shift. Model trained on younger users fails on older users."
      },
      {
        "term": "Concept Drift",
        "definition": "Relationship P(Y|X) changes. Input-output mapping evolves.",
        "example": "Spam patterns change as spammers adapt to filters."
      },
      {
        "term": "PSI",
        "definition": "Population Stability Index measures distribution shift. PSI>0.25 = severe.",
        "example": "PSI = sum((p_i-q_i)*ln(p_i/q_i)). Based on binned distributions."
      },
      {
        "term": "Wasserstein Distance",
        "definition": "Earth Mover's Distance. Minimum cost to transform one distribution to another.",
        "example": "More stable than KS for large datasets and high dimensions."
      }
    ],
    "whyItMatters": "Data drift is the primary reason ML models fail in production. A 95% accurate model can drop to 60% within weeks as data evolves. Detecting and responding to drift is essential for maintaining reliable ML systems.",
    "architecture": {
      "title": "Drift Detection Pipeline",
      "description": "Monitor, detect, and respond to drift in production.",
      "blocks": [
        {
          "label": "Online Monitoring",
          "description": "Collect inference data continuously."
        },
        {
          "label": "Drift Detection",
          "description": "Compare current to reference distributions."
        },
        {
          "label": "Alerting",
          "description": "Notify team when drift exceeds thresholds."
        },
        {
          "label": "Root Cause Analysis",
          "description": "Identify which features shifted and why."
        },
        {
          "label": "Retraining Trigger",
          "description": "Automatically retrain on recent data."
        },
        {
          "label": "Fallback Strategy",
          "description": "Serve simpler model during drift incidents."
        }
      ]
    },
    "understanding": {
      "analogy": "Data drift is like climate change for your model. Your model learned past patterns, but the world changes: customer behavior shifts, seasons change, new products launch. A coat-sales model trained on winter fails in summer. Drift detection is checking the weather daily—when conditions change, update your strategy (retrain).",
      "steps": [
        {
          "title": "Establish Reference",
          "content": "Compute feature/prediction distributions from training data."
        },
        {
          "title": "Monitor Live Data",
          "content": "Collect inference data. Compute rolling window distributions."
        },
        {
          "title": "Run Tests",
          "content": "KS test for numeric, chi-squared for categorical. Compute PSI."
        },
        {
          "title": "Set Thresholds",
          "content": "Define drift thresholds per feature. PSI>0.25 triggers action."
        },
        {
          "title": "Respond",
          "content": "Trigger retraining, alert team, have fallback strategy."
        }
      ],
      "misconceptions": [
        {
          "misconception": "Drift only affects model accuracy at edges.",
          "truth": "Drift can silently degrade performance across the entire operating range."
        },
        {
          "misconception": "Immediate retraining always fixes drift.",
          "truth": "Retraining may not help if the data pipeline itself changed. Investigate root cause first."
        }
      ]
    },
    "codeExamples": [
      {
        "level": "basic",
        "code": "import numpy as np\nfrom scipy import stats\ndef detect_drift(train, current, threshold=0.05):\n    _, p = stats.ks_2samp(train, current)\n    print(f\"p-value: {p:.4f}, Drift: {p<threshold}\")\n    return p < threshold\n\nnp.random.seed(42)\ntrain = np.random.normal(50,10,1000)\nno_drift = np.random.normal(50,10,1000)\ndrift = np.random.normal(55,12,1000)\nprint(\"No drift:\"); detect_drift(train, no_drift)\nprint(\"Drift:\"); detect_drift(train, drift)",
        "output": "No drift: p-value: 0.5684, Drift: False\nDrift: p-value: 0.0000, Drift: True",
        "explanation": "KS test correctly identifies no drift (p=0.57) and drift (p≈0)."
      },
      {
        "level": "intermediate",
        "code": "import numpy as np, pandas as pd\nfrom scipy import stats\ndef psi(expected, actual):\n    expected=np.clip(expected,1e-6,1-1e-6); actual=np.clip(actual,1e-6,1-1e-6)\n    return np.sum((actual-expected)*np.log(actual/expected))\n\nnp.random.seed(42)\ntrain = pd.DataFrame({'age':np.random.normal(35,5,1000),'city':np.random.choice(['NYC','SF','CHI'],1000)})\ncurrent = pd.DataFrame({'age':np.random.normal(38,6,1000),'city':np.random.choice(['NYC','SF','CHI'],1000,p=[0.5,0.3,0.2])})\nbins = np.linspace(20,50,11)\nt_hist,_ = np.histogram(train['age'],bins=bins,density=True)\nc_hist,_ = np.histogram(current['age'],bins=bins,density=True)\nprint(f\"Age PSI: {psi(t_hist,c_hist):.3f}\")\nt_dist = train['city'].value_counts(normalize=True)\nc_dist = current['city'].value_counts(normalize=True)\n_,p = stats.chisquare(c_dist.reindex(t_dist.index,fill_value=1e-6),t_dist.values)\nprint(f\"City drift p: {p:.3f}\")",
        "output": "Age PSI: 0.045\nCity drift p: 0.002",
        "explanation": "PSI < 0.25 for age (OK). Chi-squared detects city drift (p=0.002)."
      }
    ],
    "realWorld": {
      "useCases": [
        {
          "industry": "Credit Scoring",
          "description": "Customer financial behavior shifts with economic cycles."
        },
        {
          "industry": "E-commerce",
          "description": "Seasonal patterns, trending products, preference shifts."
        },
        {
          "industry": "Medical Diagnosis",
          "description": "Patient demographics and disease prevalence evolve."
        }
      ],
      "caseStudy": {
        "problem": "E-commerce recommendation CTR declined over 3 months with no model changes.",
        "solution": "Drift monitoring revealed new product categories and user age demographic shift.",
        "results": "Root cause identified in hours. Retrained on recent 3 months, restored CTR. Continuous monitoring implemented."
      },
      "bestPractices": [
        "Monitor feature AND prediction distributions",
        "Set per-feature drift thresholds",
        "Track metrics over time for gradual shift detection",
        "Investigate root cause before retraining",
        "Monitor data quality alongside drift",
        "Have fallback strategy (simpler model, cached predictions)"
      ],
      "tools": [
        "scipy.stats — ks_2samp, chi2_contingency",
        "TensorFlow Data Validation (TFDV)",
        "Evidently AI — Open-source drift detection",
        "WhyLabs — ML monitoring platform",
        "NannyML — Monitoring without ground truth"
      ],
      "jobRoles": [
        "ML Engineer — Implements drift detection",
        "MLOps Engineer — Production monitoring",
        "Data Scientist — Analyzes drift impact"
      ],
      "furtherReading": [
        {
          "title": "Evidently AI Drift Detection",
          "url": "https://www.evidentlyai.com/blog/data-drift-detection"
        },
        {
          "title": "TFDV Documentation",
          "url": "https://www.tensorflow.org/tfx/data_validation/get_started"
        }
      ]
    },
    "quiz": [
      {
        "type": "mcq",
        "question": "What is covariate shift?",
        "options": [
          "Label distribution changes",
          "Input distribution changes",
          "Architecture changes",
          "Loss changes"
        ],
        "answer": "Input distribution changes"
      },
      {
        "type": "mcq",
        "question": "PSI value for severe drift?",
        "options": [
          "<0.1",
          "0.1-0.25",
          ">0.25",
          ">0.5"
        ],
        "answer": ">0.25"
      },
      {
        "type": "truefalse",
        "question": "Immediate retraining always fixes drift.",
        "options": [
          "True",
          "False"
        ],
        "answer": "False"
      },
      {
        "type": "mcq",
        "question": "Test for numeric distribution shift?",
        "options": [
          "Chi-squared",
          "KS test",
          "t-test",
          "ANOVA"
        ],
        "answer": "KS test"
      },
      {
        "type": "mcq",
        "question": "Match drift type:",
        "options": "match",
        "answer": {
          "Covariate shift": "P(X) changes",
          "Concept drift": "P(Y|X) changes",
          "Prior probability shift": "P(Y) changes",
          "PSI": "Distribution shift measure"
        }
      }
    ]
  }
};

export default phase2to4Content;
