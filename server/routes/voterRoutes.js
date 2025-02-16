const express = require('express');
const { registerVoter, viewVoters, generateEthereumAddressController } = require('../controllers/voterController');
const { body } = require('express-validator');

const router = express.Router();

router.post(
  '/admin/register-voter',
  [
    body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('phoneNumber')
      .isMobilePhone()
      .withMessage('Invalid phone number'),
    body('dateOfBirth')
      .isISO8601()
      .toDate()
      .withMessage('Invalid date format (YYYY-MM-DD expected)'),
  ],
  registerVoter
);

router.get('/admin/view-voters', viewVoters);

module.exports = router;
