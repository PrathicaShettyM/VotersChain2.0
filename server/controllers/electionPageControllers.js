const Election = require('../models/Election');
const ElectionCandidate = require('../models/ElectionCandidate');
const Candidate = require('../models/Candidate');

exports.getElectionDetails = async (req, res) => {
    try {
        const electionCandidates = await ElectionCandidate.find();
        
        // Get all unique election IDs
        const electionIds = [...new Set(electionCandidates.map(ec => ec.election_id))];
        
        // Fetch elections
        const elections = await Election.find({
            election_id: { $in: electionIds }
        });

        // Create a map of election details for faster lookup
        const electionMap = new Map(
            elections.map(election => [election.election_id, election])
        );

        // Get all unique candidate addresses
        const allCandidateAddresses = electionCandidates.reduce(
            (addresses, ec) => [...addresses, ...ec.candidate_addresses],
            []
        );
        
        // Fetch candidates
        const candidates = await Candidate.find({
            ethereumAddress: { $in: allCandidateAddresses }
        });

        // Create a map of candidate details for faster lookup
        const candidateMap = new Map(
            candidates.map(candidate => [candidate.ethereumAddress, candidate])
        );

        // Combine all the data
        const electionDetails = electionCandidates.map(ec => {
            const election = electionMap.get(ec.election_id);
            const electionCandidates = ec.candidate_addresses.map(address => {
                const candidate = candidateMap.get(address);
                return {
                    name: candidate?.name || 'Unknown',
                    ethereumAddress: address,
                    party: candidate?.party_affiliation || 'Unknown'
                };
            });

            return {
                election_id: ec.election_id,
                election_name: election?.name || 'Unknown Election',
                candidates: electionCandidates
            };
        });

        res.json({ electionDetails });
    } catch (error) {
        console.error('Error fetching election details:', error);
        res.status(500).json({ message: 'Error fetching election details', error });
    }
};