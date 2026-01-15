from app.db import get_vector_collection

def ingest_data():
    collection = get_vector_collection()
    
    documents = [
        "To teach counting, use pebbles and local leaves. (Grade 1 Math)",
        "For classroom management, use the 'Monitor System' to assign roles. (General)",
        "Use 'Think-Pair-Share' to encourage shy students to speak. (Pedagogy)"
    ]
    ids = [f"doc_{i}" for i in range(len(documents))]
    
    print(f"Adding {len(documents)} documents to ChromaDB...")
    collection.add(documents=documents, ids=ids)
    print("Done!")

if __name__ == "__main__":
    ingest_data()