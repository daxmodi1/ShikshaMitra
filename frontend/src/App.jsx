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
          <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 p-6">
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
        }
      />
    </Routes>
  );
}
