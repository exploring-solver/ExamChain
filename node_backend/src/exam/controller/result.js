const { Result } = require('../models/Result');
const Answer = require('../models/Answer');
const { Question } = require('../models/Question');
const { Student } = require('../models/Student');

const calculateResults = async (req, res) => {
  const { examId } = req.body;
  try {
    // Get all answers for this exam
    const questions = await Question.find({ examId });
    const questionMap = {};
    questions.forEach(q => { questionMap[q._id.toString()] = q.answer; });

    const answers = await Answer.find({ questionId: { $in: questions.map(q => q._id) } });

    // Group answers by student
    const studentAnswers = {};
    answers.forEach(ans => {
      if (!studentAnswers[ans.studentId]) studentAnswers[ans.studentId] = [];
      studentAnswers[ans.studentId].push(ans);
    });

    // Calculate marks for each student
    for (const studentId in studentAnswers) {
      let marks = 0;
      studentAnswers[studentId].forEach(ans => {
        if (questionMap[ans.questionId.toString()] === ans.answer) marks++;
      });
      await Result.findOneAndUpdate(
        { studentId, examId },
        { marks },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ message: 'Results calculated and stored' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

const getResultsByExam = async (req, res) => {
  const { examId } = req.params;
  try {
    const results = await Result.find({ examId })
      .populate('studentId', 'username name enrollmentNumber')
      .lean();
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = { calculateResults, getResultsByExam };