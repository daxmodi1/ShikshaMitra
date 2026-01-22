import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState("crp"); // 'crp' or 'teacher'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Shiksha Mitra Login
        </h1>

        {/* Login Type Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setLoginType("crp")}
            className={`flex-1 py-2 rounded ${
              loginType === "crp"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            CRP Login
          </button>
          <button
            onClick={() => setLoginType("teacher")}
            className={`flex-1 py-2 rounded ${
              loginType === "teacher"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Teacher Login
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border p-3 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border p-3 mb-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loginType === "crp" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
            } text-white py-3 rounded font-semibold transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded text-xs">
          <p className="font-semibold mb-2 text-gray-700">Demo Credentials:</p>
          <div className="space-y-1 text-gray-600">
            <p><strong>CRP:</strong> crp1@shiksha.com / password123</p>
            <p><strong>Teacher:</strong> amit@school.com / teacher123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
