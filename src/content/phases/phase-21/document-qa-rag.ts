import { registerContent } from '@/content/index'

registerContent('p21-document-qa-rag', () => ({
  difficulty: 'Advanced',
  estimatedTime: '120 minutes',
  prerequisites: ['p19-rag-architecture', 'p19-vector-dbs'],
  tags: ['End-to-End Projects', 'Advanced', 'Project'],
  objectives: [
    'Build a complete RAG system for question answering over PDF documents',
    'Implement document ingestion with chunking and embedding',
    'Set up a vector store for efficient retrieval',
    'Create a conversational interface with session memory',
    'Deploy the system with Streamlit and FastAPI',
  ],
  theory: `# Document Q&A with RAG

## System Architecture

A Retrieval-Augmented Generation (RAG) system combines document retrieval with LLM generation to answer questions based on custom documents. Unlike fine-tuning, RAG requires no training and can reference any document set.

### Components

1. **Document Ingestion Pipeline**
   - Parse PDF (PyMuPDF, Unstructured, LlamaParse)
   - Split into chunks (RecursiveCharacterTextSplitter)
   - Generate embeddings (sentence-transformers, OpenAI, Cohere)
   - Store in vector database (Chroma, FAISS, Pinecone)

2. **Retrieval Pipeline**
   - Embed user query
   - Search nearest neighbors (cosine similarity)
   - Return top-k relevant chunks

3. **Generation Pipeline**
   - Construct prompt with retrieved context
   - Send to LLM (GPT-4, Claude, Llama)
   - Return answer with source citations

## Chunking Strategies

| Strategy | Description | Best For |
|----------|-------------|----------|
| Recursive Character | Split on natural boundaries (\\n\\n, \\n, .) | General text |
| Token-based | Split by token count | Long documents |
| Semantic | Split by topic/meaning change | Research papers |
| Sentence-based | Split by sentence boundaries | Legal/technical docs |

### Chunk Size Tradeoffs

- **Small (128-256 tokens)**: Precise retrieval, but may miss context
- **Medium (512 tokens)**: Good balance for most use cases
- **Large (1024+ tokens)**: More context, but may include irrelevant info

## Retrieval Strategies

1. **Simple Similarity**: Cosine similarity between query and chunk embeddings
   $$\\text{score}(q, d) = \\frac{q \\cdot d}{\\|q\\| \\cdot \\|d\\|}$$

2. **MMR (Maximum Marginal Relevance)**: Balances relevance and diversity
   $$\\text{MMR} = \\arg\\max_{d \\in D} [\\lambda \\cdot \\text{sim}(q, d) - (1 - \\lambda) \\cdot \\max_{d_j \\in S} \\text{sim}(d, d_j)]$$

3. **Hybrid Search**: Combines keyword (BM25) + semantic (embedding) search

## Prompt Template

The generation prompt instructs the LLM to answer based solely on provided context:

\\\`\\\`\\\`
You are a document Q&A assistant. Answer the question using ONLY the provided context.
If the context does not contain the answer, say "I cannot find this information in the documents."
Always cite the source document name and page number.

Context:
{retrieved_chunks}

Question: {user_question}
\\\`\\\`\\\`

## Session Memory

Conversation memory stores chat history to enable follow-up questions:
- **BufferWindowMemory**: Keep last N exchanges
- **ConversationSummaryMemory**: Summarize long conversations
- **ConversationBufferMemory**: Keep full history (limited context window)`,

  understanding: {
    analogy: 'RAG is like a research assistant in a library. When you ask a question, the assistant doesn\'t try to answer from memory alone. Instead, they first go to the shelves, find the most relevant books, open them to the right pages, and then read those passages to formulate a precise answer with citations. The vector database is the library catalog, embeddings are the index, and the LLM is the assistant synthesizing the answer from retrieved passages.',
    steps: [
      { title: 'Document Ingestion', content: 'Parse the PDF or document into machine-readable text. Use PyMuPDF for simple PDFs or Unstructured for complex layouts (tables, headers, footers).' },
      { title: 'Text Chunking', content: 'Split documents into overlapping chunks of ~500 tokens with 50-token overlap. This preserves context across chunk boundaries and ensures each chunk is semantically coherent.' },
      { title: 'Embedding Generation', content: 'Convert chunks into dense vector embeddings using Sentence Transformers (all-MiniLM-L6-v2). Each chunk becomes a 384-dimensional vector capturing semantic meaning.' },
      { title: 'Vector Store Indexing', content: 'Store embeddings in ChromaDB with metadata (source file, page number, chunk index). Build an index for fast approximate nearest neighbor search.' },
      { title: 'Query Processing', content: 'Embed the user question using the same model. Search the vector store for the top-k most similar chunks (k=3-5). Aggregate chunks into context.' },
      { title: 'Response Generation', content: 'Send the question + retrieved context to an LLM with a strict instruction to answer only from context. Return the answer with source citations.' },
    ],
    misconceptions: [
      { misconception: 'RAG eliminates all LLM hallucinations', truth: 'RAG reduces hallucinations by grounding answers in retrieved context, but the LLM can still ignore or misinterpret the context. Prompt engineering and output validation are essential secondary safeguards.' },
      { misconception: 'More context chunks always improve answer quality', truth: 'Beyond 5-7 chunks, additional context adds noise and can confuse the LLM. The model\'s attention dilutes across too many passages, reducing answer quality.' },
      { misconception: 'Any embedding model works equally well for retrieval', truth: 'Embedding quality dramatically affects retrieval. Domain-specific embedding models (e.g., for legal, medical, code) significantly outperform general models for specialized documents.' },
    ],
    comparisons: [
      { label: 'Retrieval Quality', methodA: 'Dense (embedding) — Captures semantic similarity', methodB: 'Sparse (BM25) — Captures keyword matches exactly' },
      { label: 'Latency', methodA: 'Dense — Higher (requires embedding computation)', methodB: 'Sparse — Lower (inverted index lookup)' },
      { label: 'Cold Start', methodA: 'Dense — Needs embedding model download', methodB: 'Sparse — Works immediately with any text' },
      { label: 'Multilingual', methodA: 'Dense — Cross-lingual models available', methodB: 'Sparse — Language-specific tokenization needed' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Setup: Document ingestion pipeline
import fitz  # PyMuPDF
from pathlib import Path
from typing import List, Dict

def extract_text_from_pdf(pdf_path: str) -> List[Dict]:
    """Extract text and metadata from a PDF file."""
    doc = fitz.open(pdf_path)
    pages = []

    for page_num, page in enumerate(doc):
        text = page.get_text()
        if text.strip():
            pages.append({
                "text": text,
                "metadata": {
                    "source": Path(pdf_path).name,
                    "page": page_num + 1,
                    "total_pages": len(doc),
                }
            })
    doc.close()
    return pages

# Test with a sample PDF
pdf_path = "data/sample_report.pdf"
pages = extract_text_from_pdf(pdf_path)
print(f"Extracted {len(pages)} pages from {Path(pdf_path).name}")

for page in pages[:2]:
    meta = page["metadata"]
    text_preview = page["text"][:200].replace("\\n", " ")
    print(f"\\nPage {meta['page']}/{meta['total_pages']}:")
    print(f"  Preview: {text_preview}...")`,
      output: `Extracted 24 pages from sample_report.pdf

Page 1/24:
  Preview: Annual Report 2024 - Q4 Financial Results. The company reported revenue of $2.3B for Q4 2024, representing a 15% year-over-year increase...

Page 2/24:
  Preview: Revenue Breakdown by Segment. Enterprise solutions contributed 45% of total revenue ($1.035B), while consumer products contributed...`,
      explanation: 'PDF parsing with PyMuPDF extracts clean text page by page. Each page includes metadata (source file, page number) for citation tracking. This forms the foundation of the document ingestion pipeline.',
    },
    {
      level: 'intermediate',
      code: `# Core logic: Vector store indexing and retrieval
from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA

# 1. Load and chunk documents
loader = PyMuPDFLoader("data/sample_report.pdf")
documents = loader.load()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\\n\\n", "\\n", ".", " ", ""],
)
chunks = text_splitter.split_documents(documents)
print(f"Split {len(documents)} pages into {len(chunks)} chunks")

# 2. Create embeddings and vector store
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db",
)
print(f"Indexed {vectorstore._collection.count()} vectors")

# 3. Set up retrieval chain
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 3},
)

# 4. Query the retriever (without LLM for testing)
query = "What was the Q4 2024 revenue?"
docs = retriever.get_relevant_documents(query)
print(f"\\nRetrieved {len(docs)} chunks for: '{query}'")
for i, doc in enumerate(docs):
    print(f"\\nChunk {i+1} (source: {doc.metadata['source']}):")
    print(f"  {doc.page_content[:150]}...")`,
      output: `Split 24 pages into 127 chunks

Indexed 127 vectors

Retrieved 3 chunks for: 'What was the Q4 2024 revenue?'

Chunk 1 (source: sample_report.pdf):
  Annual Report 2024 - Q4 Financial Results. The company reported revenue of $2.3B for Q4 2024, representing a 15% year-over-year increase...

Chunk 2 (source: sample_report.pdf):
  Revenue Breakdown by Segment. Enterprise solutions contributed 45% of total revenue ($1.035B), while consumer products contributed...

Chunk 3 (source: sample_report.pdf):
  The Board approved a $500M share buyback program for 2025...`,
      explanation: 'End-to-end retrieval pipeline: PDF loading, chunking (127 chunks from 24 pages), embedding with sentence-transformers, indexing in Chroma, and similarity search. The retriever finds the most relevant chunks for a query, ready for LLM-based answer generation.',
    },
    {
      level: 'advanced',
      code: `# Deployment: Streamlit chat interface with session memory
import streamlit as st
from langchain.chains import RetrievalQA
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain_community.llms import Ollama
from pathlib import Path

st.set_page_config(page_title="Document Q&A", layout="wide")
st.title("\\U0001f4d6 Document Q&A with RAG")

# Load vector store
@st.cache_resource
def load_rag_system():
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vectorstore = Chroma(
        persist_directory="./chroma_db",
        embedding_function=embeddings,
    )
    llm = Ollama(model="llama3", temperature=0)
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
    )
    template = """Answer the question using ONLY the provided context.
    If unsure, say "I cannot find this information."

    Context: {context}
    Chat History: {chat_history}
    Question: {question}
    Answer:"""
    prompt = PromptTemplate(
        template=template,
        input_variables=["context", "chat_history", "question"],
    )
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(k=3),
        chain_type_kwargs={
            "prompt": prompt,
            "memory": memory,
        },
        return_source_documents=True,
    )
    return qa_chain

qa_chain = load_rag_system()

# Chat interface
if "messages" not in st.session_state:
    st.session_state.messages = []

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])
        if "sources" in msg:
            with st.expander("Sources"):
                for src in msg["sources"]:
                    st.caption(f"\\U0001f4c4 {src}")

if query := st.chat_input("Ask about your documents..."):
    st.session_state.messages.append({"role": "user", "content": query})
    with st.chat_message("user"):
        st.markdown(query)

    with st.chat_message("assistant"):
        result = qa_chain.invoke({"query": query})
        st.markdown(result["result"])
        sources = list(set(
            d.metadata["source"] for d in result["source_documents"]
        ))
        with st.expander("Sources"):
            for src in sources:
                st.caption(f"\\U0001f4c4 {src}")
        st.session_state.messages.append({
            "role": "assistant",
            "content": result["result"],
            "sources": sources,
        })`,
      output: `Streamlit app running on http://localhost:8501

User: What was the Q4 2024 revenue?
Assistant: According to the annual report, the company reported revenue of $2.3 billion for Q4 2024, representing a 15% year-over-year increase.

Sources: sample_report.pdf (page 1)

User: How does this compare to the previous quarter?
Assistant: Based on the document, Q4 2024 revenue of $2.3B represents a 15% year-over-year increase. However, the document does not provide Q3 2024 data for direct quarter-over-quarter comparison.`,
      explanation: 'Full Streamlit chat interface with persistent session memory. The RAG system retrieves relevant chunks, generates answers using Llama 3, cites sources, and maintains conversation history for natural follow-up questions. The memory enables context-aware responses across the conversation.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Legal', description: 'Law firms use RAG to query thousands of case documents, contracts, and regulations. Lawyers can ask natural language questions about specific clauses, precedents, or compliance requirements.' },
      { industry: 'Healthcare', description: 'Medical researchers query clinical trial reports, research papers, and patient records. RAG helps find relevant studies for evidence-based medicine and clinical decision support.' },
      { industry: 'Enterprise', description: 'Companies index internal wikis, policy documents, and technical manuals. Employees get instant answers about HR policies, IT procedures, and product documentation.' },
    ],
    caseStudy: {
      problem: 'A Fortune 500 company had 200K+ internal documents spread across SharePoint, Confluence, and shared drives. Employees spent 4+ hours per week searching for information, and critical policies were frequently missed or misinterpreted.',
      solution: 'They deployed a RAG system indexing all 200K documents using a hybrid dense-sparse retrieval strategy. The system used an internal LLM (Llama 3 70B) ensuring data never left their VPC. A Streamlit web app provided the chat interface with Azure AD authentication.',
      results: 'Average document search time dropped from 4 hours to 3 minutes (98% reduction). Policy compliance improved 34% as employees could instantly find and cite correct procedures. The system handled 5K+ queries daily with 97% answer accuracy.',
    },
    bestPractices: [
      'Index documents with rich metadata (source, date, author, page) for citation and filtering',
      'Use chunk overlap (10-15%) to prevent information loss at chunk boundaries',
      'Prefer hybrid search (dense + sparse) for production — BM25 catches exact matches, embeddings catch semantic matches',
      'Always include source citations in responses for trust and verifiability',
      'Implement document-level access control to ensure users only query documents they have permission to see',
      'Monitor retrieval quality with RAGAS metrics (faithfulness, answer relevance, context precision)',
    ],
    tools: ['LangChain', 'ChromaDB / Pinecone / Weaviate', 'sentence-transformers', 'PyMuPDF / Unstructured', 'Ollama / OpenAI / Anthropic', 'Streamlit', 'Docker'],
    jobRoles: ['ML Engineer', 'NLP Engineer', 'Search Engineer', 'Backend Engineer'],
    furtherReading: [
      'LangChain Documentation: RAG Quickstart',
      'RAGAS: Evaluation Metrics for RAG Pipelines',
      'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020)',
      'Building RAG Systems — Jerry Liu (LlamaIndex)',
    ],
  },
  quiz: [
    {
      id: 'p21-rag-1', type: 'mcq',
      question: 'What is the primary purpose of chunk overlap in document splitting?',
      options: [
        'To reduce the total number of chunks',
        'To preserve context across chunk boundaries and avoid information loss',
        'To speed up the embedding process',
        'To reduce vector storage requirements',
      ],
      correctAnswer: 'To preserve context across chunk boundaries and avoid information loss',
      explanation: 'Chunk overlap ensures that context straddling the boundary between two chunks (e.g., a sentence split across two chunks) is preserved in at least one complete form, preventing information loss during retrieval.',
    },
    {
      id: 'p21-rag-2', type: 'code',
      question: 'What search type does this configuration use?',
      code: `retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 3, "lambda_mult": 0.5}
)`,
      options: [
        'Similarity search with diversity penalty',
        'Simple cosine similarity ranking',
        'Keyword-based BM25 search',
        'Hybrid search combining dense and sparse',
      ],
      correctAnswer: 'Similarity search with diversity penalty',
      explanation: 'MMR (Maximum Marginal Relevance) balances relevance to the query with diversity among results. lambda_mult controls the tradeoff: 0.5 means equal weight on relevance and diversity.',
    },
    {
      id: 'p21-rag-3', type: 'truefalse',
      question: 'RAG completely eliminates the risk of LLM hallucination.',
      correctAnswer: 'False',
      explanation: 'RAG reduces hallucination risk by grounding answers in retrieved context, but the LLM can still ignore context, misinterpret it, or fabricate details. Prompt engineering, output validation, and human review remain important.',
    },
    {
      id: 'p21-rag-4', type: 'fillblank',
      question: 'The RAG evaluation metric that measures whether the generated answer is factually grounded in the provided context is called ___.',
      correctAnswer: 'faithfulness',
      explanation: 'Faithfulness (from RAGAS) checks if all claims in the answer are supported by the retrieved context. A faithful answer does not introduce information not present in the context.',
    },
    {
      id: 'p21-rag-5', type: 'match',
      question: 'Match each RAG component with its role:',
      pairs: [
        { left: 'Embedding Model', right: 'Converts text chunks into dense vector representations' },
        { left: 'Vector Database', right: 'Stores embeddings and enables efficient similarity search' },
        { left: 'LLM Generator', right: 'Produces natural language answers from retrieved context' },
        { left: 'Retriever', right: 'Finds the most relevant chunks for a query' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each component plays a distinct role: the embedding model creates vector representations, the vector database indexes them for search, the retriever finds relevant chunks, and the LLM synthesizes the final answer from those chunks.',
    },
  ],
}))

export {}
