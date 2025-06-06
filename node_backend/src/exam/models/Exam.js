const mongoose = require('../../../services/mongoose');

const Exam = mongoose.model(
  'Exam',
  {
    examId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    encryptedContent: { type: String, required: true },
    threshold: { type: Number, required: true },
    sharesSubmitted: [{ organizationId: mongoose.Schema.Types.ObjectId, share: String }],
    isDecrypted: { type: Boolean, default: false },
    duration: { type: Number, required: true },
    startTime: { type: Date, required: true },
    questions: [{ questionId: String, correctAnswer: String }],
    organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }], // <-- Add this
    decryptedContent: { type: String }, // Store decrypted content after threshold
    status: { type: String, enum: ['created', 'started', 'ended'], default: 'created' }, // Exam status
  },
  'Exams',
);

module.exports = {
  Exam,
};
