const mongoose = require('mongoose');

const LectureSchema = new mongoose.Schema({
  name: String,
  done: { type: Boolean, default: false },
  scheduled: { type: Boolean, default: false }, // ✅ NEW
  startDate: Date,
  endDate: Date
});

const ChapterSchema = new mongoose.Schema({
  name: String,
  lectures: [LectureSchema],
});

const SubjectSchema = new mongoose.Schema(
  {
    name: String,
    chapters: [ChapterSchema],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', SubjectSchema);
