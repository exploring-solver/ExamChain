const crypto = require('crypto');
const mongoose = require('../../../services/mongoose');
const { encrypt, decrypt } = require('../utils/questionEncrypt');
const { Question } = require('../models/Question');

const createQuestion = async (req, res) => {
  const { content, options, answer, organizationId, encryptionKey, examId } = req.body;

  try {
    const encryptionKeyHex = crypto.createHash('sha256').update(encryptionKey).digest('hex');

    // Encrypt the content, options, and answer using the provided encryptionKey
    const encryptedContent = encrypt(content, encryptionKeyHex);
    const encryptedOptions = {
      a: encrypt(options.a, encryptionKeyHex),
      b: encrypt(options.b, encryptionKeyHex),
      c: encrypt(options.c, encryptionKeyHex),
      d: encrypt(options.d, encryptionKeyHex),
    };
    const encryptedAnswer = encrypt(answer, encryptionKeyHex);

    const newQuestion = new Question({
      content: encryptedContent,
      options: encryptedOptions,
      answer: encryptedAnswer,
      encrypted: true,
      examId: mongoose.Types.ObjectId(examId),
      organizationId: mongoose.Types.ObjectId(organizationId),
    });

    await newQuestion.save();
    return res.status(201).json({ message: 'Question created successfully' });
  } catch (error) {
    return res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

const decryptQuestion = async (req, res) => {
  const { questionId, decryptionKey } = req.body;

  try {
    const decryptionKeyHex = crypto.createHash('sha256').update(decryptionKey).digest('hex');

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ status: 404, message: 'Question not found' });
    }

    // Decrypt the content, options, and answer using the provided decryptionKey
    const decryptedContent = decrypt(question.content, decryptionKeyHex);
    const decryptedOptions = {
      a: decrypt(question.options.get('a'), decryptionKeyHex),
      b: decrypt(question.options.get('b'), decryptionKeyHex),
      c: decrypt(question.options.get('c'), decryptionKeyHex),
      d: decrypt(question.options.get('d'), decryptionKeyHex),
    };
    const decryptedAnswer = decrypt(question.answer, decryptionKeyHex);

    return res.status(200).json({
      id: question.id,
      content: decryptedContent,
      options: decryptedOptions,
      answer: decryptedAnswer,
      organizationId: question.organizationId,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

module.exports = {
  createQuestion,
  decryptQuestion,
};
