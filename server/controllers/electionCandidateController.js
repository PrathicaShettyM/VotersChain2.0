const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const ElectionCandidate = require('../models/ElectionCandidate');

exports.getCandidatesAndElections = async (req, res) => {
    try {
        const elections = await Election.find();
        const candidates = await Candidate.find();
        res.json({ elections, candidates });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Error fetching data', error });
    }
};

exports.assignCandidatesToElection = async (req, res) => {
    const { election_id, candidate_addresses } = req.body;
    
    if (!election_id || !candidate_addresses || !Array.isArray(candidate_addresses)) {
        return res.status(400).json({ message: 'Invalid input data' });
    }
    
    try {
        const selectedCandidates = await Candidate.find({ 
            ethereumAddress: { $in: candidate_addresses } 
        });
        
        if (selectedCandidates.length !== candidate_addresses.length) {
            return res.status(400).json({ message: 'One or more candidates not found' });
        }
        
        const party_affiliations = selectedCandidates.map(c => c.party_affiliation || 'Unknown');
        
        const electionCandidate = new ElectionCandidate({
            election_id,
            candidate_addresses,
            party_affiliations
        });
        
        await electionCandidate.save();
        res.status(201).json({ message: 'Candidates assigned successfully' });
    } catch (error) {
        console.error('Error assigning candidates:', error);
        res.status(500).json({ message: 'Error assigning candidates', error });
    }
};