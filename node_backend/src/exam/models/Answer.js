const mongoose = require('../../../services/mongoose');

const Answer = mongoose.model(
    'Answer',
    {
        questionId: {
            type: String,
            required: true,
            unique: true,
            type: mongoose.Schema.Types.ObjectId, ref: 'Question' 
        },
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        answer: String,
        signature: String,
        publicKey: {
            type: String,
            //required: true,
            unique: true,
        },
        timestamp: { type: Date, default: Date.now },
    },
    'answers'
);

module.exports = {
    Answer,
};
