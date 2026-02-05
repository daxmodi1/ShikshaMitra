from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.retrievers import BM25Retriever
from langchain_classic.retrievers import EnsembleRetriever
from langchain_core.documents import Document
from app.config import settings
from difflib import SequenceMatcher
import re

ensemble_retriever = None

embedding_function = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)


vector_db = Chroma(
    persist_directory=settings.CHROMA_DB_DIR,
    embedding_function=embedding_function,
    collection_name="ncert_pedagogy"
)

def initialize_retriever():
    global ensemble_retriever
    
    existing_docs = vector_db.get() 
    
    doc_objects = []
    if existing_docs['documents']:
        for i, text in enumerate(existing_docs['documents']):

            meta = existing_docs['metadatas'][i] if existing_docs['metadatas'] else {}
            doc_objects.append(Document(page_content=text, metadata=meta))

    if not doc_objects:
        print("Warning: Database is empty. Hybrid search will return nothing until data is ingested.")
        ensemble_retriever = None
        return

    bm25_retriever = BM25Retriever.from_documents(doc_objects)
    bm25_retriever.k = 3

    chroma_retriever = vector_db.as_retriever(search_kwargs={"k": 3})
    ensemble_retriever = EnsembleRetriever(
        retrievers=[bm25_retriever, chroma_retriever],
        weights=[0.5, 0.5]
    )
    print("Hybrid Retriever Initialized!")

def search_ncert(query_text: str):
    if not ensemble_retriever:
        initialize_retriever()
        if not ensemble_retriever: return []
    
    print(f"[RAG] Original query: {query_text}")
    
    # Try primary search first
    docs = ensemble_retriever.invoke(query_text)
    
    # If no results found, try fuzzy matching on key words
    if not docs or len(docs) == 0:
        print(f"[RAG] No results found. Attempting fuzzy matching...")
        # Extract key words (longer words, likely nouns/important terms)
        words = query_text.lower().split()
        key_words = [w for w in words if len(w) > 3]
        
        if key_words:
            # Try searching with each keyword individually
            for keyword in key_words:
                print(f"[RAG] Trying fuzzy search with keyword: {keyword}")
                docs = ensemble_retriever.invoke(keyword)
                if docs:
                    print(f"[RAG] Found {len(docs)} results with keyword '{keyword}'")
                    break
    
    result = [d.page_content for d in docs] if docs else []
    print(f"[RAG] Final results: {len(result)} documents found")
    return result

def insert_documents(texts: list, metadatas: list):
    docs = [Document(page_content=t, metadata=m) for t, m in zip(texts, metadatas)]
    
    vector_db.add_documents(docs)
    
    initialize_retriever()
    
    return len(texts)

def get_teacher_profile(teacher_id: str):
    return {
        "id": teacher_id,
        "grade": "5",
        "subject": "Math",
        "location": "Rural"
    }

initialize_retriever()