import { useNavigate } from "react-router-dom";
import { MessageSquare, Mic, BarChart3, BookOpen, Languages, History } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Shiksha Mitra" className="w-10 h-10 rounded-lg" />
            <span className="text-xl font-bold text-gray-900">Shiksha Mitra</span>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center gap-8">
            <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium">
              Home
            </a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium">
              About Us
            </a>
            <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium">
              Features
            </a>
          </div>

          <button
            onClick={() => navigate("/login")}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <div className="inline-block bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Empowering Teachers with AI
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
          AI-Powered Teacher
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Support Platform
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
          Get instant AI assistance for teaching challenges, student management, and curriculum planning
        </p>

        {/* Description */}
        <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
          Empowering teachers across India with intelligent AI mentorship and real-time support
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-20">
          <button
            onClick={() => navigate("/login")}
            className="bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all flex items-center gap-2 group"
          >
            Get Started
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <button className="border-2 border-gray-300 text-gray-900 px-8 py-3 rounded-full font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors flex items-center gap-2">
            <span>▶</span> Watch Demo
          </button>
        </div>

        {/* Hero Image Section */}
        </div>
      </div>

      {/* Features Section and Below */}
      <div className="bg-white">
      <div id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wider">FEATURES</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 max-w-3xl mx-auto leading-tight">
            Powerful features to simplify your teaching experience
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 - Spanning 2 columns on large screens */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 hover:border-blue-200 transition-all">
            <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">AI Chat Assistant</h3>
            <p className="text-gray-600 leading-relaxed">
              Get personalized teaching recommendations with AI-powered tools that help you create polished, professional lesson plans effortlessly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 hover:border-blue-200 transition-all">
            <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <Mic className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Voice Support</h3>
            <p className="text-gray-600 leading-relaxed">
              Ask questions using voice and get responses in your preferred language - hands-free learning.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 hover:border-blue-200 transition-all">
            <div className="bg-green-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Analytics Dashboard</h3>
            <p className="text-gray-600 leading-relaxed">
              Boost your teaching effectiveness with integrated analytics and performance tracking tools.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 hover:border-blue-200 transition-all">
            <div className="bg-orange-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <BookOpen className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">NCERT Integrated</h3>
            <p className="text-gray-600 leading-relaxed">
              Easily connect with NCERT curriculum and resources for a comprehensive teaching experience.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 hover:border-blue-200 transition-all">
            <div className="bg-pink-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <Languages className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Multilingual</h3>
            <p className="text-gray-600 leading-relaxed">
              Create lessons that work beautifully in Hindi, English, or Hinglish on any device.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="about" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Three simple steps to get started</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sign Up</h3>
              <p className="text-gray-600">
                Create your account in seconds with your email and school details
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Ask Questions</h3>
              <p className="text-gray-600">
                Type or speak your questions about teaching, curriculum, or student management
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Answers</h3>
              <p className="text-gray-600">
                Receive instant, expert-level responses tailored to Indian education context
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Powered By Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-gray-600 font-semibold">Powered by</p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
          <img src="/groq-logo.svg" alt="Groq AI" className="h-8" />
          <img src="/chromaDB.svg" alt="ChromaDB" className="h-8" />
          <img src="/langchain-1.svg" alt="LangChain" className="h-8" />
          <img src="/FastAPI.png" alt="FastAPI" className="h-8" />
          <img src="/React_logo_wordmark.png" alt="React" className="h-8" />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Shiksha Mitra" className="w-8 h-8 rounded-lg" />
                <span className="text-white font-bold">Shiksha Mitra</span>
              </div>
              <p className="text-sm">Empowering teachers with AI</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Shiksha Mitra. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
