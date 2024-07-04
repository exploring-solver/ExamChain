const mongoose = require('../../../services/mongoose');

const Exam = mongoose.model(
  'Exam',
  {
    title: { type: String, required: true },
    encryptedContent: { type: String, required: true }, // Encrypted exam content
    threshold: { type: Number, required: true }, // Minimum number of shares required
    sharesSubmitted: [{ organizationId: mongoose.Schema.Types.ObjectId, share: String }],
    isDecrypted: { type: Boolean, default: false },
  },
  'Exams',
);

module.exports = {
  Exam,
};
