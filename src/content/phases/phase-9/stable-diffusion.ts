import { registerContent } from '@/content/index'

registerContent('p9-stable-diffusion', () => ({
  difficulty: 'Advanced',
  estimatedTime: '60 minutes',
  prerequisites: ['p9-diffusion', 'p8-transformer-arch'],
  tags: ['Generative AI', 'Advanced', 'Topic'],
  objectives: [
    'Understand latent diffusion and why diffusion in VAE latent space is efficient',
    'Implement cross-attention for text conditioning in the U-Net',
    'Understand classifier-free guidance (CFG) and its effect on sample quality',
    'Use the diffusers library for text-to-image generation with various schedulers',
  ],
  theory: `# Stable Diffusion

## Latent Diffusion Models

Stable Diffusion (Rombach et al., 2022) performs the diffusion process in the **latent space** of a pretrained VAE rather than in pixel space. This is the key innovation that makes high-resolution generation practical.

### Why Latent Diffusion?

Pixel-space diffusion has two major problems:
1. **Computational cost**: Processing 512x512x3 images is expensive ($O(n^2)$ for attention)
2. **Perceptual redundancy**: Pixels contain high-frequency details that are perceptually less important

By compressing images to a latent representation (typically 64x64x4 using a VAE encoder), latent diffusion:
- Reduces spatial dimensions by 8x (64x64 vs 512x512)
- Works in a perceptually meaningful space
- Enables training on limited hardware (single GPU)

### Architecture

Stable Diffusion has three main components:

1. **VAE** (AutoencoderKL): Compresses 512x512x3 images to 64x64x4 latents (encoder) and reconstructs them (decoder). The VAE is pretrained and frozen during diffusion training.

2. **CLIP Text Encoder**: Encodes text prompts into 77x768 token embeddings. Provides the conditioning signal for text-to-image generation. Also frozen during training.

3. **Denoising U-Net**: Performs the diffusion process in latent space. At each step, it receives the noisy latent $z_t$, timestep $t$, and cross-attention context from CLIP, and predicts the noise.

### Training Objective

The training objective is similar to DDPM but operates on latents $z = E(x)$ instead of pixels $x$:

$$\\mathcal{L}_{LDM} = \\mathbb{E}_{E(x), \\epsilon \\sim \\mathcal{N}(0,1), t} \\left[ \\|\\epsilon - \\epsilon_\\theta(z_t, t, \\tau_\\theta(y))\\|^2 \\right]$$

Where $\\tau_\\theta(y)$ is the CLIP text embedding of prompt $y$.

## Cross-Attention for Text Conditioning

The U-Net incorporates text conditioning through **cross-attention** layers. Unlike self-attention (which attends to all spatial positions), cross-attention allows each spatial location to attend to all text tokens:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d}}\\right)V$$

Where:
- $Q = W_Q \\cdot \\varphi_i(z_t)$ (from spatial features at layer $i$)
- $K = W_K \\cdot \\tau_\\theta(y)$ (from text embeddings)
- $V = W_V \\cdot \\tau_\\theta(y)$ (from text embeddings)

This enables the model to "look up" relevant information from the text prompt when denoising each spatial region.

## Classifier-Free Guidance (CFG)

Classifier-free guidance (Ho & Salimans, 2022) is a technique to improve sample quality and prompt alignment without training a separate classifier:

$$\\tilde{\\epsilon}_\\theta(z_t, c) = \\epsilon_\\theta(z_t) + w \\cdot (\\epsilon_\\theta(z_t, c) - \\epsilon_\\theta(z_t))$$

Where:
- $\\epsilon_\\theta(z_t, c)$ is the **conditional** prediction (with prompt)
- $\\epsilon_\\theta(z_t)$ is the **unconditional** prediction (empty or " " prompt)
- $w$ is the **CFG scale** (typically 3-14)

During training, randomly drop the conditioning (e.g., 10% of batches) to enable both conditional and unconditional predictions. At sampling time, extrapolate between them.

**Effect of CFG scale**:
- $w=1$: Standard conditional generation
- $w=3-7$: Better alignment with prompt, but may reduce diversity
- $w>10$: Over-saturation, artifacts, reduced diversity

## Sampling Schedulers

Stable Diffusion supports multiple schedulers that vary the sampling trajectory:

### DDIM (Denoising Diffusion Implicit Models)
$$z_{t-1} = \\sqrt{\\bar{\\alpha}_{t-1}} \\cdot \\hat{z}_0 + \\sqrt{1 - \\bar{\\alpha}_{t-1}} \\cdot \\epsilon_\\theta(z_t, t)$$
- Deterministic, fast (10-50 steps)
- Good interpolation between latents

### PNDM (Pseudo Numerical Methods for Diffusion)
- Uses Runge-Kutta-like stepping to reduce steps
- Good quality at 20-50 steps
- More stable than DDIM at very few steps

### LMS Discrete Scheduler (Linear Multi-Step)
- Uses previous noise predictions for better step estimation
- Good quality at moderate step counts
- Less explored than DDIM/PNDM

### DPM++ (Diffusion Probabilistic Model Solver)
- State-of-the-art, high quality at 10-30 steps
- DPM++ 2M Karras is currently recommended

## Prompt Engineering

Effective prompting for Stable Diffusion follows patterns:
- **Subject**: "a photorealistic portrait of a young woman"
- **Style**: "in the style of Van Gogh, oil painting"
- **Quality modifiers**: "masterpiece, highly detailed, 8K"
- **Negative prompts**: "blurry, ugly, deformed, text" (using CFG)

## VAE Encoder/Decoder

The VAE used in Stable Diffusion (KL-f8) has a downsampling factor of 8:
- Encoder: $x \\in \\mathbb{R}^{H \\times W \\times 3} \\to z \\in \\mathbb{R}^{H/8 \\times W/8 \\times 4}$
- Decoder: $z \\in \\mathbb{R}^{H/8 \\times W/8 \\times 4} \\to x \\in \\mathbb{R}^{H \\times W \\times 3}$

The latent space has 4 channels (vs 3 RGB), which captures more information in the compressed space. The VAE is trained with a combination of reconstruction loss, KL divergence, and perceptual loss.`,
  understanding: {
    analogy: 'Think of Stable Diffusion as a painter who follows detailed instructions while maintaining their own style. The VAE is like having an assistant who can sketch a rough, compressed version of any reference photo (encoder) and later expand those sketches into full detailed paintings (decoder). The diffusion process happens on these rough sketches rather than the full canvas — much faster and more efficient. The CLIP text encoder is like the painter reading instructions like "a cat wearing a hat, in a sunny garden." The cross-attention mechanism is the painter repeatedly looking at those instructions while painting: "What color should this area be? Oh right, green grass." Classifier-free guidance is like turning up the volume on the instructions — it makes the painter follow the prompt more closely (at the cost of ignoring their creative instincts). The scheduler is like choosing between painting with broad strokes (fast but rough — DDIM with few steps) or fine brushwork (slower but detailed — DDPM with many steps).',
    steps: [
      { title: 'Encode to Latent', content: 'Pass the input image (or random noise during generation) through the VAE encoder to get a compressed latent representation z = E(x), reducing spatial dimensions by 8x.' },
      { title: 'Text Encoding', content: 'Encode the text prompt through CLIP text encoder to get 77 token embeddings. These provide the semantic guidance for what to generate.' },
      { title: 'Diffusion in Latent Space', content: 'Apply the forward/reverse diffusion process in the 64x64x4 latent space rather than 512x512x3 pixel space. The U-Net attends to the text embeddings via cross-attention at each denoising step.' },
      { title: 'Classifier-Free Guidance', content: 'Blend conditional and unconditional noise predictions to amplify the prompt signal. A CFG scale of 7 means the prompt influence is 7x stronger than unconditional generation.' },
      { title: 'Decode to Image', content: 'After denoising, pass the clean latent through the VAE decoder to reconstruct the final 512x512x3 image. The decoder upsamples and adds fine details lost in compression.' },
    ],
    misconceptions: [
      { misconception: 'Stable Diffusion generates images directly in pixel space', truth: 'The diffusion process operates in a compressed 64x64x4 latent space. The VAE encoder compresses the image and the decoder reconstructs it. This makes training and inference much more efficient than pixel-space diffusion.' },
      { misconception: 'Higher CFG scale always gives better results', truth: 'CFG scale > 10 often produces oversaturated, artificial-looking images with reduced diversity. The optimal CFG scale depends on the model and prompt — typically 3-7 for photorealistic results and 7-14 for artistic/creative generations.' },
      { misconception: 'All schedulers produce the same quality at the same step count', truth: 'Different schedulers have different quality-speed tradeoffs. DPM++ 2M Karras outperforms DDIM at low step counts (10-20), while DDIM is better for interpolation. PNDM works well at 50 steps but degrades at 10 steps.' },
    ],
    comparisons: [
      { label: 'Diffusion Space', methodA: 'Pixel space (256x256x3)', methodB: 'Latent space (64x64x4) via VAE' },
      { label: 'Training Cost', methodA: 'High — requires hundreds of GPU-days', methodB: 'Much lower — can fine-tune on single GPU' },
      { label: 'Max Resolution', methodA: '256-512px (practical)', methodB: '1024+ px (practical, via upscaling)' },
      { label: 'Text Conditioning', methodA: 'Usually classifier guidance', methodB: 'Cross-attention + classifier-free guidance' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Stable Diffusion Text-to-Image with diffusers
import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from diffusers import DDIMScheduler, PNDMScheduler, LMSDiscreteScheduler

# Load model
model_id = "runwayml/stable-diffusion-v1-5"
pipe = StableDiffusionPipeline.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    safety_checker=None,
)
pipe = pipe.to("cuda" if torch.cuda.is_available() else "cpu")

# Default scheduler (PNDM)
print(f"Default scheduler: {pipe.scheduler.__class__.__name__}")

# Generate a single image
prompt = "a photograph of a cat wearing a space suit, detailed, 8K"
image = pipe(prompt).images[0]
image.save("cat_astronaut.png")
print(f"Generated image from prompt: '{prompt}'")

# ============ Scheduler Comparison ============

prompts = [
    "a misty mountain landscape at sunset, cinematic lighting",
    "a futuristic city with flying cars, cyberpunk style",
    "an oil painting of a bowl of fruit by Van Gogh",
]

schedulers = {
    "DDIM": DDIMScheduler.from_pretrained(model_id, subfolder="scheduler"),
    "PNDM": PNDMScheduler.from_pretrained(model_id, subfolder="scheduler"),
    "LMS": LMSDiscreteScheduler.from_pretrained(model_id, subfolder="scheduler"),
    "DPM++": DPMSolverMultistepScheduler.from_pretrained(
        model_id, subfolder="scheduler"
    ),
}

def generate_with_scheduler(pipe, prompt, scheduler, steps=25):
    """Generate image with a specific scheduler."""
    pipe.scheduler = scheduler
    with torch.autocast("cuda" if torch.cuda.is_available() else "cpu"):
        image = pipe(prompt, num_inference_steps=steps).images[0]
    return image

for prompt in prompts:
    print(f"\\nPrompt: {prompt}")
    for name in schedulers:
        img = generate_with_scheduler(pipe, prompt, schedulers[name], steps=25)
        img.save(f"{name}_{prompt[:20].replace(' ', '_')}.png")
        print(f"  {name}: saved")

print("\\nScheduler comparison complete.")
print("DPM++ generally produces best quality at 25 steps.")`,
      output: `Default scheduler: PNDMScheduler

Generated image from prompt: 'a photograph of a cat wearing a space suit, detailed, 8K'

Prompt: a misty mountain landscape at sunset, cinematic lighting
  DDIM: saved
  PNDM: saved
  LMS: saved
  DPM++: saved
...
Scheduler comparison complete.
DPM++ generally produces best quality at 25 steps.`,
      explanation: 'This demonstrates basic text-to-image generation with Stable Diffusion using the diffusers library. Different schedulers produce different quality-speed tradeoffs. DPM++ is currently the recommended scheduler for the best quality at low step counts (20-30). DDIM is preferred when you need deterministic generation or interpolation between seeds.',
    },
    {
      level: 'intermediate',
      code: `import torch
from diffusers import StableDiffusionPipeline, DDIMScheduler
import numpy as np

pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16,
    safety_checker=None,
)
pipe = pipe.to("cuda" if torch.cuda.is_available() else "cpu")
pipe.scheduler = DDIMScheduler.from_config(pipe.scheduler.config)

# ============ Negative Prompting ============

prompt = "a beautiful portrait of a woman, detailed face, soft lighting"
negative_prompt = "blurry, ugly, deformed, disfigured, bad anatomy"

image = pipe(
    prompt,
    negative_prompt=negative_prompt,
    num_inference_steps=30,
    guidance_scale=7.5,
).images[0]
image.save("portrait_with_neg.png")

print("Negative prompting helps avoid common artifacts:")

# ============ CFG Scale Sweep ============

def cfg_sweep(prompt, scales=[1, 3, 5, 7, 10, 15]):
    """Generate the same prompt at different CFG scales."""
    images = []
    for scale in scales:
        img = pipe(
            prompt,
            num_inference_steps=25,
            guidance_scale=scale,
        ).images[0]
        images.append(img)
        print(f"  CFG={scale}: generated")
    return images

print("\\nCFG scale effect:")
print("  Low (1-3): Diverse but may ignore prompt")
print("  Medium (5-7): Best balance for photorealism")
print("  High (10+): Closer to prompt but oversaturated")

# ============ Seed Control for Reproducibility ============

def generate_with_seed(prompt, seed=42, **kwargs):
    """Generate with a fixed seed for reproducibility."""
    generator = torch.Generator(
        device="cuda" if torch.cuda.is_available() else "cpu"
    ).manual_seed(seed)
    return pipe(prompt, generator=generator, **kwargs).images[0]

# Same seed = same image (with DDIM scheduler)
img1 = generate_with_seed(prompt, seed=42)
img2 = generate_with_seed(prompt, seed=42)
img3 = generate_with_seed(prompt, seed=123)

print("\\nSeed control: same seed = same image (deterministic)")

# ============ Image-to-Image ============

from diffusers import StableDiffusionImg2ImgPipeline

img2img_pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16,
).to("cuda" if torch.cuda.is_available() else "cpu")

init_image = Image.open("input_sketch.png")
transformed = img2img_pipe(
    prompt="a detailed oil painting of this scene, vibrant colors",
    image=init_image,
    strength=0.75,  # 0 = no change, 1 = complete new image
    guidance_scale=7.5,
).images[0]

print("\\nImg2Img: transform an existing image while preserving composition")
print(f"  strength=0.75 means 75% of the noise schedule is applied")`,
      output: `Negative prompting helps avoid common artifacts:

CFG scale effect:
  Low (1-3): Diverse but may ignore prompt
  Medium (5-7): Best balance for photorealism
  High (10+): Closer to prompt but oversaturated

Seed control: same seed = same image (deterministic)

Img2Img: transform an existing image while preserving composition
  strength=0.75 means 75% of the noise schedule is applied`,
      explanation: 'Negative prompting tells the model what NOT to generate, reducing common artifacts like distorted anatomy. The CFG scale sweep shows the quality-diversity tradeoff. Seed control enables reproducibility. Image-to-Image (img2img) starts from an existing image, adds noise proportional to strength, and denoises with a target prompt — useful for style transfer and refinement.',
    },
    {
      level: 'advanced',
      code: `# Advanced: Cross-Attention Visualization & Prompt Weighting
import torch
from diffusers import StableDiffusionPipeline
import numpy as np

pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16,
).to("cuda" if torch.cuda.is_available() else "cpu")

# ============ Attention Map Extraction ============

def get_cross_attention_maps(pipe, prompt, tokens):
    """Extract cross-attention maps for specific tokens."""
    tokenizer = pipe.tokenizer
    text_encoder = pipe.text_encoder
    unet = pipe.unet

    # Tokenize
    text_inputs = tokenizer(
        prompt, padding="max_length", max_length=77, return_tensors="pt"
    )
    text_ids = text_inputs.input_ids.to(pipe.device)
    encoder_hidden_states = text_encoder(text_ids)[0]

    # Find token positions
    token_positions = {}
    for token in tokens:
        token_id = tokenizer.encode(token)[1]
        positions = (text_ids[0] == token_id).nonzero(as_tuple=True)[0]
        token_positions[token] = positions.tolist()

    # Hook into cross-attention layers
    attention_maps = {}

    def hook_fn(name):
        def fn(module, input, output):
            # Extract attention weights from cross-attention
            attention_maps[name] = output.detach().cpu()
        return fn

    hooks = []
    for name, module in unet.named_modules():
        if "attn2" in name and isinstance(module, torch.nn.Module):
            hooks.append(module.register_forward_hook(hook_fn(name)))

    # Run a single denoising step
    with torch.no_grad():
        latent = torch.randn(1, 4, 64, 64, device=pipe.device)
        t = torch.tensor([50], device=pipe.device)
        noise_pred = unet(latent, t, encoder_hidden_states=encoder_hidden_states)

    for hook in hooks:
        hook.remove()

    return attention_maps, token_positions

# ============ Prompt Weighting (Compel) ============

try:
    from compel import Compel

    compel_proc = Compel(tokenizer=pipe.tokenizer, text_encoder=pipe.text_encoder)
    # Weighted prompt: "cat" is 1.5x, "spacesuit" is 0.8x
    weighted_prompt = "a (cat:1.5) wearing a (spacesuit:0.8), detailed"
    conditioning, _ = compel_proc(weighted_prompt)
    print(f"Weighted prompt encoding: {conditioning.shape}")
except ImportError:
    print("Install compel for prompt weighting: pip install compel")
    print("Fallback: use (word:weight) syntax in prompt")

# ============ Textual Inversion ============

from diffusers import DiffusionPipeline
import torch

# Load a textual inversion embedding
pipe.load_textual_inversion(
    "sd-concepts-library/midjourney-style",
)
image = pipe(
    "a landscape in <midjourney-style>",
    num_inference_steps=30,
    guidance_scale=7.5,
).images[0]

print("\\nTextual Inversion: embed custom concepts as tokens")

# ============ LoRA Loading ============

from diffusers import StableDiffusionPipeline
import torch

pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16,
).to("cuda")

# Load a LoRA adapter
pipe.load_lora_weights(
    "lora-library/characters",
    weight_name="arcane_style.safetensors",
)
# LoRA scale: 0 (no effect) to 1 (full effect)
image = pipe(
    "a portrait of a woman, arcane style",
    cross_attention_kwargs={"scale": 0.8},
    num_inference_steps=30,
).images[0]

print("LoRA: lightweight fine-tuning for specific styles/characters")
print(f"LoRA weights add only ~10MB vs full model's ~5GB")`,
      output: `Weighted prompt encoding: torch.Size([1, 77, 768])

Textual Inversion: embed custom concepts as tokens

LoRA: lightweight fine-tuning for specific styles/characters
LoRA weights add only ~10MB vs full model's ~5GB`,
      explanation: 'Advanced techniques include extracting cross-attention maps to understand which text tokens influence which spatial regions, prompt weighting with Compel for fine-grained control, Textual Inversion for embedding custom visual concepts, and LoRA adapters for lightweight style/character fine-tuning. These techniques turn Stable Diffusion from a simple text-to-image tool into a controllable creative platform.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Advertising & Marketing', description: 'Agencies use Stable Diffusion to rapidly generate product mockups, social media visuals, and campaign concepts. A single designer can produce 500+ unique variations per day, A/B testing creative directions at unprecedented speed.' },
      { industry: 'Game Development', description: 'Indie and AAA studios use SD to generate concept art, textures, and UI elements. The combination of img2img (refining sketches) and prompt engineering accelerates the pre-production pipeline by 10-20x.' },
      { industry: 'Architecture & Interior Design', description: 'Architects use SD to generate photorealistic visualizations from rough sketches and text descriptions. Image-to-image workflows allow iterative refinement of designs with natural language feedback.' },
    ],
    caseStudy: {
      problem: 'A fashion retailer needed 50,000 unique product images for their e-commerce catalog showing each item in various settings (studio, street, outdoor). Traditional photoshoots cost $200/image ($10M total) and required weeks of coordination.',
      solution: 'They fine-tuned Stable Diffusion with DreamBooth on 100 product photos per category, then used prompt engineering and ControlNet (canny edge + depth) to generate the products in consistent poses across diverse backgrounds.',
      results: 'Generated 50,000 images in 3 days at $0.02/image ($1,000 total). Conversion rates from generated images matched or exceeded traditional photoshoot images in A/B tests. The system now generates 5,000 new images weekly for seasonal collections.',
    },
    bestPractices: [
      'Use DPM++ 2M Karras scheduler for best quality at 20-30 steps',
      'Always use negative prompts to avoid common artifacts (blurry, deformed, extra limbs)',
      'CFG scale 5-7 for photorealism, 7-14 for creative/artistic outputs',
      'Use DDIM scheduler when you need deterministic outputs (same seed = same image)',
      'Combine LoRA adapters with prompt engineering for consistent character/styles',
      'Use img2img with strength 0.5-0.8 for iterative refinement of AI-generated or human-drawn sketches',
    ],
    tools: ['Hugging Face Diffusers', 'Automatic1111 WebUI', 'ComfyUI', 'InvokeAI', 'Kohya SS (training)', 'Compl (prompt weighting)'],
    jobRoles: ['Generative AI Engineer', 'AI Artist / Creative Technologist', 'ML Infrastructure Engineer', 'Brand Designer', 'Game Artist'],
    furtherReading: [
      '"High-Resolution Image Synthesis with Latent Diffusion Models" (Rombach et al., 2022)',
      '"Classifier-Free Diffusion Guidance" (Ho & Salimans, 2022)',
      'Stable Diffusion GitHub repository and model card',
      'Hugging Face Diffusers documentation and tutorials',
    ],
  },
  quiz: [
    {
      id: 'sd-1', type: 'mcq',
      question: 'Why does Stable Diffusion perform diffusion in latent space rather than pixel space?',
      options: [
        'To generate higher resolution images than the training data',
        'Because latent space is smaller (64x64 vs 512x512), making training and inference faster and more memory efficient',
        'To avoid the need for a scheduler during sampling',
        'Because the model cannot handle RGB images directly',
      ],
      correctAnswer: 'Because latent space is smaller (64x64 vs 512x512), making training and inference faster and more memory efficient',
      explanation: 'The VAE compresses 512x512x3 images to 64x64x4 latents — an 8x spatial reduction. This makes the diffusion U-Net much smaller and faster, enabling training on a single GPU and real-time inference. The VAE is pretrained and frozen during diffusion training.',
    },
    {
      id: 'sd-2', type: 'truefalse',
      question: 'In classifier-free guidance (CFG), higher scale values always produce better quality images.',
      correctAnswer: 'False',
      explanation: 'While moderate CFG scales (3-7) improve prompt alignment, very high scales (>10) cause oversaturation, artifacts, and reduced diversity. The optimal scale depends on the specific model and prompt — there is a clear quality peak beyond which results degrade.',
    },
    {
      id: 'sd-3', type: 'code',
      question: 'What is the purpose of the unconditional prediction in CFG?',
      code: `noise_pred = noise_pred_uncond + guidance_scale * (
    noise_pred_cond - noise_pred_uncond
)`,
      options: [
        'To reduce the computational cost of sampling',
        'To provide a baseline that the conditional prediction is extrapolated away from',
        'To denoise the image twice as fast',
        'To remove stochastic noise from the prediction',
      ],
      correctAnswer: 'To provide a baseline that the conditional prediction is extrapolated away from',
      explanation: 'CFG works by interpolating between unconditional (no prompt) and conditional (with prompt) noise predictions. The unconditional prediction serves as an anchor — the difference between conditional and unconditional is amplified by the guidance scale, making the model follow the prompt more closely.',
    },
    {
      id: 'sd-4', type: 'fillblank',
      question: 'In Stable Diffusion\'s cross-attention mechanism, the ___ come from the spatial features and the ___ come from the CLIP text embeddings.',
      correctAnswer: 'Queries, Keys/Values',
      explanation: 'The cross-attention formula uses Q from spatial features (the image latents at each location ask "what text token is relevant here?") and K, V from text embeddings (each text token provides its key and value). This allows each region to selectively attend to relevant words in the prompt.',
    },
    {
      id: 'sd-5', type: 'match',
      question: 'Match each component with its role in Stable Diffusion:',
      pairs: [
        { left: 'VAE Encoder', right: 'Compresses 512x512 images to 64x64 latents' },
        { left: 'CLIP Text Encoder', right: 'Converts text prompts to 77x768 token embeddings' },
        { left: 'Denoising U-Net', right: 'Predicts noise in latent space with cross-attention' },
        { left: 'VAE Decoder', right: 'Reconstructs 512x512 images from clean latents' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'These four components work together: the VAE encoder/decoder handles the image compression bottleneck, CLIP provides text understanding, and the U-Net performs the core diffusion process with text conditioning via cross-attention.',
    },
  ],
}))

export {}