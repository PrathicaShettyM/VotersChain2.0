// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    struct Candidate {
        string candidateAddress;
        string partyAffiliation;
        uint256 voteCount;
    }
    
    struct Vote {
        uint256 electionId;
        uint256 candidateId;
        address voterEthereumAddress;
        uint256 timestamp;
    }

    struct AuditTrail {
        bytes32 transactionHash;
        string transactionType;
        address userEthereumAddress;
        uint256 timestamp;
        string additionalDetails;
    }

    struct ElectionResult {
        uint256 resultId;
        uint256 electionId;
        string candidateAddress;
        uint256 voteCount;
        uint256 timestamp;
    }

    struct Election {
        uint256 electionId;
        string electionName;
        bool isActive;
        mapping(uint256 => Candidate) candidates;
        uint256 candidateCount;
        mapping(address => bool) hasVoted;
        uint256 totalVotes;  // Added to track votes per election
    }
    
    mapping(uint256 => Election) public elections;
    mapping(bytes32 => Vote) public votes;
    mapping(bytes32 => AuditTrail) public auditTrails;
    mapping(uint256 => ElectionResult) public electionResults;

    uint256 public electionCount;
    uint256 public auditTrailCount;
    uint256 public resultCount;
    uint256 public totalSystemVotes;  // Renamed from voteCount for clarity

    event VoteCast(uint256 electionId, uint256 candidateId, address voter);
    event ElectionCreated(uint256 electionId);
    event AuditTrailCreated(bytes32 transactionHash, string transactionType);
    event ElectionResultRecorded(uint256 resultId, uint256 electionId);
    constructor() {
        electionCount = 0;
        auditTrailCount = 0;
        resultCount = 0;
        totalSystemVotes = 0;
    }

    function createAuditTrail(
        string memory _transactionType,
        string memory _additionalDetails
    ) internal returns (bytes32) {
        bytes32 transactionHash = keccak256(
            abi.encodePacked(
                block.timestamp,
                msg.sender,
                _transactionType
            )
        );
        
        AuditTrail storage trail = auditTrails[transactionHash];
        trail.transactionHash = transactionHash;
        trail.transactionType = _transactionType;
        trail.userEthereumAddress = msg.sender;
        trail.timestamp = block.timestamp;
        trail.additionalDetails = _additionalDetails;
        
        auditTrailCount++;
        emit AuditTrailCreated(transactionHash, _transactionType);
        return transactionHash;
    }


    function activateElection(uint256 _electionId) public {
        Election storage election = elections[_electionId];
        require(bytes(election.electionName).length > 0, "Election does not exist");
        election.isActive = true;
    }

     function createElection(
        uint256 _electionId,
        string memory _electionName,
        string[] memory _candidateAddresses,
        string[] memory _partyAffiliations
    ) public {
        require(_candidateAddresses.length == _partyAffiliations.length, "Arrays length mismatch");
        require(_electionId > 0, "Invalid election ID");
        require(bytes(elections[_electionId].electionName).length == 0, "Election ID already exists");
        
        Election storage election = elections[_electionId];
        election.electionId = _electionId;
        election.electionName = _electionName;
        election.isActive = true;
        election.candidateCount = 0;
        election.totalVotes = 0;
        
        for(uint256 i = 0; i < _candidateAddresses.length; i++) {
            election.candidates[i] = Candidate({
                candidateAddress: _candidateAddresses[i],
                partyAffiliation: _partyAffiliations[i],
                voteCount: 0
            });
            election.candidateCount++;
        }
        
        electionCount++;
        createAuditTrail("ELECTION_CREATED", _electionName);
        emit ElectionCreated(_electionId);
    }
    
    function castVote(uint256 _electionId, uint256 _candidateId) public {
        Election storage election = elections[_electionId];
        require(election.isActive, "Election is not active");
        require(!election.hasVoted[msg.sender], "Already voted");
        require(_candidateId < election.candidateCount, "Invalid candidate");
        
        bytes32 voteId = keccak256(
            abi.encodePacked(_electionId, msg.sender, block.timestamp)
        );
        
        votes[voteId] = Vote({
            electionId: _electionId,
            candidateId: _candidateId,
            voterEthereumAddress: msg.sender,
            timestamp: block.timestamp
        });

        election.candidates[_candidateId].voteCount++;
        election.hasVoted[msg.sender] = true;
        election.totalVotes++;
        totalSystemVotes++;
        
        createAuditTrail("VOTE_CAST", string(abi.encodePacked("Election: ", _electionId)));
        emit VoteCast(_electionId, _candidateId, msg.sender);
    }
    
    function recordElectionResult(
        uint256 _electionId,
        uint256 _candidateId
    ) public {
        Election storage election = elections[_electionId];
        require(!election.isActive, "Election is still active");
        
        resultCount++;
        ElectionResult storage result = electionResults[resultCount];
        result.resultId = resultCount;
        result.electionId = _electionId;
        result.candidateAddress = election.candidates[_candidateId].candidateAddress;
        result.voteCount = election.candidates[_candidateId].voteCount;
        result.timestamp = block.timestamp;
        
        createAuditTrail("RESULT_RECORDED", string(abi.encodePacked("Election: ", _electionId)));
        emit ElectionResultRecorded(resultCount, _electionId);
    }

    function getVoteDetails(bytes32 _voteId) public view returns (
        uint256 electionId,
        uint256 candidateId,
        address voterEthereumAddress,
        uint256 timestamp
    ) {
        Vote storage vote = votes[_voteId];
        return (
            vote.electionId,
            vote.candidateId,
            vote.voterEthereumAddress,
            vote.timestamp
        );
    }


    function getAuditTrail(bytes32 _transactionHash) public view returns (
        string memory transactionType,
        address userEthereumAddress,
        uint256 timestamp,
        string memory additionalDetails
    ) {
        AuditTrail storage trail = auditTrails[_transactionHash];
        return (
            trail.transactionType,
            trail.userEthereumAddress,
            trail.timestamp,
            trail.additionalDetails
        );
    }

    function getElectionResult(uint256 _resultId) public view returns (
        uint256 electionId,
        string memory candidateAddress,
        uint256 voteCount,
        uint256 timestamp
    ) {
        ElectionResult storage result = electionResults[_resultId];
        return (
            result.electionId,
            result.candidateAddress,
            result.voteCount,
            result.timestamp
        );
    }

    function getElectionDetails(uint256 _electionId) public view returns (
        string memory electionName,
        bool isActive,
        uint256 candidateCount,
        uint256 totalVotes
    ) {
        Election storage election = elections[_electionId];
        return (
            election.electionName,
            election.isActive,
            election.candidateCount,
            election.totalVotes
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