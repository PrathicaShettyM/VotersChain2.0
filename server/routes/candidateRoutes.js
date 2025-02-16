const express = require('express');
const { registerCandidate, viewCandidates } = require('../controllers/candidateController');
const { body } = require('express-validator');

const router = express.Router();

router.post(
  '/admin/register-candidate',
  [
    body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('party_affiliation').trim().notEmpty().withMessage('Party affiliation is required'),
    body('bio').trim().isLength({ min: 10 }).withMessage('Bio must be at least 10 characters long'),
  ],
  registerCandidate
);

router.get('/admin/view-candidates', viewCandidates);

module.exports = router;
