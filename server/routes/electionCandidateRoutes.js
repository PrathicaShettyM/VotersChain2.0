const express = require('express');
const router = express.Router();
const { getCandidatesAndElections, assignCandidatesToElection } = require('../controllers/electionCandidateController');

router.get('/admin/register-candidate-to-election', getCandidatesAndElections);
router.post('/admin/register-candidate-to-election', assignCandidatesToElection);

module.exports = router;
