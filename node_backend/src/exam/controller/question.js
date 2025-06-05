const crypto = require('crypto');
const mongoose = require('../../../services/mongoose');
const { encrypt, decrypt } = require('../utils/questionEncrypt');
const { Question } = require('../models/Question');

const createQuestion = async (req, res) => {
  const { content, options, answer, organizationId, encryptionKey, examId } = req.body;

  try {
    // Validate that answer is one of the allowed enum values
    if (!['a', 'b', 'c', 'd'].includes(answer)) {
      return res.status(400).json({ 
        status: 400, 
        message: 'Answer must be one of: a, b, c, d' 
      });
    }

    // Generate encryption key hash
    const encryptionKeyHex = crypto.createHash('sha256').update(encryptionKey).digest('hex');

    // Encrypt content and options
    const encryptedContent = encrypt(content, encryptionKeyHex);
    const encryptedOptions = {
      a: encrypt(options.a, encryptionKeyHex),
      b: encrypt(options.b, encryptionKeyHex),
      c: encrypt(options.c, encryptionKeyHex),
      d: encrypt(options.d, encryptionKeyHex),
    };

    // Create new question with PLAIN answer (not encrypted)
    // The answer should remain as 'a', 'b', 'c', or 'd' to pass enum validation
    const newQuestion = new Question({
      content: encryptedContent,
      options: encryptedOptions,
      answer: answer, // Keep this as plain text to pass enum validation
      encrypted: true,
      examId: mongoose.Types.ObjectId(examId),
      organizationId: mongoose.Types.ObjectId(organizationId),
    });

    await newQuestion.save();
    return res.status(201).json({ message: 'Question created successfully' });
  } catch (error) {
    console.error('Error creating question:', error);
    return res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

// Updated decrypt function to handle the fact that answer is not encrypted
const decryptQuestion = async (req, res) => {
  const { questionId, decryptionKey } = req.body;

  try {
    const decryptionKeyHex = crypto.createHash('sha256').update(decryptionKey).digest('hex');
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ status: 404, message: 'Question not found' });
    }

    // Decrypt content and options
    const decryptedContent = decrypt(question.content, decryptionKeyHex);
    const decryptedOptions = {
      a: decrypt(question.options.a, decryptionKeyHex),
      b: decrypt(question.options.b, decryptionKeyHex),
      c: decrypt(question.options.c, decryptionKeyHex),
      d: decrypt(question.options.d, decryptionKeyHex),
    };
    
    // Answer is already in plain text, no need to decrypt
    const plainAnswer = question.answer;

    return res.status(200).json({
      id: question._id,
      content: decryptedContent,
      options: decryptedOptions,
      answer: plainAnswer,
      organizationId: question.organizationId,
      examId: question.examId,
    });
  } catch (error) {
    console.error('Error decrypting question:', error);
    return res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

// Updated decryptAllQuestions function
const decryptAllQuestions = async (req, res) => {
  const { organizationId, examId, decryptionKey } = req.body;

  try {
    const decryptionKeyHex = crypto.createHash('sha256').update(decryptionKey).digest('hex');
    const questions = await Question.find({
      organizationId: mongoose.Types.ObjectId(organizationId),
      examId: mongoose.Types.ObjectId(examId),
      encrypted: true,
    });

    const decryptedQuestions = questions.map((question) => {
      const decryptedContent = decrypt(question.content, decryptionKeyHex);
      const decryptedOptions = {
        a: decrypt(question.options.a, decryptionKeyHex),
        b: decrypt(question.options.b, decryptionKeyHex),
        c: decrypt(question.options.c, decryptionKeyHex),
        d: decrypt(question.options.d, decryptionKeyHex),
      };
      
      // Answer is already in plain text
      const plainAnswer = question.answer;

      return {
        id: question._id,
        content: decryptedContent,
        options: decryptedOptions,
        answer: plainAnswer,
        organizationId: question.organizationId,
        examId: question.examId,
      };
    });

    // Update questions to mark them as decrypted
    await Promise.all(
      decryptedQuestions.map((decryptedQuestion) =>
        Question.findByIdAndUpdate(decryptedQuestion.id, {
          content: decryptedQuestion.content,
          options: decryptedQuestion.options,
          answer: decryptedQuestion.answer, // This remains the same
          encrypted: false,
        })
      )
    );

    return res.status(200).json({ 
      message: 'All questions decrypted successfully', 
      decryptedQuestions 
    });
  } catch (error) {
    console.error('Error decrypting all questions:', error);
    return res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

// Controller to get all questions
const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    return res.status(200).json(questions);
  } catch (error) {
    console.error('Error getting all questions:', error);
    return res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

// Controller to get questions by exam ID
const getQuestionsByExamId = async (req, res) => {
  const { examId } = req.params;

  try {
    const questions = await Question.find({ examId: mongoose.Types.ObjectId(examId) });
    if (questions.length === 0) {
      return res.status(404).json({ status: 404, message: 'No questions found for this exam' });
    }
    return res.status(200).json(questions);
  } catch (error) {
    console.error('Error getting questions by exam ID:', error);
    return res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

// Fixed Controller to get questions by organization ID
const getQuestionsByOrganizationId = async (req, res) => {
  const { organizationId } = req.params;

  try {
    // Fixed: should use organizationId, not examId
    const questions = await Question.find({ organizationId: mongoose.Types.ObjectId(organizationId) });
    if (questions.length === 0) {
      return res.status(404).json({ status: 404, message: 'No questions found for this organization' });
    }
    return res.status(200).json(questions);
  } catch (error) {
    console.error('Error getting questions by organization ID:', error);
    return res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

// Controller to get a question by its ID
const getQuestionById = async (req, res) => {
  const { questionId } = req.params;

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ status: 404, message: 'Question not found' });
    }
    return res.status(200).json(question);
  } catch (error) {
    console.error('Error getting question by ID:', error);
    return res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

const deleteQuestionById = async (req, res) => {
  const { questionId } = req.params;

  try {
    const question = await Question.findByIdAndDelete(questionId);

    if (!question) {
      return res.status(404).json({ status: 404, message: 'Question not found' });
    }

    return res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

module.exports = {
  createQuestion,
  decryptQuestion,
  decryptAllQuestions,
  getAllQuestions,
  getQuestionsByExamId,
  getQuestionsByOrganizationId,
  getQuestionById,
  deleteQuestionById
};