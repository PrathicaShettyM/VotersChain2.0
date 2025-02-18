import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axiosInstance from '../utils/axiosInstance';
import cABI from "../../artifacts/contracts/VotingSystem.sol/VotingSystem.json";
import Navbar from '../components/Navbar';

const VoterDashboard = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => { 
    fetchElections();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      showMessage('error', 'Please install MetaMask');
      return;
    }
  
    try {
      console.log("Attempting to connect to wallet...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setUserAddress(address);
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      if (!contractAddress) throw new Error('Contract address not configured');
      const code = await provider.getCode(contractAddress);
      if (code === '0x') throw new Error('No contract deployed at the specified address');
      const contractInstance = new ethers.Contract(contractAddress, cABI.abi, signer);
      await verifyContractMethods(contractInstance); // Added method call
      setContract(contractInstance);
      showMessage('success', `Wallet connected: ${address}`);
    } catch (error) {
      console.error("Connection error details:", error);
      showMessage('error', 'Failed to connect: ' + error.message);
    }
  };

  const verifyContractMethods = async (contractInstance) => {
    try {
      console.log("Verifying contract methods...");
      const functions = Object.keys(contractInstance.interface.functions);
      
      // Expected functions that should be in your contract
      const expectedFunctions = [
        'electionCount()',
        'elections(uint256)',
        'createElection(string,address[],string[])',
        'castVote(uint256,uint256,bytes32)',
        'getCandidateInfo(uint256,uint256)'
      ];
  
      // Check each expected function
      expectedFunctions.forEach(func => {
        if (!functions.includes(func)) {
          console.warn(`Warning: Expected function ${func} not found in contract`);
        }
      });
  
      return true;
    } catch (error) {
      console.error("Contract verification failed:", error);
      return false;
    }
  };

  const fetchElections = async () => {
    try {
      const { data } = await axiosInstance.get('/voter/dashboard');
      setElections(data.electionData);
      setUserAddress(data.voterAddress);
    } catch (error) { 
      showMessage('error', 'Failed to fetch elections: ' + error.message);
    }
  };

  const ensureElectionExists = async (election) => {
    if (!contract) return false;
    
    try {
      // First check if this election has been created
      const electionData = await contract.elections(election.election_id);
      
      // If election doesn't exist (name is empty), create it
      if (!electionData[1]) { // checking if electionName is empty
        const candidateAddresses = election.candidates.map(c => c.candidate_address || c.candidate_name);
        const partyAffiliations = election.candidates.map(c => c.party_affiliation);
        
        const tx = await contract.createElection(
          election.election_name,
          candidateAddresses,
          partyAffiliations
        );
        await tx.wait();
        console.log("Election created on blockchain");
      }
      return true;
    } catch (error) {
      console.error("Error ensuring election exists:", error);
      return false;
    }
  };

  const castVote = async (electionId, candidateIndex) => {
    if (!contract) {
      return showMessage('error', 'Please connect your wallet first');
    }
    
    try {
      setLoading(true);
      
      // Debug log: Check if user has already voted
      try {
        const election = await contract.elections(electionId);
        const hasVoted = await contract.elections(electionId).hasVoted(userAddress);
        console.log("Has user already voted?", hasVoted);
      } catch (error) {
        console.log("Error checking vote status:", error);
      }
      
      // Ensure election exists before voting
      const election = elections.find(e => e.election_id === electionId);
      if (!election) {
        throw new Error('Election not found');
      }
      
      // Create election if it doesn't exist
      const electionReady = await ensureElectionExists(election);
      if (!electionReady) {
        throw new Error('Failed to prepare election');
      }
  
      // Generate a temporary transaction hash
      const tempTxHash = ethers.keccak256(
        ethers.toUtf8Bytes(`${electionId}-${candidateIndex}-${Date.now()}`)
      );
  
      console.log("Attempting to cast vote with params:", {
        electionId: Number(electionId),
        candidateIndex: Number(candidateIndex),
        txHash: tempTxHash,
        userAddress: userAddress
      });
  
      // Cast the vote
      const tx = await contract.castVote(
        Number(electionId),
        Number(candidateIndex),
        tempTxHash
      );
      
      console.log("Vote transaction initiated:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Vote transaction completed:", receipt);
      
      // Get vote count after voting
      let currentVoteCount;
      try {
        const candidateInfo = await contract.getCandidateInfo(electionId, candidateIndex);
        currentVoteCount = candidateInfo[2].toString();
        console.log("Current vote count for candidate:", currentVoteCount);
      } catch (error) {
        console.log("Error getting vote count:", error);
      }
  
      // Store vote details in backend
      try {
        const backendResponse = await axiosInstance.post('/voter/dashboard', {
          auditData: {
            transactionHash: receipt.hash,
            transactionType: 'Vote',
            userEthereumAddress: userAddress,
            additionalDetails: `Voted for candidate ${candidateIndex} in election ${electionId}`
          },
          voteData: {
            electionId,
            candidateId: candidateIndex,
            voterEthereumAddress: userAddress
          },
          resultData: {
            electionId,
            candidateId: candidateIndex,
            votesCount: currentVoteCount
          }
        });
        console.log("Backend response:", backendResponse);
      } catch (backendError) {
        console.error("Backend error:", backendError);
        if (backendError.response?.status === 400 && 
            backendError.response?.data?.message?.includes("already voted")) {
          showMessage('error', 'You have already voted in this election');
        } else {
          // Even if backend fails, the blockchain vote was successful
          showMessage('warning', 'Vote recorded on blockchain but failed to update server');
        }
        return;
      }
  
      showMessage('success', 'Vote recorded successfully!');
      // Add this to your castVote function after successful vote
      await getElectionResults(electionId);
      await fetchElections();
    } catch (error) {
      console.error("Voting error details:", {
        message: error.message,
        reason: error.reason,
        code: error.code,
        data: error.data,
        transaction: error.transaction
      });
      
      // Check if this is an "already voted" error
      if (error.message.includes("Already voted")) {
        showMessage('error', 'You have already voted in this election');
      } else {
        showMessage('error', 'Failed to cast vote: ' + (error.reason || error.message));
      }
    } finally {
      setLoading(false);
    }
};

  const getElectionResults = async (electionId) => {
    if (!contract) return;
    
    try {
        // Get election data
        const election = await contract.elections(electionId);
        const candidateCount = election.candidateCount;
        
        console.log(`Election ${electionId} Results:`);
        
        // Array to store all promises
        const resultPromises = [];
        
        // Create array of promises for getting candidate info
        for (let i = 0; i < Number(candidateCount); i++) {
            resultPromises.push(contract.getCandidateInfo(electionId, i));
        }
        
        // Wait for all promises to resolve
        const results = await Promise.all(resultPromises);
        
        // Log results
        results.forEach((candidate, index) => {
            console.log(`Candidate ${index}:`, {
                address: candidate[0],     // candidateAddress
                party: candidate[1],       // partyAffiliation
                votes: candidate[2].toString() // voteCount
            });
        });
        
    } catch (error) {
        console.error("Error getting results:", error);
        console.error("Error details:", {
            message: error.message,
            code: error.code,
            data: error.data
        });
    }
};

const getElectionResults = async (electionId) => {
  if (!contract) return;
  try {
    const election = await contract.elections(electionId);
    const candidateCount = election.candidateCount;
    const resultPromises = [];
    for (let i = 0; i < Number(candidateCount); i++) {
      resultPromises.push(contract.getCandidateInfo(electionId, i));
    }
    const resultsData = await Promise.all(resultPromises);
    setResults(resultsData.map((candidate, index) => ({
      index,
      address: candidate[0],
      party: candidate[1],
      votes: candidate[2].toString()
    })));
  } catch (error) {
    console.error("Error getting results:", error);
  }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {message.text}
          </div>
        )}
        
        <h1 className="text-3xl font-bold mb-6">Voter Dashboard</h1>
        
        <div className="text-center bg-gray-50 p-4 rounded-lg mb-6">
          <button 
            className="px-6 py-3 border border-black text-black bg-white rounded-lg text-lg"
            onClick={connectWallet}
          >
            {userAddress ? `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Connect Wallet'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold p-4 border-b">Active Elections</h2>
          <div className="p-4 space-y-4">
            {elections.map(election => (
              <div key={election.election_id} className="border rounded-lg p-4">
                <button 
                  className="w-full text-left px-4 py-3 text-lg hover:bg-gray-50"
                  onClick={() => setSelectedElection(election)}
                >
                  <span className="font-semibold">{election.election_name}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {selectedElection && (
          <div className="bg-white rounded-lg shadow-md mt-4">
            <h2 className="text-2xl font-semibold p-4 border-b">
              {selectedElection.election_name} - Candidates
            </h2>
            <div className="p-4 space-y-4">
              {selectedElection.candidates.map((candidate, index) => (
                <div key={index} className="p-4 border rounded-lg text-lg">
                  <p className="font-semibold">{candidate.candidate_name}</p>
                  <p className="text-gray-600">{candidate.party_affiliation}</p>
                  <button 
                  className={`mt-3 px-6 py-2 rounded-lg text-white text-lg ${
                    loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={loading}
                  onClick={async () => {
                    await castVote(selectedElection.election_id, index);
                    await getElectionResults(selectedElection.election_id);
                  }}
                >
                  {loading ? 'Processing...' : 'Vote'}
                </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VoterDashboard;
