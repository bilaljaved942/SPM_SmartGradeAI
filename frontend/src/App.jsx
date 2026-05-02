import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BookOpen, User, CheckCircle, GraduationCap } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function App() {
  const [role, setRole] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col font-sans">
      <header className="bg-white/70 backdrop-blur-md shadow-sm p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-indigo-600 w-8 h-8" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
              SmartGradeAI
            </h1>
          </div>
          {role && (
            <button 
              onClick={() => setRole(null)}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Switch Role
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6">
        {!role ? (
          <RoleSelection setRole={setRole} />
        ) : role === 'teacher' ? (
          <TeacherDashboard />
        ) : (
          <StudentDashboard />
        )}
      </main>
    </div>
  );
}

function RoleSelection({ setRole }) {
  return (
    <div className="flex flex-col items-center justify-center h-full mt-20 gap-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-gray-900">Welcome to SmartGradeAI</h2>
        <p className="text-xl text-gray-600">Automated, fair, and consistent descriptive grading.</p>
      </div>
      <div className="flex gap-6">
        <motion.button
          whileHover={{ scale: 1.05, translateY: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setRole('teacher')}
          className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-indigo-100 w-64 h-64 gap-4 group cursor-pointer"
        >
          <div className="bg-indigo-100 p-4 rounded-full group-hover:bg-indigo-600 transition-colors">
            <BookOpen className="w-12 h-12 text-indigo-600 group-hover:text-white transition-colors" />
          </div>
          <span className="text-2xl font-bold text-gray-800">Teacher</span>
          <span className="text-sm text-gray-500 text-center">Manage exams, rubrics, and view results</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, translateY: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setRole('student')}
          className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-blue-100 w-64 h-64 gap-4 group cursor-pointer"
        >
          <div className="bg-blue-100 p-4 rounded-full group-hover:bg-blue-500 transition-colors">
            <User className="w-12 h-12 text-blue-500 group-hover:text-white transition-colors" />
          </div>
          <span className="text-2xl font-bold text-gray-800">Student</span>
          <span className="text-sm text-gray-500 text-center">Submit answers and view AI feedback</span>
        </motion.button>
      </div>
    </div>
  );
}

function TeacherDashboard() {
  const [exams, setExams] = useState([]);
  const [title, setTitle] = useState('');
  const [qText, setQText] = useState('');
  const [rubric, setRubric] = useState('');
  const [marks, setMarks] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await axios.get(`${API_BASE}/exams/`);
      setExams(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const createExam = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: title,
        questions: [{ question_text: qText, rubric_text: rubric, max_marks: marks }]
      };
      const res = await axios.post(`${API_BASE}/exams/`, payload);
      await axios.post(`${API_BASE}/questions/${res.data.questions[0].id}/generate-solution`);
      fetchExams();
      setTitle(''); setQText(''); setRubric('');
    } catch (err) {
      console.error(err);
      alert('Error creating exam. Is backend running and GEMINI_API_KEY set?');
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <BookOpen className="text-indigo-600" /> Create New Exam
        </h2>
        <form onSubmit={createExam} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exam Title</label>
            <input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. Midterm Physics" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
              <textarea required value={qText} onChange={e=>setQText(e.target.value)} rows={4} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="Describe the question..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grading Rubric</label>
              <textarea required value={rubric} onChange={e=>setRubric(e.target.value)} rows={4} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="10 marks for X, 5 marks for Y..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Marks</label>
            <input required type="number" value={marks} onChange={e=>setMarks(Number(e.target.value))} className="w-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
          </div>
          <button disabled={loading} type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center w-full md:w-auto min-w-[150px] cursor-pointer">
            {loading ? <span className="animate-pulse">Processing AI...</span> : 'Create Exam & Generate AI Solution'}
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Available Exams</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map(ex => (
            <div key={ex.id} className="p-5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-2">
              <h3 className="font-bold text-lg text-gray-900">{ex.title}</h3>
              <p className="text-sm text-gray-500">ID: {ex.id} • {ex.questions?.length} Questions</p>
            </div>
          ))}
          {exams.length === 0 && <p className="text-gray-500 italic">No exams created yet.</p>}
        </div>
      </div>
    </motion.div>
  );
}

function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/exams/`).then(res => setExams(res.data)).catch(console.error);
  }, []);

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!selectedExam || !studentId || !answer) return;
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        exam_id: selectedExam.id,
        question_id: selectedExam.questions[0].id,
        student_id: studentId,
        answer_text: answer
      };
      const res = await axios.post(`${API_BASE}/answers/submit`, payload);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Error evaluating answer');
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <User className="text-blue-500" /> Student Submission
        </h2>
        <form onSubmit={submitAnswer} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Exam</label>
              <select onChange={(e) => setSelectedExam(exams.find(ex => ex.id == e.target.value))} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">-- Choose Exam --</option>
                {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
              <input required value={studentId} onChange={e=>setStudentId(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 22i-0788" />
            </div>
          </div>
          
          {selectedExam && selectedExam.questions && selectedExam.questions.length > 0 && (
             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
               <h4 className="font-semibold text-blue-900 mb-2">Question:</h4>
               <p className="text-blue-800">{selectedExam.questions[0].question_text}</p>
               <span className="text-xs font-bold bg-blue-200 text-blue-800 px-2 py-1 rounded mt-2 inline-block">Max Marks: {selectedExam.questions[0].max_marks}</span>
             </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
            <textarea required value={answer} onChange={e=>setAnswer(e.target.value)} rows={6} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Write your descriptive answer here..." />
          </div>
          <button disabled={loading || !selectedExam} type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors w-full flex justify-center items-center cursor-pointer">
            {loading ? <span className="animate-pulse">AI is Evaluating...</span> : 'Submit Answer'}
          </button>
        </form>
      </div>

      {result && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg border border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="text-green-600 w-8 h-8" />
            <h3 className="text-2xl font-bold text-green-900">Evaluation Result</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-green-700">{result.score}</span>
              <span className="text-lg text-green-600 font-semibold">/ {selectedExam?.questions[0]?.max_marks} Marks</span>
            </div>
            <div className="bg-white/60 p-4 rounded-xl">
              <h4 className="font-semibold text-green-900 mb-1">AI Feedback:</h4>
              <p className="text-green-800 whitespace-pre-wrap">{result.feedback}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
