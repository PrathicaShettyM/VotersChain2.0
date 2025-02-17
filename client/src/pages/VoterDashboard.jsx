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

  useEffect(() => { fetchElections(); }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return showMessage('error', 'Please install MetaMask');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setUserAddress(await signer.getAddress());
      setContract(new ethers.Contract(import.meta.env.VITE_CONTRACT_ADDRESS, cABI.abi, signer));
    } catch (error) { showMessage('error', 'Failed to connect'); }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const fetchElections = async () => {
    try {
      const { data } = await axiosInstance.get('/voter/dashboard');
      const correctedData = data.electionData.map(e => ({
        ...e,
        candidates: e.candidates.map(c => ({
          candidate_name: c.candidate_name,
          candidate_address: c.candidate_address,
          party_affiliation: c.party_affiliation
        }))
      }));
      setElections(correctedData);
      setUserAddress(data.voterAddress);
    } catch (error) { showMessage('error', 'Failed to fetch elections'); }
  };

  const fetchCandidates = (election) => { setSelectedElection(election); setCandidates(election.candidates); };

  const castVote = async (electionId, candidateIndex) => {
    if (!contract) return showMessage('error', 'Connect wallet');
    try {
      setLoading(true);
      const tx = await contract.castVote(electionId, candidateIndex);
      await tx.wait();
      showMessage('success', 'Vote recorded');
      fetchElections();
    } catch (error) { showMessage('error', error.message); } finally { setLoading(false); }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {message.text && (<div className={`mb-4 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</div>)}
        <h1 className="text-3xl font-bold mb-6">Voter Dashboard</h1>
        <div className="text-center bg-gray-50 p-4 rounded-lg mb-6">
          <button className="px-6 py-3 border border-black text-black bg-white rounded-lg text-lg" onClick={connectWallet}>{userAddress ? userAddress : 'Connect Wallet'}</button>
        </div>
        <div className="bg-white rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold p-4 border-b">Active Elections</h2>
          <div className="p-4 space-y-4">
            {elections.map(election => (
              <button key={election.election_id} className="w-full text-left px-4 py-3 text-lg border rounded-lg hover:bg-gray-50" onClick={() => fetchCandidates(election)}>{election.election_name}</button>
            ))}
          </div>
        </div>
        {selectedElection && (
          <div className="bg-white rounded-lg shadow-md mt-4">
            <h2 className="text-2xl font-semibold p-4 border-b">{selectedElection.election_name} - Candidates</h2>
            <div className="p-4 space-y-4">
              {candidates.map((candidate, index) => (
                <div key={index} className="p-4 border rounded-lg text-lg">
                  <p className="font-semibold">{candidate.candidate_name}</p>
                  <p className="text-gray-600">{candidate.party_affiliation}</p>
                  <p className="text-gray-500 text-sm">Address: {candidate.candidate_address}</p>
                  <button className={`mt-3 px-6 py-2 rounded-lg text-white text-lg ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`} disabled={loading} onClick={() => castVote(selectedElection.election_id, index)}>{loading ? 'Processing...' : 'Vote'}</button>
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
