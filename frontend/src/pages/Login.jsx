import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false); // Toggle between login and signup
  const [loginType, setLoginType] = useState("crp"); // 'crp' or 'teacher'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCRP, setSelectedCRP] = useState("");
  const [crps, setCrps] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load CRPs when switching to teacher signup
  useEffect(() => {
    if (isSignup && loginType === "teacher") {
      loadCRPs();
    }
  }, [isSignup, loginType]);

  const loadCRPs = async () => {
    try {
      const crpList = await api.getCRPs();
      setCrps(crpList);
    } catch (err) {
      console.error("Failed to load CRPs:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.login(email, password);
      
      // Store user info
      localStorage.setItem('user', JSON.stringify({
        id: response.user_id,
        name: response.name,
        email: response.email,
        role: response.role,
        crp_id: response.crp_id
      }));

      // Navigate based on role
      if (response.role === 'crp') {
        navigate("/app/dashboard");
      } else if (response.role === 'teacher') {
        navigate("/teacher/query");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Validate CRP selection for teachers
    if (loginType === 'teacher' && !selectedCRP) {
      setError("Please select a CRP");
      return;
    }

    setLoading(true);

    try {
      const response = await api.signup({
        email,
        password,
        name,
        role: loginType,
        grade: loginType === 'teacher' ? grade : null,
        subject: loginType === 'teacher' ? subject : null,
        location: loginType === 'teacher' ? location : null,
        crp_id: loginType === 'teacher' ? selectedCRP : null
      });
      
      // Store user info
      localStorage.setItem('user', JSON.stringify({
        id: response.user_id,
        name: response.name,
        email: response.email,
        role: response.role,
        crp_id: response.crp_id
      }));

      // Navigate based on role
      if (response.role === 'crp') {
        navigate("/app/dashboard");
      } else if (response.role === 'teacher') {
        navigate("/teacher/query");
      }
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <img src="/logo.png" alt="Shiksha Mitra" className="w-16 h-16 rounded-lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignup ? "Create account" : "Welcome back!"}
          </h1>
          <p className="text-gray-600">
            {isSignup ? "Fill in your details to get started" : "Please enter your details to get started"}
          </p>
        </div>

        {/* Login/Signup Type Toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setLoginType("crp")}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              loginType === "crp"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            CRP {isSignup ? "Signup" : "Login"}
          </button>
          <button
            onClick={() => setLoginType("teacher")}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              loginType === "teacher"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Teacher {isSignup ? "Signup" : "Login"}
          </button>
        </div>

        <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-5">
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            />
          </div>

          {isSignup && loginType === "teacher" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Your CRP *</label>
                <select
                  value={selectedCRP}
                  onChange={(e) => setSelectedCRP(e.target.value)}
                  required
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                >
                  <option value="">Choose a CRP...</option>
                  {crps.map((crp) => (
                    <option key={crp.id} value={crp.id}>
                      {crp.name} ({crp.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                  <input
                    type="text"
                    placeholder="e.g., 5"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g., Math"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="e.g., Rural"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            />
          </div>

          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
              />
            </div>
          )}

          {!isSignup && (
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </a>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (isSignup ? "Creating account..." : "Signing in...") : (isSignup ? "Create account" : "Sign in")}
          </button>

          {!isSignup && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full border border-gray-300 hover:border-gray-400 bg-white text-gray-700 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </>
          )}

          <p className="text-center text-sm text-gray-600">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{' '}
            <button 
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
