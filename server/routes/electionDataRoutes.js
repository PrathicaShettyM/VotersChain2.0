const express = require('express');
const { getElectionData} = require('../controllers/electionDataController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.get('/voter/dashboard', authMiddleware, getElectionData);

module.exports = router;