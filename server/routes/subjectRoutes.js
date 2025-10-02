const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const { auth } = require("../middleware/auth");

// Protect all routes below
router.use(auth);

// Get all subjects (for current user)
router.get("/subjects", async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.userId });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// Also support GET / (for clients calling /api/subjects)
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.userId });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// Toggle lecture status
router.patch(
  "/:subjectId/chapters/:chapterId/lectures/:lectureId",
  async (req, res) => {
    try {
      const { subjectId, chapterId, lectureId } = req.params;
      const subject = await Subject.findOne({ _id: subjectId, user: req.userId });
      if (!subject) return res.status(404).json({ error: "Subject not found" });

      const chapter = subject.chapters.id(chapterId);
      if (!chapter) return res.status(404).json({ error: "Chapter not found" });

      const lecture = chapter.lectures.id(lectureId);
      if (!lecture) return res.status(404).json({ error: "Lecture not found" });

      lecture.done = !lecture.done;
      await subject.save();
      res.sendStatus(200);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Create subject for current user
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const newSubject = await Subject.create({ name, chapters: [], user: req.userId });
    res.status(201).json(newSubject);
  } catch (err) {
    res.status(500).json({ error: "Failed to create subject" });
  }
});

// Add chapter to a user's subject
router.post("/:subjectId/chapters", async (req, res) => {
  try {
    const { name } = req.body;
    const subject = await Subject.findOne({ _id: req.params.subjectId, user: req.userId });
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    subject.chapters.push({ name, lectures: [] });
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ error: "Failed to add chapter" });
  }
});

// Bulk add lectures to a user's subject chapter
router.post(
  "/:subjectId/chapters/:chapterId/lectures/bulk",
  async (req, res) => {
    const { subjectId, chapterId } = req.params;
    const { lectures } = req.body; // expects array of { name }

    if (!Array.isArray(lectures) || lectures.length === 0) {
      return res.status(400).json({ error: "Lectures array is required" });
    }

    try {
      const subject = await Subject.findOne({ _id: subjectId, user: req.userId });
      if (!subject) return res.status(404).json({ error: "Subject not found" });

      const chapter = subject.chapters.id(chapterId);
      if (!chapter) return res.status(404).json({ error: "Chapter not found" });

      // Push all lectures
      chapter.lectures.push(...lectures);

      await subject.save();
      res.json({
        message: `${lectures.length} lecture(s) added successfully`,
        lectures: chapter.lectures.slice(-lectures.length), // Return the newly added lectures
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Schedule lectures for a user's subject
router.post("/schedule", async (req, res) => {
  try {
    const { subjectId, totalDays } = req.body;

    const subject = await Subject.findOne({ _id: subjectId, user: req.userId });
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    const allLectures = [];

    // Flatten all lectures
    subject.chapters.forEach((chapter, chapterIdx) => {
      chapter.lectures.forEach((lecture, lectureIdx) => {
        allLectures.push({ chapterIdx, lectureIdx });
      });
    });

    const totalLectures = allLectures.length;
    if (totalLectures === 0) {
      return res.status(400).json({ error: "No lectures to schedule." });
    }

    let currentLectureIndex = 0;
    let currentDate = new Date();

    if (totalLectures <= totalDays) {
      // CASE 1: Fewer lectures than days → 1 lecture per day, some extra days
      const baseDays = Math.floor(totalDays / totalLectures); // how many days per lecture
      let extraDays = totalDays % totalLectures; // how many lectures get one extra day

      for (let i = 0; i < totalLectures; i++) {
        const { chapterIdx, lectureIdx } = allLectures[i];
        const lecture = subject.chapters[chapterIdx].lectures[lectureIdx];

        const start = new Date(currentDate);
        const end = new Date(start);
        end.setDate(start.getDate() + baseDays - 1);
        if (extraDays > 0) {
          end.setDate(end.getDate() + 1);
          extraDays--;
        }
        end.setHours(23, 59, 59, 999);

        lecture.startDate = start.toISOString();
        lecture.endDate = end.toISOString();

        // Move to next lecture start day
        currentDate.setDate(end.getDate() + 1);
      }
    } else {
      // CASE 2: More lectures than days → multiple lectures per day
      const baseLecturesPerDay = Math.floor(totalLectures / totalDays);
      let extraLectures = totalLectures % totalDays;

      for (
        let day = 0;
        day < totalDays && currentLectureIndex < totalLectures;
        day++
      ) {
        const lecturesToday = baseLecturesPerDay + (extraLectures > 0 ? 1 : 0);
        if (extraLectures > 0) extraLectures--;

        const start = new Date(currentDate);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);

        for (
          let i = 0;
          i < lecturesToday && currentLectureIndex < totalLectures;
          i++
        ) {
          const { chapterIdx, lectureIdx } = allLectures[currentLectureIndex];
          const lecture = subject.chapters[chapterIdx].lectures[lectureIdx];

          lecture.startDate = start.toISOString();
          lecture.endDate = end.toISOString();

          currentLectureIndex++;
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    subject.markModified("chapters");
    await subject.save();

    res.json({ message: "Lectures scheduled successfully!" });
  } catch (err) {
    console.error("Scheduling error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reset scheduled dates for a user's subject
router.patch("/:id/reset-scheduled", async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.userId });
    if (!subject)
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });

    subject.chapters.forEach((chapter) => {
      chapter.lectures.forEach((lecture) => {
        lecture.startDate = null;
        lecture.endDate = null;
      });
    });

    await subject.save();
    res.json({ success: true });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error resetting scheduled progress" });
  }
});

// Delete a user's subject
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Subject.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted) return res.status(404).json({ error: "Subject not found" });
    res.json({ message: "Subject deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete subject" });
  }
});

// Delete a chapter in a user's subject
router.delete("/:subjectId/chapters/:chapterId", async (req, res) => {
  const { subjectId, chapterId } = req.params;

  try {
    const subject = await Subject.findOne({ _id: subjectId, user: req.userId });
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }

    // Check if chapter exists
    const chapterExists = subject.chapters.some(
      (chap) => chap._id.toString() === chapterId
    );
    if (!chapterExists) {
      return res
        .status(404)
        .json({ success: false, message: "Chapter not found" });
    }

    // Remove chapter using filter
    subject.chapters = subject.chapters.filter(
      (chap) => chap._id.toString() !== chapterId
    );

    await subject.save();

    res.json({ success: true, message: "Chapter deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get today's lectures for current user
router.get("/today", async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const subjects = await Subject.find({ user: req.userId });
  const todayLectures = [];

  for (const subject of subjects) {
    for (const chapter of subject.chapters) {
      for (const lecture of chapter.lectures) {
        if (
          lecture.startDate &&
          new Date(lecture.startDate) >= todayStart &&
          new Date(lecture.startDate) <= todayEnd
        ) {
          todayLectures.push({
            subjectId: subject._id,
            subjectName: subject.name,
            chapterId: chapter._id,
            chapterName: chapter.name,
            lectureId: lecture._id,
            lectureName: lecture.name,
            done: lecture.done,
          });
        }
      }
    }
  }

  res.json(todayLectures);
});

// Delete a lecture in a user's subject
router.delete(
  "/:subjectId/chapters/:chapterId/lectures/:lectureId",
  async (req, res) => {
    const { subjectId, chapterId, lectureId } = req.params;

    try {
      const subject = await Subject.findOne({ _id: subjectId, user: req.userId });
      if (!subject) {
        return res
          .status(404)
          .json({ success: false, message: "Subject not found" });
      }

      const chapter = subject.chapters.id(chapterId);
      if (!chapter) {
        return res
          .status(404)
          .json({ success: false, message: "Chapter not found" });
      }

      const lectureIndex = chapter.lectures.findIndex(
        (lec) => lec._id.toString() === lectureId
      );

      if (lectureIndex === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Lecture not found" });
      }

      // ✅ Remove lecture manually
      chapter.lectures.splice(lectureIndex, 1);

      // ✅ Tell Mongoose we modified a nested path
      subject.markModified("chapters");

      await subject.save();

      res.json({ success: true, message: "Lecture deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

module.exports = router;
