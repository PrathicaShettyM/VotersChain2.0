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
        bool isActive;
        mapping(uint256 => Candidate) candidates;
        uint256 candidateCount;
        mapping(address => bool) hasVoted;
    }
    
    mapping(uint256 => Election) public elections;
    uint256 public electionCount;
    
    event VoteCast(uint256 electionId, uint256 candidateId, address voter);
    event ElectionCreated(uint256 electionId);
    
    function createElection(
        uint256 _electionId,
        string memory _electionName,
        string[] memory _candidateAddresses,
        string[] memory _partyAffiliations
    ) public {
        require(_candidateAddresses.length == _partyAffiliations.length, "Arrays length mismatch");
        
        Election storage election = elections[_electionId];
        election.electionId = _electionId;
        election.electionName = _electionName;
        election.isActive = true;
        
        for(uint256 i = 0; i < _candidateAddresses.length; i++) {
            election.candidates[i] = Candidate({
                candidateAddress: _candidateAddresses[i],
                partyAffiliation: _partyAffiliations[i],
                voteCount: 0
            });
            election.candidateCount++;
        }
        
        electionCount++;
        emit ElectionCreated(_electionId);
    }
    
    function castVote(uint256 _electionId, uint256 _candidateId) public {
        Election storage election = elections[_electionId];
        require(election.isActive, "Election is not active");
        require(!election.hasVoted[msg.sender], "Already voted");
        require(_candidateId < election.candidateCount, "Invalid candidate");
        
        election.candidates[_candidateId].voteCount++;
        election.hasVoted[msg.sender] = true;
        
        emit VoteCast(_electionId, _candidateId, msg.sender);
    }
    
    function getElectionDetails(uint256 _electionId) public view returns (
        string memory electionName,
        bool isActive,
        uint256 candidateCount
    ) {
        Election storage election = elections[_electionId];
        return (
            election.electionName,
            election.isActive,
            election.candidateCount
        );
    }
    
    function getCandidateDetails(uint256 _electionId, uint256 _candidateId) public view returns (
        string memory candidateAddress,
        string memory partyAffiliation,
        uint256 voteCount
    ) {
        Election storage election = elections[_electionId];
        Candidate storage candidate = election.candidates[_candidateId];
        return (
            candidate.candidateAddress,
            candidate.partyAffiliation,
            candidate.voteCount
        );
    }
}