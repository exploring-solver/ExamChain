const express = require('express');
const router = express.Router();
const { checkIfOrganization, checkIfAuthenticated, checkIfAdmin } = require('../../middlewares/validateAuth');
const { createQuestion, decryptQuestion, decryptAllQuestions, getAllQuestions, getQuestionsByExamId, getQuestionById, getQuestionsByOrganizationId, deleteQuestionById } = require('./controller/question');
const { decryptQuestionsIfThresholdMet } = require('./controller/submit-share');
const { createExam, submitShare, getExams, getExamStats, getExamById, updateExam, deleteExam, toggleExamDecryption, startExam } = require('./controller/exam');
const { calculateResults, submitAnswers, submitAnswer } = require('./controller/answer');
const { getAllOrganizations, deleteOrganization, getOrganizationStats, getOrganizationById, createOrganization, updateOrganization, clearOrganizationShare, bulkDeleteOrganizations, getSharesForOrganization } = require('./controller/organization');
const { createStudents } = require('./controller/student');
const { getResultsByExam } = require('./controller/result');


router.post('/api/v2/question/create', checkIfOrganization, createQuestion);
router.post('/api/v2/question/decrypt', checkIfOrganization, decryptQuestion);

//API : for shamira's secrets
router.post('/api/v2/secrets/submit-share', checkIfAuthenticated, checkIfOrganization, submitShare);
router.post('/api/v2/secrets/decrypt-questions', checkIfAuthenticated, checkIfOrganization, decryptQuestionsIfThresholdMet);

router.post('/create-exam', checkIfAdmin, createExam);
router.post('/api/v2/question/decrypt-all', decryptAllQuestions);

//create students
router.post('/create-students', createStudents);

//get all exams
router.get('/exams', getExams);
router.get('/exams/stats', getExamStats);

// GET /exam/exams/:id - Get specific exam by ID
router.get('/exams/:id', getExamById);

// PUT /exam/exams/:id - Update an exam
router.put('/exams/:id', updateExam);

// DELETE /exam/exams/:id - Delete an exam
router.delete('/exams/:id', deleteExam);

// PATCH /exam/exams/:id/toggle-decryption - Toggle exam decryption status
router.patch('/exams/:id/toggle-decryption', toggleExamDecryption);
// TODO: submit an answer in queue
router.post('/submit', submitAnswers);
// TODO: answer calculator in theory works as a gate for blockchain
router.post('/calculate-results', calculateResults);

// GET /exam/organizations - Get all organizations
router.get('/organizations', getAllOrganizations);

// GET /exam/organizations/stats - Get organization statistics
router.get('/organizations/stats', getOrganizationStats);


// GET /exam/organizations/:id - Get specific organization by ID
router.get('/organizations/:id', getOrganizationById);

// POST /exam/organizations - Create a new organization
router.post('/organizations', createOrganization);

// PUT /exam/organizations/:id - Update an organization
router.put('/organizations/:id', updateOrganization);

// DELETE /exam/organizations/:id - Delete an organization
router.delete('/organizations/:id', deleteOrganization);

// PATCH /exam/organizations/:id/clear-share - Clear organization share
router.patch('/organizations/:id/clear-share', clearOrganizationShare);

// POST /exam/organizations/bulk-delete - Bulk delete organizations
router.post('/organizations/bulk-delete', bulkDeleteOrganizations);

// Getting questions
router.get('/questions', getAllQuestions);
router.get('/questions/:organizationId', getQuestionsByOrganizationId);
router.get('/questions/exam/:examId', getQuestionsByExamId);
router.get('/questions/:questionId', getQuestionById);
router.delete('/questions/:questionId', deleteQuestionById);

// Get all shares for an organization
router.get('/organizations/:organizationId/shares', checkIfOrganization, getSharesForOrganization);

// Start an exam
router.post('/exams/start', checkIfAdmin, startExam);

// Student submits an answer (signed)
router.post('/answers/submit', checkIfAuthenticated, submitAnswer);

// Calculate and store results for an exam
router.post('/results/calculate', calculateResults);

// Get results by exam ID
router.get('/results/:examId', getResultsByExam);

module.exports = router;
