import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-96">
        <h1 className="text-xl font-semibold mb-6 text-center">
          CRP Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-4 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-6 rounded"
        />

        <button
          onClick={() => navigate("/app/dashboard")}
          className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800"
        >
          Login
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          *Simulated login for MVP
        </p>
      </div>
    </div>
  );
}
