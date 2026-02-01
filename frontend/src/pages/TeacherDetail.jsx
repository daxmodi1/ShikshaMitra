import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function TeacherDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    loadChats();
  }, [id]);

  const loadChats = async () => {
    try {
      const data = await api.getTeacherChats(id);
      setChats(data);
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading chat history...</div>;
  }

  const teacher = chats.length > 0 ? chats[0].teacher_name : "Teacher";

  // Group chats by topic
  const topicGroups = chats.reduce((acc, chat) => {
    const topic = chat.detected_topic;
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(chat);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/app/teachers")}
          className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
        >
          ← Back to Teachers
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{teacher}'s Chat History</h1>
          <p className="text-sm text-gray-600">Review teacher queries and responses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-semibold text-gray-900 mb-4">All Queries ({chats.length})</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-3 rounded-lg cursor-pointer border ${
                  selectedChat?.id === chat.id
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  <span>{chat.source_type === 'voice' ? '🎤' : '💬'}</span>
                  <p className="text-sm line-clamp-2 text-gray-800">{chat.query_text}</p>
                </div>
                <div className="flex gap-2 text-xs text-gray-500 mt-2">
                  <span className="bg-white border border-gray-200 px-2 py-0.5 rounded">{chat.detected_topic}</span>
                  <span>{new Date(chat.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Detail */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <span>{selectedChat.source_type === 'voice' ? '🎤 Voice Query' : '💬 Text Query'}</span>
                  <span>•</span>
                  <span>{new Date(selectedChat.timestamp).toLocaleString()}</span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">Question</h3>
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg mb-6">
                  <p className="text-gray-800">{selectedChat.query_text}</p>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">Answer</h3>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selectedChat.answer_text}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Topic</p>
                    <p className="font-semibold text-gray-900">{selectedChat.detected_topic}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Sentiment</p>
                    <p className="font-semibold text-gray-900">{selectedChat.query_sentiment}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Language</p>
                    <p className="font-semibold text-gray-900">{selectedChat.detected_language}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center text-gray-500">
              Select a query from the list to view details
            </div>
          )}

          {/* Topic Summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Query Topics Summary</h3>
            <div className="space-y-2">
              {Object.entries(topicGroups).map(([topic, chats]) => (
                <div key={topic} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-800">{topic}</span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                    {chats.length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
