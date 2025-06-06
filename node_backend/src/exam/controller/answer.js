const crypto = require('crypto');
const mongoose = require('mongoose');
const { Student } = require('../models/Student');
const { Question } = require('../models/Question');
const Answer = require('../models/Answer');
const { Result } = require('../models/Result');

const submitAnswers = async (req, res) => {
  const { answers } = req.body;
  console.log('Received answers:', answers);

  try {
    for (const answer of answers) {
      console.log('Processing answer:', answer);

      const { message, signature, publicKey } = answer;
      const { questionId, answer: studentAnswer, examId, studentId } = JSON.parse(message);
      console.log('Parsed message:', { questionId, studentAnswer, examId });

      // Verify the signature using RSA-PSS (matching frontend)
      try {
        // Ensure the publicKey is in PEM format
        const pemPublicKey = 
          publicKey.startsWith('-----BEGIN PUBLIC KEY-----')
            ? publicKey
            : `-----BEGIN PUBLIC KEY-----\n${publicKey.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;

        // Create a verify object for RSA-PSS
        const verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(message);
        verifier.end();

        // For RSA-PSS, we need to use a different approach
        // First try with the standard verify method
        let isVerified = false;
        try {
          // Try standard RSA verification first (in case keys were generated differently)
          isVerified = verifier.verify(pemPublicKey, Buffer.from(signature, 'base64'));
        } catch (standardError) {
          console.log('Standard RSA verification failed, trying RSA-PSS...');
          
          // For RSA-PSS verification, we need to use the Web Crypto API style verification
          // But since Node.js crypto doesn't directly support RSA-PSS verify, 
          // we'll need to use a different approach
          
          // Import the key as a KeyObject
          const keyObject = crypto.createPublicKey({
            key: pemPublicKey,
            format: 'pem',
            type: 'spki'
          });

          // Use the sign/verify method with PSS padding
          const verifyObject = crypto.createVerify('sha256');
          verifyObject.update(message);
          verifyObject.end();

          // Try with PSS padding options
          isVerified = verifyObject.verify({
            key: keyObject,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            saltLength: 32, // Must match frontend saltLength
            mgf: crypto.constants.RSA_MGF1
          }, Buffer.from(signature, 'base64'));
        }

        console.log('Signature verified:', isVerified);

        if (!isVerified) {
          console.warn('Signature verification failed for answer:', answer);
          return res.status(400).json({ message: 'Signature verification failed' });
        }
      } catch (verifyError) {
        console.error('Error during signature verification:', verifyError);
        return res.status(400).json({ message: 'Signature verification error', error: verifyError.message });
      }

      // Save the answer to the database
      const student = await Student.findById(studentId);
      if (!student) {
        console.warn('Student not found for studentId:', studentId);
        return res.status(404).json({ message: 'Student not found' });
      }

      const newAnswer = new Answer({
        questionId: mongoose.Types.ObjectId(questionId),
        studentId: student._id,
        answer: studentAnswer,
        signature,
        publicKey
      });

      await newAnswer.save();
      console.log('Answer saved for questionId:', questionId);
    }

    console.log('All answers submitted successfully');
    return res.status(201).json({ message: 'Answers submitted successfully' });
  } catch (error) {
    console.error('Error submitting answers:', error);
    return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
  }
};

const calculateResults = async (req, res) => {
  const { examId } = req.body;

  try {
    const questions = await Question.find({ examId: mongoose.Types.ObjectId(examId) });
    
    // Fix the query - Answer schema likely has questionId field, not nested examId
    const answers = await Answer.find({}).populate('questionId');
    
    // Filter answers for this specific exam
    const examAnswers = answers.filter(answer => 
      answer.questionId && answer.questionId.examId && 
      answer.questionId.examId.equals(mongoose.Types.ObjectId(examId))
    );

    const results = {};

    examAnswers.forEach((answer) => {
      const question = questions.find(q => q._id.equals(answer.questionId._id));
      if (!question) {
        return;
      }

      const isCorrect = question.answer === answer.answer;
      if (!results[answer.studentId]) {
        results[answer.studentId] = { correct: 0, total: 0 };
      }

      results[answer.studentId].total += 1;
      if (isCorrect) {
        results[answer.studentId].correct += 1;
      }
    });

    const finalResults = Object.keys(results).map(studentId => ({
      studentId,
      correct: results[studentId].correct,
      total: results[studentId].total,
      percentage: (results[studentId].correct / results[studentId].total) * 100
    }));

    for (const r of finalResults) {
      await Result.findOneAndUpdate(
        { studentId: r.studentId, examId },
        { correct: r.correct, total: r.total, percentage: r.percentage },
        { upsert: true, new: true }
      );
    }
    res.status(200).json({ results: finalResults });
  } catch (error) {
    console.error('Error calculating results:', error);
    return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
  }
};

const submitAnswer = async (req, res) => {
  const { questionId, studentId, answer, signature, publicKey } = req.body;
  try {
    // Optionally: verify signature here using the same RSA-PSS method
    const newAnswer = new Answer({ questionId, studentId, answer, signature, publicKey });
    await newAnswer.save();
    res.status(201).json({ message: 'Answer submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  submitAnswers,
  calculateResults,
  submitAnswer
};