import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { handleUnauthorized } from "../services/auth";

export default function AddDataForm({ refresh }) {
  const [subjects, setSubjects] = useState([]);

  const [subjectName, setSubjectName] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [lectureCount, setLectureCount] = useState("");

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");

  const BASE_URL = "http://localhost:5000/api/subjects";

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchSubjects = async () => {
    const res = await fetch(BASE_URL+"/subjects", { headers: { ...authHeaders() } });
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }
    const data = await res.json();
    setSubjects(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const addSubject = async () => {
    if (!subjectName.trim()) return;
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ name: subjectName }),
    });
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }
    setSubjectName("");
    fetchSubjects();
    refresh();
    toast.success("Subject Added Successfully");
  };

  const addChapter = async () => {
    if (!chapterName.trim() || !selectedSubjectId) return;
    const res = await fetch(`${BASE_URL}/${selectedSubjectId}/chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ name: chapterName }),
    });
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }
    setChapterName("");
    fetchSubjects();
    refresh();
    toast.success("Chapter Added Successfully");
  };

const addLectures = async () => {
  const count = parseInt(lectureCount);
  if (!count || count <= 0 || !selectedSubjectId || !selectedChapterId) {
    toast.error("Please select subject, chapter, and valid count.");
    return;
  }

  const subject = subjects.find((s) => s._id === selectedSubjectId);
  const chapter = subject?.chapters.find((c) => c._id === selectedChapterId);

  if (!chapter) {
    toast.error("Chapter not found.");
    return;
  }

  try {
    // ✅ Extract only the text after the colon
    const chapterBaseName = chapter.name.includes(':')
      ? chapter.name.split(':')[1].trim()
      : chapter.name;

    const lectureNames = Array.from({ length: count }, (_, i) => {
      const index = (i + 1).toString().padStart(2, "0");
      return { name: `${chapterBaseName} ${index}` };
    });

    const res = await fetch(
      `${BASE_URL}/${selectedSubjectId}/chapters/${selectedChapterId}/lectures/bulk`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ lectures: lectureNames }),
      }
    );

    if (res.status === 401) {
      handleUnauthorized();
      return;
    }

    if (!res.ok) throw new Error("Failed to add lectures");

    setLectureCount('');
    await fetchSubjects();
    refresh();
    toast.success(`✅ ${count} Lecture(s) Added`);
  } catch (err) {
    console.error(err);
    toast.error("Error adding lectures.");
  }
};



  return (
    <div className="bg-white dark:bg-gray-800 text-black dark:text-white shadow-xl rounded-2xl p-6 mb-8 space-y-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-4">
        ➕ Add Subject, Chapter & Lecture
      </h2>

      {/* Subject Input */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="New Subject Name"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900"
        />
        <button
          onClick={addSubject}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          ➕ Add Subject
        </button>
      </div>

      {/* Chapter Input */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedSubjectId}
          onChange={(e) => {
            setSelectedSubjectId(e.target.value);
            setSelectedChapterId("");
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900"
        >
          <option value="">-- Select Subject --</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="New Chapter Name"
          value={chapterName}
          onChange={(e) => setChapterName(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900"
        />
        <button
          onClick={addChapter}
          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
        >
          ➕ Add Chapter
        </button>
      </div>

      {/* Lecture Input (by count) */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedSubjectId}
          onChange={(e) => {
            setSelectedSubjectId(e.target.value);
            setSelectedChapterId("");
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900"
        >
          <option value="">-- Select Subject --</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={selectedChapterId}
          onChange={(e) => setSelectedChapterId(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900"
        >
          <option value="">-- Select Chapter --</option>
          {subjects
            .find((s) => s._id === selectedSubjectId)
            ?.chapters.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
        </select>

        <input
          type="number"
          placeholder="No. of Lectures"
          value={lectureCount}
          onChange={(e) => setLectureCount(e.target.value)}
          className="w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900"
        />

        <button
          onClick={addLectures}
          className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
        >
          ➕ Add Lectures
        </button>
      </div>
    </div>
  );
}
