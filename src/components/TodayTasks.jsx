import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { LuCalendarClock } from "react-icons/lu";

export default function TodayTasks({ onToggle, tasks, setTasks }) {
  const [showTasks, setShowTasks] = useState(false);

  const todayDate = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (tasks.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-sky-100 to-blue-200 dark:from-gray-900 dark:to-slate-800 p-4 rounded-xl shadow-md border border-blue-300 dark:border-gray-600 mb-6">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setShowTasks(!showTasks)}
      >
        <h2 className="text-lg flex gap-3 items-center font-semibold text-blue-900 dark:text-white">
          <span className="bg-white flex gap-2 items-center text-blue-600 px-3 py-1 text-sm font-medium rounded-full shadow dark:bg-gray-700 dark:text-red-500">
            <LuCalendarClock className="text-lg text-white" />
            {todayDate}
          </span>{" "}
          <span>Today's Scheduled Lectures</span>
        </h2>
        <span className="text-blue-600 dark:text-blue-300">
          {showTasks ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />}
        </span>
      </div>

      {showTasks && (
        <div className="space-y-3 mt-3">
          {tasks.map((task) => (
            <div
              key={task.lectureId}
              className="flex justify-between items-center px-4 py-3 rounded-lg border border-blue-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900 shadow-sm"
            >
              <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {task.subjectName}
                </span>
                {" / "}
                <span className="text-pink-600 dark:text-pink-400">
                  {task.chapterName}
                </span>
                {" → "}
                <span className="italic text-purple-700 dark:text-purple-300">
                  {task.lectureName}
                </span>
              </div>

              <input
                type="checkbox"
                checked={task.done}
                onClick={(e) => e.stopPropagation()}
                onChange={() => {
                  setTasks((prev) =>
                    prev.map((t) =>
                      t.lectureId === task.lectureId
                        ? { ...t, done: !t.done }
                        : t
                    )
                  );
                  onToggle(task.subjectId, task.chapterId, task.lectureId);
                }}
                className="w-5 h-5 rounded-full accent-blue-500 border-gray-400 cursor-pointer"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
