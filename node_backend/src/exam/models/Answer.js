const mongoose = require('../../../services/mongoose');

const Answer = mongoose.model(
  'Answer',
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    signature: {
      type: String,
      required: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  'answers'
);

module.exports = {
  Answer,
};
