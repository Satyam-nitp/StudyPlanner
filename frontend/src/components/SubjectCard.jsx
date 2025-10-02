import { useState } from "react";
import LectureItem from "./LectureItem";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { LuBookOpen, LuCircleCheck } from "react-icons/lu";

export default function SubjectCard({ subject, onToggle, onDelete, onDeleteChapter, onDeleteLecture }) {
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [chapterOpenMap, setChapterOpenMap] = useState({});

  const toggleChapter = (chapterId) => {
    setChapterOpenMap((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const totalLectures = subject.chapters.reduce((sum, chap) => sum + chap.lectures.length, 0);
  const doneLectures = subject.chapters.reduce((sum, chap) => sum + chap.lectures.filter((l) => l.done).length, 0);
  const subjectCompletion = totalLectures === 0 ? 0 : Math.round((doneLectures / totalLectures) * 100);

  return (
    <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-md border border-gray-300 dark:border-gray-700 rounded-2xl shadow-md px-6 pt-4">
      {/* Subject Header */}
      <div
        className="flex justify-between items-center cursor-pointer mb-4"
        onClick={() => setSubjectOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
          <LuBookOpen className="text-purple-600" />
          {subject.name}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
          {subjectCompletion}% Complete {subjectOpen ? <FaChevronUp /> : <FaChevronDown />}
          <button
            className="text-xl text-red-500 hover:text-red-700 transition"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete subject "${subject.name}"?`)) {
                onDelete(subject._id);
              }
            }}
          >
            <MdDelete />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
        <div
          className="bg-gradient-to-r from-green-400 to-green-600 h-3 transition-all duration-500"
          style={{ width: `${subjectCompletion}%` }}
        />
      </div>

      {/* Chapters */}
      {subjectOpen && subject.chapters.map((chap) => {
        const chapterDone = chap.lectures.filter((l) => l.done).length;
        const chapterTotal = chap.lectures.length;
        const chapterCompletion = chapterTotal === 0 ? 0 : Math.round((chapterDone / chapterTotal) * 100);

        return (
          <div key={chap._id} className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
            {/* Chapter Header */}
            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleChapter(chap._id)}>
              <div className="flex items-center gap-2 text-md font-semibold text-gray-800 dark:text-gray-100">
                <LuCircleCheck className="text-blue-500" /> CH {chap.chapterNumber}: {chap.name}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-300">
                {chapterCompletion}%
                {chapterOpenMap[chap._id] ? <FaChevronUp /> : <FaChevronDown />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete chapter "${chap.name}"?`)) {
                      onDeleteChapter(subject._id, chap._id);
                    }
                  }}
                  className="text-red-500 hover:text-red-700 text-lg"
                >
                  <MdDelete />
                </button>
              </div>
            </div>

            {/* Chapter Progress Bar */}
            <div className="mt-2 mb-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-2 transition-all duration-500"
                  style={{ width: `${chapterCompletion}%` }}
                />
              </div>
            </div>

            {/* Lectures */}
            <div className="flex flex-col gap-2">
              {chapterOpenMap[chap._id] && chap.lectures.map((lec) => (
              <LectureItem
                key={lec._id}
                lecture={lec}
                subjectId={subject._id}
                chapterId={chap._id}
                onToggle={onToggle}
                onDelete={onDeleteLecture}
              />
            ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
