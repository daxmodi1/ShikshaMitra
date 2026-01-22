# Quick Setup Guide

## Step 1: Install Backend Dependencies

Open PowerShell in the backend directory:

```powershell
cd d:\PROJECT\Shisksha\backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
```

## Step 2: Start Backend Server

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Keep this terminal open. The backend will run at http://localhost:8000

## Step 3: Install Frontend Dependencies

Open a NEW PowerShell window in the frontend directory:

```powershell
cd d:\PROJECT\Shisksha\frontend
npm install
```

## Step 4: Start Frontend Server

```powershell
npm run dev
```

The frontend will run at http://localhost:5173

## Step 5: Access the Application

Open your browser and go to: http://localhost:5173

### Login with Demo Credentials:

**CRP (Cluster Resource Person):**
- Email: crp1@shiksha.com
- Password: password123

**Teacher:**
- Email: amit@school.com
- Password: teacher123

## Features You Can Test

### As a Teacher:
1. Login with teacher credentials
2. Type a question in Hindi/English/Hinglish
3. OR record a voice question
4. Get AI-powered responses
5. View your chat history

### As a CRP:
1. Login with CRP credentials
2. View analytics dashboard
3. See all teachers and their activities
4. Click "View Chats" to see individual teacher conversations
5. Analyze topics, sentiments, and languages

## Troubleshooting

**If backend fails to start:**
- Check if Python 3.9+ is installed: `python --version`
- Ensure virtual environment is activated
- Check if port 8000 is free

**If frontend fails to start:**
- Check if Node.js 16+ is installed: `node --version`
- Delete node_modules and run `npm install` again
- Check if port 5173 is free

**If API calls fail:**
- Ensure backend is running on port 8000
- Check .env file in frontend has correct API URL
- Check browser console for errors

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│  (React + Vite) │
│  Port: 5173     │
└────────┬────────┘
         │ HTTP Requests
         │ (JWT Token Auth)
         ▼
┌─────────────────┐
│   Backend       │
│   (FastAPI)     │
│  Port: 8000     │
└────────┬────────┘
         │
         ├──────► Groq AI (LLM + STT)
         │
         └──────► ChromaDB (Vector DB)
```

## New Features Added

### Backend:
✅ JWT Authentication
✅ User Management (CRP + Teacher)
✅ Chat History Storage
✅ Analytics Endpoints
✅ Voice Query Processing
✅ CORS Configuration

### Frontend:
✅ Dual Login System (CRP/Teacher)
✅ Teacher Query Interface
✅ Voice Recording
✅ Real-time Analytics Dashboard
✅ Teacher Chat History Viewer
✅ API Service Layer
✅ Protected Routes

## Files Created/Modified

### Backend:
- `app/models.py` - User, Teacher, ChatMessage models
- `app/auth.py` - JWT authentication
- `app/database.py` - In-memory database
- `app/main.py` - Updated with new endpoints
- `app/schemas.py` - Updated schemas
- `requirements.txt` - Added auth dependencies

### Frontend:
- `src/services/api.js` - API service
- `src/pages/Login.jsx` - Dual login
- `src/pages/TeacherQuery.jsx` - Teacher interface
- `src/pages/Dashboard.jsx` - Updated CRP dashboard
- `src/pages/Teachers.jsx` - Updated teacher list
- `src/pages/TeacherDetail.jsx` - Chat history viewer
- `src/App.jsx` - Updated routing
- `src/components/Sidebar.jsx` - Added logout
- `.env` - API configuration

## Next Steps for Production

1. Replace in-memory database with PostgreSQL
2. Add email verification
3. Implement password reset
4. Add rate limiting
5. Set up proper logging
6. Add file upload for teachers
7. Implement notification system
8. Add export functionality for CRP reports
9. Deploy to cloud (AWS/Azure/Vercel)
10. Set up CI/CD pipeline
