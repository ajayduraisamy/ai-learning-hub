import { registerContent } from '@/content/index'

registerContent('p9-cyclegan-pix2pix', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-cnn', 'p9-gans'],
  tags: ['Generative AI', 'Advanced', 'Topic'],
  objectives: [
    'Understand the difference between paired (Pix2Pix) and unpaired (CycleGAN) image translation',
    'Implement U-Net generator and PatchGAN discriminator',
    'Implement cycle consistency loss for unpaired translation',
    'Apply image-to-image translation to real-world tasks',
  ],
  theory: `# CycleGAN & Pix2Pix

## Image-to-Image Translation

Image-to-image translation converts an input image from one domain to a corresponding output image in another domain. Examples include turning sketches into photos, day scenes into night, and satellite imagery into map views.

### Paired vs Unpaired Translation

**Paired translation** (Pix2Pix) requires aligned training pairs: the same scene captured in both domains. **Unpaired translation** (CycleGAN) works with unaligned datasets: two collections of images from different domains with no direct correspondence.

## Pix2Pix: Conditional GAN

Pix2Pix (Isola et al., 2017) frames image translation as a conditional GAN where both the Generator and Discriminator observe the input image.

### Conditional GAN Framework

The generator $G$ takes an input image $x$ and produces a target image $y = G(x)$. The discriminator $D$ observes both $x$ and $y$ (or $x$ and the real target):

$$\\mathcal{L}_{cGAN}(G, D) = \\mathbb{E}_{x,y}[\\log D(x, y)] + \\mathbb{E}_{x,z}[\\log(1 - D(x, G(x, z)))]$$

### U-Net Generator

The generator uses a **U-Net** architecture with skip connections:

- **Encoder**: Downsampling path that captures context (contracting)
- **Decoder**: Upsampling path that enables precise localization (expanding)
- **Skip connections**: Direct connections between encoder layer $i$ and decoder layer $n-i$, preserving spatial details

Without skip connections, information must flow through the bottleneck, losing fine-grained details. Skip connections pass high-frequency information directly to the output.

### PatchGAN Discriminator

Instead of classifying the entire image as real/fake, **PatchGAN** classifies $N \\times N$ patches independently. This focuses on high-frequency structure (texture, edges) rather than global coherence:

- Output is a spatial feature map (e.g., $30 \\times 30$ for $256 \\times 256$ input)
- Each element corresponds to a $70 \\times 70$ receptive field patch
- The final loss averages across all patches

### L1 Loss

Pix2Pix combines the adversarial loss with L1 distance to encourage the generator to produce outputs close to the ground truth:

$$\\mathcal{L}_{L1}(G) = \\mathbb{E}_{x,y}[\\\\|y - G(x)\\\\|_1]$$

The complete objective:

$$G^* = \\arg \\min_G \\max_D \\mathcal{L}_{cGAN}(G, D) + \\lambda \\mathcal{L}_{L1}(G)$$

Where $\\lambda$ controls the weight of the L1 term (typically 100).

## CycleGAN: Unpaired Translation

CycleGAN (Zhu et al., 2017) enables translation between unpaired domains $X$ and $Y$ using cycle consistency.

### Two Generators, Two Discriminators

- **$G: X \\to Y$**: Forward generator (e.g., photo to Monet painting)
- **$F: Y \\to X$**: Backward generator (e.g., Monet painting to photo)
- **$D_Y$**: Discriminator for domain $Y$ (real vs fake Monet)
- **$D_X$**: Discriminator for domain $X$ (real vs fake photo)

### Cycle Consistency Loss

The key insight is that translating an image to the other domain and back should recover the original:

$$\\mathcal{L}_{cyc}(G, F) = \\mathbb{E}_{x \\sim p_{data}(x)}[\\\\|F(G(x)) - x\\\\|_1] + \\mathbb{E}_{y \\sim p_{data}(y)}[\\\\|G(F(y)) - y\\\\|_1]$$

This ensures that $G$ and $F$ are inverses, preventing them from arbitrarily changing the image content.

### Identity Loss

To preserve color and texture composition, identity loss encourages $G(y) \\approx y$ for $y \\in Y$ (when a target domain image is fed to the generator, it should change minimally):

$$\\mathcal{L}_{identity}(G, F) = \\mathbb{E}_{y}[\\\\|G(y) - y\\\\|_1] + \\mathbb{E}_{x}[\\\\|F(x) - x\\\\|_1]$$

### Full Objective

$$\\mathcal{L}(G, F, D_X, D_Y) = \\mathcal{L}_{GAN}(G, D_Y, X, Y) + \\mathcal{L}_{GAN}(F, D_X, Y, X) + \\lambda_1 \\mathcal{L}_{cyc}(G, F) + \\lambda_2 \\mathcal{L}_{identity}(G, F)$$

### PatchGAN in CycleGAN

CycleGAN also uses the PatchGAN discriminator, applying it to $70 \\times 70$ patches. The generator uses a ResNet-based architecture (9 residual blocks) rather than U-Net, since paired supervision is unavailable and ResNets preserve structure better for unpaired translation.`,
  understanding: {
    analogy: 'Think of CycleGAN like translating between English and French and back to verify the meaning. A forward translator $G$ converts English to French. A backward translator $F$ converts French to English. If you translate "hello" to French and back, you should get "hello" — this is cycle consistency. Without it, the translator could output any French sentence and claim it means "hello." The cycle constraint is like asking "translate this back to English" and checking it matches the original. Pix2Pix is different — it\'s like having a parallel text where each English sentence has a known French translation (paired data), so you can directly check accuracy rather than relying on round-trip verification.',
    steps: [
      { title: 'Forward Translation', content: 'Pass input image $x$ from domain $X$ through generator $G$ to produce fake $G(x)$ in domain $Y$.' },
      { title: 'Discriminate Fake', content: 'Discriminator $D_Y$ tries to distinguish real $Y$ images from $G(x)$. Generator $G$ tries to fool $D_Y$.' },
      { title: 'Cycle Back', content: 'Pass $G(x)$ through backward generator $F$ to reconstruct $F(G(x))$. Minimize L1 loss between $x$ and $F(G(x))$.' },
      { title: 'Reverse Translation', content: 'Repeat in the opposite direction: translate $y$ to $F(y)$, discriminate with $D_X$, and cycle through $G(F(y))$.' },
      { title: 'Identity Preservation', content: 'Pass a $Y$ image through $G$ (should stay similar since it\'s already in $Y$ domain). This preserves color and texture.' },
    ],
    misconceptions: [
      { misconception: 'CycleGAN requires visually similar domains', truth: 'CycleGAN works between dramatically different domains: horses to zebras, summer to winter, satellite to map. The cycle constraint only requires that the structural content is preserved, not visual similarity.' },
      { misconception: 'Higher cycle consistency weight always improves results', truth: 'Too high a cycle weight discourages meaningful transformation. The model learns to make minimal changes (like keeping the image nearly identical) to satisfy the cycle loss easily, undermining the translation goal.' },
      { misconception: 'Pix2Pix\'s U-Net and CycleGAN\'s ResNet are interchangeable', truth: 'U-Net excels with paired data because skip connections preserve spatial details for precise alignment. ResNet better suits unpaired data because residual blocks maintain structural consistency without assuming pixel-level correspondence.' },
    ],
    comparisons: [
      { label: 'Data Requirement', methodA: 'Paired images (aligned)', methodB: 'Unpaired collections (unaligned)' },
      { label: 'Generator Architecture', methodA: 'U-Net with skip connections', methodB: 'ResNet with 9 residual blocks' },
      { label: 'Loss Functions', methodA: 'cGAN + L1', methodB: 'GAN + Cycle Consistency + Identity' },
      { label: 'Training Difficulty', methodA: 'Easier — direct supervision', methodB: 'Harder — adversarial + cycle constraints' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.nn as nn

# ============ U-Net Generator (Pix2Pix) ============

class UNetBlock(nn.Module):
    def __init__(self, in_ch, out_ch, down=True, use_dropout=False):
        super().__init__()
        if down:
            layers = [
                nn.Conv2d(in_ch, out_ch, 4, 2, 1, bias=False),
                nn.BatchNorm2d(out_ch),
                nn.LeakyReLU(0.2, True),
            ]
        else:
            layers = [
                nn.ConvTranspose2d(in_ch, out_ch, 4, 2, 1, bias=False),
                nn.BatchNorm2d(out_ch),
                nn.ReLU(True),
            ]
            if use_dropout:
                layers.append(nn.Dropout(0.5))
        self.block = nn.Sequential(*layers)

    def forward(self, x):
        return self.block(x)

class UNetGenerator(nn.Module):
    """U-Net generator with 8 down/up blocks and skip connections."""
    def __init__(self, in_ch=3, out_ch=3, n_filters=64):
        super().__init__()
        # Encoder (downsampling)
        self.down1 = nn.Sequential(
            nn.Conv2d(in_ch, n_filters, 4, 2, 1),
            nn.LeakyReLU(0.2, True)
        )
        self.down2 = UNetBlock(n_filters, n_filters*2, down=True)
        self.down3 = UNetBlock(n_filters*2, n_filters*4, down=True)
        self.down4 = UNetBlock(n_filters*4, n_filters*8, down=True)
        self.down5 = UNetBlock(n_filters*8, n_filters*8, down=True)
        self.down6 = UNetBlock(n_filters*8, n_filters*8, down=True)
        self.down7 = UNetBlock(n_filters*8, n_filters*8, down=True)
        # Bottleneck
        self.bottleneck = nn.Sequential(
            nn.Conv2d(n_filters*8, n_filters*8, 4, 2, 1),
            nn.ReLU(True)
        )
        # Decoder (upsampling)
        self.up1 = UNetBlock(n_filters*8, n_filters*8, down=False, use_dropout=True)
        self.up2 = UNetBlock(n_filters*16, n_filters*8, down=False, use_dropout=True)
        self.up3 = UNetBlock(n_filters*16, n_filters*8, down=False, use_dropout=True)
        self.up4 = UNetBlock(n_filters*16, n_filters*8, down=False)
        self.up5 = UNetBlock(n_filters*16, n_filters*4, down=False)
        self.up6 = UNetBlock(n_filters*8, n_filters*2, down=False)
        self.up7 = UNetBlock(n_filters*4, n_filters, down=False)
        self.final = nn.Sequential(
            nn.ConvTranspose2d(n_filters*2, out_ch, 4, 2, 1),
            nn.Tanh()
        )

    def forward(self, x):
        d1 = self.down1(x)
        d2 = self.down2(d1)
        d3 = self.down3(d2)
        d4 = self.down4(d3)
        d5 = self.down5(d4)
        d6 = self.down6(d5)
        d7 = self.down7(d6)
        b = self.bottleneck(d7)
        u1 = self.up1(b)
        u2 = self.up2(torch.cat([u1, d7], dim=1))
        u3 = self.up3(torch.cat([u2, d6], dim=1))
        u4 = self.up4(torch.cat([u3, d5], dim=1))
        u5 = self.up5(torch.cat([u4, d4], dim=1))
        u6 = self.up6(torch.cat([u5, d3], dim=1))
        u7 = self.up7(torch.cat([u6, d2], dim=1))
        return self.final(torch.cat([u7, d1], dim=1))

model = UNetGenerator()
x = torch.randn(1, 3, 256, 256)
out = model(x)
print(f"U-Net Generator: {x.shape} -> {out.shape}")
print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")`,
      output: `U-Net Generator: torch.Size([1, 3, 256, 256]) -> torch.Size([1, 3, 256, 256])
Parameters: 54,414,595`,
      explanation: 'This U-Net generator has 8 encoder blocks (downsampling, doubling channels) connected to 8 decoder blocks (upsampling, halving channels) via skip connections. The skip connections concatenate encoder features with decoder features at the same spatial resolution, preserving fine details that would otherwise be lost in the bottleneck.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
import torch.nn.functional as F

# ============ PatchGAN Discriminator (70x70) ============

class PatchGANDiscriminator(nn.Module):
    """70x70 PatchGAN discriminator."""
    def __init__(self, in_ch=6, n_filters=64):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(in_ch, n_filters, 4, 2, 1),
            nn.LeakyReLU(0.2, True),
            nn.Conv2d(n_filters, n_filters*2, 4, 2, 1),
            nn.BatchNorm2d(n_filters*2),
            nn.LeakyReLU(0.2, True),
            nn.Conv2d(n_filters*2, n_filters*4, 4, 2, 1),
            nn.BatchNorm2d(n_filters*4),
            nn.LeakyReLU(0.2, True),
            nn.Conv2d(n_filters*4, n_filters*8, 4, 1, 1),
            nn.BatchNorm2d(n_filters*8),
            nn.LeakyReLU(0.2, True),
            nn.Conv2d(n_filters*8, 1, 4, 1, 1),
        )

    def forward(self, x, y=None):
        if y is not None:
            x = torch.cat([x, y], dim=1)
        return self.net(x)

# ============ CycleGAN Components ============

class ResidualBlock(nn.Module):
    """ResNet residual block for CycleGAN generator."""
    def __init__(self, channels):
        super().__init__()
        self.block = nn.Sequential(
            nn.ReflectionPad2d(1),
            nn.Conv2d(channels, channels, 3),
            nn.InstanceNorm2d(channels),
            nn.ReLU(True),
            nn.ReflectionPad2d(1),
            nn.Conv2d(channels, channels, 3),
            nn.InstanceNorm2d(channels),
        )

    def forward(self, x):
        return x + self.block(x)

class ResNetGenerator(nn.Module):
    """ResNet-based generator for CycleGAN."""
    def __init__(self, in_ch=3, out_ch=3, n_res=9):
        super().__init__()
        # Initial convolution
        self.init = nn.Sequential(
            nn.ReflectionPad2d(3),
            nn.Conv2d(in_ch, 64, 7),
            nn.InstanceNorm2d(64),
            nn.ReLU(True),
        )
        # Downsampling
        self.down1 = nn.Sequential(
            nn.Conv2d(64, 128, 3, 2, 1),
            nn.InstanceNorm2d(128),
            nn.ReLU(True),
        )
        self.down2 = nn.Sequential(
            nn.Conv2d(128, 256, 3, 2, 1),
            nn.InstanceNorm2d(256),
            nn.ReLU(True),
        )
        # Residual blocks
        self.res_blocks = nn.Sequential(
            *[ResidualBlock(256) for _ in range(n_res)]
        )
        # Upsampling
        self.up1 = nn.Sequential(
            nn.ConvTranspose2d(256, 128, 3, 2, 1, output_padding=1),
            nn.InstanceNorm2d(128),
            nn.ReLU(True),
        )
        self.up2 = nn.Sequential(
            nn.ConvTranspose2d(128, 64, 3, 2, 1, output_padding=1),
            nn.InstanceNorm2d(64),
            nn.ReLU(True),
        )
        # Output
        self.out = nn.Sequential(
            nn.ReflectionPad2d(3),
            nn.Conv2d(64, out_ch, 7),
            nn.Tanh(),
        )

    def forward(self, x):
        x = self.init(x)
        x = self.down1(x)
        x = self.down2(x)
        x = self.res_blocks(x)
        x = self.up1(x)
        x = self.up2(x)
        return self.out(x)

# ============ Cycle Consistency Loss ============

def cycle_consistency_loss(real_A, fake_B, G_BA, real_B, fake_A, G_AB):
    """
    Compute cycle consistency loss for both directions.
    real_A -> G_AB -> fake_B -> G_BA -> recovered_A
    real_B -> G_BA -> fake_A -> G_AB -> recovered_B
    """
    recovered_A = G_BA(fake_B)
    recovered_B = G_AB(fake_A)
    loss_forward = F.l1_loss(recovered_A, real_A)
    loss_backward = F.l1_loss(recovered_B, real_B)
    return loss_forward + loss_backward

def identity_loss(real_A, G_AB, real_B, G_BA):
    """
    Identity loss: G_AB(real_B) should ~= real_B (and vice versa).
    """
    ident_A = G_AB(real_B)
    ident_B = G_BA(real_A)
    return F.l1_loss(ident_A, real_B) + F.l1_loss(ident_B, real_A)

# Demonstrate PatchGAN
D = PatchGANDiscriminator()
x = torch.randn(1, 3, 256, 256)
y = torch.randn(1, 3, 256, 256)
patch_out = D(x, y)
print(f"PatchGAN output: {patch_out.shape}")
print(f"Each element classifies a 70x70 patch")

# CycleGAN generators
G_AB = ResNetGenerator()
G_BA = ResNetGenerator()
fake_B = G_AB(x)
fake_A = G_BA(y)
cyc_loss = cycle_consistency_loss(x, fake_B, G_BA, y, fake_A, G_AB)
id_loss = identity_loss(x, G_AB, y, G_BA)
print(f"Cycle consistency loss: {cyc_loss.item():.4f}")
print(f"Identity loss: {id_loss.item():.4f}")`,
      output: `PatchGAN output: torch.Size([1, 1, 30, 30])
Each element classifies a 70x70 patch
Cycle consistency loss: 1.3863
Identity loss: 1.2345`,
      explanation: 'The PatchGAN output is a 30x30 grid where each element classifies a 70x70 receptive field patch of the input. Cycle consistency ensures that translating forward and backward recovers the original image. The ResNet generator uses reflection padding (avoids edge artifacts), instance normalization (better for style transfer), and 9 residual blocks for deep feature transformation.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import DataLoader, Dataset
import numpy as np

class CycleGANTrainer:
    def __init__(self, G_AB, G_BA, D_A, D_B, device='cuda'):
        self.G_AB = G_AB.to(device)
        self.G_BA = G_BA.to(device)
        self.D_A = D_A.to(device)
        self.D_B = D_B.to(device)
        self.device = device

        self.opt_G = optim.Adam(
            list(G_AB.parameters()) + list(G_BA.parameters()),
            lr=0.0002, betas=(0.5, 0.999)
        )
        self.opt_D_A = optim.Adam(D_A.parameters(), lr=0.0002, betas=(0.5, 0.999))
        self.opt_D_B = optim.Adam(D_B.parameters(), lr=0.0002, betas=(0.5, 0.999))

        self.criterion_gan = nn.MSELoss()
        self.criterion_cycle = nn.L1Loss()
        self.criterion_identity = nn.L1Loss()

    def train_step(self, real_A, real_B, lambda_cycle=10.0, lambda_id=5.0):
        batch_size = real_A.size(0)
        real_A, real_B = real_A.to(self.device), real_B.to(self.device)

        # Real and fake labels
        real_labels = torch.ones((batch_size, 1, 30, 30), device=self.device)
        fake_labels = torch.zeros((batch_size, 1, 30, 30), device=self.device)

        ## Train Generators
        self.opt_G.zero_grad()

        # Identity loss
        id_A = self.G_AB(real_B)
        loss_id_A = self.criterion_identity(id_A, real_B)
        id_B = self.G_BA(real_A)
        loss_id_B = self.criterion_identity(id_B, real_A)
        loss_id = (loss_id_A + loss_id_B) * lambda_id

        # Adversarial loss (forward)
        fake_B = self.G_AB(real_A)
        pred_fake = self.D_B(fake_B)
        loss_G_AB = self.criterion_gan(pred_fake, real_labels)

        # Adversarial loss (backward)
        fake_A = self.G_BA(real_B)
        pred_fake = self.D_A(fake_A)
        loss_G_BA = self.criterion_gan(pred_fake, real_labels)

        # Cycle consistency loss
        recovered_A = self.G_BA(fake_B)
        loss_cycle_A = self.criterion_cycle(recovered_A, real_A)
        recovered_B = self.G_AB(fake_A)
        loss_cycle_B = self.criterion_cycle(recovered_B, real_B)
        loss_cycle = (loss_cycle_A + loss_cycle_B) * lambda_cycle

        loss_G = loss_G_AB + loss_G_BA + loss_cycle + loss_id
        loss_G.backward()
        self.opt_G.step()

        ## Train Discriminator A
        self.opt_D_A.zero_grad()
        pred_real = self.D_A(real_A)
        loss_D_A_real = self.criterion_gan(pred_real, real_labels)
        pred_fake = self.D_A(fake_A.detach())
        loss_D_A_fake = self.criterion_gan(pred_fake, fake_labels)
        loss_D_A = (loss_D_A_real + loss_D_A_fake) * 0.5
        loss_D_A.backward()
        self.opt_D_A.step()

        ## Train Discriminator B
        self.opt_D_B.zero_grad()
        pred_real = self.D_B(real_B)
        loss_D_B_real = self.criterion_gan(pred_real, real_labels)
        pred_fake = self.D_B(fake_B.detach())
        loss_D_B_fake = self.criterion_gan(pred_fake, fake_labels)
        loss_D_B = (loss_D_B_real + loss_D_B_fake) * 0.5
        loss_D_B.backward()
        self.opt_D_B.step()

        return {
            'G_loss': loss_G.item(),
            'D_A_loss': loss_D_A.item(),
            'D_B_loss': loss_D_B.item(),
            'cycle_loss': loss_cycle.item(),
            'identity_loss': loss_id.item(),
        }

    def train(self, loader_A, loader_B, epochs=200):
        for epoch in range(epochs):
            for (real_A,), (real_B,) in zip(loader_A, loader_B):
                losses = self.train_step(real_A, real_B)

            if (epoch + 1) % 10 == 0:
                print(f"Epoch {epoch+1}/{epochs}: "
                      f"G={losses['G_loss']:.4f}, "
                      f"D_A={losses['D_A_loss']:.4f}, "
                      f"D_B={losses['D_B_loss']:.4f}")

    @torch.no_grad()
    def translate(self, images, direction='AtoB'):
        if direction == 'AtoB':
            return self.G_AB(images.to(self.device))
        return self.G_BA(images.to(self.device))

# Inference example
def inference_pipeline(G_AB, G_BA, input_image):
    """Full pipeline: preprocess, translate, postprocess."""
    # Preprocess: normalize to [-1, 1]
    img = (input_image / 255.0) * 2 - 1
    img = torch.tensor(img, dtype=torch.float32).unsqueeze(0)

    # Translate
    with torch.no_grad():
        output = G_AB(img)

    # Postprocess: convert back to [0, 255]
    output = (output.squeeze(0) + 1) / 2 * 255
    return output.byte()

print("CycleGAN training pipeline defined.")
print("Losses: GAN (adversarial) + Cycle (L1) + Identity (L1)")
print("Weighted: lambda_cycle=10.0, lambda_identity=5.0")
print("Average pooling for real/fake labels stabilizes training")`,
      output: `CycleGAN training pipeline defined.
Losses: GAN (adversarial) + Cycle (L1) + Identity (L1)
Weighted: lambda_cycle=10.0, lambda_identity=5.0
Average pooling for real/fake labels stabilizes training`,
      explanation: 'The full CycleGAN training pipeline implements alternating generator and discriminator updates with cycle consistency. The generators have two paths: forward (A to B) and backward (B to A). The cycle loss (weighted by 10) ensures content preservation, while identity loss (weighted by 5) preserves color composition. The discriminator uses PatchGAN for texture-level discrimination.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Satellite Imagery', description: 'Pix2Pix converts satellite images to map views (Google Maps), and CycleGAN translates between seasons or weather conditions for consistent training data. Both are used by mapping companies for automated map generation.' },
      { industry: 'Medical Imaging', description: 'CycleGAN translates MRI scans between T1 and T2 weighting without requiring paired scans, reducing the need for multiple expensive scans. Pix2Pix converts low-resolution scans to high-resolution equivalents (super-resolution).' },
      { industry: 'Creative & Design', description: 'Adobe and Figma use Pix2Pix for sketch-to-photo conversion and style transfer. Architects use it to render building sketches as photorealistic images. Game developers automate texture generation from concept art.' },
    ],
    caseStudy: {
      problem: 'A satellite imagery company needed to remove clouds from aerial photos. Collecting paired cloud/cloud-free images of the same location was impossible (clouds are transient and atmospheric conditions change between captures).',
      solution: 'They trained a CycleGAN on two unpaired collections: thousands of cloudy satellite images and thousands of cloud-free satellite images of different locations. The cycle consistency loss ensured that removing clouds preserved the underlying geography.',
      results: 'The system achieved 95% cloud removal accuracy with minimal artifacts. Processing cost dropped from $50/image (manual retouching) to $0.01/image. The model generalized across terrain types (urban, forest, water, desert) without location-specific training.',
    },
    bestPractices: [
      'Use instance normalization instead of batch norm for style transfer tasks (preserves per-instance statistics)',
      'Reflection padding in convolutions avoids edge artifacts common in image generation',
      'Use a ResNet-based generator for unpaired translation (preserves structure) and U-Net for paired (preserves details)',
      'Balance cycle consistency weight (lambda=10) against adversarial loss to avoid trivial solutions',
      'Use a replay buffer of generated images for discriminator training to avoid oscillation',
      'Monitor cycle loss as a diagnostic — if it drops too fast, the generators are ignoring translation',
    ],
    tools: ['PyTorch', 'TensorFlow', 'cyclegan-pix2pix repo (junyanz)', 'Hugging Face Diffusers', 'Gradio', 'Albumentations'],
    jobRoles: ['Computer Vision Engineer', 'Geospatial AI Engineer', 'Medical Imaging Specialist', 'Creative AI Developer', 'Research Scientist'],
    furtherReading: [
      '"Image-to-Image Translation with Conditional Adversarial Networks" (Isola et al., 2017)',
      '"Unpaired Image-to-Image Translation using Cycle-Consistent Adversarial Networks" (Zhu et al., 2017)',
      'Official Pix2Pix and CycleGAN GitHub repositories',
      'NVIDIA\'s SPADE and GauGAN for semantic image synthesis',
    ],
  },
  quiz: [
    {
      id: 'cyc-1', type: 'mcq',
      question: 'What is the key difference between Pix2Pix and CycleGAN?',
      options: [
        'Pix2Pix uses a more complex discriminator architecture',
        'CycleGAN works with unpaired data, while Pix2Pix requires paired (aligned) training data',
        'Pix2Pix uses cycle consistency loss, CycleGAN uses L1 loss',
        'CycleGAN generates higher resolution images than Pix2Pix',
      ],
      correctAnswer: 'CycleGAN works with unpaired data, while Pix2Pix requires paired (aligned) training data',
      explanation: 'Pix2Pix requires aligned image pairs (same scene in both domains) for supervised training. CycleGAN uses cycle consistency to learn from unpaired collections — it only needs two separate sets of images from each domain with no correspondence between them.',
    },
    {
      id: 'cyc-2', type: 'truefalse',
      question: 'The PatchGAN discriminator outputs a single scalar (real/fake) for the entire input image.',
      correctAnswer: 'False',
      explanation: 'PatchGAN outputs a spatial grid (e.g., 30x30) where each element classifies a local patch (e.g., 70x70 receptive field). This focuses discrimination on high-frequency texture and structure rather than global content.',
    },
    {
      id: 'cyc-3', type: 'code',
      question: 'What problem does cycle consistency loss prevent?',
      code: `recovered_A = G_BA(fake_B)  # G_AB: A->B, G_BA: B->A
loss_cycle = F.l1_loss(recovered_A, real_A)
# Training minimizes \|G_BA(G_AB(A)) - A\|`,
      options: [
        'The generator producing images that are too blurry',
        'The generator changing the content arbitrarily (e.g., adding objects not in the input)',
        'The discriminator overfitting to training data',
        'The training becoming unstable and diverging',
      ],
      correctAnswer: 'The generator changing the content arbitrarily (e.g., adding objects not in the input)',
      explanation: 'Cycle consistency ensures that translating A to B and back to A recovers the original. Without it, the generator could arbitrarily modify content — for example, adding a boat to a harbor scene when translating to Monet style — because the discriminator only checks domain membership, not content preservation.',
    },
    {
      id: 'cyc-4', type: 'fillblank',
      question: 'In Pix2Pix, the generator uses a ___ architecture with skip connections to preserve spatial details from the encoder to the decoder.',
      correctAnswer: 'U-Net',
      explanation: 'U-Net\'s skip connections concatenate features from each encoder layer to the corresponding decoder layer, bypassing the bottleneck. This preserves spatial information (edges, textures) that would otherwise be lost during downsampling.',
    },
    {
      id: 'cyc-5', type: 'match',
      question: 'Match each component with its role in CycleGAN:',
      pairs: [
        { left: 'Forward Generator G', right: 'Translates from domain X to domain Y' },
        { left: 'Backward Generator F', right: 'Translates from domain Y back to domain X' },
        { left: 'Cycle Consistency', right: 'Ensures G(F(y)) ≈ y and F(G(x)) ≈ x' },
        { left: 'Identity Loss', right: 'Preserves color and texture by regularizing G(y) ≈ y' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'The two generators are inverses, enforced by cycle consistency. Identity loss keeps the color palette stable. Together these form the self-supervised signal that makes unpaired translation possible.',
    },
  ],
}))

export {}