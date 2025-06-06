const { combineShares } = require('../utils/shamir-secret');
const { Organization } = require('../models/Organization');
const { Question } = require('../models/Question');

let sharesReceived = [];

const submitShare = async (req, res) => {
  const { organizationId, share } = req.body;

  try {
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({ status: 404, message: 'Organization not found' });
    }

    sharesReceived.push(Buffer.from(share, 'hex'));

    return res.status(200).json({ message: 'Share received' });
  } catch (error) {
    return res.status(500).json({ status: 500, message: 'Internal server error', error });
  }
};

//to be deleted and not used since we already have a function to decrypt questions in controller/question.js
const decryptQuestionsIfThresholdMet = async (req, res) => {
  const { threshold } = req.body;
  console.log(`[INFO] Decryption request received with threshold: ${threshold}`);
  console.log(`[DEBUG] Current number of shares received: ${sharesReceived.length}`);

  if (sharesReceived.length >= threshold) {
    try {
      console.log(`[INFO] Threshold met. Combining shares to reconstruct secret key.`);
      const secretKey = combineShares(sharesReceived);
      console.log(`[DEBUG] Secret key successfully reconstructed.`);

      sharesReceived = []; // Clear shares after combining
      console.log(`[INFO] Shares cleared after reconstruction.`);

      // Find all encrypted questions
      const questions = await Question.find({ encrypted: true });
      console.log(`[INFO] Found ${questions.length} encrypted questions.`);

      const decryptedQuestions = questions.map((question, index) => {
        console.log(`[DEBUG] Decrypting question ${index + 1}/${questions.length} with ID: ${question._id}`);

        const decryptedContent = decrypt(question.content, secretKey);
        const decryptedOptions = {
          a: decrypt(question.options.a, secretKey),
          b: decrypt(question.options.b, secretKey),
          c: decrypt(question.options.c, secretKey),
          d: decrypt(question.options.d, secretKey),
        };
        const decryptedAnswer = decrypt(question.answer, secretKey);

        return {
          ...question._doc,
          content: decryptedContent,
          options: decryptedOptions,
          answer: decryptedAnswer,
          encrypted: false,
        };
      });

      // Update the questions in the database
      for (let i = 0; i < decryptedQuestions.length; i++) {
        const decryptedQuestion = decryptedQuestions[i];
        console.log(`[INFO] Updating question ${i + 1}/${decryptedQuestions.length} in the database with ID: ${decryptedQuestion._id}`);
        await Question.findByIdAndUpdate(decryptedQuestion._id, decryptedQuestion);
      }

      console.log(`[SUCCESS] All questions decrypted and updated successfully.`);
      return res.status(200).json({ message: 'Questions decrypted successfully' });
    } catch (error) {
      console.error(`[ERROR] Failed to decrypt questions:`, error);
      return res.status(500).json({ status: 500, message: 'Internal server error', error });
    }
  } else {
    console.warn(`[WARN] Not enough shares received. Threshold not met.`);
    return res.status(400).json({ message: 'Not enough shares received yet' });
  }
};

module.exports = { decryptQuestionsIfThresholdMet };
