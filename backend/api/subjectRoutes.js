// backend/api/subjects.js

const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const { auth } = require("../middleware/auth");  // Adjust path based on your folder structure

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
router.patch("/:subjectId/chapters/:chapterId/lectures/:lectureId", async (req, res) => {
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
});

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
router.post("/:subjectId/chapters/:chapterId/lectures/bulk", async (req, res) => {
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
});

// Other routes like scheduling, deleting, etc...

// Export the express app as a serverless function
module.exports = (req, res) => {
  router(req, res);
};
