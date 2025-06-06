const mongoose = require('../../../services/mongoose');
const Organization = mongoose.model(
  'Organization',
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => require('uuid').v4() // Add default value using uuid
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    shares: [{
      examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
      share: { type: String }
    }],
  },
  'organizations',
);

module.exports = {
  Organization,
};
