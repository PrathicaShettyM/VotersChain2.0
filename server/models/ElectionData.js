const mongoose = require('mongoose');

const electionDataSchema = new mongoose.Schema({
  election_id: { type: Number, required: true, ref: 'ElectionCandidate' },
  election_name: { type: String, required: true, ref: 'Election' },
  candidates: [{
    candidate_name: { type: String, required: true, ref: 'Candidate' },
    candidate_address: { type: String, required: true, ref: 'ElectionCandidate' },
    party_affiliation: { type: String, ref: 'ElectionCandidate' }
  }]
});

module.exports = mongoose.model('ElectionData', electionDataSchema);