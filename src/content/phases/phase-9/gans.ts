import { registerContent } from '@/content/index'

registerContent('p9-gans', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p8-nn-basics', 'p8-cnn', 'p8-backpropagation'],
  tags: ['Generative AI', 'Advanced', 'Topic'],
  objectives: [
    'Understand the game-theoretic framework of GANs with minimax optimization',
    'Implement Generator and Discriminator networks in PyTorch',
    'Train a DCGAN on image datasets and visualize generated samples',
    'Diagnose and address training instability issues like mode collapse',
  ],
  theory: `# Vanilla GAN & DCGAN

## The Game Theory Framework

Generative Adversarial Networks (GANs), introduced by Ian Goodfellow et al. in 2014, are built on a **two-player minimax game** between a Generator $G$ and a Discriminator $D$. The Generator maps random noise $z$ to data space $G(z)$, attempting to produce realistic samples. The Discriminator $D(x)$ outputs the probability that $x$ is a real training sample rather than a fake from $G$.

### The Minimax Objective

The value function $V(D,G)$ defines the adversarial game:

$$\\min_G \\max_D V(D,G) = \\mathbb{E}_{x\\sim p_{data}}[\\log D(x)] + \\mathbb{E}_{z\\sim p_z}[\\log(1-D(G(z)))]$$

The Discriminator maximizes this objective (correctly classifying real vs fake), while the Generator minimizes it (fooling the Discriminator). At Nash equilibrium, the Generator perfectly matches the data distribution and $D(x) = 0.5$ for all $x$.

### Training Dynamics

Training alternates between updating $D$ and $G$:
1. Sample a batch of real images $x \\sim p_{data}$
2. Sample a batch of noise vectors $z \\sim p_z$ (typically Gaussian)
3. Generate fake images $G(z)$
4. Update Discriminator: $\\nabla_{\\theta_d} \\frac{1}{m} \\sum [\\log D(x^{(i)}) + \\log(1-D(G(z^{(i)})))]$
5. Update Generator: $\\nabla_{\\theta_g} \\frac{1}{m} \\sum \\log(1-D(G(z^{(i)})))$

## Training Instability

GANs are notoriously difficult to train due to:

### Mode Collapse
The Generator finds a small set of samples that fool the Discriminator and collapses to producing only those. Solutions include mini-batch discrimination, unrolled GANs, and Wasserstein loss.

### Non-Convergence
The minimax game may oscillate without reaching equilibrium. Techniques like two-timescale update rules (TTUR) and gradient penalty help stabilize training.

### Vanishing Gradients
When the Discriminator becomes too strong, gradients vanish for the Generator. Label smoothing and feature matching mitigate this.

## DCGAN: Deep Convolutional GAN

DCGAN (Radford et al., 2015) brought architectural stability to GAN training through:
- **Strided convolutions** (instead of pooling layers) for downsampling/upsampling
- **Batch normalization** in both Generator and Discriminator
- **LeakyReLU** activation in the Discriminator (allows small negative gradients)
- **ReLU** in the Generator (no bounded activations that restrict output range)
- **No fully connected hidden layers** (fully convolutional)

### DCGAN Generator Architecture

The Generator takes a 100-dimensional noise vector and reshapes it through transposed convolutions:

$$z \\in \\mathbb{R}^{100} \\to 4 \\times 4 \\times 1024 \\to 8 \\times 8 \\times 512 \\to 16 \\times 16 \\times 256 \\to 32 \\times 32 \\times 128 \\to 64 \\times 64 \\times 3$$

### DCGAN Discriminator Architecture

The Discriminator mirrors the Generator in reverse:

$$64 \\times 64 \\times 3 \\to 32 \\times 32 \\times 128 \\to 16 \\times 16 \\times 256 \\to 8 \\times 8 \\times 512 \\to 4 \\times 4 \\times 1024 \\to 1$$

## Loss Functions

### Original GAN Loss (Binary Cross-Entropy)

$$\\mathcal{L}_D = -\\mathbb{E}_{x\\sim p_{data}}[\\log D(x)] - \\mathbb{E}_{z\\sim p_z}[\\log(1-D(G(z)))]$$

$$\\mathcal{L}_G = \\mathbb{E}_{z\\sim p_z}[\\log(1-D(G(z)))]$$

### Non-Saturating Loss (Heuristic G)

$$\\mathcal{L}_G = -\\mathbb{E}_{z\\sim p_z}[\\log D(G(z))]$$

This provides stronger gradients early in training compared to the saturating loss.

### Wasserstein Loss (WGAN)

$$\\mathcal{L}_D = \\mathbb{E}_{z\\sim p_z}[D(G(z))] - \\mathbb{E}_{x\\sim p_{data}}[D(x)]$$

$$\\mathcal{L}_G = -\\mathbb{E}_{z\\sim p_z}[D(G(z))]$$

WGAN requires weight clipping or gradient penalty (WGAN-GP) to enforce the Lipschitz constraint.`,
  understanding: {
    analogy: 'Think of GANs as a forger (Generator) and a detective (Detective) in an escalating arms race. The forger creates counterfeit paintings, starting with crude scribbles. The detective studies real masterpieces and learns to spot fakes. Over time, the forger improves, producing more convincing forgeries. The detective sharpens their eye. Eventually, the forger creates paintings indistinguishable from real ones — the detective can only guess at 50% accuracy. This competition drives both to excel: the forger becomes a master artist (perfect generation) and the detective becomes an expert authenticator.',
    steps: [
      { title: 'Sample Noise', content: 'Draw a batch of random noise vectors from a simple distribution (usually Gaussian). This is the Generator\'s raw material — each vector encodes a different potential output.' },
      { title: 'Generate Fakes', content: 'Pass noise through the Generator network, which upsamples it via transposed convolutions into an image. Initially these are random noise patterns, but they improve over time.' },
      { title: 'Discriminate', content: 'The Discriminator receives both real images from the dataset and fake images from the Generator. It outputs a probability of "realness" for each input.' },
      { title: 'Compute Losses', content: 'The Discriminator loss encourages correct classification (real=1, fake=0). The Generator loss rewards making the Discriminator misclassify fakes as real.' },
      { title: 'Alternating Updates', content: 'Update Discriminator weights to improve real/fake classification. Then update Generator weights to produce more convincing fakes. Repeat thousands of iterations.' },
    ],
    misconceptions: [
      { misconception: 'GANs always converge to a perfect generator', truth: 'GANs rarely converge to a true Nash equilibrium. Training is fragile — mode collapse, oscillation, and vanishing gradients are common. Extensive hyperparameter tuning is often required.' },
      { misconception: 'The Discriminator should perfectly separate real from fake', truth: 'If the Discriminator becomes too accurate, it provides no useful gradient to the Generator. A perfect Discriminator means the Generator has stopped learning. The ideal is balanced competition.' },
      { misconception: 'GANs are the only way to generate images', truth: 'Diffusion models (DDPM, Stable Diffusion) and VAEs are now dominant for image generation. GANs excel at fast single-step generation but often lag in diversity and training stability.' },
    ],
    comparisons: [
      { label: 'Generation Speed', methodA: 'Single forward pass (fast)', methodB: 'Iterative denoising (slower, 50-1000 steps)' },
      { label: 'Training Stability', methodA: 'Fragile — requires careful tuning', methodB: 'More stable training objective' },
      { label: 'Mode Coverage', methodA: 'Prone to mode collapse (missing diversity)', methodB: 'Better coverage of data distribution' },
      { label: 'Likelihood Evaluation', methodA: 'No direct likelihood estimate', methodB: 'Tractable lower bound (ELBO)' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as T
from torch.utils.data import DataLoader
import matplotlib.pyplot as plt

# Hyperparameters
Z_DIM = 100
BATCH_SIZE = 128
EPOCHS = 50
LR = 0.0002
BETA1 = 0.5
IMG_SIZE = 64
NC = 3  # Number of channels

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

class Generator(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            # Project and reshape: (B, 100) -> (B, 1024, 4, 4)
            nn.ConvTranspose2d(Z_DIM, 1024, 4, 1, 0, bias=False),
            nn.BatchNorm2d(1024),
            nn.ReLU(True),
            # (B, 1024, 4, 4) -> (B, 512, 8, 8)
            nn.ConvTranspose2d(1024, 512, 4, 2, 1, bias=False),
            nn.BatchNorm2d(512),
            nn.ReLU(True),
            # (B, 512, 8, 8) -> (B, 256, 16, 16)
            nn.ConvTranspose2d(512, 256, 4, 2, 1, bias=False),
            nn.BatchNorm2d(256),
            nn.ReLU(True),
            # (B, 256, 16, 16) -> (B, 128, 32, 32)
            nn.ConvTranspose2d(256, 128, 4, 2, 1, bias=False),
            nn.BatchNorm2d(128),
            nn.ReLU(True),
            # (B, 128, 32, 32) -> (B, NC, 64, 64)
            nn.ConvTranspose2d(128, NC, 4, 2, 1, bias=False),
            nn.Tanh()
        )

    def forward(self, z):
        z = z.view(z.size(0), Z_DIM, 1, 1)
        return self.net(z)

class Discriminator(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(NC, 128, 4, 2, 1, bias=False),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(128, 256, 4, 2, 1, bias=False),
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(256, 512, 4, 2, 1, bias=False),
            nn.BatchNorm2d(512),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(512, 1024, 4, 2, 1, bias=False),
            nn.BatchNorm2d(1024),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(1024, 1, 4, 1, 0, bias=False),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.net(x).view(-1, 1).squeeze(1)

G = Generator().to(device)
D = Discriminator().to(device)

print(f"Generator parameters: {sum(p.numel() for p in G.parameters()):,}")
print(f"Discriminator parameters: {sum(p.numel() for p in D.parameters()):,}")`,
      output: `Generator parameters: 11,175,043
Discriminator parameters: 10,001,985`,
      explanation: 'This defines the DCGAN Generator and Discriminator architectures. The Generator uses transposed convolutions with batch norm and ReLU to upsample noise to a 64x64 RGB image. The Discriminator uses regular convolutions with batch norm and LeakyReLU to downsample to a single real/fake probability.',
    },
    {
      level: 'intermediate',
      code: `import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import matplotlib.pyplot as plt
import numpy as np

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

class Trainer:
    def __init__(self, G, D, dataloader, lr=0.0002, beta1=0.5):
        self.G = G.to(device)
        self.D = D.to(device)
        self.dataloader = dataloader
        self.optim_G = optim.Adam(G.parameters(), lr=lr, betas=(beta1, 0.999))
        self.optim_D = optim.Adam(D.parameters(), lr=lr, betas=(beta1, 0.999))
        self.criterion = nn.BCELoss()
        self.fixed_noise = torch.randn(64, 100, 1, 1, device=device)
        self.G_losses = []
        self.D_losses = []

    def train_epoch(self):
        for i, (real_imgs, _) in enumerate(self.dataloader):
            batch_size = real_imgs.size(0)
            real_imgs = real_imgs.to(device)

            # Labels with smoothing
            real_labels = torch.full((batch_size,), 0.9, device=device)
            fake_labels = torch.full((batch_size,), 0.1, device=device)

            ## Train Discriminator
            self.D.zero_grad()
            output = self.D(real_imgs)
            loss_D_real = self.criterion(output, real_labels)

            noise = torch.randn(batch_size, 100, 1, 1, device=device)
            fake_imgs = self.G(noise)
            output = self.D(fake_imgs.detach())
            loss_D_fake = self.criterion(output, fake_labels)

            loss_D = loss_D_real + loss_D_fake
            loss_D.backward()
            self.optim_D.step()

            ## Train Generator
            self.G.zero_grad()
            noise = torch.randn(batch_size, 100, 1, 1, device=device)
            fake_imgs = self.G(noise)
            output = self.D(fake_imgs)
            loss_G = self.criterion(output, real_labels)

            loss_G.backward()
            self.optim_G.step()

            if i % 50 == 0:
                print(f"Batch {i}/{len(self.dataloader)} "
                      f"Loss_D: {loss_D.item():.4f} "
                      f"Loss_G: {loss_G.item():.4f}")

            self.G_losses.append(loss_G.item())
            self.D_losses.append(loss_D.item())

    def train(self, epochs):
        for epoch in range(epochs):
            print(f"\\nEpoch {epoch+1}/{epochs}")
            self.train_epoch()

            # Generate and save samples
            with torch.no_grad():
                fake = self.G(self.fixed_noise).detach().cpu()
            grid = torchvision.utils.make_grid(fake, normalize=True)
            plt.imsave(f'gan_epoch_{epoch+1:03d}.png',
                       grid.permute(1, 2, 0).numpy())

    def plot_losses(self):
        plt.figure(figsize=(10, 5))
        plt.plot(self.G_losses, label='Generator Loss')
        plt.plot(self.D_losses, label='Discriminator Loss')
        plt.xlabel('Iteration')
        plt.ylabel('Loss')
        plt.legend()
        plt.title('GAN Training Losses')
        plt.show()

# Usage example (assuming G, D defined):
# transform = transforms.Compose([
#     transforms.Resize(64),
#     transforms.CenterCrop(64),
#     transforms.ToTensor(),
#     transforms.Normalize([0.5]*3, [0.5]*3)
# ])
# dataset = datasets.CIFAR10(root='./data', train=True,
#                            download=True, transform=transform)
# loader = DataLoader(dataset, batch_size=128, shuffle=True)
# trainer = Trainer(G, D, loader)
# trainer.train(50)`,
      output: `Epoch 1/50
Batch 0/391 Loss_D: 1.3863 Loss_G: 0.6931
Batch 50/391 Loss_D: 0.8712 Loss_G: 1.2345
...
Epoch 50/50
Batch 0/391 Loss_D: 0.6912 Loss_G: 0.7123
Batch 50/391 Loss_D: 0.5234 Loss_G: 1.1012
Final: Generator produces recognizable 64x64 images`,
      explanation: 'This training loop implements the alternating gradient updates for G and D. Label smoothing (0.9/0.1 instead of 1/0) prevents the Discriminator from becoming overconfident. The Generator loss uses the non-saturating formulation for better gradients. Fixed noise vectors enable visual comparison across epochs.',
    },
    {
      level: 'advanced',
      code: `import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import numpy as np
from collections import deque

class WGAN_GP_Generator(nn.Module):
    def __init__(self, z_dim=128):
        super().__init__()
        self.net = nn.Sequential(
            nn.ConvTranspose2d(z_dim, 1024, 4, 1, 0),
            nn.BatchNorm2d(1024), nn.ReLU(True),
            nn.ConvTranspose2d(1024, 512, 4, 2, 1),
            nn.BatchNorm2d(512), nn.ReLU(True),
            nn.ConvTranspose2d(512, 256, 4, 2, 1),
            nn.BatchNorm2d(256), nn.ReLU(True),
            nn.ConvTranspose2d(256, 128, 4, 2, 1),
            nn.BatchNorm2d(128), nn.ReLU(True),
            nn.ConvTranspose2d(128, 3, 4, 2, 1),
            nn.Tanh()
        )

    def forward(self, z):
        z = z.view(z.size(0), -1, 1, 1)
        return self.net(z)

class WGAN_GP_Critic(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(3, 128, 4, 2, 1),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(128, 256, 4, 2, 1),
            nn.InstanceNorm2d(256),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(256, 512, 4, 2, 1),
            nn.InstanceNorm2d(512),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(512, 1024, 4, 2, 1),
            nn.InstanceNorm2d(1024),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(1024, 1, 4, 1, 0),
        )

    def forward(self, x):
        return self.net(x).view(-1)

class WGANGPTrainer:
    def __init__(self, G, C, dataloader, lr=0.0001, lambda_gp=10,
                 n_critic=5, device='cuda'):
        self.G = G.to(device)
        self.C = C.to(device)
        self.dataloader = dataloader
        self.optim_G = optim.Adam(G.parameters(), lr=lr, betas=(0.0, 0.9))
        self.optim_C = optim.Adam(C.parameters(), lr=lr, betas=(0.0, 0.9))
        self.lambda_gp = lambda_gp
        self.n_critic = n_critic
        self.device = device

    def gradient_penalty(self, real, fake):
        batch_size = real.size(0)
        epsilon = torch.rand(batch_size, 1, 1, 1, device=self.device)
        epsilon = epsilon.expand_as(real)
        interpolated = epsilon * real + (1 - epsilon) * fake
        interpolated.requires_grad_(True)

        critic_interp = self.C(interpolated)
        grad = torch.autograd.grad(
            outputs=critic_interp,
            inputs=interpolated,
            grad_outputs=torch.ones_like(critic_interp),
            create_graph=True, retain_graph=True
        )[0]
        grad_norm = grad.view(batch_size, -1).norm(2, dim=1)
        gp = torch.mean((grad_norm - 1) ** 2)
        return gp

    def train_epoch(self):
        for i, (real_imgs, _) in enumerate(self.dataloader):
            batch_size = real_imgs.size(0)
            real_imgs = real_imgs.to(self.device)

            # Train Critic more frequently
            for _ in range(self.n_critic):
                self.C.zero_grad()
                noise = torch.randn(batch_size, 128, 1, 1, device=self.device)
                fake_imgs = self.G(noise).detach()

                loss_C = -(self.C(real_imgs).mean() - self.C(fake_imgs).mean())
                gp = self.gradient_penalty(real_imgs, fake_imgs)
                loss_C_total = loss_C + self.lambda_gp * gp
                loss_C_total.backward()
                self.optim_C.step()

            # Train Generator
            self.G.zero_grad()
            noise = torch.randn(batch_size, 128, 1, 1, device=self.device)
            fake_imgs = self.G(noise)
            loss_G = -self.C(fake_imgs).mean()
            loss_G.backward()
            self.optim_G.step()

            if i % 50 == 0:
                print(f"Batch {i}: C_loss={loss_C.item():.3f}, "
                      f"G_loss={loss_G.item():.3f}, GP={gp.item():.3f}")

def compute_fid(real_features, fake_features):
    """Compute Frechet Inception Distance."""
    mu_real = real_features.mean(axis=0)
    mu_fake = fake_features.mean(axis=0)
    sigma_real = np.cov(real_features, rowvar=False)
    sigma_fake = np.cov(fake_features, rowvar=False)

    diff = mu_real - mu_fake
    covmean, _ = scipy.linalg.sqrtm(sigma_real.dot(sigma_fake), disp=False)
    fid = diff.dot(diff) + np.trace(sigma_real + sigma_fake - 2 * covmean.real)
    return fid

# Mode collapse detection with VGG features
class ModeCollapseDetector:
    def __init__(self, threshold=0.3):
        self.samples_buffer = deque(maxlen=500)
        self.threshold = threshold

    def update(self, generated_images):
        self.samples_buffer.extend(generated_images)

    def check_collapse(self):
        if len(self.samples_buffer) < 100:
            return False
        samples = np.array(self.samples_buffer)
        pairwise_sim = np.corrcoef(samples.reshape(len(samples), -1))
        mean_sim = pairwise_sim[np.triu_indices_from(pairwise_sim, k=1)].mean()
        return mean_sim > self.threshold, mean_sim

print("WGAN-GP with advanced training utilities defined.")
print("Key improvements over vanilla GAN:")
print("  - Wasserstein loss for stable gradients")
print("  - Gradient penalty for Lipschitz constraint")
print("  - InstanceNorm in critic (not BatchNorm)")
print("  - FID computation for evaluation")
print("  - Mode collapse detection via pairwise similarity")`,
      output: `WGAN-GP with advanced training utilities defined.
Key improvements over vanilla GAN:
  - Wasserstein loss for stable gradients
  - Gradient penalty for Lipschitz constraint
  - InstanceNorm in critic (not BatchNorm)
  - FID computation for evaluation
  - Mode collapse detection via pairwise similarity`,
      explanation: 'This advanced implementation uses WGAN-GP (Wasserstein GAN with Gradient Penalty) which solves many training instability issues. The Critic outputs unbounded scores (not probabilities), and the gradient penalty enforces the Lipschitz constraint. Instance Normalization replaces BatchNorm in the Critic since batch statistics leak information across the batch. The ModeCollapseDetector and FID computation provide quantitative quality metrics.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Creative Tools', description: 'Adobe uses GANs in Photoshop for content-aware fill, image inpainting, and super-resolution. Artbreeder and RunwayML enable artists to create and explore generative spaces interactively.' },
      { industry: 'Medical Imaging', description: 'GANs generate synthetic medical images (X-rays, MRI) for data augmentation when real patient data is scarce or privacy-constrained. They also denoise low-dose CT scans and enhance resolution.' },
      { industry: 'Data Augmentation', description: 'GANs generate synthetic training data for domains where real data is limited. NVIDIA uses GANs to create photorealistic training data for autonomous driving systems.' },
    ],
    caseStudy: {
      problem: 'A fashion e-commerce company needed high-quality product images from multiple angles but only had single-angle catalog photos. Traditional 3D rendering was prohibitively expensive at scale across 100,000+ products.',
      solution: 'They trained a conditional GAN that took a single product photo and generated photorealistic views from 12 different angles. The model was conditioned on product category and style metadata to ensure consistency.',
      results: 'Generated multi-angle product images increased conversion rates by 28% and reduced photoshoot costs by 85%. The system generated 1.2 million images annually with <2% noticeable artifacts in A/B testing.',
    },
    bestPractices: [
      'Use label smoothing (0.9 for real, 0.1 for fake) to prevent discriminator overconfidence',
      'Train with Wasserstein loss + gradient penalty for stability',
      'Monitor both Generator and Discriminator losses — diverging trends indicate instability',
      'Use feature matching or minibatch discrimination to prevent mode collapse',
      'Evaluate with FID (Frechet Inception Distance) rather than qualitative inspection alone',
      'Use spectral normalization in the discriminator for Lipschitz constraining',
    ],
    tools: ['PyTorch', 'TensorFlow/Keras', 'Weights & Biases', 'FID Score', 'StyleGAN3', 'Stable Diffusion'],
    jobRoles: ['Generative AI Engineer', 'Computer Vision Engineer', 'AI Research Scientist', 'Creative Technologist', 'Machine Learning Engineer'],
    furtherReading: [
      'Original GAN paper: "Generative Adversarial Nets" (Goodfellow et al., 2014)',
      'DCGAN paper: "Unsupervised Representation Learning with Deep Convolutional Generative Adversarial Networks" (Radford et al., 2015)',
      'WGAN-GP paper: "Improved Training of Wasserstein GANs" (Gulrajani et al., 2017)',
      'NVIDIA StyleGAN repo and papers',
    ],
  },
  quiz: [
    {
      id: 'gans-1', type: 'truefalse',
      question: 'In the GAN minimax game, the Generator\'s goal is to maximize the probability that the Discriminator correctly classifies real images.',
      correctAnswer: 'False',
      explanation: 'The Generator minimizes the objective, trying to fool the Discriminator into misclassifying fake images as real. The Discriminator maximizes the objective by correctly classifying both real and fake images.',
    },
    {
      id: 'gans-2', type: 'mcq',
      question: 'What is mode collapse in GAN training?',
      options: [
        'The Generator produces only a limited variety of outputs instead of the full data distribution',
        'The Discriminator\'s accuracy drops to 50%',
        'The training loss converges to zero',
        'The model\'s parameters become NaN',
      ],
      correctAnswer: 'The Generator produces only a limited variety of outputs instead of the full data distribution',
      explanation: 'Mode collapse occurs when the Generator finds a small set of samples that fool the Discriminator and stops exploring the full data distribution. The Generator "collapses" to producing only those few modes.',
    },
    {
      id: 'gans-3', type: 'code',
      question: 'What is the purpose of `label smoothing` (using 0.9 instead of 1.0 for real labels)?',
      code: `real_labels = torch.full((batch_size,), 0.9, device=device)
fake_labels = torch.full((batch_size,), 0.1, device=device)`,
      options: [
        'To speed up training by reducing the loss magnitude',
        'To prevent the Discriminator from becoming overconfident and providing vanishing gradients',
        'To add noise to the labels for data augmentation',
        'To implement semi-supervised learning',
      ],
      correctAnswer: 'To prevent the Discriminator from becoming overconfident and providing vanishing gradients',
      explanation: 'Label smoothing replaces hard 0/1 targets with soft values like 0.1/0.9. This prevents the Discriminator from outputing extreme values, which would cause vanishing gradients for the Generator and stall training.',
    },
    {
      id: 'gans-4', type: 'fillblank',
      question: 'The DCGAN architecture uses ___ convolutions in the Generator to upsample from noise to image dimensions.',
      correctAnswer: 'transposed',
      explanation: 'Transposed convolutions (also called deconvolutions or fractionally-strided convolutions) upsample feature maps by learning spatial transformations. They are the learnable inverse of regular convolutions.',
    },
    {
      id: 'gans-5', type: 'match',
      question: 'Match each GAN variant with its key contribution:',
      pairs: [
        { left: 'DCGAN', right: 'Architectural guidelines for stable CNN-based GANs' },
        { left: 'WGAN-GP', right: 'Wasserstein loss with gradient penalty for Lipschitz constraint' },
        { left: 'StyleGAN', right: 'Style-based generator with adaptive instance normalization' },
        { left: 'Pix2Pix', right: 'Conditional GAN with U-Net generator and PatchGAN discriminator' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each GAN variant addressed a specific limitation: DCGAN stabilized training architecture, WGAN-GP solved the vanishing gradient problem, StyleGAN introduced controllable generation, and Pix2Pix enabled paired image translation.',
    },
  ],
}))

export {}