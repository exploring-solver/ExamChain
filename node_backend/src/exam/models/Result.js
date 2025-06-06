const mongoose = require('../../../services/mongoose');

const Result = mongoose.model(
  'Result',
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    correct: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true }
  },
  'results'
);

module.exports = { Result };
