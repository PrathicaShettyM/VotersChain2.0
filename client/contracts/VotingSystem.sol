// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    struct Candidate {
        string candidateAddress;
        string partyAffiliation;
        uint256 voteCount;
    }

    struct Election {
        uint256 electionId;
        string electionName;
        mapping(uint256 => Candidate) candidates;
        uint256 candidateCount;
        mapping(address => bool) hasVoted;
    }

    struct AuditTrail {
        string transactionHash;
        string transactionType;
        address userEthereumAddress;
        string additionalDetails;
    }

    struct Vote {
        uint256 electionId;
        uint256 candidateId;
        address voterEthereumAddress;
    }

    struct ElectionResult {
        uint256 electionId;
        uint256 candidateId;
        uint256 votesCount;
    }

    mapping(uint256 => Election) public elections;
    mapping(uint256 => AuditTrail) public auditTrails;
    mapping(uint256 => Vote) public votes;
    mapping(uint256 => ElectionResult) public results;

    uint256 public electionCount;
    uint256 public auditCount;
    uint256 public voteCount;
    uint256 public resultCount;

    event VoteCast(uint256 electionId, uint256 candidateId, address voter);
    event ElectionCreated(uint256 electionId);
    event ElectionResultStored(uint256 electionId, uint256 candidateId, uint256 votesCount);
    event AuditTrailStored(string transactionHash, string transactionType, address userEthereumAddress, string additionalDetails);

    function createElection(
        string memory _electionName,
        string[] memory _candidateAddresses,
        string[] memory _partyAffiliations
    ) public {
        require(_candidateAddresses.length == _partyAffiliations.length, "Mismatched inputs");

        electionCount++;
        Election storage election = elections[electionCount];
        election.electionId = electionCount;
        election.electionName = _electionName;

        for (uint256 i = 0; i < _candidateAddresses.length; i++) {
            election.candidates[i] = Candidate({
                candidateAddress: _candidateAddresses[i],
                partyAffiliation: _partyAffiliations[i],
                voteCount: 0
            });
            election.candidateCount++;
        }

        emit ElectionCreated(electionCount);
    }

    function castVote(uint256 _electionId, uint256 _candidateId, string memory _transactionHash) public {
        Election storage election = elections[_electionId];
        require(!election.hasVoted[msg.sender], "Already voted");
        require(_candidateId < election.candidateCount, "Invalid candidate");

        // Store the vote
        voteCount++;
        votes[voteCount] = Vote({
            electionId: _electionId,
            candidateId: _candidateId,
            voterEthereumAddress: msg.sender
        });

        // Store audit trail
        auditCount++;
        auditTrails[auditCount] = AuditTrail({
            transactionHash: _transactionHash,
            transactionType: "Vote",
            userEthereumAddress: msg.sender,
            additionalDetails: "Voted in election"
        });

        election.candidates[_candidateId].voteCount++;
        election.hasVoted[msg.sender] = true;

        emit VoteCast(_electionId, _candidateId, msg.sender);
        emit AuditTrailStored(_transactionHash, "Vote", msg.sender, "Voted in election");
    }

    function storeElectionResult(uint256 _electionId) public {
        Election storage election = elections[_electionId];

        uint256 winningCandidateId;
        uint256 maxVotes = 0;

        for (uint256 i = 0; i < election.candidateCount; i++) {
            if (election.candidates[i].voteCount > maxVotes) {
                maxVotes = election.candidates[i].voteCount;
                winningCandidateId = i;
            }
        }

        resultCount++;
        results[resultCount] = ElectionResult({
            electionId: _electionId,
            candidateId: winningCandidateId,
            votesCount: maxVotes
        });

        emit ElectionResultStored(_electionId, winningCandidateId, maxVotes);
    }

    function getCandidateInfo(uint256 _electionId, uint256 _candidateId) public view returns (
        string memory candidateAddress,
        string memory partyAffiliation,
        uint256 totalVotes  // Changed from voteCount to totalVotes
    ) {
        Election storage election = elections[_electionId];
        require(_candidateId < election.candidateCount, "Invalid candidate");
        
        Candidate storage candidate = election.candidates[_candidateId];
        return (
            candidate.candidateAddress,
            candidate.partyAffiliation,
            candidate.voteCount
        );
    }
}