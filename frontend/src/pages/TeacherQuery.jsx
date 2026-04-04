import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Menu,
  MessageCircle,
  Mic,
  PanelLeftClose,
  Plus,
  Square,
} from "lucide-react";
import api from "../services/api";
import { renderFormattedResponse } from "../utils/textFormatting.jsx";

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
  const [audioLevels, setAudioLevels] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationIdRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    localStorage.removeItem("currentChat");
    localStorage.removeItem("chatHistory");
    localStorage.removeItem("currentChatId");

    loadChatSessions();
  }, []);

  const loadChatSessions = async () => {
    try {
      const sessions = await api.getTeacherSessions();
      setChatSessions(sessions);
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
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
      const result = await api.teacherQueryText(
        queryText,
        currentChat,
        currentSessionId
      );

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
        timestamp: new Date(),
      };
      setCurrentChat((prev) => [...prev, aiMessage]);
      await loadChatSessions();
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        text: `Error: ${error.message}`,
        topic: "Error",
        sentiment: "Error",
        language: "Unknown",
        timestamp: new Date(),
      };
      setCurrentChat((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleVoiceQuery(audioBlob);
        cancelAnimationFrame(animationIdRef.current);
        setAudioLevels([]);
        clearInterval(timerIntervalRef.current);
        setRecordingTime(0);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      visualizeAudio(analyser);
    } catch (error) {
      alert("Microphone access denied or not available");
      console.error("Recording error:", error);
      clearInterval(timerIntervalRef.current);
    }
  };

  const visualizeAudio = (analyser) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const updateLevels = () => {
      analyser.getByteFrequencyData(dataArray);
      const levels = Array.from(dataArray.slice(0, 40)).map((v) => (v / 255) * 100);
      setAudioLevels(levels);
      animationIdRef.current = requestAnimationFrame(updateLevels);
    };
    updateLevels();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      clearInterval(timerIntervalRef.current);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const handleVoiceQuery = async (audioBlob) => {
    setLoading(true);

    try {
      const audioFile = new File([audioBlob], "recording.webm", {
        type: "audio/webm",
      });
      const result = await api.teacherQueryVoice(
        audioFile,
        currentChat,
        currentSessionId
      );

      if (result.session_id && !currentSessionId) {
        setCurrentSessionId(result.session_id);
      }

      const userMessage = {
        role: "user",
        text: result.query_text || "Voice message",
        isVoice: true,
        timestamp: new Date(),
      };

      const aiMessage = {
        role: "assistant",
        text: result.answer_text,
        topic: result.detected_topic,
        sentiment: result.query_sentiment,
        language: result.detected_language,
        suggestedActions: result.suggested_actions,
        timestamp: new Date(),
      };
      setCurrentChat((prev) => [...prev, userMessage, aiMessage]);
      await loadChatSessions();
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        text: `Error: ${error.message}`,
        topic: "Error",
        sentiment: "Error",
        language: "Unknown",
        timestamp: new Date(),
      };
      setCurrentChat((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setCurrentChat([]);
    setCurrentSessionId(null);
  };

  const loadChatSession = (session) => {
    const messages = [];
    session.messages.forEach((msg) => {
      messages.push({
        role: "user",
        text: msg.query_text,
        timestamp: new Date(msg.timestamp),
      });
      messages.push({
        role: "assistant",
        text: msg.answer_text,
        topic: msg.detected_topic,
        sentiment: msg.query_sentiment,
        language: msg.detected_language,
        timestamp: new Date(msg.timestamp),
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
    const query =
      session.first_query && session.first_query.length > 30
        ? session.first_query.substring(0, 30) + "..."
        : session.first_query || "New Chat";
    return query;
  };

  const shellCard =
    "rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl";

  return (
    <div className="flex h-screen overflow-hidden bg-[#07080c] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(111,175,190,0.2),transparent_34%),radial-gradient(circle_at_right,rgba(108,75,119,0.18),transparent_26%)]" />
        <div className="absolute inset-0 bg-[#07080c]/94" />
      </div>

      <div
        className={`relative z-10 flex h-full flex-col overflow-hidden border-r border-white/8 bg-[#0b0b10]/92 backdrop-blur-xl transition-all duration-300 ${
          sidebarOpen ? "w-80 px-4 py-4" : "w-0 px-0 py-0"
        }`}
      >
        {sidebarOpen && (
          <>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-5 flex items-center gap-3">
                <img
                  src="/logo_with_bg.svg"
                  alt="Shiksha Mitra"
                  className="h-11 w-11 rounded-2xl"
                />
                <div>
                  <h1 className="text-base font-semibold text-white">
                    Shiksha Mitra
                  </h1>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.28em] text-white/42">
                    Teacher Workspace
                  </div>
                </div>
              </div>

              <button
                onClick={startNewChat}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.09]"
              >
                <Plus className="h-4 w-4" /> New chat
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03]">
              <div className="border-b border-white/8 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/42">
                  Recent Chats
                </p>
              </div>

              <div className="auth-scrollbar h-full overflow-y-auto px-3 py-3">
                <div className="space-y-2 pb-24">
                  {chatSessions.length === 0 ? (
                    <p className="px-3 py-8 text-center text-sm text-white/38">
                      No chats yet
                    </p>
                  ) : (
                    chatSessions.map((session) => (
                      <button
                        key={session.session_id}
                        onClick={() => loadChatSession(session)}
                        className={`w-full rounded-2xl p-3 text-left transition ${
                          currentSessionId === session.session_id
                            ? "border border-white/12 bg-white/[0.07] text-white"
                            : "border border-transparent text-white/62 hover:bg-white/[0.04] hover:text-white"
                        }`}
                        title={session.first_query}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-xl bg-white/[0.06] p-2">
                            <MessageCircle className="h-4 w-4" />
                          </div>
                          <p className="line-clamp-2 text-sm">{getChatPreview(session)}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-3 text-left transition hover:bg-white/[0.06]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] text-sm font-semibold text-white">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-white/42">Logout</p>
                </div>
                <ChevronDown className="h-4 w-4 text-white/36" />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>

          <div className="hidden text-[11px] uppercase tracking-[0.3em] text-white/38 md:block">
            Classroom AI Support
          </div>

          <button
            onClick={() => navigate("/")}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72 transition hover:bg-white/[0.08] hover:text-white"
          >
            Home
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-5 py-5">
          <div className="mx-auto flex h-full w-full max-w-5xl min-h-0 flex-col">
            <div className={`${shellCard} flex min-h-0 flex-1 flex-col overflow-hidden`}>
              <div className="border-b border-white/8 px-6 py-5">
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">
                  Ask Shiksha Mitra
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                  Teacher query workspace
                </h2>
              </div>

              <div className="auth-scrollbar flex-1 overflow-y-auto px-6 py-6">
                {currentChat.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/60">
                      <img src="/logo_with_bg.svg" alt="" className="h-5 w-5" />
                      Smart support for lessons, classrooms, and school action
                    </div>
                    <h1 className="mt-8 max-w-3xl bg-gradient-to-b from-white via-white/90 to-white/70 bg-clip-text text-4xl font-medium tracking-[-0.05em] text-transparent md:text-6xl">
                      Ask better questions.
                      <br />
                      Get classroom-ready answers.
                    </h1>
                    <p className="mt-5 max-w-xl text-sm leading-7 text-white/52">
                      Plan faster, solve classroom challenges, and get support in a
                      calm workspace built for teachers.
                    </p>

                    <form onSubmit={handleTextQuery} className="mt-8 w-full max-w-2xl">
                      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] p-2">
                        <input
                          type="text"
                          value={queryText}
                          onChange={(e) => setQueryText(e.target.value)}
                          placeholder="How can I help you today?"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") handleTextQuery(e);
                          }}
                          disabled={loading || recording}
                          className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/32 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={recording ? stopRecording : startRecording}
                          disabled={loading}
                          className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition ${
                            recording
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-white/[0.05] text-white/60 hover:bg-white/[0.08] hover:text-white"
                          }`}
                        >
                          {recording ? (
                            <Square className="h-4 w-4" />
                          ) : (
                            <Mic className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="submit"
                          disabled={loading || recording || !queryText.trim()}
                          className="rounded-full bg-[#f7eff4] px-5 py-3 text-sm font-semibold text-[#17131b] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <>
                    <div className="space-y-5">
                      {currentChat.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${
                            msg.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-3xl rounded-[26px] border px-5 py-4 ${
                              msg.role === "user"
                                ? "border-white/10 bg-[#f7eff4] text-[#17131b]"
                                : "border-white/10 bg-white/[0.05] text-white"
                            }`}
                          >
                            <div className="space-y-2 text-sm leading-7">
                              {renderFormattedResponse(msg.text)}
                            </div>

                            {msg.role === "assistant" && msg.topic && (
                              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/8 pt-4">
                                <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/64">
                                  Topic: {msg.topic}
                                </span>
                                <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/64">
                                  Sentiment: {msg.sentiment}
                                </span>
                                <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/64">
                                  Language: {msg.language}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {loading && (
                        <div className="flex justify-start">
                          <div className="flex gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-white/45"></div>
                            <div
                              className="h-2 w-2 animate-bounce rounded-full bg-white/45"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="h-2 w-2 animate-bounce rounded-full bg-white/45"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {currentChat.length > 0 && (
                <div className="border-t border-white/8 px-6 py-5">
                  {recording && (
                    <div className="mb-4 rounded-[24px] border border-red-500/20 bg-red-500/8 px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="animate-pulse">
                            <Mic className="h-4 w-4 text-red-400" />
                          </div>
                          <span className="text-sm font-medium text-red-300">
                            Recording
                          </span>
                        </div>
                        <span className="text-sm font-mono text-red-200">
                          {formatTime(recordingTime)}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-center gap-1">
                        {audioLevels.map((level, idx) => (
                          <div
                            key={idx}
                            className="rounded-full bg-gradient-to-t from-red-500 to-red-300 transition-all duration-75"
                            style={{
                              width: "3px",
                              height: `${Math.max(8, level / 1.5)}%`,
                              minHeight: "8px",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleTextQuery} className="flex gap-3">
                    <input
                      type="text"
                      value={queryText}
                      onChange={(e) => setQueryText(e.target.value)}
                      placeholder="Ask about lessons, behavior, reports, or classroom support..."
                      disabled={loading || recording}
                      className="flex-1 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white placeholder:text-white/32 focus:border-white/16 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={recording ? stopRecording : startRecording}
                      disabled={loading}
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-full transition ${
                        recording
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "border border-white/10 bg-white/[0.05] text-white/66 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      {recording ? (
                        <Square className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="submit"
                      disabled={loading || recording || !queryText.trim()}
                      className="rounded-full bg-[#f7eff4] px-6 py-3 text-sm font-semibold text-[#17131b] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
