import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import api from "../services/api";

const roleCopy = {
  crp: {
    title: "CRP access",
    caption: "Coordinate mentors, review schools, and track action items.",
  },
  teacher: {
    title: "Teacher access",
    caption: "Ask better questions, plan faster, and act with confidence.",
  },
};

export default function Login() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [loginType, setLoginType] = useState("crp");
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

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.user_id,
          name: response.name,
          email: response.email,
          role: response.role,
          crp_id: response.crp_id,
        })
      );

      if (response.role === "crp") {
        navigate("/app/dashboard");
      } else if (response.role === "teacher") {
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

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (loginType === "teacher" && !selectedCRP) {
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
        grade: loginType === "teacher" ? grade : null,
        subject: loginType === "teacher" ? subject : null,
        location: loginType === "teacher" ? location : null,
        crp_id: loginType === "teacher" ? selectedCRP : null,
      });

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.user_id,
          name: response.name,
          email: response.email,
          role: response.role,
          crp_id: response.crp_id,
        })
      );

      if (response.role === "crp") {
        navigate("/app/dashboard");
      } else if (response.role === "teacher") {
        navigate("/teacher/query");
      }
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-emerald-200/40 focus:bg-white/[0.06]";

  return (
    <div className="min-h-screen overflow-hidden bg-[#0a0a0f] text-white">
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
            style={{ backgroundImage: 'url("/Div [bg-hero].png")' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,15,0.22)_0%,rgba(10,10,15,0.52)_55%,rgba(10,10,15,0.78)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-8 px-6 py-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <section className="hidden lg:block">
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white/70 backdrop-blur">
                <img src="/logo_with_bg.svg" alt="" className="h-5 w-5" />
                Shiksha Mitra access for teachers and school leaders
              </div>

              <h1 className="mt-6 max-w-lg bg-gradient-to-b from-white via-white/92 to-white/72 bg-clip-text text-4xl font-medium leading-[0.98] tracking-[-0.045em] text-transparent md:text-5xl">
                {isSignup ? "Create your workspace access." : "Welcome back to Shiksha Mitra."}
              </h1>

              <p className="mt-4 max-w-md text-base leading-7 text-white/58">
                {isSignup
                  ? "Set up your account to start planning lessons, supporting classrooms, and tracking school action in one place."
                  : "Sign in to continue with a calmer, sharper AI workflow for teaching and school support."}
              </p>

              <div className="mt-8 space-y-3 rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.24)] backdrop-blur">
                {[
                  "Teacher-ready AI planning and response support",
                  "Separate access flows for CRPs and teachers",
                  "Built for multilingual classroom and school workflows",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-white/72">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span className="text-sm leading-5">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="w-full">
            <div className="mx-auto w-full max-w-lg rounded-[1.7rem] border border-white/10 bg-[#11131a]/88 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl md:p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                    <img src="/logo_with_bg.svg" alt="Shiksha Mitra" className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/35">
                      {isSignup ? "Create account" : "Sign in"}
                    </p>
                    <h2 className="mt-1.5 text-xl font-semibold text-white">
                      {isSignup ? "Set up your account" : "Access your workspace"}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/65 transition hover:border-white/20 hover:text-white"
                >
                  Home
                </button>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/8 bg-black/20 p-2">
                {["crp", "teacher"].map((role) => {
                  const active = loginType === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setLoginType(role)}
                      className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                        active
                          ? "bg-white text-[#14151b] shadow-[0_10px_30px_rgba(255,255,255,0.08)]"
                          : "text-white/58 hover:text-white"
                      }`}
                    >
                      {role === "crp" ? "CRP" : "Teacher"}
                    </button>
                  );
                })}
              </div>

              <div className="mb-5 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">{roleCopy[loginType].title}</p>
                <p className="mt-1 text-sm leading-6 text-white/48">{roleCopy[loginType].caption}</p>
              </div>

              <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
                {isSignup && (
                  <div>
                    <label className="mb-2 block text-sm text-white/62">Full name</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={inputClassName}
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm text-white/62">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClassName}
                  />
                </div>

                {isSignup && loginType === "teacher" && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm text-white/62">Select your CRP</label>
                      <select
                        value={selectedCRP}
                        onChange={(e) => setSelectedCRP(e.target.value)}
                        required
                        className={inputClassName}
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
                        <label className="mb-2 block text-sm text-white/62">Grade</label>
                        <input
                          type="text"
                          placeholder="e.g. 5"
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className={inputClassName}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-white/62">Subject</label>
                        <input
                          type="text"
                          placeholder="e.g. Math"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className={inputClassName}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-white/62">Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Rural"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className={inputClassName}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="mb-2 block text-sm text-white/62">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={inputClassName}
                  />
                </div>

                {isSignup && (
                  <div>
                    <label className="mb-2 block text-sm text-white/62">Confirm password</label>
                    <input
                      type="password"
                      placeholder="••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={inputClassName}
                    />
                  </div>
                )}

                {!isSignup && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center text-sm text-white/52">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/20 bg-transparent text-emerald-300 focus:ring-emerald-300"
                      />
                      <span className="ml-2">Remember me</span>
                    </label>
                    <a href="#" className="text-sm text-white/58 transition hover:text-white">
                      Forgot password?
                    </a>
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#f7eff4] px-8 py-3.5 text-sm font-semibold text-[#17131b] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (isSignup ? "Creating account..." : "Signing in...") : isSignup ? "Create account" : "Sign in"}
                  {!loading && <ArrowRight className="h-5 w-5" />}
                </button>

                {!isSignup && (
                  <>
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-[#11131a] px-3 text-xs uppercase tracking-[0.24em] text-white/28">
                          Or
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-8 py-3.5 text-sm font-medium text-white/78 transition hover:border-white/20 hover:text-white"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign in with Google
                    </button>
                  </>
                )}

                <p className="pt-2 text-center text-sm text-white/52">
                  {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignup(!isSignup);
                      setError("");
                    }}
                    className="font-semibold text-white transition hover:text-emerald-200"
                  >
                    {isSignup ? "Sign in" : "Sign up"}
                  </button>
                </p>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
