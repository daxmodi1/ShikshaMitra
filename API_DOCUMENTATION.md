# API Documentation

Base URL: `http://localhost:8000`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Public Endpoints

### Login
**POST** `/api/auth/login`

Authenticate a user and receive JWT token.

**Request Body:**
```json
{
  "email": "amit@school.com",
  "password": "teacher123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "T1",
  "name": "Amit Singh",
  "email": "amit@school.com",
  "role": "teacher",
  "crp_id": "crp1"
}
```

---

## Teacher Endpoints

### Submit Text Query
**POST** `/api/teacher/query`

Submit a text-based question to the AI.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "query_text": "How can I improve student engagement in math class?"
}
```

**Response:**
```json
{
  "answer_text": "Here are some effective strategies...",
  "source_documents": ["NCERT Chapter 3...", "Pedagogy Guide..."],
  "suggested_actions": [
    "Use visual aids",
    "Include group activities"
  ],
  "detected_topic": "Classroom Management",
  "query_sentiment": "Curious",
  "detected_language": "English"
}
```

---

### Submit Voice Query
**POST** `/api/teacher/query-voice`

Submit a voice recording for transcription and AI response.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (multipart/form-data)
- `file`: Audio file (webm, mp3, wav)

**Response:**
```json
{
  "answer_text": "मैं आपकी मदद कर सकता हूं...",
  "source_documents": ["..."],
  "suggested_actions": ["..."],
  "detected_topic": "Subject Knowledge",
  "query_sentiment": "Neutral",
  "detected_language": "Hindi"
}
```

---

### Get Chat History
**GET** `/api/teacher/history`

Retrieve teacher's chat history (last 50 queries).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid-1",
    "teacher_id": "T1",
    "teacher_name": "Amit Singh",
    "query_text": "How to teach fractions?",
    "answer_text": "Here are some methods...",
    "detected_topic": "Subject Knowledge",
    "query_sentiment": "Curious",
    "detected_language": "English",
    "source_type": "text",
    "timestamp": "2026-01-22T10:30:00"
  }
]
```

---

### Get Teacher Profile
**GET** `/api/teacher/profile`

Get current teacher's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "T1",
  "name": "Amit Singh",
  "email": "amit@school.com",
  "phone": null,
  "grade": "5",
  "subject": "Math",
  "location": "Rural",
  "total_queries": 42,
  "last_active": "2026-01-22T10:30:00"
}
```

---

## CRP Endpoints

### Get All Teachers
**GET** `/api/crp/teachers`

Get list of all teachers under the CRP.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "T1",
    "name": "Amit Singh",
    "email": "amit@school.com",
    "phone": null,
    "grade": "5",
    "subject": "Math",
    "location": "Rural",
    "total_queries": 42,
    "last_active": "2026-01-22T10:30:00"
  }
]
```

---

### Get All Chats
**GET** `/api/crp/chats`

Get all chat messages from teachers under this CRP (last 100).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid-1",
    "teacher_id": "T1",
    "teacher_name": "Amit Singh",
    "query_text": "How to teach fractions?",
    "answer_text": "Here are some methods...",
    "detected_topic": "Subject Knowledge",
    "query_sentiment": "Curious",
    "detected_language": "English",
    "source_type": "text",
    "timestamp": "2026-01-22T10:30:00"
  }
]
```

---

### Get Specific Teacher's Chats
**GET** `/api/crp/teacher/{teacher_id}/chats`

Get chat history for a specific teacher.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `teacher_id`: Teacher's ID (e.g., "T1")

**Response:**
```json
[
  {
    "id": "uuid-1",
    "teacher_id": "T1",
    "teacher_name": "Amit Singh",
    "query_text": "How to teach fractions?",
    "answer_text": "Here are some methods...",
    "detected_topic": "Subject Knowledge",
    "query_sentiment": "Curious",
    "detected_language": "English",
    "source_type": "text",
    "timestamp": "2026-01-22T10:30:00"
  }
]
```

---

### Get Analytics
**GET** `/api/crp/analytics`

Get comprehensive analytics for CRP's teachers.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "crp_id": "crp1",
  "total_teachers": 3,
  "active_teachers_today": 2,
  "total_queries_today": 5,
  "top_topics": [
    {
      "topic": "Classroom Management",
      "count": 15
    },
    {
      "topic": "Subject Knowledge",
      "count": 12
    }
  ],
  "sentiment_distribution": {
    "Curious": 20,
    "Frustrated": 5,
    "Neutral": 10
  },
  "language_distribution": {
    "Hindi": 18,
    "English": 12,
    "Hinglish": 5
  }
}
```

---

## Admin Endpoints

### Ingest PDF
**POST** `/api/ingest-pdf`

Upload a PDF file to add to the knowledge base.

**Request Body:** (multipart/form-data)
- `file`: PDF file

**Response:**
```json
{
  "message": "Successfully ingested 25 chunks from document.pdf"
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not authorized. Teacher access required."
}
```

### 404 Not Found
```json
{
  "detail": "Teacher profile not found"
}
```

### 400 Bad Request
```json
{
  "detail": "Audio could not be understood"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider:
- 10 requests per minute for query endpoints
- 100 requests per hour for analytics endpoints

---

## WebSocket Support

Not currently implemented. Consider adding for:
- Real-time chat updates
- Live analytics updates
- Teacher status updates

---

## Testing with cURL

### Login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"amit@school.com","password":"teacher123"}'
```

### Text Query:
```bash
curl -X POST http://localhost:8000/api/teacher/query \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query_text":"How to teach fractions?"}'
```

### Voice Query:
```bash
curl -X POST http://localhost:8000/api/teacher/query-voice \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@recording.webm"
```

### Get Analytics:
```bash
curl -X GET http://localhost:8000/api/crp/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Interactive API Documentation

FastAPI provides automatic interactive documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

These interfaces allow you to test all endpoints directly from the browser.
