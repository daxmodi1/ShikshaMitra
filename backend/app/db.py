from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.retrievers import BM25Retriever
from langchain_classic.retrievers import EnsembleRetriever
from langchain_core.documents import Document
from app.config import settings

ensemble_retriever = None

embedding_function = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)


vector_db = Chroma(
    persist_directory=settings.CHROMA_DB_DIR,
    embedding_function=embedding_function,
    collection_name="ncert_pedagogy"
)

def initialize_retriever():
    """
    Builds the Hybrid Retriever (Vector + Keyword).
    Must be called on startup and after ingesting new files.
    """
    global ensemble_retriever
    
    # A. Get all documents to build the BM25 Keyword Index
    # Note: For massive datasets, you wouldn't load everything, 
    # but for a school library/hackathon, this is fine.
    existing_docs = vector_db.get() 
    
    # Convert Chroma format to LangChain Documents
    doc_objects = []
    if existing_docs['documents']:
        for i, text in enumerate(existing_docs['documents']):
            # Safely handle metadata if it exists
            meta = existing_docs['metadatas'][i] if existing_docs['metadatas'] else {}
            doc_objects.append(Document(page_content=text, metadata=meta))

    if not doc_objects:
        print("Warning: Database is empty. Hybrid search will return nothing until data is ingested.")
        ensemble_retriever = None
        return

    # B. Create Retrievers
    # 1. Keyword Retriever (BM25) - Standard BM25 from LangChain
    bm25_retriever = BM25Retriever.from_documents(doc_objects)
    bm25_retriever.k = 3  # Fetch top 3 keyword matches

    # 2. Vector Retriever (Semantic)
    chroma_retriever = vector_db.as_retriever(search_kwargs={"k": 3})

    # C. Combine them (Hybrid)
    # Weights: 0.5 for Keyword, 0.5 for Vector (Balanced)
    ensemble_retriever = EnsembleRetriever(
        retrievers=[bm25_retriever, chroma_retriever],
        weights=[0.5, 0.5]
    )
    print("Hybrid Retriever Initialized!")

def search_ncert(query_text: str):
    """
    Performs the Hybrid Search.
    """
    if not ensemble_retriever:
        initialize_retriever()
        if not ensemble_retriever: return [] # Still empty

    # Invoke the ensemble chain
    docs = ensemble_retriever.invoke(query_text)
    
    # Return list of strings for your AI prompt
    return [d.page_content for d in docs]

def insert_documents(texts: list, metadatas: list):
    """
    Inserts text into Chroma and REBUILDS the retriever 
    so the new keywords are searchable.
    """
    # Create LangChain Document objects
    docs = [Document(page_content=t, metadata=m) for t, m in zip(texts, metadatas)]
    
    # Add to Chroma
    vector_db.add_documents(docs)
    
    # Refresh the Hybrid Index immediately
    initialize_retriever()
    
    return len(texts)

# --- Mock Postgres ---
def get_teacher_profile(teacher_id: str):
    return {
        "id": teacher_id,
        "grade": "5",
        "subject": "Math",
        "location": "Rural"
    }

# Initialize on module load
initialize_retriever()