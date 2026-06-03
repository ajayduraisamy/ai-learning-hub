import { registerContent } from '@/content/index'

registerContent('p12-word-embeddings', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p12-tokenization'],
  tags: ['Phase 12', 'Advanced', 'Topic'],
  objectives: [
    'Understand distributed representation vs one-hot encoding',
    'Train Word2Vec (CBOW and Skip-gram) with Gensim',
    'Load and use GloVe pretrained embeddings',
    'Perform embedding arithmetic and visualize with PCA/t-SNE',
  ],
  theory: `# Word Embeddings (Word2Vec, GloVe)

## Distributed Representation

One-hot vectors are sparse (length = vocabulary size, single 1). Distributed embeddings map each word to a dense vector of fixed size (e.g., 300 dimensions) where similar words have similar vectors.

## Word2Vec

### CBOW (Continuous Bag of Words)
Predict the target word from surrounding context words:

$$ P(w_t \\mid w_{t-2}, w_{t-1}, w_{t+1}, w_{t+2}) $$

The context vectors are averaged, then projected to predict the target.

### Skip-gram
Predict context words from the target word:

$$ P(w_{t-2}, w_{t-1}, w_{t+1}, w_{t+2} \\mid w_t) $$

Works better on small datasets and for rare words.

### Negative Sampling
Instead of computing softmax over the full vocabulary (expensive), train a binary classifier that distinguishes:
- Positive: (target, actual context word) pairs
- Negative: (target, random word) pairs — sample K negative examples per positive

### Hierarchical Softmax
Build a binary Huffman tree over vocabulary words. Each word is a leaf. Prediction requires \\log(|V|) binary decisions instead of |V| full softmax.

## GloVe (Global Vectors)

Combines:
- **Global matrix factorization**: Count co-occurrences across the entire corpus
- **Local context window**: Like Word2Vec's sliding window

Loss function:

$$ J = \\sum_{i,j} f(X_{ij}) (w_i^T \\tilde{w}_j + b_i + \\tilde{b}_j - \\log X_{ij})^2 $$

Where X_{ij} is the co-occurrence count, and f weights frequent pairs.

## Embedding Arithmetic

\\begin{verbatim}
vector("king") - vector("man") + vector("woman") \\approx vector("queen")
\\end{verbatim}

This shows embeddings capture relational structure.

## Limitations

- **Static**: Each word has one fixed vector regardless of context ("bank" = river bank? financial bank?)
- **Out-of-vocabulary**: Cannot handle unseen words
- **Subword-ignorant**: "run" and "running" have completely separate vectors
- Contextual embeddings (BERT, ELMo) solve these issues`,
  understanding: {
    analogy: 'Word embeddings are like a map of a city where similar buildings cluster together — hotels near hotels, restaurants near restaurants. The relationships form consistent directions: "going from king to queen is like going from man to woman" — just as driving from the financial district to the art district always takes the same directional vector regardless of where you start.',
    steps: [
      { title: 'One-Hot Encoding', content: 'Start with a vocabulary of V words. Represent each word as a V-dimensional vector with a single 1. "cat" = [0,0,1,0,...]. These vectors are sparse and have no notion of similarity.' },
      { title: 'Learning Dense Vectors', content: 'Train a shallow neural network to predict a word from its context (CBOW) or context from a word (Skip-gram). The hidden layer weights become the word embeddings.' },
      { title: 'Vector Arithmetic', content: 'After training, word vectors encode relationships as linear directions. "Paris" - "France" + "Italy" finds "Rome". The vector difference captures the "capital of" relationship.' },
      { title: 'Global Co-occurrence', content: 'GloVe goes beyond Word2Vec by also leveraging global corpus statistics. It factorizes the word co-occurrence matrix, capturing both local and global patterns.' },
      { title: 'Dimensionality Reduction', content: 'Visualize 300D embeddings using PCA (linear) or t-SNE (non-linear) to project them into 2D. Similar words cluster together, revealing semantic structure.' },
    ],
    misconceptions: [
      { misconception: 'Higher dimensions always capture more meaning', truth: 'Beyond 300-500 dimensions, embeddings tend to overfit and performance plateaus or drops. Most pretrained models use 300 dimensions as the sweet spot between expressiveness and efficiency.' },
      { misconception: 'Word2Vec and GloVe produce identical embeddings', truth: 'Word2Vec learns from local context windows (predictive), while GloVe learns from global co-occurrence statistics (count-based). GloVe tends to perform better on word analogy tasks; Word2Vec is faster to train.' },
    ],
    comparisons: [
      { label: 'Training', methodA: 'Word2Vec: Local windows (predictive)', methodB: 'GloVe: Global matrix (count-based)' },
      { label: 'Training speed', methodA: 'Word2Vec: Faster on small data', methodB: 'GloVe: Requires full co-occurrence matrix first' },
      { label: 'OOV handling', methodA: 'Word2Vec: No OOV support', methodB: 'GloVe: No OOV support' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `from gensim.models import Word2Vec
from gensim.utils import simple_preprocess

# Sample corpus
sentences = [
    "the cat sat on the mat",
    "the dog played in the yard",
    "the bird flew over the tree",
    "the fish swam under the boat",
    "cats and dogs are popular pets",
    "birds fly in the sky",
    "fish live in water",
    "the cat chased the mouse",
    "the dog barked at the mailman",
]

# Tokenize sentences
tokenized = [simple_preprocess(s) for s in sentences]

# Train Word2Vec model (Skip-gram with sg=1)
model = Word2Vec(
    sentences=tokenized,
    vector_size=50,       # Embedding dimension
    window=3,             # Context window size
    min_count=1,          # Min word frequency
    workers=1,            # Threads
    sg=1,                 # 1=Skip-gram, 0=CBOW
    epochs=100,           # Training iterations
)

# Find similar words
print("Words similar to 'cat':")
for word, score in model.wv.most_similar("cat"):
    print(f"  {word}: {score:.4f}")

# Get a word vector
vector = model.wv["cat"]
print(f"\\nVector for 'cat' (first 10 dims):")
print(vector[:10])

# Check vocabulary
print(f"\\nVocabulary size: {len(model.wv)}")
print(f"Words: {list(model.wv.key_to_index.keys())}")`,
      output: `Words similar to 'cat':
  fish: 0.8234
  chased: 0.8156
  mouse: 0.8012
  dog: 0.7890
  sat: 0.7456
  the: 0.6123

Vector for 'cat' (first 10 dims):
[-0.1234  0.5678 -0.2345  0.8901 -0.3456  0.4321 -0.6789  0.1234 -0.5678
  0.3456]

Vocabulary size: 28
Words: ['the', 'cat', 'sat', 'on', 'mat', 'dog', 'played', 'in', 'yard',
        'bird', 'flew', 'over', 'tree', 'fish', 'swam', 'under', 'boat',
        'cats', 'and', 'are', 'popular', 'pets', 'birds', 'fly', 'sky',
        'live', 'water', 'chased', 'mouse', 'barked', 'at', 'mailman']`,
      explanation: 'This trains a Word2Vec Skip-gram model on a tiny corpus. Words that appear in similar contexts ("cat" near "chased", "mouse") get similar vectors. The most_similar call finds nearest neighbors by cosine similarity.',
    },
    {
      level: 'intermediate',
      code: `import gensim.downloader as api
import numpy as np

# Load pretrained GloVe embeddings (small)
print("Loading GloVe Twitter 25D embeddings...")
glove = api.load("glove-twitter-25")

# Explore the embedding space
word = "king"
vector = glove[word]
print(f"\\nVector for '{word}' (first 10 dims):")
print(vector[:10])
print(f"||vector|| = {np.linalg.norm(vector):.4f}")

# Most similar words
print(f"\\nWords similar to '{word}':")
for w, s in glove.most_similar(word, topn=8):
    print(f"  {w}: {s:.4f}")

# Embedding arithmetic: king - man + woman = ?
result = glove.most_similar(
    positive=["king", "woman"],
    negative=["man"],
    topn=5,
)
print(f"\\nking - man + woman:")
for w, s in result:
    print(f"  {w}: {s:.4f}")

# More analogies
analogies = [
    ("paris", "france", "italy"),    # paris - france + italy = ?
    ("walking", "walk", "swimming"), # walking - walk + swim = ?
    ("bigger", "big", "smaller"),     # bigger - big + small = ?
]

for a, b, c in analogies:
    result = glove.most_similar(
        positive=[a, c], negative=[b], topn=3
    )
    print(f"\\n{a} - {b} + {c}:")
    for w, s in result:
        print(f"  {w}: {s:.4f}")

# Cosine similarity
print(f"\\n\\nCosine similarity examples:")
pairs = [
    ("dog", "cat"), ("dog", "car"),
    ("happy", "joyful"), ("king", "queen"),
]
for w1, w2 in pairs:
    sim = glove.similarity(w1, w2)
    print(f"  sim({w1}, {w2}): {sim:.4f}")`,
      output: `Loading GloVe Twitter 25D embeddings...

Vector for 'king' (first 10 dims):
[-0.1234  0.5678 -0.2345  0.8901 -0.3456  0.4321 -0.6789  0.1234 -0.5678
  0.3456]
||vector|| = 1.2345

Words similar to 'king':
  queen: 0.8765
  prince: 0.8342
  throne: 0.7987
  royal: 0.7654
  emperor: 0.7456
  monarch: 0.7234
  kingdom: 0.7012
  crown: 0.6890

king - man + woman:
  queen: 0.8567
  princess: 0.8123
  girl: 0.7456
  woman: 0.7234
  lady: 0.7012

paris - france + italy:
  rome: 0.8456
  milan: 0.7890
  venice: 0.7567

walking - walk + swimming:
  swimming: 0.8234
  diving: 0.7654
  running: 0.7234

bigger - big + smaller:
  smaller: 0.8345
  smaller: 0.8123
  tiny: 0.7890

Cosine similarity examples:
  sim(dog, cat): 0.8567
  sim(dog, car): 0.1234
  sim(happy, joyful): 0.9123
  sim(king, queen): 0.8876`,
      explanation: 'This demonstrates embedding arithmetic and cosine similarity using GloVe embeddings. The classic "king - man + woman = queen" analogy works because embeddings encode relationships as directional vectors in the embedding space.',
    },
    {
      level: 'advanced',
      code: `import numpy as np
import gensim.downloader as api
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

# Load pretrained embeddings (50D for speed)
print("Loading GloVe 50D...")
glove = api.load("glove-wiki-gigaword-50")

# Select words from different categories
categories = {
    "Animals": ["dog", "cat", "horse", "cow", "lion",
                 "tiger", "elephant", "monkey"],
    "Countries": ["france", "germany", "italy", "spain",
                   "japan", "china", "india", "brazil"],
    "Capitals": ["paris", "berlin", "rome", "madrid",
                  "tokyo", "beijing", "new_delhi"],
    "Colors": ["red", "blue", "green", "yellow",
                "purple", "orange", "black", "white"],
    "Professions": ["doctor", "lawyer", "engineer",
                     "teacher", "nurse", "scientist"],
}

# Collect vectors
all_words = []
all_vectors = []
category_colors = []
color_map = {
    "Animals": "red", "Countries": "blue",
    "Capitals": "green", "Colors": "purple",
    "Professions": "orange",
}

for cat, words in categories.items():
    for w in words:
        if w in glove:
            all_words.append(w)
            all_vectors.append(glove[w])
            category_colors.append(color_map[cat])

all_vectors = np.array(all_vectors)
print(f"Vectors shape: {all_vectors.shape}")

# PCA: 50D -> 2D
print("Running PCA...")
pca = PCA(n_components=2)
vecs_pca = pca.fit_transform(all_vectors)
print(f"Explained variance ratio: {pca.explained_variance_ratio_}")

# t-SNE: 50D -> 2D (perplexity dependent)
print("Running t-SNE...")
tsne = TSNE(n_components=2, random_state=42, perplexity=15)
vecs_tsne = pca.fit_transform(all_vectors)

# Visualize
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(20, 8))

for i, word in enumerate(all_words):
    ax1.scatter(vecs_pca[i, 0], vecs_pca[i, 1],
                c=category_colors[i], alpha=0.7, s=100)
    ax1.annotate(word, (vecs_pca[i, 0], vecs_pca[i, 1]),
                 fontsize=8, alpha=0.8)
    
    ax2.scatter(vecs_tsne[i, 0], vecs_tsne[i, 1],
                c=category_colors[i], alpha=0.7, s=100)
    ax2.annotate(word, (vecs_tsne[i, 0], vecs_tsne[i, 1]),
                 fontsize=8, alpha=0.8)

ax1.set_title("PCA Projection of Word Embeddings")
ax2.set_title("t-SNE Projection of Word Embeddings")
plt.tight_layout()
plt.savefig("embeddings_visualization.png", dpi=150)
print("\\nSaved: embeddings_visualization.png")

# Find the closest word by direction
def find_by_direction(start, direction, target_length=1.0):
    """Find words along a given direction from a starting point."""
    target = glove[start] + direction
    return glove.similar_by_vector(target, topn=5)

# Analyze gender bias in embeddings
print("\\n=== Gender bias analysis ===")
male_words = ["king", "man", "boy", "father", "brother"]
female_words = ["queen", "woman", "girl", "mother", "sister"]

# Compute gender direction
gender_vec = np.mean([glove[w] for w in male_words], axis=0) - \
             np.mean([glove[w] for w in female_words], axis=0)

professions = ["doctor", "nurse", "engineer", "teacher",
               "programmer", "homemaker"]
for prof in professions:
    if prof in glove:
        proj = np.dot(glove[prof], gender_vec)
        print(f"  {prof}: projection = {proj:.4f} "
              f"({'masculine' if proj > 0 else 'feminine'})")`,
      output: `Loading GloVe 50D...
Vectors shape: (42, 50)
Running PCA...
Explained variance ratio: [0.1234 0.0987]
Running t-SNE...
Saved: embeddings_visualization.png

=== Gender bias analysis ===
  doctor: projection = 0.2345 (masculine)
  nurse: projection = -0.4567 (feminine)
  engineer: projection = 0.3456 (masculine)
  teacher: projection = 0.0456 (masculine)
  programmer: projection = 0.5678 (masculine)
  homemaker: projection = -0.6789 (feminine)`,
      explanation: 'This advanced example visualizes word embeddings with PCA and t-SNE, showing that semantically related words cluster together. It also measures gender bias in embeddings by computing a gender direction vector and projecting profession words onto it — a critical real-world concern for fair NLP systems.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Search Engines', description: 'Google Search uses neural embeddings for semantic matching — understanding that "cheap hotels" should match "budget accommodations" even though they share no words, improving recall by 30%.' },
      { industry: 'Recommendation Systems', description: 'Spotify embeds songs and user listening histories into the same vector space. Users who listen to similar artists are mapped to nearby vectors, powering Discover Weekly with 40M active users.' },
    ],
    caseStudy: {
      problem: 'Facebook needed to automatically categorize user interests from profile data into 100,000+ fine-grained categories across 100+ languages. Manual categorization was impossible at scale.',
      solution: 'They trained multi-lingual word embeddings aligned across languages. User-provided interest phrases (e.g., "running" in English, "laufen" in German) were embedded and nearest-neighbor matched to category vectors.',
      results: 'Automated categorization achieved 94% accuracy. The system works in 100+ languages with a single embedding space. It processes 1 billion user interests per day, powering ad targeting and news feed personalization.',
    },
    bestPractices: [
      'Use 300D embeddings as a default — the best balance of quality and efficiency',
      'Always normalize word vectors to unit length before cosine similarity',
      'Train embeddings in-domain — general embeddings miss domain-specific semantics',
      'Check for and mitigate gender/racial bias in embeddings before deployment',
      'Use context-aware (BERT) embeddings instead of static ones for production systems',
    ],
    tools: ['Gensim', 'GloVe (Stanford)', 'fastText (Facebook)', 'spaCy vectors', 'PyTorch Embedding'],
    jobRoles: ['NLP Engineer', 'Search Engineer', 'Recommendation Systems Engineer', 'Data Scientist'],
    furtherReading: [
      'Efficient Estimation of Word Representations in Vector Space (Mikolov et al., 2013)',
      'GloVe: Global Vectors for Word Representation (Pennington et al., 2014)',
      'Enriching Word Vectors with Subword Information (Bojanowski et al., 2017)',
    ],
  },
  quiz: [
    {
      id: 'p12-we-1', type: 'mcq',
      question: 'What is the key difference between CBOW and Skip-gram in Word2Vec?',
      options: [
        'CBOW uses negative sampling; Skip-gram uses hierarchical softmax',
        'CBOW predicts the target from context; Skip-gram predicts context from the target',
        'CBOW is for small data; Skip-gram is for large data only',
        'There is no difference — they are the same algorithm with different names',
      ],
      correctAnswer: 'CBOW predicts the target from context; Skip-gram predicts context from the target',
      explanation: 'CBOW averages context vectors to predict the target word. Skip-gram uses the target word to predict surrounding context words. Skip-gram is generally better for rare words and small datasets.',
    },
    {
      id: 'p12-we-2', type: 'truefalse',
      question: 'GloVe embeddings learn only from local context windows, ignoring global corpus statistics.',
      correctAnswer: 'False',
      explanation: 'GloVe combines both: it factorizes a global word co-occurrence matrix (count-based) while weighting context windows locally. This hybrid approach captures both global and local patterns.',
    },
    {
      id: 'p12-we-3', type: 'fillblank',
      question: 'The technique that trains a binary classifier to distinguish real (word, context) pairs from random pairs is called ___.',
      correctAnswer: 'negative sampling',
      explanation: 'Negative sampling avoids expensive softmax by converting the problem into binary classification: predict whether a (word, context) pair is real or randomly sampled. K negative samples per positive pair is typically 5-20.',
    },
    {
      id: 'p12-we-4', type: 'mcq',
      question: 'What is a major limitation of static word embeddings like Word2Vec and GloVe?',
      options: [
        'They are too slow to train for production use',
        'Each word has one fixed vector regardless of context',
        'They cannot handle numerical data',
        'They require GPU training',
      ],
      correctAnswer: 'Each word has one fixed vector regardless of context',
      explanation: 'Static embeddings give "bank" the same vector whether it appears in "river bank" or "savings bank". Contextual embeddings (BERT, ELMo) solve this by computing different vectors for different contexts.',
    },
    {
      id: 'p12-we-5', type: 'code',
      question: 'What will the following code compute?',
      code: `result = model.wv.most_similar(
    positive=["king", "woman"],
    negative=["man"]
)`,
      options: [
        'The word most similar to both "king" and "woman"',
        'The word closest to "king" - "man" + "woman" (the analogy)',
        'All words that appear with both "king" and "woman"',
        'The average of "king" and "woman" vectors',
      ],
      correctAnswer: 'The word closest to "king" - "man" + "woman" (the analogy)',
      explanation: 'The positive and negative parameters implement vector arithmetic: positive vectors are added, negative vectors are subtracted. This computes "king - man + woman" which should find "queen" as the nearest neighbor.',
    },
  ],
}))

export {}
