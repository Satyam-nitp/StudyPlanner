// components/ResetScheduleModal.jsx
import { useState } from "react";
import toast from "react-hot-toast";

export default function ResetScheduleModal({
  subjects,
  onReset,
  onClose,
  fetchToday,
}) {
  const [selectedSubject, setSelectedSubject] = useState("all");

  const handleSubmit = async () => {
    if (selectedSubject === "all") {
      alert("Please select a specific subject");
      return;
    }
    await onReset(selectedSubject); // ✅ wait for reset to complete
    toast.success("Schedule reset successfully!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 text-white p-6 rounded-xl w-[400px]">
        <h1 className="font-semibold text-xl mb-4">Reset Subject Schedule</h1>

        <label className="block mb-2 text-sm font-medium text-white">
          Select Subject
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
        >
          <option value="all">-- Choose Subject --</option>
          {subjects.map((subject) => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              onClose();
              await handleSubmit();
              await fetchToday();
            }}
            className="px-5 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-semibold"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
