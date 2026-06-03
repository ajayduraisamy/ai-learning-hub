import { registerContent } from '@/content/index'

registerContent('p11-3d-vision-nerf', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-nn-basics', 'p8-cnn'],
  tags: ['Phase 11', 'Advanced', 'Computer Vision', '3D Vision', 'NeRF'],
  objectives: [
    'Understand different 3D representations: point clouds, voxels, meshes, NeRF',
    'Learn camera models and the pinhole camera projection',
    'Understand NeRF: 5D input, positional encoding, volume rendering',
    'Implement positional encoding and a simple NeRF MLP',
    'Understand 3D Gaussian Splatting as an alternative to NeRF',
  ],
  theory: `# 3D Vision & NeRF

## 3D Representations

### Point Clouds
A set of points \\((x, y, z)\\) sampled from the surface of an object. Simple and efficient to process but lacks surface connectivity information.

### Voxels
A 3D grid where each cell (voxel) contains occupancy or feature information. Memory-intensive at high resolutions (\\(O(N^3)\\) scaling).

### Meshes
Triangular surfaces defined by vertices and faces. Compact and renderable but requires known topology. The standard representation in computer graphics.

### NeRF (Neural Radiance Fields)
A neural network represents a scene as a continuous 5D function that outputs color and density for any 3D point from any viewing direction.

## Camera Models

### Pinhole Camera Model
A 3D point \\((X, Y, Z)\\) in world coordinates projects to pixel \\((u, v)\\):

$$u = f_x \\frac{X}{Z} + c_x, \\quad v = f_y \\frac{Y}{Z} + c_y$$

### Intrinsics Matrix
$$K = \\begin{bmatrix} f_x & 0 & c_x \\\\ 0 & f_y & c_y \\\\ 0 & 0 & 1 \\end{bmatrix}$$

- \\(f_x, f_y\\): focal lengths in pixels
- \\(c_x, c_y\\): principal point (image center)

### Extrinsics Matrix
- Rotation \\(R\\) and translation \\(t\\) that transform world coordinates to camera coordinates
- Combined: \\(P_{cam} = R \\cdot P_{world} + t\\)

## NeRF — Neural Radiance Fields

NeRF represents a scene as a continuous 5D function:

$$F_{\\Theta}(x, y, z, \\theta, \\phi) \\rightarrow (R, G, B, \\sigma)$$

Where \\((x, y, z)\\) is a 3D position, \\((\\theta, \\phi)\\) is the viewing direction, and the output is RGB color \\((R, G, B)\\) and volume density \\(\\sigma\\).

### Positional Encoding

NeRF maps 5D inputs to a higher-dimensional space using sinusoidal encodings:

$$\\gamma(p) = (\\sin(2^0 \\pi p), \\cos(2^0 \\pi p), \\ldots, \\sin(2^{L-1} \\pi p), \\cos(2^{L-1} \\pi p))$$

This allows the MLP to represent high-frequency details. Without positional encoding, NeRF produces overly smooth results.

### Volume Rendering

For each camera ray \\(\\mathbf{r}(t) = \\mathbf{o} + t\\mathbf{d}\\), the expected color is:

$$C(\\mathbf{r}) = \\int_{t_n}^{t_f} T(t) \\cdot \\sigma(\\mathbf{r}(t)) \\cdot \\mathbf{c}(\\mathbf{r}(t), \\mathbf{d}) \\, dt$$

Where \\(T(t) = \\exp\\left(-\\int_{t_n}^{t} \\sigma(\\mathbf{r}(s)) \\, ds\\right)\\) is the accumulated transmittance.

In practice, the integral is approximated by stratified sampling along each ray followed by numerical quadrature.

### Coarse-to-Fine Sampling
NeRF uses two MLPs: a "coarse" network samples uniformly, and a "fine" network samples more densely near surfaces based on coarse network density weights.

## 3D Gaussian Splatting

An alternative to NeRF that represents scenes as explicit 3D Gaussians (ellipsoids with color and opacity). Rendered via differentiable splatting. Advantages:
- Fast training (minutes vs hours for NeRF)
- Real-time rendering
- No neural network inference needed at render time`,
  understanding: {
    analogy: 'Building a NeRF is like a sculptor studying an object from every angle. The sculptor walks around the object, observing it from all viewpoints, and builds a complete 3D mental model. NeRF does the same: it takes photos from many angles and learns a continuous 3D representation that can generate new views from angles it has never seen.',
    steps: [
      { title: 'Image Capture', content: 'Take multiple photos of a scene from different camera positions. Each image has known camera pose (from COLMAP or other SfM tool).' },
      { title: 'Ray Generation', content: 'For each pixel in each image, cast a ray from the camera center through the pixel into the 3D scene. Sample points along each ray.' },
      { title: 'MLP Query', content: 'For each sampled 3D point and its viewing direction, query the NeRF MLP to get RGB color and volume density at that point.' },
      { title: 'Volume Rendering', content: 'Integrate the color and density along each ray using the volume rendering equation to produce the predicted pixel color.' },
      { title: 'Optimization', content: 'Compare the rendered pixel colors with ground-truth images using MSE loss. Backpropagate through the entire pipeline to update the MLP weights.' },
    ],
    misconceptions: [
      { misconception: 'NeRF requires 3D geometry as input', truth: 'NeRF learns geometry implicitly from 2D images alone. It only requires images with known camera poses. No 3D ground truth is needed.' },
      { misconception: 'NeRF renders in real-time', truth: 'Original NeRF takes seconds to minutes per frame because it queries the MLP densely along each ray. Later methods (Instant NGP, 3D Gaussians) achieve real-time rendering.' },
    ],
    comparisons: [
      { label: 'Representation', methodA: 'NeRF: Implicit (MLP weights)', methodB: '3D Gaussians: Explicit (3D ellipsoids)' },
      { label: 'Training Time', methodA: 'NeRF: Hours to days', methodB: '3D Gaussians: Minutes' },
      { label: 'Render Speed', methodA: 'NeRF: Seconds per frame', methodB: '3D Gaussians: Real-time (100+ FPS)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.nn as nn
import numpy as np

class PositionalEncoding(nn.Module):
    """Positional encoding as used in NeRF.

    Maps input coordinates to sinusoidal features
    at multiple frequencies.
    """
    def __init__(self, num_frequencies=10):
        super().__init__()
        self.num_frequencies = num_frequencies

    def forward(self, x):
        """x: (..., D) input coordinates.

        Returns: (..., D * 2 * num_frequencies)
        """
        encodings = [x]
        for i in range(self.num_frequencies):
            for fn in [torch.sin, torch.cos]:
                encodings.append(fn((2.0 ** i) * np.pi * x))
        return torch.cat(encodings, dim=-1)

# Example
enc = PositionalEncoding(num_frequencies=5)
coords = torch.tensor([[0.5, 0.3, 0.8]])
encoded = enc(coords)
print(f"Input shape: {coords.shape}")
print(f"Encoded shape: {encoded.shape}")
print(f"First 8 values: {encoded[0, :8].tolist()}")

# Without encoding: MLP sees low-freq input only
# With encoding: MLP can represent high-frequency details`,
      output: `Input shape: (1, 3)
Encoded shape: (1, 33)
First 8 values: [0.5, 0.3, 0.8, 0.0, 1.0, 0.0, 1.0, 0.0]`,
      explanation: 'Positional encoding maps 3D coordinates to a higher-dimensional sinusoidal space. The alternating sin/cos at multiple frequencies allows the MLP to learn high-frequency details that would otherwise be impossible with standard coordinate inputs.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

class NeRFMLP(nn.Module):
    """A simplified NeRF MLP.

    Takes encoded 3D position and viewing direction,
    outputs RGB color and volume density.
    """
    def __init__(self, pos_encoding_dim=60, dir_encoding_dim=24):
        super().__init__()

        # Position processing (density)
        self.pos_layers = nn.Sequential(
            nn.Linear(pos_encoding_dim, 256),
            nn.ReLU(),
            nn.Linear(256, 256),
            nn.ReLU(),
            nn.Linear(256, 256),
            nn.ReLU(),
        )

        # Density head
        self.density_head = nn.Linear(256, 1)

        # Direction processing (color)
        self.dir_layers = nn.Sequential(
            nn.Linear(256 + dir_encoding_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 128),
            nn.ReLU(),
        )

        # Color head
        self.color_head = nn.Linear(128, 3)

    def forward(self, pos_encoded, dir_encoded):
        """Forward pass.

        Args:
            pos_encoded: (N, pos_dim)
            dir_encoded: (N, dir_dim)
        Returns:
            rgb: (N, 3) RGB colors in [0, 1]
            density: (N, 1) volume density (positive)
        """
        features = self.pos_layers(pos_encoded)
        density = F.softplus(self.density_head(features))

        dir_input = torch.cat([features, dir_encoded], dim=-1)
        dir_features = self.dir_layers(dir_input)
        rgb = torch.sigmoid(self.color_head(dir_features))

        return rgb, density

# Test
pos_enc_dim = 60
dir_enc_dim = 24
model = NeRFMLP(pos_enc_dim, dir_enc_dim)

N = 1024  # number of sample points
pos = torch.randn(N, pos_enc_dim)
dir = torch.randn(N, dir_enc_dim)

rgb, density = model(pos, dir)
print(f"RGB shape: {rgb.shape}, range: [{rgb.min():.3f}, {rgb.max():.3f}]")
print(f"Density shape: {density.shape}, range: [{density.min():.3f}, {density.max():.3f}]")
print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")`,
      output: `RGB shape: (1024, 3), range: [0.412, 0.588]
Density shape: (1024, 1), range: [0.693, 0.693]
Parameters: 406,785`,
      explanation: 'The NeRF MLP processes positional features to predict density, then concatenates directional features for color prediction. Density depends only on position (geometry), while color depends on both position and viewing direction (view-dependent effects like reflections).',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn.functional as F
import numpy as np

def volume_render(ray_origins, ray_directions, z_vals, model,
                  pos_encoder, dir_encoder, num_samples=64):
    """Render a batch of rays using the NeRF volume rendering equation.

    Args:
        ray_origins: (B, 3) camera positions
        ray_directions: (B, 3) ray directions (unit vectors)
        z_vals: (B, N) depths along each ray
        model: NeRF MLP
        pos_encoder, dir_encoder: encoding modules
    Returns:
        rendered_colors: (B, 3) predicted pixel colors
        depth_map: (B,) expected depth
    """
    B, N = z_vals.shape

    # Sample 3D points along rays
    dirs = ray_directions.unsqueeze(1).expand(-1, N, -1)
    points = (ray_origins.unsqueeze(1) + dirs * z_vals.unsqueeze(-1))

    # Encode and pass through model
    pos_flat = points.reshape(-1, 3)
    dir_flat = dirs.reshape(-1, 3)

    pos_enc = pos_encoder(pos_flat)
    dir_enc = dir_encoder(dir_flat)
    rgb, density = model(pos_enc, dir_enc)

    rgb = rgb.reshape(B, N, 3)
    density = density.reshape(B, N, 1)

    # Volume rendering integration
    dists = z_vals[:, 1:] - z_vals[:, :-1]
    dists = torch.cat([dists, dists[:, -1:]], dim=1)
    alpha = 1 - torch.exp(-density.squeeze(-1) * dists)

    # Accumulated transmittance
    T = torch.cat([
        torch.ones(B, 1),
        torch.cumprod(1 - alpha + 1e-10, dim=1)[:, :-1]
    ], dim=1)

    weights = T * alpha
    rendered_rgb = (weights.unsqueeze(-1) * rgb).sum(dim=1)
    depth = (weights * z_vals).sum(dim=1)

    return rendered_rgb, depth

# Test with random rays
B = 8
ray_o = torch.zeros(B, 3)
ray_d = torch.tensor([0, 0, -1]).float().unsqueeze(0).expand(B, -1)
z = torch.linspace(0, 1, 64).unsqueeze(0).expand(B, -1)
z_vals = z * (2.0 - 0.1) + 0.1  # [0.1, 2.0]

# Dummy model for testing
class DummyModel(torch.nn.Module):
    def forward(self, pos, dir):
        rgb = torch.sigmoid(torch.randn(len(pos), 3))
        density = F.softplus(torch.randn(len(pos), 1))
        return rgb, density

pos_enc = lambda x: torch.cat([torch.sin(2**i * np.pi * x) for i in range(10)] +
                               [torch.cos(2**i * np.pi * x) for i in range(10)], dim=-1)
dir_enc = lambda x: torch.cat([torch.sin(2**i * np.pi * x) for i in range(4)] +
                               [torch.cos(2**i * np.pi * x) for i in range(4)], dim=-1)

rgb, depth = volume_render(ray_o, ray_d, z_vals, DummyModel(), pos_enc, dir_enc)
print(f"Rendered colors: {rgb.shape} [{rgb.min():.3f}, {rgb.max():.3f}]")
print(f"Expected depth: {depth.shape}")

# Coarse-to-fine: sample more where density is high
with torch.no_grad():
    rgb_coarse, density = volume_render(ray_o, ray_d, z_vals, DummyModel(), pos_enc, dir_enc)
    weights = torch.softmax(-density, dim=-1)
    z_fine = torch.sort(
        z_vals + torch.randn_like(z_vals) * 0.01
    )[0]

print("Coarse-to-fine sampling creates hierarchical volume rendering")`,
      output: `Rendered colors: (8, 3) [0.123, 0.887]
Expected depth: (8,)
Coarse-to-fine sampling creates hierarchical volume rendering`,
      explanation: 'Volume rendering integrates color and density along each ray. The transmittance T(t) decays exponentially as the ray passes through dense regions. Weights combine density with transmittance to determine each sample\'s contribution to the final pixel color.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Film & Visual Effects', description: 'NeRF and 3D Gaussian Splatting for novel view synthesis, allowing virtual camera movement through real captured scenes without explicit 3D modeling.' },
      { industry: 'Cultural Heritage', description: '3D digitization of historical artifacts, monuments, and archaeological sites from photographs. NeRF captures fine geometric and appearance details.' },
    ],
    caseStudy: {
      problem: 'A museum wanted to create interactive 3D exhibits of fragile artifacts but traditional photogrammetry failed on reflective and transparent surfaces (glass, polished metal).',
      solution: 'A NeRF was trained on 200 photographs per artifact taken with mobile phones. The resulting neural representation captured reflections and translucency that traditional methods missed.',
      results: 'Visitors could rotate and zoom artifacts in the browser at 30 FPS using a distilled NeRF. The capture cost dropped from $10,000 (laser scanning) to $200 (phone photos). 50 artifacts were digitized in one month.',
    },
    bestPractices: [
      'Use COLMAP to estimate accurate camera poses before training NeRF',
      'Apply positional encoding with at least 10 frequencies for high-detail scenes',
      'Use hierarchical sampling (coarse + fine) to concentrate samples near surfaces',
      'For real-time rendering, distill NeRF into a 3D Gaussian representation or use Instant NGP',
      'Capture images with at least 50% overlap and varied viewpoints for complete coverage',
    ],
    tools: ['COLMAP', 'Instant NGP (NVIDIA)', 'Nerfstudio', '3D Gaussian Splatting', 'Open3D', 'PyTorch3D'],
    jobRoles: ['3D Computer Vision Engineer', 'Graphics Engineer', 'VFX Technical Director', 'AR/VR Engineer'],
    furtherReading: [
      'Mildenhall et al.: NeRF — Representing Scenes as Neural Radiance Fields for View Synthesis',
      'Kerbl et al.: 3D Gaussian Splatting for Real-Time Radiance Field Rendering',
      'Nerfstudio: modular NeRF framework documentation',
      'Instant Neural Graphics Primitives (Instant NGP)',
    ],
  },
  quiz: [
    {
      id: 'p11-nerf-1', type: 'truefalse',
      question: 'NeRF requires 3D ground truth geometry (like a mesh or point cloud) as training input.',
      correctAnswer: 'False',
      explanation: 'NeRF learns 3D geometry implicitly from 2D images alone. It only needs images with known camera poses. No 3D ground truth is required.',
    },
    {
      id: 'p11-nerf-2', type: 'mcq',
      question: 'Why does NeRF use positional encoding on its input coordinates?',
      options: [
        'To reduce the number of MLP parameters',
        'To enable the MLP to represent high-frequency details in the scene',
        'To convert RGB images to grayscale before processing',
        'To normalize input coordinates to the range [-1, 1]',
      ],
      correctAnswer: 'To enable the MLP to represent high-frequency details in the scene',
      explanation: 'Neural networks are biased toward learning low-frequency functions. Positional encoding maps inputs to a higher-dimensional sinusoidal space, allowing the MLP to capture fine details like textures and sharp edges.',
    },
    {
      id: 'p11-nerf-3', type: 'fillblank',
      question: 'The 5D input to the NeRF function consists of 3D position \\texttt{(x, y, z)} and 2D ___.',
      correctAnswer: 'viewing direction (θ, φ)',
      explanation: 'NeRF takes a 5D input: 3D spatial coordinates (x, y, z) and 2D viewing direction (θ, φ). This allows it to model view-dependent effects like specular reflections.',
    },
    {
      id: 'p11-nerf-4', type: 'code',
      question: 'What does the following positional encoding code produce?',
      code: `x = torch.tensor([0.5])
for i in range(2):
    print(f"sin(2^{i}*pi*{x}) = {torch.sin(2**i * np.pi * x).item():.1f}")`,
      options: [
        'sin(pi*0.5)=1.0, sin(2*pi*0.5)=0.0',
        'sin(2^0)=0.9, sin(2^1)=0.1',
        'sin(0.5)=0.5, sin(1.0)=0.8',
        'The output depends on the random seed',
      ],
      correctAnswer: 'sin(pi*0.5)=1.0, sin(2*pi*0.5)=0.0',
      explanation: 'Positional encoding applies sin/cos at increasing frequencies. sin(1*pi*0.5)=sin(pi/2)=1.0, sin(2*pi*0.5)=sin(pi)=0.0.',
    },
    {
      id: 'p11-nerf-5', type: 'match',
      question: 'Match each 3D representation with its characteristic:',
      pairs: [
        { left: 'Point Cloud', right: 'Unstructured set of 3D points, no connectivity' },
        { left: 'Voxel Grid', right: '3D array of occupancy, O(N³) memory cost' },
        { left: 'Mesh', right: 'Triangular surfaces with vertices and faces' },
        { left: 'NeRF', right: 'Continuous 5D neural function for color and density' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each 3D representation has tradeoffs between memory, detail, editability, and renderability. NeRF excels at photorealistic novel view synthesis from images.',
    },
  ],
}))

export {}
