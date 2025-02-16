const express = require('express');
const { body } = require('express-validator');
const { createElection, getAllElections } = require('../controllers/electionControllers');

const router = express.Router();

// Validation middleware
const validateElectionInput = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('Name must not contain special characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .escape(), // Prevents script injection

  body('start_time')
    .isISO8601()
    .withMessage('Start time must be a valid date'),

  body('duration_minutes')
    .isInt({ min: 1, max: 1440 })
    .withMessage('Duration must be between 1 and 1440 minutes'),
];

// Register Election with validation
router.post('/admin/register-election', validateElectionInput, createElection);

// View All Elections
router.get('/admin/view-elections', getAllElections);

module.exports = router;
