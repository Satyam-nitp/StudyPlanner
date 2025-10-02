const Subject = require("../models/Subject");
const { auth } = require("../middleware/auth");  // Adjust path based on your folder structure

// Helper to handle route logic
async function getAllSubjects(req, res) {
  try {
    const subjects = await Subject.find({ user: req.userId });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
}

async function toggleLectureStatus(req, res) {
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

async function createSubject(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const newSubject = await Subject.create({ name, chapters: [], user: req.userId });
    res.status(201).json(newSubject);
  } catch (err) {
    res.status(500).json({ error: "Failed to create subject" });
  }
}

async function addChapter(req, res) {
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
}

async function bulkAddLectures(req, res) {
  const { subjectId, chapterId } = req.params;
  const { lectures } = req.body;

  if (!Array.isArray(lectures) || lectures.length === 0) {
    return res.status(400).json({ error: "Lectures array is required" });
  }

  try {
    const subject = await Subject.findOne({ _id: subjectId, user: req.userId });
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    const chapter = subject.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ error: "Chapter not found" });

    chapter.lectures.push(...lectures);
    await subject.save();

    res.json({
      message: `${lectures.length} lecture(s) added successfully`,
      lectures: chapter.lectures.slice(-lectures.length),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
  // Authentication middleware
  await auth(req, res);

  // Route Handling
  if (req.method === "GET") {
    if (req.url === "/api/subjects" || req.url === "/api/subjects/") {
      return getAllSubjects(req, res);
    }
  }

  if (req.method === "POST") {
    if (req.url === "/api/subjects") {
      return createSubject(req, res);
    }
    if (req.url.match(/^\/api\/subjects\/[^/]+\/chapters$/)) {
      return addChapter(req, res);
    }
    if (req.url.match(/^\/api\/subjects\/[^/]+\/chapters\/[^/]+\/lectures\/bulk$/)) {
      return bulkAddLectures(req, res);
    }
  }

  if (req.method === "PATCH") {
    if (req.url.match(/^\/api\/subjects\/[^/]+\/chapters\/[^/]+\/lectures\/[^/]+$/)) {
      return toggleLectureStatus(req, res);
    }
  }

  // If route does not match any of the above, return 404
  res.status(404).json({ error: "Route not found" });
};
