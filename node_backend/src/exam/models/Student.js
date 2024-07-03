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
      required: true,
      unique: true,
    },
    privateKey: {
      type: String,
      required: true,
      unique: true,
    },
  },
  'students'
);

module.exports = {
  Student,
};
