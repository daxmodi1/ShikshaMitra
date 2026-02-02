import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MessageCircle, ChevronDown } from "lucide-react";
import api from "../services/api";

export default function TeacherQuery() {
  const navigate = useNavigate();
  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentChat, setCurrentChat] = useState([]);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Clear old localStorage chat data - we now use database with sessions
    localStorage.removeItem('currentChat');
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('currentChatId');
    
    // Load chat sessions from database
    loadChatSessions();
  }, []);

  const loadChatSessions = async () => {
    try {
      const sessions = await api.getTeacherSessions();
      setChatSessions(sessions);
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat]);

  const handleTextQuery = async (e) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    const userMessage = { role: "user", text: queryText, timestamp: new Date() };
    setCurrentChat([...currentChat, userMessage]);
    setQueryText("");
    setLoading(true);

    try {
      // Send current chat history and session_id for context
      const result = await api.teacherQueryText(queryText, currentChat, currentSessionId);
      
      // Store session_id from response
      if (result.session_id && !currentSessionId) {
        setCurrentSessionId(result.session_id);
      }
      
      const aiMessage = { 
        role: "assistant", 
        text: result.answer_text,
        topic: result.detected_topic,
        sentiment: result.query_sentiment,
        language: result.detected_language,
        suggestedActions: result.suggested_actions,
        timestamp: new Date()
      };
      setCurrentChat(prev => [...prev, aiMessage]);
      
      // Reload chat sessions to show the updated session
      await loadChatSessions();
    } catch (error) {
      const errorMessage = { 
        role: "assistant", 
        text: `Error: ${error.message}`,
        topic: "Error",
        sentiment: "Error",
        language: "Unknown",
        timestamp: new Date()
      };
      setCurrentChat(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleVoiceQuery(audioBlob);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      alert("Microphone access denied or not available");
      console.error("Recording error:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
    }
  };

  const handleVoiceQuery = async (audioBlob) => {
    const userMessage = { role: "user", text: "🎤 Voice message sent", isVoice: true, timestamp: new Date() };
    const updatedChat = [...currentChat, userMessage];
    setCurrentChat(updatedChat);
    setLoading(true);

    try {
      const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });
      // Send current chat history and session_id for context
      const result = await api.teacherQueryVoice(audioFile, updatedChat, currentSessionId);
      
      // Store session_id from response
      if (result.session_id && !currentSessionId) {
        setCurrentSessionId(result.session_id);
      }
      
      const aiMessage = { 
        role: "assistant", 
        text: result.answer_text,
        topic: result.detected_topic,
        sentiment: result.query_sentiment,
        language: result.detected_language,
        suggestedActions: result.suggested_actions,
        timestamp: new Date()
      };
      setCurrentChat(prev => [...prev, aiMessage]);
      
      // Reload chat sessions to show the updated session
      await loadChatSessions();
    } catch (error) {
      const errorMessage = { 
        role: "assistant", 
        text: `Error: ${error.message}`,
        topic: "Error",
        sentiment: "Error",
        language: "Unknown",
        timestamp: new Date()
      };
      setCurrentChat(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setCurrentChat([]);
    setCurrentSessionId(null); // Clear session to create new one
  };

  const loadChatSession = (session) => {
    // Convert session messages to chat format
    const messages = [];
    session.messages.forEach(msg => {
      messages.push({ role: "user", text: msg.query_text, timestamp: new Date(msg.timestamp) });
      messages.push({ 
        role: "assistant", 
        text: msg.answer_text,
        topic: msg.detected_topic,
        sentiment: msg.query_sentiment,
        language: msg.detected_language,
        timestamp: new Date(msg.timestamp)
      });
    });
    setCurrentChat(messages);
    setCurrentSessionId(session.session_id);
  };

  const handleLogout = () => {
    api.logout();
    navigate("/login");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getChatPreview = (session) => {
    const query = session.first_query && session.first_query.length > 30 
      ? session.first_query.substring(0, 30) + "..." 
      : session.first_query || "New Chat";
    return query;
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col overflow-hidden`}>
        {/* Logo */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="Shiksha Mitra" className="w-8 h-8 rounded-lg" />
            <h1 className="text-lg font-bold text-gray-900">Shiksha Mitra</h1>
          </div>

          {/* New Chat Button */}
          <button
            onClick={startNewChat}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <Plus size={18} /> New chat
          </button>
        </div>

        {/* Chat History Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Recent Chats</p>
          <div className="space-y-1">
            {chatSessions.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-4">No chats yet</p>
            ) : (
              chatSessions.map((session, idx) => (
                <button
                  key={session.session_id}
                  onClick={() => loadChatSession(session)}
                  className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                    currentSessionId === session.session_id 
                      ? 'bg-gray-100 text-gray-900 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={session.first_query}
                >
                  <div className="flex items-start gap-2">
                    <MessageCircle size={14} className="flex-shrink-0 mt-1 text-gray-500" />
                    <p className="truncate text-xs">{getChatPreview(session)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm text-gray-700 font-medium"
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-semibold text-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">Logout</p>
            </div>
            <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900 p-2 rounded-lg transition-colors"
          >
            <span className="text-xl">{sidebarOpen ? '☰' : '☰'}</span>
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col">
          {currentChat.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full -mt-20">
              <div className="text-center max-w-md">
                <div className="text-5xl mb-4 flex items-center justify-center">
                  <span className="relative">
                    Evening, {user?.name?.split(' ')[0] || 'Teacher'}
                  </span>
                </div>
                <input
                  type="text"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="How can I help you today?"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleTextQuery(e);
                  }}
                  disabled={loading || recording}
                  className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white text-gray-900 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 transition-colors mt-8"
                />
              </div>
            </div>
          ) : (
            <>
              {currentChat.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div
                    className={`max-w-2xl ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-3xl rounded-br-none'
                        : 'text-gray-900'
                    } p-4 rounded-lg`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.text}</p>
                    {msg.role === 'assistant' && msg.topic && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-300">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">📚 {msg.topic}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">💭 {msg.sentiment}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">🌐 {msg.language}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start mb-4">
                  <div className="flex gap-2 p-4">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        {currentChat.length > 0 && (
          <div className="border-t border-gray-200 p-8">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleTextQuery} className="flex gap-3 items-end">
                <input
                  type="text"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="How can I help you today?"
                  disabled={loading || recording}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 focus:bg-white text-gray-900 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 transition-colors"
                />
                <button
                  onClick={recording ? stopRecording : startRecording}
                  disabled={loading}
                  className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed p-2"
                >
                  <span className="text-xl">{recording ? "⏹" : "🎤"}</span>
                </button>
                <button
                  type="submit"
                  disabled={loading || recording || !queryText.trim()}
                  className="bg-orange-400 hover:bg-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors flex-shrink-0"
                >
                  <span className="text-xl">↑</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
