const mongoose = require("../../../services/mongoose");

const Student = mongoose.model(
  'Student',
  {
    enrollmentNumber: {
      type: String,
      required: true,
      unique: true,
    },
    name: String,
    publicKey: {
      type: String,
      unique: true,
    },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  },
  'students'
);

module.exports = {
  Student,
};
