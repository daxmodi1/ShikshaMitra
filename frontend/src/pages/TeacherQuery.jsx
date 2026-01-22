import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function TeacherQuery() {
  const navigate = useNavigate();
  const [queryText, setQueryText] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [user, setUser] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await api.getTeacherHistory();
      setChatHistory(history);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const handleTextQuery = async (e) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const result = await api.teacherQueryText(queryText);
      setResponse(result);
      setQueryText("");
      loadHistory(); // Reload history
    } catch (error) {
      setResponse({ 
        answer_text: `Error: ${error.message}`, 
        detected_topic: "Error",
        query_sentiment: "Error",
        detected_language: "Unknown"
      });
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
    setLoading(true);
    setResponse(null);

    try {
      const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });
      const result = await api.teacherQueryVoice(audioFile);
      setResponse(result);
      loadHistory(); // Reload history
    } catch (error) {
      setResponse({ 
        answer_text: `Error: ${error.message}`, 
        detected_topic: "Error",
        query_sentiment: "Error",
        detected_language: "Unknown"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Shiksha Mitra</h1>
            <p className="text-sm text-gray-600">AI Assistant for Teachers</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Query Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Query Input Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Ask Your Question</h2>
              
              {/* Text Query */}
              <form onSubmit={handleTextQuery} className="mb-4">
                <textarea
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="Type your question in Hindi, English, or Hinglish..."
                  className="w-full border rounded-lg p-3 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading || recording}
                />
                <div className="flex gap-3 mt-3">
                  <button
                    type="submit"
                    disabled={loading || recording || !queryText.trim()}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : "Send Question"}
                  </button>
                </div>
              </form>

              {/* Voice Query */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-3">Or ask using your voice:</p>
                <button
                  onClick={recording ? stopRecording : startRecording}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                    recording
                      ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                >
                  <span className="text-xl">{recording ? "⏸️" : "🎤"}</span>
                  {recording ? "Stop Recording" : "Start Voice Recording"}
                </button>
              </div>
            </div>

            {/* Response Card */}
            {response && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Answer</h3>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {response.answer_text}
                  </p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500 text-xs">Topic</p>
                    <p className="font-semibold text-gray-700">{response.detected_topic}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500 text-xs">Sentiment</p>
                    <p className="font-semibold text-gray-700">{response.query_sentiment}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-500 text-xs">Language</p>
                    <p className="font-semibold text-gray-700">{response.detected_language}</p>
                  </div>
                </div>

                {/* Suggested Actions */}
                {response.suggested_actions && response.suggested_actions.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Suggested Actions:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {response.suggested_actions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History Sidebar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Chats</h3>
              <button
                onClick={async () => {
                  try {
                    await api.clearConversationMemory();
                    setResponse(null);
                    alert("Started new conversation!");
                  } catch (error) {
                    console.error("Failed to clear memory:", error);
                  }
                }}
                className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                + New Chat
              </button>
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {chatHistory.length === 0 ? (
                <p className="text-gray-500 text-sm">No chats yet. Start a conversation!</p>
              ) : (
                chatHistory.slice(0, 10).map((chat, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                    {/* User Query */}
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-lg flex-shrink-0">{chat.source_type === 'voice' ? '🎤' : '👤'}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">You</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{chat.query_text}</p>
                      </div>
                    </div>
                    {/* AI Response */}
                    <div className="flex items-start gap-2 mt-2 pl-2 border-l-2 border-blue-400">
                      <span className="text-lg flex-shrink-0">🤖</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-700">Shiksha Mitra</p>
                        <p className="text-sm text-gray-600 line-clamp-3">{chat.answer_text}</p>
                      </div>
                    </div>
                    {/* Metadata */}
                    <div className="flex gap-2 text-xs text-gray-500 mt-2 pt-2 border-t">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{chat.detected_topic}</span>
                      <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{chat.detected_language}</span>
                      <span className="ml-auto">{new Date(chat.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
