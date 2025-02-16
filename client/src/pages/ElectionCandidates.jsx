// frontend/components/ElectionCandidates.js
import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import Navbar from '../components/Navbar';

export default function ElectionCandidates() {
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  useEffect(() => {
    axiosInstance.get('/admin/register-candidate-to-election')
      .then(response => {
        setElections(response.data.elections);
        setCandidates(response.data.candidates);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/admin/register-candidate-to-election', {
        election_id: selectedElection,
        candidate_addresses: selectedCandidates,
      });
      alert(response.data.message || 'Candidates assigned successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.response?.data?.message || 'Error occurred while assigning candidates.');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-md">
        <h2 className="text-xl font-bold mb-4">Register Candidates to Election</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Select Election:</label>
          <select value={selectedElection} onChange={(e) => setSelectedElection(e.target.value)} className="w-full p-2 border rounded">
            <option value="">-- Select Election --</option>
            {elections.map(e => <option key={e.election_id} value={e.election_id}>{e.name}</option>)}
          </select>

          <label className="block mt-4 mb-2">Select Candidates:</label>
          {candidates.map(c => (
            <div key={c.ethereumAddress} className="flex items-center mb-2">
              <input type="checkbox" value={c.ethereumAddress} onChange={(e) => {
                const { checked, value } = e.target;
                setSelectedCandidates(prev => checked ? [...prev, value] : prev.filter(v => v !== value));
              }} />
              <span className="ml-2">{c.name} ({c.party_affiliation})</span>
            </div>
          ))}

          <button type="submit" className="mt-4 w-full bg-blue-500 text-white p-2 rounded">Assign Candidates</button>
        </form>
      </div>
    </div>
  );
}
