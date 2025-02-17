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

  useEffect(() => {
    fetchElections();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      showMessage('error', 'Please install MetaMask to connect');
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setUserAddress(await signer.getAddress());
      const votingContract = new ethers.Contract(import.meta.env.VITE_CONTRACT_ADDRESS, cABI.abi, signer);
      setContract(votingContract);
    } catch (error) {
      showMessage('Error:Failed to connect to Ethereum network', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const fetchElections = async () => {
    try {
      const { data } = await axiosInstance.get('/voter/dashboard');
      setElections(data.electionData);
      setUserAddress(data.voterAddress);
    } catch (error) {
      showMessage('Error: Failed to fetch elections', error);
    }
  };

  const fetchCandidates = (election) => {
    setSelectedElection(election);
    setCandidates(election.candidates);
  };

  const castVote = async (electionId, candidateIndex) => {
    if (!contract) return showMessage('error', 'Please connect your MetaMask wallet');
    try {
      setLoading(true);
      const tx = await contract.castVote(electionId, candidateIndex);
      await tx.wait();
      showMessage('success', 'Your vote has been recorded on the blockchain');
      fetchElections();
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</div>
        )}
        <h1 className="text-2xl font-bold mb-6">Voter Dashboard</h1>
        <div className="mb-8 text-center bg-gray-50 p-4 rounded-lg">
          <button className="px-4 py-2 border border-black text-black bg-white rounded-lg mb-4" onClick={connectWallet}>
            {userAddress ? userAddress : 'Connect Wallet'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold p-4 border-b">Active Elections</h2>
            <div className="p-4 space-y-4">
              {elections.map(election => (
                <button key={election.election_id} className="w-full text-left px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => fetchCandidates(election)}>{election.election_name}</button>
              ))}
            </div>
          </div>
          {selectedElection && (
            <div className="bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-semibold p-4 border-b">{selectedElection.election_name} - Candidates</h2>
              <div className="p-4 space-y-4">
                {candidates.map((candidate, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <p className="font-medium">{candidate.candidate_name}</p>
                    <p className="text-sm text-gray-500">{candidate.party_affiliation}</p>
                    <p className="text-xs text-gray-500">Address: {candidate.candidate_address}</p>
                    <button className={`mt-2 px-4 py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`} disabled={loading} onClick={() => castVote(selectedElection.election_id, index)}>{loading ? 'Processing...' : 'Vote'}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VoterDashboard;
