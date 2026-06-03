import { registerContent } from '@/content/index'

registerContent('p19-chunking', () => ({
  difficulty: 'Advanced',
  estimatedTime: '45 minutes',
  prerequisites: ['p19-rag-architecture'],
  tags: ['RAG', 'Advanced', 'Topic'],
  objectives: [
    'Understand why chunking strategy directly impacts RAG quality',
    'Implement fixed-size, recursive, semantic, and document-aware chunking',
    'Evaluate chunk quality using retrieval metrics',
    'Optimize chunk size and overlap for different document types',
  ],
  theory: `# Chunking Strategies (All Types)

## Why Chunking Matters

Chunking is the process of dividing documents into smaller pieces (chunks) for indexing and retrieval. It is the single most impactful hyperparameter in RAG pipelines — bad chunking can destroy retrieval quality regardless of how good your embedding model or vector store is.

### The Chunking Tradeoff

| Small Chunks | Large Chunks |
|-------------|-------------|
| High precision (specific match) | High recall (broader context) |
| Missing surrounding context | Contains irrelevant information |
| More chunks to search | Fewer chunks, faster search |
| Prone to splitting concepts | Preserves complete concepts |

## Chunking Strategies

### 1. Fixed-Size Chunking

The simplest approach: split text into chunks of a fixed number of characters or tokens.

\\\`\\\`python
# Fixed-size with overlap
chunk_size = 500
chunk_overlap = 50

for i in range(0, len(text), chunk_size - chunk_overlap):
    chunk = text[i:i + chunk_size]
\\\`\\\`\\\`

**Pros**: Simple, predictable, fast. **Cons**: Splits sentences/paragraphs arbitrarily.

### 2. Recursive Character Text Splitter

Splits text recursively using a hierarchy of separators. LangChain's default approach:

\\\`\\\`python
RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\\\\n\\\\n", "\\\\n", ".", " ", ""]
)
\\\`\\\`\\\`

Tries to split on paragraph boundaries first, then sentences, then words. Falls back to character-level if necessary.

### 3. Semantic Chunking

Uses embedding similarity to determine chunk boundaries. When consecutive sentences become semantically different, start a new chunk.

1. Embed each sentence
2. Compute cosine similarity between consecutive sentences
3. When similarity drops below a threshold, insert a chunk boundary
4. Merge small chunks that fall below minimum size

### 4. Document-Aware Chunking

Preserves the structural hierarchy of the document:

**Markdown**: Split on headers (h1, h2, h3), keep heading hierarchy as metadata
\\\`\\\`python
# Split on ## headers, keep ## in chunk
# Parent sections included as context
\\\`\\\`\\\`

**Code**: Split on function/class definitions, keep imports and docstrings
**HTML**: Split on structural tags (\\\\texttt{<section>}, \\\\texttt{<article>}, \\\\texttt{<p>})

### 5. Agentic Chunking

An LLM decides chunk boundaries based on semantic completeness:

1. Feed text segments to an LLM
2. Ask: "Does this segment represent a complete, self-contained topic?"
3. If yes, create a chunk boundary
4. The LLM can also generate a summary or title for each chunk

## Chunk Size Tradeoffs

| Chunk Size | Token Count | Use Case | Retrieval Quality |
|------------|-------------|----------|-------------------|
| Very small | 64-128 | Entity lookup, definitions | High precision, low recall |
| Small | 256-512 | Factoid QA, specific answers | Balanced |
| Medium | 512-1024 | General RAG, summarization | Best overall |
| Large | 1024-2048 | Long-form analysis | High recall, low precision |
| Very large | 2048+ | Document-level retrieval | Context preservation |

## Chunk Overlap Optimization

Overlap prevents information loss at chunk boundaries. General guidelines:

- **Overlap = 10-20% of chunk size**: Good default
- **Overlap = 1-2 sentences**: Ensures sentence continuity
- **No overlap**: Only when chunks align with natural boundaries (headers, sections)

## Evaluating Chunk Quality

1. **Hit Rate**: Does the correct chunk appear in the top-k results?
2. **Mean Reciprocal Rank (MRR)**: How highly ranked is the correct chunk?
3. **Context Precision**: What fraction of retrieved chunks are relevant?
4. **Chunk Completeness**: Does the chunk contain the full answer (not cut off)?

## Best Practices

- Start with RecursiveCharacterTextSplitter (size=1000, overlap=200)
- For markdown-heavy docs, use MarkdownHeaderTextSplitter
- For code, split on function/class definitions
- Always embed metadata (source, section, page number) with each chunk
- Test chunk quality with a held-out set of query-answer pairs

## Understanding

The right chunking strategy depends on your document type and retrieval use case. A cookbook of recipes needs different chunking than legal contracts or technical manuals.`,
  understanding: {
    analogy: 'Chunking is like cutting a long book into pieces for quick lookup. Cutting by chapter (large chunks) gives full context but you might get irrelevant pages. Cutting by sentence (tiny chunks) is precise but loses the surrounding story. Cutting by paragraph with overlap is the Goldilocks zone — enough context to understand, focused enough to be relevant.',
    steps: [
      { title: 'Analyze Document Structure', content: 'Identify the natural structure of your documents — headers, paragraphs, code blocks, tables. Different structures require different splitting strategies.' },
      { title: 'Choose Splitter Strategy', content: 'Select a chunking method based on document type: recursive for plain text, markdown-aware for docs with headers, semantic for content where sentence boundaries matter.' },
      { title: 'Set Size and Overlap', content: 'Configure chunk size (typically 256-1024 tokens) and overlap (10-20%). Test multiple configurations to find the sweet spot for your use case.' },
      { title: 'Embed and Index', content: 'Each chunk becomes an independent index entry. Store metadata (source, section heading, position) alongside each chunk for filtering and provenance.' },
      { title: 'Evaluate Retrieval Quality', content: 'Create a test set of queries with known correct answers. Measure hit rate, MRR, and whether the retrieved chunk contains the complete answer.' },
    ],
    misconceptions: [
      { misconception: 'Larger chunks always give better answers because the LLM has more context', truth: 'Larger chunks dilute relevant information and increase the chance of retrieving irrelevant content. Precision drops as chunk size increases beyond the optimal point.' },
      { misconception: 'All documents should use the same chunking strategy', truth: 'Different document types need different strategies. Markdown needs header-aware splitting, code needs function boundaries, and plain text works best with semantic or recursive splitting.' },
    ],
    comparisons: [
      { label: 'Precision', methodA: 'Small chunks (256t): High precision', methodB: 'Large chunks (1024t): Lower precision' },
      { label: 'Context Preservation', methodA: 'Small chunks: Poor (split concepts)', methodB: 'Large chunks: Good (complete thoughts)' },
      { label: 'Index Size', methodA: 'Small chunks: Many entries', methodB: 'Large chunks: Fewer entries' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Fixed-Size and Recursive Chunking
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    CharacterTextSplitter
)

sample_text = """Machine learning is a subset of artificial intelligence.

It focuses on building systems that learn from data.

Deep learning is a subset of machine learning using neural networks.

Natural language processing deals with text and speech.

Computer vision enables machines to interpret visual information."""

# Fixed-size chunking with overlap
fixed_splitter = CharacterTextSplitter(
    chunk_size=60,
    chunk_overlap=15,
    separator=" "
)
fixed_chunks = fixed_splitter.split_text(sample_text)
print("Fixed-size chunks:")
for i, chunk in enumerate(fixed_chunks):
    print(f"  [{i}] ({len(chunk)}c): {chunk[:50]}...")

print()

# Recursive character text splitter
recursive_splitter = RecursiveCharacterTextSplitter(
    chunk_size=80,
    chunk_overlap=20,
    separators=["\\\\n\\\\n", "\\\\n", ".", " ", ""]
)
recursive_chunks = recursive_splitter.split_text(sample_text)
print("Recursive chunks:")
for i, chunk in enumerate(recursive_chunks):
    print(f"  [{i}] ({len(chunk)}c): {chunk[:50]}...")`,
      output: `Fixed-size chunks:
  [0] (58c): Machine learning is a subset of artificial...
  [1] (63c): focuses on building systems that learn fro...
  [2] (62c): Deep learning is a subset of machine learn...
  [3] (43c): Natural language processing deals with tex...

Recursive chunks:
  [0] (52c): Machine learning is a subset of artificial intelligence.
  [1] (60c): It focuses on building systems that learn from data.
  [2] (75c): Deep learning is a subset of machine learning using neural networks.
  [3] (57c): Natural language processing deals with text and speech.
  [4] (60c): Computer vision enables machines to interpret visual information.`,
      explanation: 'Fixed-size chunking splits at arbitrary character positions, breaking sentences and paragraphs. Recursive splitting respects natural boundaries (paragraphs first, then sentences) producing more semantically coherent chunks.',
    },
    {
      level: 'intermediate',
      code: `# Semantic Chunking with Embedding Similarity
from langchain_experimental.text_splitter import SemanticChunker
from langchain.embeddings import OpenAIEmbeddings
import numpy as np

# Semantic chunker from LangChain
embeddings = OpenAIEmbeddings()
semantic_splitter = SemanticChunker(
    embeddings,
    breakpoint_threshold_type="percentile",  # or "standard_deviation", "interquartile"
    breakpoint_threshold_amount=30
)

long_text = """The Transformer architecture revolutionized deep learning.

It introduced the self-attention mechanism that processes all tokens in parallel.

Unlike RNNs, Transformers have no sequential dependency during training.

This enables massive parallelization on GPUs and TPUs.

The multi-head attention allows the model to focus on different aspects simultaneously.

Positional encodings provide information about token positions in the sequence.

Feed-forward networks transform the attention outputs.

Layer normalization and residual connections stabilize training.

The encoder-decoder structure enables sequence-to-sequence tasks.

Pre-trained Transformers like BERT and GPT set new benchmarks across NLP tasks."""

chunks = semantic_splitter.split_text(long_text)
print(f"Semantic chunks created: {len(chunks)}")
for i, chunk in enumerate(chunks):
    print(f"\\\\nChunk {i}:")
    print(f"  {chunk[:120]}...")`,
      output: `Semantic chunks created: 4

Chunk 0:
  The Transformer architecture revolutionized deep learning. It introduced the self-attention mechanism that processes all tokens in parallel...

Chunk 1:
  Unlike RNNs, Transformers have no sequential dependency during training. This enables massive parallelization on GPUs and TPUs...

Chunk 2:
  The multi-head attention allows the model to focus on different aspects simultaneously. Positional encodings provide information about token positions...

Chunk 3:
  Feed-forward networks transform the attention outputs. Layer normalization and residual connections stabilize training...`,
      explanation: 'Semantic chunking uses embedding similarity to detect topic shifts. When sentences become semantically different from the previous group, a new chunk begins. This produces more coherent chunks that align with topical boundaries.',
    },
    {
      level: 'advanced',
      code: `# Custom Markdown-Aware Chunking with Evaluation
import re
from dataclasses import dataclass, field
from typing import List, Optional
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
import numpy as np

@dataclass
class MarkdownChunk:
    content: str
    heading_hierarchy: List[str]  # [h1, h2, h3, ...]
    char_start: int
    char_end: int

class MarkdownAwareSplitter:
    """Splits markdown documents respecting header hierarchy."""
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.heading_pattern = re.compile(r'^(#{1,6})\\\\s+(.+)$', re.MULTILINE)
    
    def _extract_hierarchy(self, text: str, pos: int) -> List[str]:
        """Find all headings that contain the given position."""
        hierarchy = []
        for match in self.heading_pattern.finditer(text[:pos + 1]):
            level = len(match.group(1))
            heading = match.group(2).strip()
            hierarchy.append((level, heading))
        # Keep only the innermost path
        if not hierarchy:
            return []
        result = []
        last_level = 0
        for level, heading in hierarchy:
            if level > last_level:
                result.append(heading)
            elif level == last_level and result:
                result[-1] = heading
            else:
                while result and len(result) >= level:
                    result.pop()
                result.append(heading)
            last_level = level
        return result
    
    def split(self, markdown_text: str) -> List[Document]:
        """Split markdown into documents with heading metadata."""
        # First split by headings
        sections = re.split(r'(?=^#{1,6}\\\\s+)', markdown_text, flags=re.MULTILINE)
        
        documents = []
        current_hierarchy = []
        
        for section in sections:
            if not section.strip():
                continue
            
            # Check if this section starts with a heading
            heading_match = self.heading_pattern.match(section)
            if heading_match:
                level = len(heading_match.group(1))
                heading_text = heading_match.group(2).strip()
                # Update hierarchy
                current_hierarchy = current_hierarchy[:level - 1] + [heading_text]
            
            # Further split long sections
            if len(section) > self.chunk_size:
                sub_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=self.chunk_size,
                    chunk_overlap=self.chunk_overlap
                )
                sub_chunks = sub_splitter.split_text(section)
                for chunk in sub_chunks:
                    documents.append(Document(
                        page_content=chunk,
                        metadata={
                            "heading_hierarchy": " > ".join(current_hierarchy),
                            "headings": current_hierarchy.copy()
                        }
                    ))
            else:
                documents.append(Document(
                    page_content=section,
                    metadata={
                        "heading_hierarchy": " > ".join(current_hierarchy),
                        "headings": current_hierarchy.copy()
                    }
                ))
        
        return documents

# Test the splitter
markdown_doc = \"\"\"# Machine Learning Guide

## Supervised Learning

Supervised learning uses labeled data to train models.

### Classification

Classification predicts discrete labels from input features.

Popular algorithms include logistic regression and decision trees.

### Regression

Regression predicts continuous values from input features.

Linear regression is the simplest regression algorithm.

## Unsupervised Learning

Unsupervised learning finds patterns in unlabeled data.

### Clustering

Clustering groups similar data points together.

K-Means is the most widely used clustering algorithm.
\"\"\"

splitter = MarkdownAwareSplitter(chunk_size=200, chunk_overlap=30)
docs = splitter.split(markdown_doc)

print("Markdown-aware chunks:")
for i, doc in enumerate(docs):
    print(f"\\\\nChunk {i}:")
    print(f"  Headings: {doc.metadata['heading_hierarchy']}")
    print(f"  Content: {doc.page_content[:80].strip()}...")`,
      output: `Markdown-aware chunks:

Chunk 0:
  Headings: Machine Learning Guide
  Content: # Machine Learning Guide...

Chunk 1:
  Headings: Machine Learning Guide > Supervised Learning
  Content: ## Supervised Learning...

Chunk 2:
  Headings: Machine Learning Guide > Supervised Learning > Classification
  Content: ### Classification...

Chunk 3:
  Headings: Machine Learning Guide > Supervised Learning > Regression
  Content: ### Regression...

Chunk 4:
  Headings: Machine Learning Guide > Unsupervised Learning
  Content: ## Unsupervised Learning...

Chunk 5:
  Headings: Machine Learning Guide > Unsupervised Learning > Clustering
  Content: ### Clustering...`,
      explanation: 'Markdown-aware chunking preserves document hierarchy. Each chunk carries metadata about its position in the heading tree, enabling more precise retrieval and better context for the LLM. This is critical for technical documentation and long-form content.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Legal Tech', description: 'Legal documents (contracts, case law) require chunking that respects sections, clauses, and subsections. Splitting in the middle of a clause would destroy legal meaning and context.' },
      { industry: 'Healthcare', description: 'Medical records and clinical guidelines need chunking that preserves diagnostic criteria, treatment protocols, and medication information within a single chunk for accurate retrieval.' },
    ],
    caseStudy: {
      problem: 'A knowledge management company built a RAG system for technical documentation but found that answers were frequently incomplete or referenced concepts split across chunks. Chunks cut through code examples and broke API documentation.',
      solution: 'They implemented a document-aware chunking strategy that detected markdown headers, code blocks, and list structures. Code blocks were kept intact, headers became chunk boundaries, and metadata included the full heading path.',
      results: 'Hit rate improved from 62% to 91%. User satisfaction scores increased by 35%. The system could now answer multi-step questions by retrieving related chunks from the same document section.',
    },
    bestPractices: [
      'Start with RecursiveCharacterTextSplitter (separators: \\n\\n, \\n, ., space)',
      'For structured docs, use format-aware splitters (markdown, HTML, code)',
      'Store chunk metadata: source, heading path, chunk index, page number',
      'Test multiple chunk sizes and overlap values on your specific data',
      'Avoid splitting code blocks, tables, and lists — keep them intact',
    ],
    tools: ['LangChain Text Splitters', 'LlamaIndex Node Parsers', 'Unstructured.IO', 'Semantic Chunkers', 'spaCy / NLTK'],
    jobRoles: ['Data Engineer', 'ML Engineer', 'Search Engineer', 'Knowledge Management Specialist'],
    furtherReading: [
      'LangChain text splitter documentation',
      'Chunking strategies for RAG (Pinecone blog)',
      'Semantic chunking research papers',
      'LlamaIndex node parser guide',
    ],
  },
  quiz: [
    {
      id: 'chunk-1', type: 'mcq',
      question: 'What is the primary consequence of using chunks that are too large in a RAG pipeline?',
      options: [
        'The vector store runs out of memory',
        'Retrieval precision decreases because each chunk contains more irrelevant content',
        'The LLM generates faster responses',
        'Chunk overlap becomes unnecessary',
      ],
      correctAnswer: 'Retrieval precision decreases because each chunk contains more irrelevant content',
      explanation: 'Large chunks dilute the relevant information. When a chunk covers many topics, its embedding vector averages across all of them, making similarity search less precise.',
    },
    {
      id: 'chunk-2', type: 'truefalse',
      question: 'RecursiveCharacterTextSplitter tries to split on paragraph boundaries first, then sentences, then characters.',
      correctAnswer: 'True',
      explanation: 'The recursive splitter uses a hierarchy of separators (\\\\n\\\\n, \\\\n, ., space, empty string). It tries each separator in order, falling back to the next one if the resulting chunk is still too large.',
    },
    {
      id: 'chunk-3', type: 'code',
      question: 'What does this chunking code do differently from standard fixed-size splitting?',
      code: `splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\\\\n\\\\n", "\\\\n", ".", " ", ""]
)`,
      options: [
        'It splits at every 1000th character regardless of content',
        'It respects natural text boundaries, preferring to split at paragraphs when possible',
        'It uses embeddings to find semantic breakpoints',
        'It splits only on periods and spaces',
      ],
      correctAnswer: 'It respects natural text boundaries, preferring to split at paragraphs when possible',
      explanation: 'The recursive splitter tries the separators in order (double newline first). If a chunk exceeds 1000 characters at the current separator, it falls back to the next separator, preserving as much natural structure as possible.',
    },
    {
      id: 'chunk-4', type: 'fillblank',
      question: 'The chunking strategy that uses embedding similarity to detect topic shifts is called ___ chunking.',
      correctAnswer: 'semantic',
      explanation: 'Semantic chunking computes cosine similarity between consecutive sentence embeddings. When similarity drops below a threshold, it indicates a topic shift and triggers a new chunk boundary.',
    },
    {
      id: 'chunk-5', type: 'match',
      question: 'Match each chunking strategy with its best use case:',
      pairs: [
        { left: 'Recursive Character Splitter', right: 'General plain text documents' },
        { left: 'Markdown Header Splitter', right: 'Technical documentation with headings' },
        { left: 'Semantic Chunker', right: 'Content with natural topic transitions' },
        { left: 'Code Splitter', right: 'Source code files (functions, classes)' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each chunking strategy is optimized for a specific document format. Choosing the wrong strategy can significantly degrade retrieval quality.',
    },
  ],
}))

export {}
