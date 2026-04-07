import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Teachers from "./pages/Teachers";
import TeacherDetail from "./pages/TeacherDetail";
import Schools from "./pages/Schools";
import Alerts from "./pages/Alerts";
import Insights from "./pages/Insights";
import Reports from "./pages/Reports";
import TeacherQuery from "./pages/TeacherQuery";
import Sidebar from "./components/Sidebar";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      
      {/* Teacher Routes */}
      <Route path="/teacher/*" element={
        <Routes>
          <Route path="query" element={<TeacherQuery />} />
        </Routes>
      } />
      
      {/* CRP Routes */}
      <Route
        path="/app/*"
        element={
          <div className="flex h-screen overflow-hidden bg-[#07080c] text-white">
            <Sidebar />
            <div className="relative flex-1 overflow-hidden">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(111,175,190,0.18),transparent_34%),radial-gradient(circle_at_right,rgba(108,75,119,0.16),transparent_28%)]" />
                <div className="absolute inset-0 bg-[#07080c]/94" />
              </div>
              <div className="auth-scrollbar relative h-full overflow-y-auto p-6">
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="teachers" element={<Teachers />} />
                  <Route path="teachers/:id" element={<TeacherDetail />} />
                  <Route path="schools" element={<Schools />} />
                  <Route path="alerts" element={<Alerts />} />
                  <Route path="insights" element={<Insights />} />
                  <Route path="reports" element={<Reports />} />
                </Routes>
              </div>
            </div>
          </div>
        }
      />
    </Routes>
  );
} 
