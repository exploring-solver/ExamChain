const express = require('express');

// const controller = require('./controller/index');
const validateSchemas = require('../../middlewares/validateSchemas');
const schemas = require('./utils/schemasValidation');

const router = express.Router();

// TODO: get questions after encrytption

// TODO: store question in db by organization

// TODO: delete a question

// TODO: submit an answer in queue

// TODO: answer calculator in theory works as a gate for blockchain

module.exports = router;
