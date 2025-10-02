import { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import SubjectCard from "./components/SubjectCard";
import AddDataForm from "./components/AddDataForm";
import LectureSchedulerModal from "./components/LectureSchedulerModal";
import ResetScheduleModal from "./components/ResetScheduleModel";
import TodayTasks from "./components/TodayTasks";
import toast from "react-hot-toast";
import RequireAuth from "./components/RequireAuth";
import AuthPage from "./pages/Auth";
import { logout as doLogout, handleUnauthorized } from "./services/auth";

const BASE_URL = "http://localhost:5000/api/subjects";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function App() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [showResetModal, setShowResetModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [authTick, setAuthTick] = useState(0); // used to re-render on login/logout
  const isAuthed = !!localStorage.getItem("token");

  const fetchSubjects = async () => {
    const res = await fetch(BASE_URL + "/subjects", {
      headers: { ...authHeaders() },
    });
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }
    const data = await res.json();
    setSubjects(Array.isArray(data) ? data : []);
  };

  const fetchToday = async () => {
    const res = await fetch("http://localhost:5000/api/subjects/today", {
      headers: { ...authHeaders() },
    });
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (!isAuthed) return; // Only fetch when authenticated
    fetchSubjects();
    fetchToday();
  }, [isAuthed, authTick]);

  const handleResetBySubject = async (subjectId) => {
    if (!subjectId) return toast.error("Invalid subject selected");

    try {
      const res = await fetch(`${BASE_URL}/${subjectId}/reset-scheduled`, {
        method: "PATCH",
        headers: { ...authHeaders() },
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();

      if (data.success) {
        fetchSubjects();
      } else {
        toast.error(data.message || "Reset failed!");
      }
    } catch (err) {
      toast.error("Reset failed!");
    }
  };

  const handleToggle = async (subjectId, chapterId, lectureId) => {
    const res = await fetch(
      `${BASE_URL}/${subjectId}/chapters/${chapterId}/lectures/${lectureId}`,
      { method: "PATCH", headers: { ...authHeaders() } }
    );
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }
    fetchSubjects();
    fetchToday();
  };

  const handleDeleteChapter = async (subjectId, chapterId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/${subjectId}/chapters/${chapterId}`,
        {
          method: "DELETE",
          headers: { ...authHeaders() },
        }
      );
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      toast.success("Chapter deleted");
      fetchSubjects();
    } catch {
      toast.error("Failed to delete chapter");
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    try {
      const res = await fetch(`${BASE_URL}/${subjectId}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      toast.success("Subject deleted");
      fetchSubjects();
    } catch {
      toast.error("Failed to delete subject");
    }
  };

  const handleDeleteLecture = async (subjectId, chapterId, lectureId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/${subjectId}/chapters/${chapterId}/lectures/${lectureId}`,
        { method: "DELETE", headers: { ...authHeaders() } }
      );
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();

      if (data.success) {
        toast.success("Lecture deleted");
        fetchSubjects();
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (err) {
      toast.error("Error deleting lecture");
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-950 text-black dark:text-white transition-colors duration-300">
        {/* Navbar */}
        <header className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-md border-b border-gray-300 dark:border-gray-700 shadow-md sticky top-0 z-10 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 relative">
            {/* Left: App Name */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-800 dark:text-white">
              📚 Study Planner
            </h1>

            {/* Center: Absolute Title */}

            {isAuthed && (
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-center text-gray-700 dark:text-gray-200">
                  🎯 Consistency Matters iykyk🔥🔥
                </h1>
              </div>
            )}

            {/* Right: Nav Links */}
            <div className="flex flex-wrap justify-end sm:justify-start gap-3">
              {isAuthed && (
                <div className="flex flex-row gap-3">
                  <Link
                    to="/"
                    className="px-4 py-2 rounded-lg text-sm bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-200 font-medium hover:bg-blue-200 dark:hover:bg-blue-700 transition-all"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/add"
                    className="px-4 py-2 rounded-lg text-sm bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-200 font-medium hover:bg-green-200 dark:hover:bg-green-700 transition-all"
                  >
                    ➕ Add Subject
                  </Link>
                </div>
              )}
              {!isAuthed ? (
                <Link
                  to="/auth"
                  className="px-4 py-2 rounded-lg text-sm bg-purple-100 dark:bg-purple-800/40 text-purple-700 dark:text-purple-200 font-medium hover:bg-purple-200 dark:hover:bg-purple-700 transition-all"
                >
                  Login / Signup
                </Link>
              ) : (
                <button
                  onClick={() => {
                    doLogout();
                    setAuthTick((v) => v + 1);
                    setSubjects([]);
                    setTasks([]);
                    toast.success("Logged out");
                  }}
                  className="px-4 py-2 rounded-lg text-sm bg-rose-100 dark:bg-rose-800/40 text-rose-700 dark:text-rose-200 font-medium hover:bg-rose-200 dark:hover:bg-rose-700 transition-all"
                >
                  Logout
                </button>
              )}
              <button
                onClick={() => setDarkMode((prev) => !prev)}
                className="px-4 py-2 rounded-lg text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                {darkMode ? "🌞 Light" : "🌙 Dark"}
              </button>
            </div>
          </div>
        </header>

        {/* Routes */}
        <main className="p-6 max-w-6xl mx-auto">
          <Routes>
            <Route
              path="/auth"
              element={
                <AuthPage onAuthSuccess={() => setAuthTick((v) => v + 1)} />
              }
            />

            <Route
              path="/"
              element={
                <RequireAuth>
                  <div className="flex flex-col gap-8">
                    <TodayTasks
                      onToggle={handleToggle}
                      tasks={tasks}
                      setTasks={setTasks}
                    />

                    <section className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <label className="block mb-1 text-sm font-semibold">
                          Select Subject
                        </label>
                        <select
                          value={selectedSubjectId}
                          onChange={(e) => setSelectedSubjectId(e.target.value)}
                          className="w-full max-w-sm px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 text-black dark:text-white"
                        >
                          <option value="all">-- All Subjects --</option>
                          {subjects.map((subject) => (
                            <option key={subject._id} value={subject._id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-wrap gap-4 items-end">
                        <button
                          onClick={() => setShowScheduler(true)}
                          className="px-5 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200 font-semibold hover:scale-95 transition"
                        >
                          📅 Schedule Lectures
                        </button>
                        <button
                          onClick={() => setShowResetModal(true)}
                          className="px-5 py-2 rounded-lg bg-rose-100 dark:bg-rose-900/30 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 font-semibold hover:scale-95 transition"
                        >
                          ♻️ Reset Scheduled Lectures
                        </button>
                      </div>
                    </section>

                    <section className="flex flex-col gap-5">
                      {subjects.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 text-lg">
                          No subjects found. Add one to begin!
                        </p>
                      ) : selectedSubjectId === "all" ? (
                        subjects.map((subject) => (
                          <SubjectCard
                            key={subject._id}
                            subject={subject}
                            onToggle={handleToggle}
                            onDelete={handleDeleteSubject}
                            onDeleteChapter={handleDeleteChapter}
                            onDeleteLecture={handleDeleteLecture}
                          />
                        ))
                      ) : (
                        <SubjectCard
                          subject={subjects.find(
                            (s) => s._id === selectedSubjectId
                          )}
                          onToggle={handleToggle}
                          onDelete={handleDeleteSubject}
                          onDeleteChapter={handleDeleteChapter}
                          onDeleteLecture={handleDeleteLecture}
                        />
                      )}
                    </section>
                  </div>
                </RequireAuth>
              }
            />
            <Route
              path="/add"
              element={
                <RequireAuth>
                  <AddDataForm refresh={fetchSubjects} />
                </RequireAuth>
              }
            />
          </Routes>
        </main>
      </div>

      {/* Modals */}
      {showScheduler && (
        <LectureSchedulerModal
          subjects={subjects}
          onSchedule={async ({ subject, days }) => {
            try {
              const res = await fetch(`${BASE_URL}/schedule`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...authHeaders(),
                },
                body: JSON.stringify({ subjectId: subject, totalDays: days }),
              });
              if (res.status === 401) {
                handleUnauthorized();
                return;
              }
              setShowScheduler(false);
              fetchSubjects();
            } catch {
              toast.error("Scheduling failed!");
            }
          }}
          onClose={() => setShowScheduler(false)}
          fetchToday={fetchToday}
        />
      )}

      {showResetModal && (
        <ResetScheduleModal
          subjects={subjects}
          onReset={handleResetBySubject}
          onClose={() => setShowResetModal(false)}
          fetchToday={fetchToday}
        />
      )}
    </div>
  );
}

export default App;
