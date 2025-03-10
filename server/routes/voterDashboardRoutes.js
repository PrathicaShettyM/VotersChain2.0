const express = require('express');
const router = express.Router();
const voterController = require('../controllers/voterDashboardController');

// POST route for processing voter data
router.post('/voter/dashboard', voterController.processVoterData);

module.exports = router;
