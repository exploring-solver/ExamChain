const mongoose = require('mongoose');

const Organization = mongoose.model(
  'Organization',
  {
    organizationId: {
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
    share: {
      type: String,
      required: true,
    },
  },
  'organizations'
);

module.exports = {
  Organization,
};
