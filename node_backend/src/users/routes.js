const express = require('express');

const controller = require('./controller/index');
const validateSchemas = require('../../middlewares/validateSchemas');
const schemas = require('./utils/schemasValidation');
const validateAuth = require('../../middlewares/validateAuth');

const router = express.Router();

router.post(
  '/api/v1/signup',
  validateSchemas.inputs(schemas.signUp, 'body'),
  (req, res) => {
    controller.signUp(res, req.body);
  }
);

router.post(
  '/api/v1/login',
  validateSchemas.inputs(schemas.login, 'body'),
  (req, res) => {
    controller.login(res, req.body);
  }
);

// API : User Details router
router.get(
  '/api/v1/user/details',
  validateAuth.checkIfAuthenticated,
  (req, res) => {
    // Use req.user to access the authenticated user's information
    res.json({ user: req.user });
  }
);


module.exports = router;
