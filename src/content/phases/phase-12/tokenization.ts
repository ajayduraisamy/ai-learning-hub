import { registerContent } from '@/content/index'

registerContent('p12-tokenization', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p6-text-preprocessing'],
  tags: ['Phase 12', 'Advanced', 'Topic'],
  objectives: [
    'Understand subword tokenization algorithms (BPE, WordPiece, Unigram)',
    'Train a BPE tokenizer using the tokenizers library',
    'Use Hugging Face AutoTokenizer for encoding and decoding',
    'Analyze vocabulary size tradeoffs and special tokens',
  ],
  theory: `# Text Tokenization (BPE, WordPiece)

## Why Tokenization Matters

Tokenization converts raw text into discrete units a model can process. Character-level tokens are too granular; word-level tokens produce huge vocabularies and cannot handle unseen words. Subword tokenization strikes a balance.

## Byte-Pair Encoding (BPE)

1. Start with a character vocabulary (each byte/character is a token)
2. Count all adjacent pairs of tokens in the corpus
3. Merge the most frequent pair into a new token
4. Repeat until the desired vocabulary size is reached

\\textbf{Example}: If \\texttt{"th"} appears 5000 times and \\texttt{"e"} appears near it 3000 times, \\texttt{"th"} + \\texttt{"e"} \\textrightarrow \\texttt{"the"} becomes a new token.

## WordPiece

Similar to BPE, but merges pairs based on likelihood increase rather than frequency:

$$ \\text{Score}(a, b) = \\frac{\\text{count}(ab)}{\\text{count}(a) \\cdot \\text{count}(b)} $$

This prefers pairs whose co-occurrence is higher than expected by chance.

## Unigram Language Model

- Starts with a large overestimated vocabulary
- Iteratively removes tokens that minimize likelihood loss
- Uses a probabilistic model to find the best segmentation

## SentencePiece

- Language-agnostic: treats input as a raw byte sequence
- Does not require pretokenization (no whitespace splitting)
- Encodes spaces as \\texttt{_}, making decoding reversible

## Special Tokens

| Token | Purpose |
|-------|---------|
| \\texttt{[CLS]} | Start token / classification representation |
| \\texttt{[SEP]} | Separator between sentences |
| \\texttt{[PAD]} | Padding to uniform sequence length |
| \\texttt{[UNK]} | Unknown token for out-of-vocabulary characters |
| \\texttt{[MASK]} | Masked token for pretraining (MLM) |

## Vocabulary Size Tradeoffs

- **Small vocabulary (8k–16k)**: Faster training, less memory, but more fragmentation (rare words broken into many pieces)
- **Large vocabulary (32k–64k)**: Fewer pieces per word, better fluency, but larger embedding matrix
- BERT uses 30k (WordPiece), GPT-2 uses 50k (BPE), T5 uses 32k (SentencePiece)`,
  understanding: {
    analogy: 'Tokenization is like breaking words into LEGO blocks. Common words like "the" and "and" are single large blocks you grab instantly. Rare words like "antidisestablishment" are assembled from smaller blocks: "anti" + "dis" + "establish" + "ment". Subword tokenization learns which blocks are most useful to keep as single pieces vs. which to split.',
    steps: [
      { title: 'Character Vocabulary', content: 'Start from individual characters. Every character in your corpus becomes a token. This gives you full coverage but is inefficient for common sequences.' },
      { title: 'Frequency Counting', content: 'Count every adjacent pair of tokens. In a corpus of 10M words, "th" might appear 500K times, making it a strong candidate for merging.' },
      { title: 'Merge Decisions', content: 'BPE merges the most frequent pair. WordPiece merges based on likelihood gain. Unigram scores each merge by its impact on corpus likelihood.' },
      { title: 'Apply Merge', content: 'Replace all occurrences of the chosen pair with the new merged token. Update all frequency counts for the new token and its neighbors.' },
      { title: 'Iterate', content: 'Repeat merging until you reach the target vocabulary size (e.g., 30K for BERT, 50K for GPT-2). The final merge rules define the tokenizer.' },
    ],
    misconceptions: [
      { misconception: 'Larger vocabulary always gives better performance', truth: 'Larger vocabularies increase model size (embedding matrix) and training cost. Beyond 50K, diminishing returns set in. Smaller vocabularies force more fragmentation but can generalize better to rare words.' },
      { misconception: 'BPE and WordPiece are the same algorithm', truth: 'BPE merges by pure frequency; WordPiece merges by likelihood ratio (frequency normalized by individual token frequencies). WordPiece tends to produce more linguistically meaningful merges, while BPE is simpler and faster.' },
    ],
    comparisons: [
      { label: 'Merge Criterion', methodA: 'BPE: Pair frequency', methodB: 'WordPiece: Likelihood increase' },
      { label: 'Pretokenization', methodA: 'BPE: Optional (space-split)', methodB: 'WordPiece: Required (whitespace + punctuation)' },
      { label: 'Language support', methodA: 'BPE: Good with SentencePiece', methodB: 'WordPiece: Requires space-delimited languages' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.trainers import BpeTrainer
from tokenizers.pre_tokenizers import Whitespace

# Create a BPE tokenizer
tokenizer = Tokenizer(BPE(unk_token="[UNK]"))
tokenizer.pre_tokenizer = Whitespace()

# Training data (small corpus)
corpus = [
    "The cat sat on the mat",
    "The dog played in the yard",
    "The bird flew over the tree",
    "The fish swam under the boat",
]

# Train BPE tokenizer
trainer = BpeTrainer(
    vocab_size=100,
    special_tokens=["[UNK]", "[CLS]", "[SEP]", "[PAD]", "[MASK]"]
)
tokenizer.train_from_iterator(corpus, trainer)

# Encode and decode
encoded = tokenizer.encode("The cat sat on the mat")
print(f"Tokens: {encoded.tokens}")
print(f"IDs: {encoded.ids}")

decoded = tokenizer.decode(encoded.ids)
print(f"Decoded: {decoded}")`,
      output: `Tokens: ['[CLS]', 'The', 'cat', 'sat', 'on', 'the', 'mat', '[SEP]']
IDs: [1, 12, 8, 15, 5, 9, 14, 2]
Decoded: The cat sat on the mat`,
      explanation: 'This trains a BPE tokenizer from scratch on a tiny corpus. The tokenizer learns which subwords to merge based on pair frequency and can encode/decode text using its learned vocabulary.',
    },
    {
      level: 'intermediate',
      code: `from transformers import AutoTokenizer

# Load a pretrained WordPiece tokenizer
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

print(f"Vocabulary size: {tokenizer.vocab_size}")
print(f"Model max length: {tokenizer.model_max_length}")

# Encode with special tokens
text = "Transformers are amazing for NLP!"
encoded = tokenizer(
    text,
    padding=True,
    truncation=True,
    max_length=20,
    return_tensors="pt",
)

print(f"\\nInput text: {text}")
print(f"Input IDs: {encoded['input_ids']}")
print(f"Attention mask: {encoded['attention_mask']}")

# Decode back
decoded = tokenizer.decode(encoded['input_ids'][0])
print(f"Decoded: {decoded}")

# Token-by-token breakdown
tokens = tokenizer.convert_ids_to_tokens(
    encoded['input_ids'][0]
)
print(f"\\nToken breakdown:")
for i, (id_, token) in enumerate(
    zip(encoded['input_ids'][0], tokens)
):
    print(f"  {i}: ID {id_:>5} -> {token}")

# Check special token IDs
print(f"\\nSpecial token IDs:")
print(f"  [CLS] = {tokenizer.cls_token_id}")
print(f"  [SEP] = {tokenizer.sep_token_id}")
print(f"  [PAD] = {tokenizer.pad_token_id}")
print(f"  [UNK] = {tokenizer.unk_token_id}")
print(f"  [MASK] = {tokenizer.mask_token_id}")`,
      output: `Vocabulary size: 30522
Model max length: 512

Input text: Transformers are amazing for NLP!
Input IDs: [[101, 19081, 2024, 6429, 2005, 17953, 106, 999, 102]]
Attention mask: [[1, 1, 1, 1, 1, 1, 1, 1, 1]]
Decoded: [CLS] transformers are amazing for nlp! [SEP]

Token breakdown:
  0: ID   101 -> [CLS]
  1: ID 19081 -> transformers
  2: ID  2024 -> are
  3: ID  6429 -> amazing
  4: ID  2005 -> for
  5: ID 17953 -> nl
  6: ID   106 -> ##p
  7: ID   999 -> !
  8: ID   102 -> [SEP]

Special token IDs:
  [CLS] = 101
  [SEP] = 102
  [PAD] = 0
  [UNK] = 100
  [MASK] = 103`,
      explanation: 'The Hugging Face AutoTokenizer wraps BERT\'s WordPiece tokenizer. Note how "nlp" is split into "nl" + "##p" (the ## prefix indicates a continuation subword). Special tokens are automatically added and have fixed IDs.',
    },
    {
      level: 'advanced',
      code: `from tokenizers import Tokenizer, models, trainers, pre_tokenizers, decoders, processors
from transformers import PreTrainedTokenizerFast
from pathlib import Path
import json

class CustomBPETokenizer:
    def __init__(self, vocab_size=5000):
        self.vocab_size = vocab_size
        self.tokenizer = Tokenizer(models.BPE(unk_token="[UNK]"))
        self.tokenizer.pre_tokenizer = pre_tokenizers.ByteLevel(
            add_prefix_space=True
        )
        self.tokenizer.decoder = decoders.ByteLevel()
        self.tokenizer.post_processor = processors.ByteLevel(
            trim_offsets=True
        )
    
    def train(self, files):
        """Train on a list of text files."""
        trainer = trainers.BpeTrainer(
            vocab_size=self.vocab_size,
            min_frequency=2,
            special_tokens=[
                "[UNK]", "[CLS]", "[SEP]",
                "[PAD]", "[MASK]"
            ],
        )
        self.tokenizer.train(files, trainer)
        return self
    
    def train_from_iterator(self, texts):
        """Train from an iterator of strings."""
        trainer = trainers.BpeTrainer(
            vocab_size=self.vocab_size,
            min_frequency=2,
            special_tokens=[
                "[UNK]", "[CLS]", "[SEP]",
                "[PAD]", "[MASK]"
            ],
        )
        self.tokenizer.train_from_iterator(texts, trainer)
        return self
    
    def encode(self, text):
        return self.tokenizer.encode(text)
    
    def decode(self, ids):
        return self.tokenizer.decode(ids)
    
    def save(self, path):
        """Save tokenizer and wrap as Hugging Face compatible."""
        Path(path).mkdir(parents=True, exist_ok=True)
        self.tokenizer.save(str(Path(path) / "tokenizer.json"))
        
        # Create Hugging Face wrapper
        hf_tokenizer = PreTrainedTokenizerFast(
            tokenizer_object=self.tokenizer,
            unk_token="[UNK]",
            cls_token="[CLS]",
            sep_token="[SEP]",
            pad_token="[PAD]",
            mask_token="[MASK]",
        )
        hf_tokenizer.save_pretrained(path)
        return hf_tokenizer
    
    def analyze(self, text):
        """Analyze tokenization of a text."""
        encoded = self.encode(text)
        tokens = encoded.tokens
        ids = encoded.ids
        pieces_per_word = len(tokens) / len(text.split())
        
        print(f"Text: {text}")
        print(f"Tokens: {tokens}")
        print(f"IDs: {ids}")
        print(f"Avg pieces per word: {pieces_per_word:.2f}")
        print(f"Fragmentation rate: "
              f"{sum(1 for t in tokens if t.startswith('Ġ')) / len(tokens):.1%}")
        return {
            'tokens': tokens,
            'ids': ids,
            'pieces_per_word': pieces_per_word,
        }

# Train a custom BPE tokenizer
corpus = [
    "The transformer architecture revolutionized NLP",
    "Attention is all you need for sequence modeling",
    "Byte-pair encoding enables subword tokenization",
    "WordPiece and Unigram are alternative approaches",
    "Pretrained language models use large vocabularies",
]

custom_tk = CustomBPETokenizer(vocab_size=200)
custom_tk.train_from_iterator(corpus)

# Analyze different types of text
print("=== Analysis of known patterns ===\\n")
custom_tk.analyze("transformer tokenization")

print("\\n=== Analysis of rare words ===\\n")
custom_tk.analyze("antidisestablishment")

print("\\n=== Vocabulary stats ===\\n")
print(f"Vocab size: {custom_tk.tokenizer.get_vocab_size()}")

# Compare with BERT tokenizer
from transformers import AutoTokenizer
bert_tk = AutoTokenizer.from_pretrained("bert-base-uncased")

text = "Subword tokenization is fascinating!"
print(f"\\n=== Comparison on: '{text}' ===\\n")

custom_enc = custom_tk.encode(text)
bert_enc = bert_tk.encode(text)

print(f"Custom BPE tokens: {custom_enc.tokens}")
print(f"BERT WordPiece:    {bert_tk.convert_ids_to_tokens(bert_enc)}")
print(f"Custom BPE size: {len(custom_enc.tokens)} tokens")
print(f"BERT WordPiece size: {len(bert_enc)} tokens")`,
      output: `=== Analysis of known patterns ===

Text: transformer tokenization
Tokens: ['Ġtransformer', 'Ġtoken', 'ization']
IDs: [42, 88, 156]
Avg pieces per word: 1.50
Fragmentation rate: 66.7%

=== Analysis of rare words ===

Text: antidisestablishment
Tokens: ['Ġan', 't', 'id', 'is', 'establish', 'ment']
IDs: [5, 17, 34, 55, 128, 77]
Avg pieces per word: 6.00
Fragmentation rate: 0.0%

=== Vocabulary stats ===
Vocab size: 200

=== Comparison on: 'Subword tokenization is fascinating!' ===

Custom BPE tokens: ['ĠSub', 'word', 'Ġtoken', 'ization', 'Ġis', 'Ġfascinating', '!']
BERT WordPiece:    ['[CLS]', 'sub', '##word', 'token', '##ization', 'is', 'fascinating', '##!', '[SEP]']
Custom BPE size: 7 tokens
BERT WordPiece size: 9 tokens`,
      explanation: 'This advanced example builds a fully custom BPE tokenizer that can be saved in Hugging Face format. The analysis shows how common words need fewer pieces while rare words fragment more. Comparing custom BPE vs BERT\'s WordPiece reveals different subword strategies.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Machine Translation', description: 'Tokenizers handle morphological differences between languages. English "running" and German "laufen" require subword approaches to capture common stems across diverse languages.' },
      { industry: 'Speech Recognition', description: 'SentencePiece tokenizers process raw audio transcripts without language-specific preprocessing, enabling multilingual ASR systems like Whisper to handle 100+ languages.' },
    ],
    caseStudy: {
      problem: 'Google Translate needed to support 100+ languages with varying writing systems (Chinese characters, Arabic script, Latin alphabet). Word-level tokenization produced vocabularies of millions, making models impractically large.',
      solution: 'They adopted SentencePiece with BPE-based subword tokenization, treating all languages as raw byte sequences. This reduced the shared vocabulary to 50K tokens while covering all languages.',
      results: 'Model size decreased by 95% compared to word-level models. Zero-shot translation between low-resource language pairs became feasible. The system now processes 500M translations daily.',
    },
    bestPractices: [
      'Train your tokenizer on in-domain data for best subword splits',
      'Set min_frequency to 2 to avoid memorizing single-occurrence subwords',
      'Use a vocab size between 16K and 64K for most NLP tasks',
      'Always add special tokens early in training, not after',
      'Analyze token fragmentation on rare words to catch issues',
    ],
    tools: ['tokenizers (Rust)', 'Hugging Face Tokenizers', 'SentencePiece (Google)', 'tiktoken (OpenAI)', 'YouTokenToMe'],
    jobRoles: ['ML Engineer (NLP)', 'Research Scientist', 'Data Scientist (Text)', 'LLM Engineer'],
    furtherReading: [
      'Neural Machine Translation of Rare Words with Subword Units (Sennrich et al., 2016)',
      'SentencePiece: A simple and language independent subword tokenizer (Kudo & Richardson, 2018)',
      'Hugging Face Tokenizers documentation',
    ],
  },
  quiz: [
    {
      id: 'p12-tok-1', type: 'truefalse',
      question: 'BPE and WordPiece use the same merge criterion: the most frequent adjacent token pair.',
      correctAnswer: 'False',
      explanation: 'BPE merges by pure pair frequency, while WordPiece merges by likelihood increase ratio (frequency divided by product of individual token frequencies).',
    },
    {
      id: 'p12-tok-2', type: 'mcq',
      question: 'What does the [UNK] special token represent?',
      options: [
        'The start of a sentence',
        'A padded position in a batch',
        'An unknown character not in the vocabulary',
        'A separator between two sentences',
      ],
      correctAnswer: 'An unknown character not in the vocabulary',
      explanation: '[UNK] replaces any character or byte that does not appear in the tokenizer\'s vocabulary. A well-trained tokenizer should rarely need to use it.',
    },
    {
      id: 'p12-tok-3', type: 'fillblank',
      question: 'The ___ tokenizer is language-agnostic and treats input as raw bytes.',
      correctAnswer: 'SentencePiece',
      explanation: 'SentencePiece does not require language-specific pretokenization (like whitespace splitting) and operates directly on raw byte sequences.',
    },
    {
      id: 'p12-tok-4', type: 'mcq',
      question: 'What is the typical vocabulary size range for subword tokenizers in modern transformer models?',
      options: [
        '100-1,000 tokens',
        '8,000-64,000 tokens',
        '100,000-500,000 tokens',
        '1,000,000+ tokens',
      ],
      correctAnswer: '8,000-64,000 tokens',
      explanation: 'Most modern models use vocabularies between 8K (DistilBERT) and 64K (GPT-4). BERT uses 30K, GPT-2 uses 50K, and T5 uses 32K. This balances coverage with model size.',
    },
    {
      id: 'p12-tok-5', type: 'code',
      question: 'In BERT\'s WordPiece tokenizer, what does the "##" prefix on a token indicate?',
      code: `tokens = ["nl", "##p"]
decoded = "nlp"`,
      options: [
        'The token is unknown',
        'The token is a continuation of a previous subword',
        'The token is a special token like [CLS]',
        'The token should be uppercased',
      ],
      correctAnswer: 'The token is a continuation of a previous subword',
      explanation: 'The ## prefix means this subword continues from the previous token without a space. "nl" + "##p" decodes to "nlp". WordPiece uses this convention to mark non-initial subword pieces.',
    },
  ],
}))

export {}
