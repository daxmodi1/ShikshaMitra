import chromadb
from chromadb.utils import embedding_functions
from app.config import settings

# --- ChromaDB Setup ---
chroma_client = chromadb.PersistentClient(path=settings.CHROMA_DB_DIR)
embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name=settings.EMBEDDING_MODEL
)

def get_vector_collection():
    """Returns the ChromaDB collection for NCERT content."""
    return chroma_client.get_or_create_collection(
        name="ncert_pedagogy",
        embedding_function=embedding_func
    )

def search_ncert(query_text: str, n_results: int = 2):
    """Semantic search for pedagogy strategies."""
    collection = get_vector_collection()
    results = collection.query(query_texts=[query_text], n_results=n_results)
    return results['documents'][0] if results['documents'] else []

# --- Postgres Mock Setup ---
def get_teacher_profile(teacher_id: str):
    """Mock database fetch for teacher context."""
    # In production, use SQLAlchemy here
    return {
        "id": teacher_id,
        "grade": "5",
        "subject": "Math",
        "location": "Rural"
    }