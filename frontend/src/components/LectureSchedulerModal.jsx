import { useState } from "react";
import toast from "react-hot-toast";

export default function LectureSchedulerModal({
  subjects,
  onSchedule,
  onClose,
  fetchToday,
}) {
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedTimeline, setSelectedTimeline] = useState("");
  const [customDays, setCustomDays] = useState("");

  const predefinedOptions = {
    "3months": 90,
    "4months": 120,
    "5months": 150,
  };

  const getTotalDays = () => {
    if (selectedTimeline) return predefinedOptions[selectedTimeline];
    const custom = parseInt(customDays);
    return !isNaN(custom) && custom >= 1 && custom <= 365 ? custom : null;
  };

  const handleSubmit = async () => {
    const days = getTotalDays();
    if (!days) return alert("Please select a valid duration");

    await onSchedule({ subject: selectedSubject, days }); // wait until scheduling finishes
    toast.success("Lecture Scheduled Successfully");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 text-white p-6 rounded-xl w-[500px]">
        <h1 className="font-semibold text-2xl">What is your learning goal?</h1>
        <p className="text-sm text-gray-400 mb-4">
          Your dedication helps us personalize your learning plan, allocating
          time effectively to each topic
        </p>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-white">
            Select Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
          >
            <option value="all">All Topics</option>
            {subjects.length === 0 ? (
              <option disabled>Loading subjects...</option>
            ) : (
              subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Select Timeline
          </label>

          {["3months", "4months", "5months"].map((key) => (
            <div
              key={key}
              className={`flex justify-between items-center p-3 mb-2 rounded-lg cursor-pointer ${
                selectedTimeline === key ? "bg-gray-700" : "bg-gray-800"
              }`}
              onClick={() => setSelectedTimeline(key)}
            >
              <div>
                <p className="font-semibold">{key[0]} months</p>
                <p className="text-sm text-gray-400">
                  {key === "3months"
                    ? "Accelerated pace"
                    : key === "4months"
                    ? "Balanced learning"
                    : "Steady & strategic"}
                </p>
              </div>
              <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                {selectedTimeline === key && (
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1 font-medium">
            Enter custom number of days
          </label>
          <input
            type="number"
            placeholder="e.g. 180"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
            value={customDays}
            onChange={(e) => {
              setCustomDays(e.target.value);
              setSelectedTimeline("");
            }}
          />
          <p className="text-xs text-gray-400 mt-1">(1–365 days)</p>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await handleSubmit();
              await fetchToday();
            }}
            className="px-5 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            Begin your journey!
          </button>
        </div>
      </div>
    </div>
  );
}
