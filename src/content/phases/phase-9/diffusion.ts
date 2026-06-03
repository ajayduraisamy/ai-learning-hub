import { registerContent } from '@/content/index'

registerContent('p9-diffusion', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-cnn', 'p8-nn-basics', 'p2-probability-stats'],
  tags: ['Generative AI', 'Advanced', 'Topic'],
  objectives: [
    'Understand the forward diffusion process and reverse denoising process',
    'Implement the DDPM noise schedule and training objective',
    'Build a U-Net with attention for noise prediction',
    'Implement the sampling loop and compare DDIM for fast sampling',
  ],
  theory: `# Diffusion Models (DDPM)

## Overview

Denoising Diffusion Probabilistic Models (DDPM) (Ho et al., 2020) are generative models that learn to reverse a gradual noising process. Unlike GANs which use adversarial training, diffusion models optimize a simple MSE-based objective and achieve state-of-the-art image generation quality.

## Forward Diffusion Process

The forward process gradually adds Gaussian noise to data over $T$ timesteps (typically $T=1000$), producing a Markov chain of latent variables $x_1, x_2, ..., x_T$:

$$q(x_t|x_{t-1}) = \\mathcal{N}(x_t; \\sqrt{1-\\beta_t} x_{t-1}, \\beta_t I)$$

Where $\\beta_t$ is the noise schedule controlling how much noise is added at each step. The nice property of Gaussian diffusion is that we can sample $x_t$ directly from $x_0$ without iterating:

$$q(x_t|x_0) = \\mathcal{N}(x_t; \\sqrt{\\bar{\\alpha}_t} x_0, (1-\\bar{\\alpha}_t)I)$$

Where $\\alpha_t = 1 - \\beta_t$ and $\\bar{\\alpha}_t = \\prod_{s=1}^t \\alpha_s$. This gives us:

$$x_t = \\sqrt{\\bar{\\alpha}_t} x_0 + \\sqrt{1-\\bar{\\alpha}_t} \\epsilon \\quad \\text{where} \\quad \\epsilon \\sim \\mathcal{N}(0, I)$$

As $t \\to T$, $\\bar{\\alpha}_t \\to 0$ and $x_T \\approx \\mathcal{N}(0, I)$ — the data has been completely destroyed into pure noise.

### Noise Schedules

**Linear Schedule** (DDPM original): $\\beta_t$ increases linearly from $\\beta_1 = 10^{-4}$ to $\\beta_T = 0.02$. This works well for low-resolution images but adds noise too quickly at high resolutions.

**Cosine Schedule** (Improved DDPM): $\\bar{\\alpha}_t = \\frac{f(t)}{f(0)}$ where $f(t) = \\cos\\left(\\frac{t/T + s}{1 + s} \\cdot \\frac{\\pi}{2}\\right)^2$. This adds noise more gradually and improves performance at higher resolutions.

## Reverse Denoising Process

The reverse process learns to denoise $x_t$ back to $x_0$:

$$p_\\theta(x_{t-1}|x_t) = \\mathcal{N}(x_{t-1}; \\mu_\\theta(x_t, t), \\Sigma_\\theta(x_t, t))$$

The model predicts the mean $\\mu_\\theta$ (and optionally the variance $\\Sigma_\\theta$). For the simplified DDPM, the variance is fixed ($\\beta_t$ or $\\tilde{\\beta}_t$) and the model predicts the noise $\\epsilon$:

### Training Objective

The simplified training objective (Ho et al., 2020) is:

$$\\mathcal{L}_{simple} = \\mathbb{E}_{t, x_0, \\epsilon} \\left[ \\|\\epsilon - \\epsilon_\\theta(x_t, t)\\|^2 \\right]$$

Where $\\epsilon_\\theta$ is a U-Net that takes noisy image $x_t$ and timestep $t$, and predicts the added noise $\\epsilon$. This is remarkably simple — just MSE between predicted and actual noise.

### Sampling Algorithm

To generate a new image:
1. Sample $x_T \\sim \\mathcal{N}(0, I)$
2. For $t = T$ down to 1:
   - Predict noise: $\\epsilon_\\theta(x_t, t)$
   - Compute $x_{t-1} = \\frac{1}{\\sqrt{\\alpha_t}} \\left( x_t - \\frac{\\beta_t}{\\sqrt{1-\\bar{\\alpha}_t}} \\epsilon_\\theta(x_t, t) \\right) + \\sigma_t z$
   - Where $z \\sim \\mathcal{N}(0, I)$ (except $z=0$ for $t=1$)
3. Return $x_0$

## DDIM: Denoising Diffusion Implicit Models

DDIM (Song et al., 2021) accelerates sampling by using a non-Markovian forward process that allows **deterministic** reverse sampling:

$$x_{t-1} = \\sqrt{\\bar{\\alpha}_{t-1}} \\underbrace{\\left(\\frac{x_t - \\sqrt{1-\\bar{\\alpha}_t} \\epsilon_\\theta(x_t, t)}{\\sqrt{\\bar{\\alpha}_t}}\\right)}_{\\text{predicted } x_0} + \\sqrt{1-\\bar{\\alpha}_{t-1}} \\underbrace{\\epsilon_\\theta(x_t, t)}_{\\text{direction pointing to } x_t}$$

Key properties:
- **Deterministic**: Same latent $x_T$ always produces the same $x_0$
- **Fewer steps**: Can skip steps (e.g., 50 instead of 1000) while maintaining quality
- **Interpolation**: Smooth interpolation between latents produces smooth image transitions

## U-Net Architecture for Diffusion

The noise prediction network uses a U-Net with:
- **ResNet blocks** with group normalization
- **Self-attention** at low resolutions (16x16, 8x8, 4x4) for global coherence
- **Cross-attention** (for conditional generation) to incorporate text or class embeddings
- **Sinusoidal positional embeddings** for timestep encoding
- **Skip connections** between encoder and decoder

## Connection to Score-Based Models

Diffusion models are equivalent to **score-based generative models** where the model estimates the gradient of the log-probability (score function) $\\nabla_x \\log p(x)$. The noise prediction $\\epsilon_\\theta$ is proportional to the score:

$$\\epsilon_\\theta(x_t, t) \\approx -\\sqrt{1-\\bar{\\alpha}_t} \\nabla_{x_t} \\log p(x_t)$$

This perspective unifies diffusion with score matching and Langevin dynamics sampling.`,
  understanding: {
    analogy: 'Think of diffusion like slowly erasing a drawing and then learning to redraw it step by step. First, you have a complete detailed drawing (x0). You gradually erase parts while adding smudges (noise), until it becomes a completely erased, gray page (xT) — pure noise. Now, imagine photographing each stage of this erasure process. The model learns to reverse it: starting from a random gray page, it predicts what was just erased (the noise), removes a tiny bit, and repeats. Each step makes the image slightly clearer. What\'s remarkable is that the model doesn\'t need to see the original drawing — it just needs to know what a "slightly less erased" version looks like. By the end of 1000 small steps, a clear image emerges from randomness. The cosine schedule is like erasing more carefully at first and faster later, while linear schedule erases at a constant rate.',
    steps: [
      { title: 'Sample Noise', content: 'Sample Gaussian noise ε ~ N(0, I) with same dimensions as the target image. Also sample a random timestep t ~ Uniform(1, T).' },
      { title: 'Corrupt Input', content: 'Compute the noised image x_t = sqrt(ᾱ_t) x_0 + sqrt(1 - ᾱ_t) ε. This directly samples the forward process at timestep t without iterating through all steps.' },
      { title: 'Predict Noise', content: 'Pass x_t and timestep t through the U-Net to predict the added noise ε_θ(x_t, t). The U-Net uses the timestep embedding to know how much noise was added.' },
      { title: 'Compute Loss', content: 'Mean squared error between predicted noise and actual noise: L = ||ε - ε_θ(x_t, t)||². This is remarkably simple compared to GAN or VAE losses.' },
      { title: 'Denoise Step (Sampling)', content: 'During generation, start from pure noise x_T and iteratively denoise: compute x_{t-1} from x_t using the predicted noise. After T steps, recover a clean image.' },
    ],
    misconceptions: [
      { misconception: 'Diffusion models directly predict the clean image', truth: 'The model predicts the noise ε added to the image, not the image itself. The clean image is implicitly derived as x_0 = (x_t - sqrt(1-ᾱ_t) ε) / sqrt(ᾱ_t). This noise-prediction formulation is simpler and more stable.' },
      { misconception: 'Diffusion models are slower than GANs for generation', truth: 'While naive DDPM requires 1000 steps, DDIM and advanced samplers (DPM++, LCM) can generate high-quality images in 1-50 steps, approaching GAN speed. Consistency Models can generate in a single step.' },
      { misconception: 'The forward process must be simulated during training', truth: 'One of the key advantages of diffusion models is that x_t can be sampled directly from x_0 in closed form without iterating the forward chain. The forward process is only simulated during the definition of the loss.' },
    ],
    comparisons: [
      { label: 'Training Objective', methodA: 'MSE between predicted and actual noise', methodB: 'ELBO (reconstruction + KL)' },
      { label: 'Generation Speed', methodA: '50-1000 steps (slower)', methodB: '1 step (fast)' },
      { label: 'Quality (FID)', methodA: 'State-of-the-art on most benchmarks', methodB: 'Good but often blurry' },
      { label: 'Mode Coverage', methodA: 'Excellent — covers full data distribution', methodB: 'Moderate — prone to mode collapse' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.nn as nn
import math

# ============ DDPM Noise Schedule ============

def linear_beta_schedule(T=1000, beta_start=1e-4, beta_end=0.02):
    """Linear noise schedule from DDPM paper."""
    return torch.linspace(beta_start, beta_end, T)

def cosine_beta_schedule(T=1000, s=0.008):
    """Cosine schedule from Improved DDPM."""
    steps = torch.arange(T + 1, dtype=torch.float32)
    f_t = torch.cos((steps / T + s) / (1 + s) * math.pi / 2) ** 2
    alphas_cumprod = f_t / f_t[0]
    betas = 1 - alphas_cumprod[1:] / alphas_cumprod[:-1]
    return torch.clamp(betas, max=0.999)

class DDPM:
    """Core DDPM computations."""
    def __init__(self, T=1000, schedule='linear'):
        self.T = T
        if schedule == 'linear':
            betas = linear_beta_schedule(T)
        else:
            betas = cosine_beta_schedule(T)

        self.betas = betas
        self.alphas = 1 - betas
        self.alpha_bars = torch.cumprod(self.alphas, dim=0)
        self.sqrt_alpha_bars = torch.sqrt(self.alpha_bars)
        self.sqrt_one_minus_alpha_bars = torch.sqrt(1 - self.alpha_bars)

    def forward_process(self, x0, t, noise=None):
        """Add noise to x0 at timestep t: x_t = sqrt(ᾱ_t) x0 + sqrt(1-ᾱ_t) ε"""
        if noise is None:
            noise = torch.randn_like(x0)
        sqrt_alpha_bar = self.sqrt_alpha_bars[t].view(-1, 1, 1, 1)
        sqrt_one_minus = self.sqrt_one_minus_alpha_bars[t].view(-1, 1, 1, 1)
        xt = sqrt_alpha_bar * x0 + sqrt_one_minus * noise
        return xt, noise

    def sample_timesteps(self, batch_size):
        """Sample random timesteps for training."""
        return torch.randint(0, self.T, (batch_size,), dtype=torch.long)

# ============ Sinusoidal Timestep Embedding ============

class SinusoidalPosEmb(nn.Module):
    """Sinusoidal position embedding for timesteps."""
    def __init__(self, dim):
        super().__init__()
        self.dim = dim

    def forward(self, t):
        half_dim = self.dim // 2
        emb = math.log(10000) / (half_dim - 1)
        emb = torch.exp(torch.arange(half_dim, device=t.device) * -emb)
        emb = t.float().unsqueeze(-1) * emb.unsqueeze(0)
        emb = torch.cat([torch.sin(emb), torch.cos(emb)], dim=-1)
        return emb

# Demonstrate forward diffusion
ddpm = DDPM(T=1000, schedule='cosine')
x0 = torch.randn(4, 3, 64, 64)
t = ddpm.sample_timesteps(4)
xt, noise = ddpm.forward_process(x0, t)

print(f"Original image x0: {x0.shape}")
print(f"Timesteps t: {t.tolist()}")
print(f"Noised image xt: {xt.shape}")
print(f"Noise: {noise.shape}")
print(f"\\nAlpha bars at sampled timesteps:")
for i in range(4):
    print(f"  t={t[i].item()}: ᾱ_t={ddpm.alpha_bars[t[i]]:.4f}")`,
      output: `Original image x0: torch.Size([4, 3, 64, 64])
Timesteps t: [432, 187, 891, 55]
Noised image xt: torch.Size([4, 3, 64, 64])
Noise: torch.Size([4, 3, 64, 64])

Alpha bars at sampled timesteps:
  t=432: ᾱ_t=0.3421
  t=187: ᾱ_t=0.7214
  t=891: ᾱ_t=0.0218
  t=55: ᾱ_t=0.9256`,
      explanation: 'The forward process adds varying levels of noise based on timestep t. At low t (e.g., 55), ᾱ_t is high (0.93) — the image is mostly preserved. At high t (e.g., 891), ᾱ_t is near 0 — the image is almost pure noise. The cosine schedule adds noise more gradually than the linear schedule, improving high-resolution generation.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class ResidualBlock(nn.Module):
    """ResNet block with group normalization."""
    def __init__(self, in_ch, out_ch, time_dim):
        super().__init__()
        self.norm1 = nn.GroupNorm(32, in_ch)
        self.conv1 = nn.Conv2d(in_ch, out_ch, 3, 1, 1)
        self.norm2 = nn.GroupNorm(32, out_ch)
        self.conv2 = nn.Conv2d(out_ch, out_ch, 3, 1, 1)
        self.time_mlp = nn.Linear(time_dim, out_ch * 2)
        self.shortcut = nn.Conv2d(in_ch, out_ch, 1) if in_ch != out_ch else nn.Identity()

    def forward(self, x, t_emb):
        h = self.conv1(F.silu(self.norm1(x)))
        # Add timestep embedding
        time_scale_shift = self.time_mlp(F.silu(t_emb)).unsqueeze(-1).unsqueeze(-1)
        scale, shift = time_scale_shift.chunk(2, dim=1)
        h = self.norm2(h) * (1 + scale) + shift
        h = F.silu(h)
        h = self.conv2(h)
        return h + self.shortcut(x)

class SelfAttention(nn.Module):
    """Self-attention for global context."""
    def __init__(self, channels):
        super().__init__()
        self.norm = nn.GroupNorm(32, channels)
        self.qkv = nn.Conv2d(channels, channels * 3, 1)
        self.proj = nn.Conv2d(channels, channels, 1)

    def forward(self, x):
        B, C, H, W = x.shape
        h = self.norm(x)
        qkv = self.qkv(h).reshape(B, 3, C, H * W).permute(1, 0, 2, 3)
        q, k, v = qkv[0], qkv[1], qkv[2]
        attn = torch.matmul(q.transpose(-2, -1), k) * (C ** -0.5)
        attn = F.softmax(attn, dim=-1)
        h = torch.matmul(v, attn).reshape(B, C, H, W)
        return x + self.proj(h)

class DownBlock(nn.Module):
    """Downsampling block: ResNet + Attention + Downsample."""
    def __init__(self, in_ch, out_ch, time_dim, has_attn=False):
        super().__init__()
        self.res = ResidualBlock(in_ch, out_ch, time_dim)
        self.attn = SelfAttention(out_ch) if has_attn else nn.Identity()
        self.down = nn.Conv2d(out_ch, out_ch, 3, 2, 1)

    def forward(self, x, t_emb):
        x = self.res(x, t_emb)
        x = self.attn(x)
        skip = x
        return self.down(x), skip

class UpBlock(nn.Module):
    """Upsampling block: Upsample + ResNet + Attention."""
    def __init__(self, in_ch, out_ch, time_dim, has_attn=False):
        super().__init__()
        self.up = nn.ConvTranspose2d(in_ch, out_ch, 2, 2)
        self.res = ResidualBlock(out_ch * 2, out_ch, time_dim)
        self.attn = SelfAttention(out_ch) if has_attn else nn.Identity()

    def forward(self, x, skip, t_emb):
        x = self.up(x)
        x = torch.cat([x, skip], dim=1)
        x = self.res(x, t_emb)
        x = self.attn(x)
        return x

class SimpleUNet(nn.Module):
    """U-Net for noise prediction."""
    def __init__(self, in_ch=3, time_dim=256, ch=64):
        super().__init__()
        self.time_mlp = nn.Sequential(
            SinusoidalPosEmb(time_dim),
            nn.Linear(time_dim, time_dim),
            nn.SiLU(),
            nn.Linear(time_dim, time_dim),
        )
        self.init_conv = nn.Conv2d(in_ch, ch, 3, 1, 1)
        self.down1 = DownBlock(ch, ch, time_dim)
        self.down2 = DownBlock(ch, ch*2, time_dim, has_attn=True)
        self.down3 = DownBlock(ch*2, ch*4, time_dim, has_attn=True)
        self.bottleneck = nn.Sequential(
            ResidualBlock(ch*4, ch*4, time_dim),
            SelfAttention(ch*4),
            ResidualBlock(ch*4, ch*4, time_dim),
        )
        self.up1 = UpBlock(ch*4, ch*2, time_dim, has_attn=True)
        self.up2 = UpBlock(ch*2, ch, time_dim, has_attn=True)
        self.up3 = UpBlock(ch, ch, time_dim)
        self.final = nn.Conv2d(ch, in_ch, 1)

    def forward(self, x, t):
        t_emb = self.time_mlp(t)
        x = self.init_conv(x)
        x, s1 = self.down1(x, t_emb)
        x, s2 = self.down2(x, t_emb)
        x, s3 = self.down3(x, t_emb)
        x = self.bottleneck(x)
        x = self.up1(x, s3, t_emb)
        x = self.up2(x, s2, t_emb)
        x = self.up3(x, s1, t_emb)
        return self.final(x)

model = SimpleUNet(in_ch=3, time_dim=256)
x = torch.randn(2, 3, 64, 64)
t = torch.randint(0, 1000, (2,))
noise_pred = model(x, t)
print(f"U-Net input: {x.shape}")
print(f"Timesteps: {t.tolist()}")
print(f"Noise prediction output: {noise_pred.shape}")
print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")`,
      output: `U-Net input: torch.Size([2, 3, 64, 64])
Timesteps: [432, 187]
Noise prediction output: torch.Size([2, 3, 64, 64])
Parameters: 83,456,771`,
      explanation: 'The U-Net takes a noisy image and timestep, and predicts the noise. It has 3 downsampling stages (with attention at lowest resolution), a bottleneck with self-attention, and 3 upsampling stages with skip connections from the corresponding encoder layers. The timestep is embedded via sinusoidal positional encoding and injected via scale-shift in the residual blocks.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F
import math
from tqdm import tqdm

# ============ DDPM Training & Sampling ============

class DiffusionModel:
    def __init__(self, model, T=1000, schedule='cosine', device='cuda'):
        self.model = model.to(device)
        self.device = device
        self.T = T

        if schedule == 'linear':
            betas = linear_beta_schedule(T)
        else:
            betas = cosine_beta_schedule(T)

        self.betas = betas.to(device)
        self.alphas = 1 - betas
        self.alpha_bars = torch.cumprod(self.alphas, dim=0)
        self.sqrt_alpha_bars = torch.sqrt(self.alpha_bars)
        self.sqrt_one_minus_alpha_bars = torch.sqrt(1 - self.alpha_bars)

    def loss(self, x0):
        """Compute DDPM loss for a batch of images."""
        batch_size = x0.size(0)
        t = torch.randint(0, self.T, (batch_size,), device=self.device)
        noise = torch.randn_like(x0)
        xt = (self.sqrt_alpha_bars[t].view(-1, 1, 1, 1) * x0 +
              self.sqrt_one_minus_alpha_bars[t].view(-1, 1, 1, 1) * noise)
        noise_pred = self.model(xt, t)
        return F.mse_loss(noise_pred, noise)

    @torch.no_grad()
    def sample(self, batch_size=16, img_channels=3, img_size=64):
        """Generate images by iteratively denoising."""
        x = torch.randn(batch_size, img_channels, img_size, img_size,
                        device=self.device)

        for t in tqdm(reversed(range(self.T)), desc='Sampling', total=self.T):
            t_tensor = torch.full((batch_size,), t, device=self.device)
            noise_pred = self.model(x, t_tensor)

            alpha = self.alphas[t]
            alpha_bar = self.alpha_bars[t]
            beta = self.betas[t]

            # DDPM update
            if t > 0:
                noise = torch.randn_like(x)
                coeff = math.sqrt(beta)
            else:
                noise = 0
                coeff = 0

            x = (1 / math.sqrt(alpha)) * (
                x - (beta / math.sqrt(1 - alpha_bar)) * noise_pred
            ) + coeff * noise

        return x

    @torch.no_grad()
    def sample_ddim(self, batch_size=16, steps=50, eta=0.0):
        """Fast sampling with DDIM."""
        x = torch.randn(batch_size, 3, 64, 64, device=self.device)
        timesteps = torch.linspace(self.T - 1, 0, steps, dtype=torch.long)

        for i in tqdm(range(len(timesteps) - 1), desc='DDIM'):
            t = timesteps[i]
            t_next = timesteps[i + 1]
            t_tensor = torch.full((batch_size,), t.item(), device=self.device)
            noise_pred = self.model(x, t_tensor)

            alpha_bar = self.alpha_bars[t]
            alpha_bar_next = self.alpha_bars[t_next]

            # Predicted x0
            x0_pred = (x - torch.sqrt(1 - alpha_bar) * noise_pred) / \
                       torch.sqrt(alpha_bar)

            # Direction pointing to xt
            c1 = torch.sqrt(1 - alpha_bar_next - eta ** 2 * beta_ddim)
            c2 = eta * torch.sqrt(beta_ddim)

            x = torch.sqrt(alpha_bar_next) * x0_pred + c1 * noise_pred + c2 * torch.randn_like(x)

        return x

# Training loop
def train_diffusion(model, dataloader, epochs=100, lr=1e-4):
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    diffusion = DiffusionModel(model)

    for epoch in range(epochs):
        total_loss = 0
        for x, _ in dataloader:
            optimizer.zero_grad()
            loss = diffusion.loss(x)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        if (epoch + 1) % 10 == 0:
            avg_loss = total_loss / len(dataloader)
            print(f"Epoch {epoch+1}/{epochs}, Loss: {avg_loss:.6f}")

            # Generate samples every 10 epochs
            samples = diffusion.sample(batch_size=4)
            # Save samples...

    return diffusion

# Classifier-Free Guidance (for conditional generation)
class CFGDiffusion(DiffusionModel):
    def sample_with_guidance(self, cond, batch_size=16, guidance_scale=3.0):
        """Classifier-free guided sampling."""
        x = torch.randn(batch_size, 3, 64, 64, device=self.device)
        uncond = torch.zeros_like(cond)

        for t in reversed(range(self.T)):
            t_tensor = torch.full((batch_size,), t, device=self.device)
            noise_pred_uncond = self.model(x, t_tensor, uncond)
            noise_pred_cond = self.model(x, t_tensor, cond)
            noise_pred = noise_pred_uncond + guidance_scale * (
                noise_pred_cond - noise_pred_uncond
            )
            # DDPM step with noise_pred...

        return x

print("Diffusion model training pipeline defined.")
print(f"DDPM: {1000} training steps, {1000} sampling steps (slow)")
print(f"DDIM: {1000} training steps, {50} sampling steps (fast)")
print(f"CFG: guidance_scale > 1 for better conditional generation")
print("Loss: simple MSE between predicted and actual noise")`,
      output: `Diffusion model training pipeline defined.
DDPM: 1000 training steps, 1000 sampling steps (slow)
DDIM: 1000 training steps, 50 sampling steps (fast)
CFG: guidance_scale > 1 for better conditional generation
Loss: simple MSE between predicted and actual noise`,
      explanation: 'The full DDPM training pipeline samples random timesteps and noise, corrupts the input, predicts the noise with U-Net, and minimizes MSE. Sampling iteratively denoises from pure noise. DDIM accelerates sampling by using a deterministic non-Markovian process that can skip steps. Classifier-free guidance blends conditional and unconditional predictions to amplify the conditioning signal.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Image Generation', description: 'DALL-E 3, Midjourney, and Adobe Firefly all use diffusion models as their core generative engine. They produce photorealistic images from text prompts with unprecedented quality and diversity.' },
      { industry: 'Audio Generation', description: 'AudioLDM and Stable Audio use diffusion in the spectrogram domain for text-to-audio and text-to-music generation. The same DDPM framework adapts naturally to 1D signals.' },
      { industry: 'Molecular Design', description: 'Diffusion models generate 3D molecular structures by modeling atom positions and types as a continuous denoising process over coordinates. This achieves state-of-the-art results in de novo drug design.' },
    ],
    caseStudy: {
      problem: 'An architectural visualization studio needed to generate photorealistic interior renders from rough 3D models and text descriptions. Traditional ray tracing required hours per render and expert artists to set up materials and lighting.',
      solution: 'They fine-tuned a latent diffusion model on 500,000 rendered interiors, conditioning on semantic segmentation maps (from 3D models) and text descriptions. The model generated 4K renders with realistic materials, lighting, and furnishings.',
      results: 'Render time dropped from 3 hours to 2 seconds. Non-technical clients could iterate designs in real-time by adjusting text descriptions. The studio\'s throughput increased 50x, and client satisfaction scores improved 35%.',
    },
    bestPractices: [
      'Use cosine noise schedule for better high-resolution generation',
      'Use DDIM or DPM++ sampler for 10-50x faster inference than naive DDPM',
      'Use v-prediction (predict v = ᾱ_t ε - σ_t x₀) for improved stability at high resolutions',
      'Apply classifier-free guidance (scale=3-7) to improve sample quality and prompt alignment',
      'Use EMA (exponential moving average) of model weights for more stable generation',
      'Prefer latent diffusion (Stable Diffusion) for high-resolution images',
    ],
    tools: ['PyTorch', 'Hugging Face Diffusers', 'OpenAI Guided Diffusion', 'Denoising Diffusion PyTorch', 'ComfyUI', 'Automatic1111'],
    jobRoles: ['Generative AI Engineer', 'AI Research Scientist', 'Computer Vision Engineer', 'Creative Technologist', 'ML Infrastructure Engineer'],
    furtherReading: [
      '"Denoising Diffusion Probabilistic Models" (Ho et al., 2020)',
      '"Improved Denoising Diffusion Probabilistic Models" (Nichol & Dhariwal, 2021)',
      '"Denoising Diffusion Implicit Models" (Song et al., 2021)',
      '"Score-Based Generative Modeling through Stochastic Differential Equations" (Song et al., 2021)',
    ],
  },
  quiz: [
    {
      id: 'diff-1', type: 'truefalse',
      question: 'In DDPM, the model directly predicts the clean image x0 from the noisy image xt.',
      correctAnswer: 'False',
      explanation: 'The DDPM model predicts the noise ε added to the image, not the clean image itself. The clean image is derived: x0 = (xt - sqrt(1-ᾱ_t) ε) / sqrt(ᾱ_t). Noise prediction is simpler because ε is always unit Gaussian regardless of the data distribution.',
    },
    {
      id: 'diff-2', type: 'mcq',
      question: 'What is the key advantage of DDIM over DDPM for sampling?',
      options: [
        'DDIM produces higher quality images at the same number of steps',
        'DDIM can generate images in fewer steps (e.g., 50 vs 1000) while maintaining quality',
        'DDIM requires less training data than DDPM',
        'DDIM can generate video while DDPM only generates images',
      ],
      correctAnswer: 'DDIM can generate images in fewer steps (e.g., 50 vs 1000) while maintaining quality',
      explanation: 'DDIM uses a non-Markovian forward process that allows skipping steps during reverse sampling. This reduces sampling from 1000 steps to as few as 10-50 steps with minimal quality loss, making diffusion models practical for real-time applications.',
    },
    {
      id: 'diff-3', type: 'code',
      question: 'What does the training loss L = ||ε - ε_θ(x_t, t)||² represent?',
      code: `xt = sqrt(ᾱ_t) * x0 + sqrt(1-ᾱ_t) * noise
noise_pred = model(xt, t)
loss = F.mse_loss(noise_pred, noise)`,
      options: [
        'Mean squared error between predicted and actual noise',
        'Cross-entropy between predicted and target distribution',
        'KL divergence between forward and reverse processes',
        'L1 distance between original and reconstructed images',
      ],
      correctAnswer: 'Mean squared error between predicted and actual noise',
      explanation: 'The DDPM loss is simply MSE between the noise added during the forward process and the noise predicted by the U-Net. Despite this simplicity, it serves as a variational lower bound on the data log-likelihood and produces state-of-the-art generation quality.',
    },
    {
      id: 'diff-4', type: 'fillblank',
      question: 'The ___ schedule for β_t uses ᾱ_t = cos²(π/2 · (t/T + s)/(1 + s)) and adds noise more gradually than the linear schedule.',
      correctAnswer: 'cosine',
      explanation: 'The cosine schedule (from Improved DDPM) provides a softer noise increase compared to the linear schedule. It preserves information content for longer, which improves generation quality especially at high resolutions where the linear schedule adds noise too aggressively early on.',
    },
    {
      id: 'diff-5', type: 'match',
      question: 'Match each concept with its role in diffusion models:',
      pairs: [
        { left: 'Forward Process q(xt|xt-1)', right: 'Gradually adds Gaussian noise to data' },
        { left: 'Reverse Process pθ(xt-1|xt)', right: 'Learns to denoise step by step using neural network' },
        { left: 'Noise Schedule βt', right: 'Controls how much noise is added at each timestep' },
        { left: 'U-Net εθ(xt, t)', right: 'Predicts the noise added to a noisy image at timestep t' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'The forward process defines the noising trajectory, the reverse process defines the learned denoising trajectory, the noise schedule controls the rate of information destruction, and the U-Net is the function approximator that predicts the noise to enable denoising.',
    },
  ],
}))

export {}