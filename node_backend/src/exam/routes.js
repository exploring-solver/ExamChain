const express = require('express');
const router = express.Router();
const { checkIfOrganization, checkIfAuthenticated, checkIfAdmin } = require('../../middlewares/validateAuth');
const { createQuestion, decryptQuestion } = require('./controller/question');
const { decryptQuestionsIfThresholdMet } = require('./controller/submit-share');
const { createExam, submitShare } = require('./controller/exam');

// TODO: get questions after encrytption

// TODO: store question in db by organization

router.post('/api/v2/question/create', checkIfOrganization, createQuestion);
router.post('/api/v2/question/decrypt', checkIfOrganization, decryptQuestion);

//API : for shamira's secrets
router.post('/api/v2/secrets/submit-share', checkIfAuthenticated, checkIfOrganization, submitShare);
router.post('/api/v2/secrets/decrypt-questions', checkIfAuthenticated, checkIfOrganization, decryptQuestionsIfThresholdMet);

router.post('/create-exam', checkIfAdmin, createExam);

// TODO: delete a question

// TODO: submit an answer in queue

// TODO: answer calculator in theory works as a gate for blockchain

module.exports = router;
