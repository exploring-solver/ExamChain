const mongoose = require('../../../services/mongoose');

const Question = mongoose.model(
    'Question',
    {
        id: {
            type: String,
            required: true,
            unique: true,
        },
        content: {
            type: String,
            required: true,
            unique: true,
        },
        answer: {
            type: String,
            required: true,
            unique: true,
        },
        encrypted: {
            type: String,
            required: true,
            unique: true,
        },
        organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    },
    'questions',
);

module.exports = {
    Question,
};
