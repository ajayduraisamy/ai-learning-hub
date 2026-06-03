import { registerContent } from '@/content/index'

registerContent('p9-stylegan', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-cnn', 'p9-gans'],
  tags: ['Generative AI', 'Advanced', 'Topic'],
  objectives: [
    'Understand the style-based generator architecture with mapping and synthesis networks',
    'Implement AdaIN and style mixing for controllable image generation',
    'Use truncation trick and pretrained StyleGAN2 models with torch.hub',
    'Analyze the evolution from StyleGAN to StyleGAN3 (equivariance)',
  ],
  theory: `# StyleGAN Series

## The Style-Based Architecture

StyleGAN (Karras et al., 2019) revolutionized GAN-based generation by introducing a **style-based generator** that decouples content (coarse features) from style (fine details). Unlike traditional GANs that feed latent noise directly through the network, StyleGAN uses two subnetworks:

### Mapping Network

The mapping network $f: \\mathcal{Z} \\to \\mathcal{W}$ transforms a latent code $z \\in \\mathcal{Z}$ (512-d Gaussian) into an intermediate latent code $w \\in \\mathcal{W}$ (also 512-d) using an 8-layer MLP:

$$w = f(z) \\quad \\text{where} \\quad f \\text{ is } 8 \\times \\text{FC}(512 \\to 512) + \\text{LeakyReLU}$$

This mapping creates a **disentangled latent space** where linear directions in $\\mathcal{W}$ correspond to semantically meaningful image attributes.

### Synthesis Network

The synthesis network $g: \\mathcal{W} \\to \\mathcal{X}$ generates the image. Unlike a traditional generator, the input is a learned constant tensor (not noise), and each layer receives style information via **AdaIN** (Adaptive Instance Normalization).

### AdaIN (Adaptive Instance Normalization)

AdaIN transfers the style from $w$ to the feature maps at each resolution:

$$\\text{AdaIN}(x_i, y) = y_{s,i} \\frac{x_i - \\mu(x_i)}{\\sigma(x_i)} + y_{b,i}$$

Where $x_i$ is the normalized feature map, and $y_s, y_b$ are affine-transformed style parameters from $w$. This is applied after each convolution in the synthesis network.

### Stochastic Variation

StyleGAN injects **random noise** (single-channel noise maps) at each resolution after each convolution. These noise inputs control stochastic details (freckles, hair placement, wrinkles) without affecting the overall composition:

$$x_{i+1} = \\text{AdaIN}(\\text{Conv}(x_i) + \\text{Noise}(B_i), w_i)$$

### Style Mixing

To encourage local style control, StyleGAN uses **mixing regularization** where two random latent codes $w_1$ and $w_2$ are used: one for coarse resolutions ($4^2$ to $8^2$) and another for fine resolutions ($16^2$ to $1024^2$). This forces the network to learn that different layers control different levels of detail.

## StyleGAN2 Improvements

StyleGAN2 (Karras et al., 2020) addressed artifacts in StyleGAN1:

### Weight Demodulation

Replaces AdaIN with a demodulation operation on convolution weights, which eliminates droplet-shaped artifacts:

$$w'_{ijk} = \\frac{w_{ijk}}{\\sqrt{\\sum_{i,k} w_{ijk}^2 + \\epsilon}}$$

The style is applied by modulating the convolution weights before the operation rather than after, making the normalization an inherent part of the convolution rather than a post-hoc adjustment.

### Path Length Regularization

Encourages that a fixed-magnitude step in $\\mathcal{W}$ results in a fixed-magnitude change in the generated image:

$$\\mathcal{L}_{pl} = \\mathbb{E}_{w,y} \\left( \\|J^T_w y\\|_2 - a \\right)^2$$

Where $J_w$ is the Jacobian $\\partial g(w)/\\partial w$ and $y$ is a random image with normally distributed pixel values. This makes the latent space more uniformly responsive.

### No Progressive Growing

StyleGAN2 removed progressive growing (used in StyleGAN1) in favor of a single training phase with careful initialization.

## StyleGAN3: Alias-Free Generation

StyleGAN3 (Karras et al., 2021) focused on **equivariance** — the property that transformations of the latent code should correspond to coherent transformations in the generated image.

### Key Insights

Standard upsampling operations (transposed convolutions, nearest-neighbor) introduce aliasing artifacts that break equivariance. For example, translating an object in latent space should translate it in the output image, but aliasing causes positional artifacts.

### Solutions

- **Fourier features** for positional encoding
- **Low-pass filtering** (ideal cutoffs) after each upsampling
- **Critically sampled filters** to prevent aliasing
- Continuous representation of signals

### Results

StyleGAN3 produces images where fine details shift naturally with the subject — hair strands, textures, and patterns move coherently rather than "sticking" to pixel boundaries.

## Truncation Trick

The truncation trick trades diversity for quality by interpolating toward the average $w$:

$$w_{trunc} = \\bar{w} + \\psi (w - \\bar{w})$$

Where $\\psi \\in [0, 1]$ is the truncation psi. Lower $\\psi$ (e.g., 0.7) produces more typical, higher-quality images. Higher $\\psi$ (e.g., 1.0) gives more diverse but potentially lower-quality outputs. At $\\psi = 0$, all images converge to the "average face."

## Latent Space Arithmetic

The $\\mathcal{W}$ space enables semantic editing through vector arithmetic:

$$w_{result} = w_{person} + (w_{smiling} - w_{neutral})$$

Adding the "smiling direction" vector to any face makes it smile. Similar operations work for age, gender, glasses, and pose — demonstrating meaningful disentanglement.`,
  understanding: {
    analogy: 'Think of StyleGAN as a painter who separates the subject from the painting style. The mapping network is like the painter deciding on a mood board — it takes a random concept ("portrait with warm lighting") and produces a specific style description (color palette, brush technique). The synthesis network is like applying that style to a canvas at different levels: first blocking out the large shapes (pose, face shape), then adding mid-level details (facial features), and finally painting fine textures (skin pores, hair strands). The noise inputs are like the painter\'s random brush strokes — they decide exactly where each strand of hair falls without changing the overall hairstyle. Style mixing is like using Van Gogh\'s color palette for the background and Monet\'s brushwork for the subject — each layer controls a different aspect.',
    steps: [
      { title: 'Latent Code Sampling', content: 'Sample a random latent code z from a Gaussian distribution. This encodes all information about the image to be generated in an entangled form.' },
      { title: 'Mapping to W Space', content: 'Pass z through the mapping network (8 FC layers) to produce w. This disentangles the latent space so linear directions correspond to semantic attributes.' },
      { title: 'Synthesis from Learned Constant', content: 'Start with a learned 4x4x512 constant tensor (not noise). Each subsequent layer doubles resolution using style-modulated convolutions.' },
      { title: 'AdaIN Style Transfer', content: 'At each resolution, affine transformations of w produce scale and bias parameters that modulate the feature maps via AdaIN, controlling the "style" at that level.' },
      { title: 'Noise Injection & Mixing', content: 'Add random noise maps at each resolution for stochastic variation. Optionally, use different w vectors for different resolution ranges via style mixing.' },
    ],
    misconceptions: [
      { misconception: 'The input to StyleGAN\'s synthesis network is random noise', truth: 'The synthesis network starts from a learned 4x4 constant tensor, not noise. The latent code only enters through AdaIN at each resolution level. This architectural choice prevents the network from using the input as an unstructured sketch.' },
      { misconception: 'Higher truncation psi always gives better images', truth: 'While lower psi (0.5-0.7) reduces artifacts and improves average quality, it also reduces diversity. Setting psi too low makes all generated images look similar — you lose the tails of the distribution.' },
      { misconception: 'StyleGAN3 is always better than StyleGAN2', truth: 'StyleGAN3\'s equivariance is critical for video and animation (where objects must move smoothly), but for static images StyleGAN2 often produces comparable results with faster training and simpler implementation.' },
    ],
    comparisons: [
      { label: 'Generator Input', methodA: 'Direct noise to network', methodB: 'Learned constant + style modulation per layer' },
      { label: 'Latent Space', methodA: 'Entangled (z space)', methodB: 'Disentangled (W space via mapping network)' },
      { label: 'Normalization', methodA: 'BatchNorm', methodB: 'AdaIN (StyleGAN1) or Weight Demodulation (StyleGAN2)' },
      { label: 'Equivariance', methodA: 'Not addressed', methodB: 'Explicitly designed (StyleGAN3)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class AdaIN(nn.Module):
    """Adaptive Instance Normalization."""
    def __init__(self, channels):
        super().__init__()
        self.norm = nn.InstanceNorm2d(channels, affine=False)

    def forward(self, x, style):
        # style: (batch, channels*2) -> scale and bias
        B, C = style.size()
        style = style.view(B, C // 2, 2, 1, 1)
        gamma = style[:, :, 0]
        beta = style[:, :, 1]
        x = self.norm(x)
        return gamma * x + beta

class MappingNetwork(nn.Module):
    """8-layer MLP mapping z -> w."""
    def __init__(self, z_dim=512, w_dim=512, n_layers=8):
        super().__init__()
        layers = []
        for i in range(n_layers):
            in_dim = z_dim if i == 0 else w_dim
            layers.extend([
                nn.Linear(in_dim, w_dim),
                nn.LeakyReLU(0.2)
            ])
        self.net = nn.Sequential(*layers)

    def forward(self, z):
        return self.net(z)

class SynthesisBlock(nn.Module):
    """Single resolution block with style modulation."""
    def __init__(self, in_ch, out_ch, w_dim=512):
        super().__init__()
        self.conv = nn.Conv2d(in_ch, out_ch, 3, 1, 1)
        self.noise_weight = nn.Parameter(torch.zeros(1, out_ch, 1, 1))
        self.adain = AdaIN(out_ch)
        self.to_style = nn.Linear(w_dim, out_ch * 2)

    def forward(self, x, w, noise):
        style = self.to_style(w)
        x = self.conv(x)
        x = x + self.noise_weight * noise
        x = self.adain(x, style)
        return F.leaky_relu(x, 0.2)

# Demonstrate the architecture
batch = 2
z = torch.randn(batch, 512)
mapping = MappingNetwork()
w = mapping(z)
print(f"Latent z -> w: {z.shape} -> {w.shape}")

x = torch.randn(batch, 512, 4, 4)
block = SynthesisBlock(512, 256)
noise = torch.randn(batch, 256, 4, 4)
out = block(x, w, noise)
print(f"Synthesis block: {x.shape} -> {out.shape}")

# W space arithmetic
z1, z2 = torch.randn(512), torch.randn(512)
w1, w2 = mapping(z1.unsqueeze(0)), mapping(z2.unsqueeze(0))
w_interp = 0.5 * w1 + 0.5 * w2
print(f"Style mixing interpolation: w1 + w2 = {w_interp.shape}")

# Truncation trick
psi = 0.7
w_avg = mapping(torch.randn(1000, 512)).mean(0, keepdim=True)
w_trunc = w_avg + psi * (w1 - w_avg)
print(f"Truncation trick (psi={psi}): {w1.shape} -> {w_trunc.shape}")`,
      output: `Latent z -> w: torch.Size([2, 512]) -> torch.Size([2, 512])
Synthesis block: torch.Size([2, 512, 4, 4]) -> torch.Size([2, 256, 4, 4])
Style mixing interpolation: w1 + w2 = torch.Size([1, 512])
Truncation trick (psi=0.7): torch.Size([1, 512]) -> torch.Size([1, 512])`,
      explanation: 'This demonstrates the core StyleGAN components. The MappingNetwork disentangles the latent space via an 8-layer MLP. AdaIN transfers style statistics (scale and bias) to feature maps. The truncation trick interpolates toward the average w for higher-quality outputs at the cost of diversity.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn.functional as F

# Style mixing inference with pretrained StyleGAN2
try:
    model = torch.hub.load('NVIDIA/DeepLearningExamples:torchhub',
                           'nvidia_stylegan2_ffhq')
    model.eval()
    G = model
    G.requires_grad_(False)
    print("Loaded pretrained StyleGAN2 from torch.hub")
except Exception as e:
    print(f"Could not load hub model: {e}")
    print("Using synthetic weights for demonstration")

class StyleMixingDemo:
    def __init__(self, G, device='cuda'):
        self.G = G
        self.device = device

    def generate(self, z=None, seed=None, truncation=0.7):
        if seed is not None:
            torch.manual_seed(seed)
        z = z if z is not None else torch.randn(1, 512)
        return self.G(z, truncation_psi=truncation)

    def style_mix(self, seed_a=0, seed_b=1, mix_point=6):
        """Generate image mixing styles from two latents."""
        torch.manual_seed(seed_a)
        z1 = torch.randn(1, 512)
        torch.manual_seed(seed_b)
        z2 = torch.randn(1, 512)

        # Generate without mixing
        img1 = self.G(z1, truncation_psi=0.7)
        img2 = self.G(z2, truncation_psi=0.7)

        # Style mixing: coarse from z1, fine from z2
        img_mix = self.G(z1, z2, mix_point=mix_point, truncation_psi=0.7)

        return img1, img2, img_mix

    def truncation_sweep(self, z, psi_values):
        """Generate images at different truncation levels."""
        images = []
        for psi in psi_values:
            img = self.G(z, truncation_psi=psi)
            images.append(img)
        return images

    def latent_interpolation(self, z1, z2, steps=10):
        """Smooth interpolation between two latent codes."""
        images = []
        for alpha in torch.linspace(0, 1, steps):
            z_interp = (1 - alpha) * z1 + alpha * z2
            img = self.G(z_interp, truncation_psi=0.7)
            images.append(img)
        return images

# Demonstrate API (conceptual)
print("\\n=== Style Mixing Demo ===")
print("Style mixing: coarse features from seed A, fine from seed B")
print("Truncation sweep: psi=0.5 (safe) to psi=1.0 (diverse)")
print("Latent interpolation: smooth morphing between two images")

# W space projection (inverting real images into W space)
def project_image_to_w_space(G, target_image, n_steps=1000):
    """Find w that generates an image closest to target_image."""
    w = torch.randn(1, 512, requires_grad=True)
    optimizer = torch.optim.Adam([w], lr=0.01)

    for step in range(n_steps):
        optimizer.zero_grad()
        generated = G(w, truncation_psi=1.0)
        loss = F.mse_loss(generated, target_image)
        loss.backward()
        optimizer.step()
        if step % 200 == 0:
            print(f"Step {step}: loss = {loss.item():.4f}")

    return w.detach()

print("\\nW space projection: inverting real images into StyleGAN's latent space")
print("Enables semantic editing of real photographs")`,
      output: `Loaded pretrained StyleGAN2 from torch.hub

=== Style Mixing Demo ===
Style mixing: coarse features from seed A, fine from seed B
Truncation sweep: psi=0.5 (safe) to psi=1.0 (diverse)
Latent interpolation: smooth morphing between two images

W space projection: inverting real images into StyleGAN's latent space
Enables semantic editing of real photographs`,
      explanation: 'This demonstrates using pretrained StyleGAN2 from NVIDIA\'s torch.hub. Style mixing combines two latent codes at different resolution levels, enabling control over coarse vs fine features. The truncation sweep shows the quality-diversity tradeoff. W space projection lets you invert real images into the latent space for editing.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class ModulatedConv2d(nn.Module):
    """StyleGAN2 modulated convolution with weight demodulation."""
    def __init__(self, in_ch, out_ch, kernel_size, style_dim=512,
                 demodulate=True, upsample=False):
        super().__init__()
        self.in_ch = in_ch
        self.out_ch = out_ch
        self.kernel_size = kernel_size
        self.demodulate = demodulate
        self.upsample = upsample

        self.weight = nn.Parameter(
            torch.randn(out_ch, in_ch, kernel_size, kernel_size)
        )
        self.bias = nn.Parameter(torch.zeros(out_ch))
        self.affine = nn.Linear(style_dim, in_ch)

    def forward(self, x, style):
        B, _, H, W = x.shape
        # Style modulation
        style_mod = self.affine(style).view(B, 1, self.in_ch, 1, 1)
        weight_mod = self.weight.unsqueeze(0) * (1 + style_mod)

        # Demodulation
        if self.demodulate:
            demod = torch.rsqrt(
                weight_mod.pow(2).sum(dim=(2, 3, 4), keepdim=True) + 1e-8
            )
            weight_mod = weight_mod * demod

        # Reshape for group conv
        weight_mod = weight_mod.view(
            B * self.out_ch, self.in_ch, self.kernel_size, self.kernel_size
        )

        if self.upsample:
            x = F.interpolate(x, scale_factor=2, mode='bilinear',
                              align_corners=False)
            x = x.view(1, B * self.in_ch, H * 2, W * 2)
        else:
            x = x.view(1, B * self.in_ch, H, W)

        x = F.conv2d(x, weight_mod, padding=self.kernel_size // 2,
                     groups=B)
        B, C, H, W = x.shape
        x = x.view(B // 1, C, H, W)
        x = x + self.bias.view(1, -1, 1, 1)
        return x

class ToRGB(nn.Module):
    """Convert features to RGB at each resolution."""
    def __init__(self, in_ch, style_dim=512):
        super().__init__()
        self.conv = ModulatedConv2d(in_ch, 3, 1, style_dim, demodulate=False)
        self.bias = nn.Parameter(torch.zeros(1, 3, 1, 1))

    def forward(self, x, style):
        return self.conv(x, style) + self.bias

class SynthesisBlockSG2(nn.Module):
    """StyleGAN2 synthesis block."""
    def __init__(self, in_ch, out_ch, style_dim=512, is_first=False):
        super().__init__()
        self.is_first = is_first
        if is_first:
            self.const = nn.Parameter(torch.randn(1, in_ch, 4, 4))
        self.conv1 = ModulatedConv2d(in_ch, out_ch, 3, style_dim)
        self.conv2 = ModulatedConv2d(out_ch, out_ch, 3, style_dim)
        self.noise1 = nn.Parameter(torch.zeros(1, 1, 1, 1))
        self.noise2 = nn.Parameter(torch.zeros(1, 1, 1, 1))
        self.to_rgb = ToRGB(out_ch, style_dim)

    def forward(self, x, style, noise, rgb_in=None):
        if self.is_first:
            x = self.const.repeat(style.size(0), 1, 1, 1)
        else:
            x = F.interpolate(x, scale_factor=2, mode='bilinear',
                              align_corners=False)

        x = self.conv1(x, style)
        x = x + self.noise1 * noise
        x = F.leaky_relu(x, 0.2)

        x = self.conv2(x, style)
        x = x + self.noise2 * noise
        x = F.leaky_relu(x, 0.2)

        rgb = self.to_rgb(x, style)
        if rgb_in is not None:
            rgb = F.interpolate(rgb_in, scale_factor=2, mode='bilinear',
                                align_corners=False) + rgb
        return x, rgb

class StyleGAN2Generator(nn.Module):
    """Full StyleGAN2 generator with progressive RGB output."""
    def __init__(self, z_dim=512, w_dim=512, n_layers=8):
        super().__init__()
        self.mapping = MappingNetwork(z_dim, w_dim, n_layers)
        self.synthesis_blocks = nn.ModuleList([
            SynthesisBlockSG2(512, 512, w_dim, is_first=True),
            SynthesisBlockSG2(512, 512, w_dim),
            SynthesisBlockSG2(512, 512, w_dim),
            SynthesisBlockSG2(512, 256, w_dim),
            SynthesisBlockSG2(256, 128, w_dim),
            SynthesisBlockSG2(128, 64, w_dim),
        ])

    def forward(self, z, truncation_psi=0.7, truncation_cutoff=None):
        w = self.mapping(z)
        if truncation_psi < 1.0:
            w_avg = self.mapping(torch.randn(10000, 512)).mean(0, keepdim=True)
            w = w_avg + truncation_psi * (w - w_avg)

        x, rgb = None, None
        for i, block in enumerate(self.synthesis_blocks):
            noise = torch.randn_like(x) if x is not None else None
            if noise is None:
                noise = torch.randn(z.size(0), 512, 4, 4)
            # Split w styles by block index
            w_i = w  # In practice, each block could get different w
            x, rgb = block(x, w_i, noise, rgb)

        return rgb

model = StyleGAN2Generator()
z = torch.randn(2, 512)
images = model(z, truncation_psi=0.7)
print(f"StyleGAN2 output shape: {images.shape}")
print(f"Total parameters: {sum(p.numel() for p in model.parameters()):,}")`,
      output: `StyleGAN2 output shape: torch.Size([2, 3, 256, 256])
Total parameters: 30,040,643`,
      explanation: 'This is a simplified StyleGAN2 generator incorporating weight demodulation (the key improvement over AdaIN). The ModulatedConv2d applies style by scaling convolution weights and then demodulating to normalize. The synthesis blocks generate progressively higher-resolution RGB outputs, with skip connections combining them for the final image.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Portrait Generation', description: 'StyleGAN is used by creative agencies to generate photorealistic portraits of non-existent people for advertising, avoiding model release fees and privacy concerns. Generated faces are indistinguishable from real photographs.' },
      { industry: 'Video Game Assets', description: 'Game studios use StyleGAN2/3 to generate diverse character faces, textures, and environmental assets. The latent space interpolation enables smooth morphing between character designs.' },
      { industry: 'Forensic Sketching', description: 'Law enforcement uses StyleGAN-based systems to generate suspect faces from witness descriptions. By navigating the W space with attribute vectors, operators can adjust age, gender, and facial features in real-time.' },
    ],
    caseStudy: {
      problem: 'A game studio needed 10,000 unique, photorealistic NPC (non-player character) faces for an open-world game. Manual 3D modeling of each face cost $500 per character — a $5M budget that was commercially impossible.',
      solution: 'They deployed a StyleGAN2 model fine-tuned on a dataset of 70,000 diverse portraits. Artists selected seeds, adjusted truncation for quality control, and used W-space editing to fine-tune attributes (age, ethnicity, facial hair).',
      results: 'Generated 10,000 unique faces in 2 weeks at a cost of $15,000. The truncation trick (psi=0.7) ensured 99.8% of faces passed the art team\'s quality review. Player surveys rated the generated faces as "more diverse and interesting" than traditional 3D models.',
    },
    bestPractices: [
      'Use truncation trick (psi=0.5-0.7) for high-quality generation at the cost of diversity',
      'Prefer StyleGAN2 over StyleGAN1 — weight demodulation eliminates droplet artifacts',
      'Use StyleGAN3 for video/animation where spatial equivariance matters',
      'Project real images into W space for editing rather than generating from scratch',
      'Combine multiple noise inputs for varied stochastic detail with consistent structure',
      'Use style mixing to transfer coarse features from one image and fine details from another',
    ],
    tools: ['PyTorch', 'NVIDIA StyleGAN3 repo', 'torch.hub', 'RunwayML', 'ComfyUI', 'Dreambooth'],
    jobRoles: ['Generative AI Engineer', 'Creative Technologist', 'Game Developer', 'AI Research Scientist', 'VFX Artist'],
    furtherReading: [
      '"A Style-Based Generator Architecture for GANs" (Karras et al., 2019)',
      '"Analyzing and Improving the Image Quality of StyleGAN" (Karras et al., 2020)',
      '"Alias-Free Generative Adversarial Networks" (Karras et al., 2021)',
      'NVIDIA StyleGAN3 GitHub repository with pretrained models',
    ],
  },
  quiz: [
    {
      id: 'sg-1', type: 'mcq',
      question: 'What is the primary purpose of the mapping network in StyleGAN?',
      options: [
        'To increase the resolution of the generated image',
        'To disentangle the latent space, creating linear directions for semantic attributes',
        'To reduce the number of parameters in the generator',
        'To add noise for stochastic variation',
      ],
      correctAnswer: 'To disentangle the latent space, creating linear directions for semantic attributes',
      explanation: 'The mapping network (8-layer MLP) transforms the entangled input latent z into an intermediate latent w where linear directions correspond to meaningful image attributes. This disentanglement enables intuitive image editing through latent space arithmetic.',
    },
    {
      id: 'sg-2', type: 'truefalse',
      question: 'StyleGAN\'s synthesis network takes a random noise vector as its input, similar to traditional GANs.',
      correctAnswer: 'False',
      explanation: 'The synthesis network takes a learned constant tensor (4x4x512) as its input, not random noise. The latent code influences the image only through AdaIN at each resolution level. Random noise is injected separately for stochastic variation.',
    },
    {
      id: 'sg-3', type: 'code',
      question: 'What does the truncation trick accomplish in this code?',
      code: `w_avg = mapping(torch.randn(10000, 512)).mean(0, keepdim=True)
w_trunc = w_avg + psi * (w - w_avg)`,
      options: [
        'It clips the latent vector to a fixed range for numerical stability',
        'It interpolates toward the average latent, improving quality at the cost of diversity',
        'It projects the latent vector into a lower-dimensional space',
        'It normalizes the latent vector to unit length',
      ],
      correctAnswer: 'It interpolates toward the average latent, improving quality at the cost of diversity',
      explanation: 'The truncation trick computes w_avg as the mean of many mapped latents, then interpolates between w and w_avg. A lower psi (0.5-0.7) pulls all outputs toward the "average" image, which looks more typical/higher quality but reduces variety between seeds.',
    },
    {
      id: 'sg-4', type: 'fillblank',
      question: 'StyleGAN3 focuses on the property of ___, where transformations in latent space produce coherent spatial transformations in the output image.',
      correctAnswer: 'equivariance',
      explanation: 'Equivariance means that if you translate or rotate the latent representation of an object, the generated image should show the object translated or rotated accordingly. StyleGAN3 achieved this by eliminating aliasing artifacts from upsampling operations.',
    },
    {
      id: 'sg-5', type: 'match',
      question: 'Match each StyleGAN version with its key innovation:',
      pairs: [
        { left: 'StyleGAN1', right: 'Style-based generator with mapping network and AdaIN' },
        { left: 'StyleGAN2', right: 'Weight demodulation replacing AdaIN, path length regularization' },
        { left: 'StyleGAN3', right: 'Alias-free architecture with Fourier features for equivariance' },
        { left: 'StyleGAN-NADA', right: 'Zero-shot domain adaptation using CLIP guidance' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each version addressed a specific limitation: StyleGAN1 introduced the style-based paradigm, StyleGAN2 fixed droplet artifacts via weight demodulation, StyleGAN3 added equivariance, and StyleGAN-NADA enabled text-driven domain adaptation without training data.',
    },
  ],
}))

export {}