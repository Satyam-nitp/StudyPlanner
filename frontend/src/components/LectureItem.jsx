import { LuCalendarClock } from "react-icons/lu";
import { FaCheckCircle, FaRegCircle, FaTrash } from "react-icons/fa";

export default function LectureItem({
  lecture,
  subjectId,
  chapterId,
  onToggle,
  onDelete,
}) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  return (
    <div
      className={`flex justify-between items-center gap-4 ml-6 px-4 py-3 rounded-xl border transition-shadow duration-300 shadow-sm group hover:shadow-md ${
        lecture.done
          ? "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100"
          : "border-gray-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
      }`}
    >
      {/* Left Section */}
      <div className="flex items-start sm:items-center gap-5 w-full">
        <button
          onClick={() => onToggle(subjectId, chapterId, lecture._id)}
          className="text-xl text-purple-600 hover:scale-110 transition-transform"
        >
          {lecture.done ? <FaCheckCircle /> : <FaRegCircle />}
        </button>

        <h4 className="font-semibold text-base mb-1 line-clamp-1">
          {lecture.name}
        </h4>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          {lecture.startDate && lecture.endDate && (
            <span className="flex gap-2 items-center bg-white text-blue-600 px-3 py-1 text-sm font-medium rounded-full shadow dark:bg-gray-700 dark:text-green-500">
              <LuCalendarClock className="text-lg text-red-500" />
              {formatDate(lecture.startDate)} – {formatDate(lecture.endDate)}
            </span>
          )}
        </div>
      </div>

      {/* Right Delete Button */}
      <button
        onClick={() => onDelete(subjectId, chapterId, lecture._id)}
        className="text-red-500 hover:text-red-700 text-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <FaTrash />
      </button>
    </div>
  );
}
