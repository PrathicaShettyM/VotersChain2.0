const Election = require('../models/Election');
const ElectionCandidate = require('../models/ElectionCandidate');
const Candidate = require('../models/Candidate');
const Voter = require('../models/Voter');

const getElectionData = async (req, res) => {
  try {
    const elections = await Election.find();
    const electionData = [];

    for (const election of elections) {
      const electionCandidates = await ElectionCandidate.find({ election_id: election.election_id });
      const candidates = [];

      for (const ec of electionCandidates) {
        for (let i = 0; i < ec.candidate_addresses.length; i++) {
          const candidate = await Candidate.findOne({ ethereumAddress: ec.candidate_addresses[i] });
          candidates.push({
            candidate_name: candidate.name,
            candidate_address: ec.candidate_addresses[i],
            party_affiliation: ec.party_affiliations[i] || candidate.party_affiliation
          });
        }
      }

      electionData.push({
        election_id: election.election_id,
        election_name: election.name,
        candidates
      });
    }

    const voter = await Voter.findOne({ _id: req.user.id });
    res.status(200).json({ electionData, voterAddress: voter.ethereumAddress });

  } catch (error) {
    console.error('Error fetching election data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getElectionData };
