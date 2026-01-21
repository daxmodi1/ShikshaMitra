import { useParams } from "react-router-dom";
import teachers from "../data/teachers.json";
import schools from "../data/schools.json";

export default function TeacherDetail() {
  const { id } = useParams();
  const teacher = teachers.find(t => t.teacherId === id);
  const school = schools.find(s => s.schoolId === teacher.schoolId);

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">
        Teacher Profile
      </h1>

      <div className="bg-white p-6 rounded shadow space-y-3">
        <div><b>Name:</b> {teacher.name}</div>
        <div><b>School:</b> {school.name}</div>
        <div><b>Subject:</b> {teacher.subject}</div>
        <div><b>Grades:</b> {teacher.grades.join(", ")}</div>
        <div><b>Experience:</b> {teacher.experience} years</div>
        <div><b>Monthly Queries:</b> {teacher.monthlyQueries}</div>
        <div><b>Common Issues:</b> {teacher.commonIssues.join(", ")}</div>
      </div>
    </>
  );
}
