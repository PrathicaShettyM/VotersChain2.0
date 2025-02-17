import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axiosInstance from '../utils/axiosInstance';
import cABI from "../../artifacts/contracts/VotingSystem.sol/VotingSystem.json";
import Navbar from '../components/Navbar';

const VoterDashboard = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userAddress, setUserAddress] = useState('');
  const [voteDetails, setVoteDetails] = useState(null);

  useEffect(() => { 
    fetchElections();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return showMessage('error', 'Please install MetaMask');
    
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
        
        // Fetch the balance of the connected account
        const balance = await provider.getBalance(address);
        console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
        
        const contractInstance = new ethers.Contract(
            import.meta.env.VITE_CONTRACT_ADDRESS, 
            cABI.abi, 
            signer
        );
        setContract(contractInstance);

        showMessage('success', `Wallet connected: ${address}`);
    } catch (error) { 
        showMessage('error', 'Failed to connect: ' + error.message);
    }
};


  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const fetchElections = async () => {
    try {
      const { data } = await axiosInstance.get('/voter/dashboard');
      const correctedData = await Promise.all(data.electionData.map(async e => {
        // Fetch on-chain election details
        if (contract) {
          try {
            const electionDetails = await contract.getElectionDetails(e.election_id);
            return {
              ...e,
              isActive: electionDetails.isActive,
              totalVotes: electionDetails.totalVotes.toString(),
              candidates: e.candidates.map(c => ({
                candidate_name: c.candidate_name,
                candidate_address: c.candidate_address,
                party_affiliation: c.party_affiliation
              }))
            };
          } catch (error) {
            console.error('Error fetching election details:', error);
            return e;
          }
        }
        return e;
      }));
      
      setElections(correctedData);
      setUserAddress(data.voterAddress);
    } catch (error) { 
      showMessage('error', 'Failed to fetch elections: ' + error.message);
    }
  };

  const fetchCandidates = async (election) => {
    setSelectedElection(election);
    try {
      if (contract) {
        const candidatesList = await Promise.all(
          election.candidates.map(async (_, index) => {
            const details = await contract.getCandidateDetails(
              election.election_id,
              index
            );
            return {
              ...election.candidates[index],
              voteCount: details.voteCount.toString()
            };
          })
        );
        setCandidates(candidatesList);
      } else {
        setCandidates(election.candidates);
      }
    } catch (error) {
      showMessage('error', 'Failed to fetch candidates: ' + error.message);
    }
  };

  const castVote = async (electionId, candidateIndex) => {
    if (!contract) return showMessage('error', 'Please connect your wallet first');
    
    try {
        setLoading(true);
        const tx = await contract.castVote(electionId, candidateIndex);
        const receipt = await tx.wait();

        // Extract vote event details
        const voteEvent = receipt.events.find(e => e.event === 'VoteCast');
        const voteDetails = voteEvent ? {
            electionId: voteEvent.args.electionId.toString(),
            candidateId: voteEvent.args.candidateId.toString(),
            voterEthereumAddress: voteEvent.args.voter,
            transactionHash: receipt.transactionHash
        } : null;

        if (voteDetails) {
            // Send vote data to the backend
            await axiosInstance.post('/voter/process-voter-data', {
                auditData: {
                    transactionHash: voteDetails.transactionHash,
                    transactionType: "Vote",
                    userEthereumAddress: voteDetails.voterEthereumAddress,
                    additionalDetails: `Voted for candidate ${voteDetails.candidateId} in election ${voteDetails.electionId}`
                },
                voteData: voteDetails
            });

            showMessage('success', 'Vote recorded successfully!');
        }

        await fetchElections();
        if (selectedElection) await fetchCandidates(selectedElection);
    } catch (error) {
        showMessage('error', 'Failed to cast vote: ' + error.message);
    } finally {
        setLoading(false);
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
              <div key={election.election_id} 
                   className="border rounded-lg p-4">
                <button 
                  className="w-full text-left px-4 py-3 text-lg hover:bg-gray-50"
                  onClick={() => fetchCandidates(election)}
                >
                  <span className="font-semibold">{election.election_name}</span>
                  {election.totalVotes && (
                    <span className="ml-4 text-sm text-gray-600">
                      Total Votes: {election.totalVotes}
                    </span>
                  )}
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
              {candidates.map((candidate, index) => (
                <div key={index} className="p-4 border rounded-lg text-lg">
                  <p className="font-semibold">{candidate.candidate_name}</p>
                  <p className="text-gray-600">{candidate.party_affiliation}</p>
                  <p className="text-gray-500 text-sm">
                    Address: {candidate.candidate_address}
                  </p>
                  {candidate.voteCount && (
                    <p className="text-sm text-gray-600 mt-2">
                      Votes: {candidate.voteCount}
                    </p>
                  )}
                  <button 
                    className={`mt-3 px-6 py-2 rounded-lg text-white text-lg ${
                      loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={loading}
                    onClick={() => castVote(selectedElection.election_id, index)}
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