const mongoose = require('mongoose');

const electionCandidateSchema = new mongoose.Schema({
    election_id: { type: Number, required: true },
    candidate_addresses: [{ type: String, required: true }],
    party_affiliations: [{ type: String }]
});

module.exports = mongoose.model('ElectionCandidate', electionCandidateSchema);