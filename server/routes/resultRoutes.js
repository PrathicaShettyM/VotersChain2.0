const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const ElectionCandidate = require('../models/ElectionCandidate');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');

router.get('/results', async (req, res) => {
  try {
    const results = await Result.find();
    
    const formattedResults = await Promise.all(results.map(async (result) => {
      const electionCandidate = await ElectionCandidate.findOne({ election_id: result.electionId });
      if (!electionCandidate) return null;
      
      const candidates = await Promise.all(electionCandidate.candidate_addresses.map(async (address, index) => {
        const candidate = await Candidate.findOne({ ethereumAddress: address });
        return {
          candidateName: candidate ? candidate.name : "Unknown Candidate",
          party: candidate ? candidate.party_affiliation : "Unknown Party",
          votesCount: result.candidateId == index ? result.votesCount : 0,
        };
      }));
      
      const election = await Election.findOne({ election_id: result.electionId });
      
      return {
        electionName: election ? election.name : "Unknown Election",
        candidates,
      };
    }));

    res.json(formattedResults.filter(item => item !== null));
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
