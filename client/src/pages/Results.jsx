import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import cABI from "../../artifacts/contracts/VotingSystem.sol/VotingSystem.json";
import Navbar from '../components/Navbar';

const Results = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contract, setContract] = useState(null);

  useEffect(() => {
    initializeContract();
  }, []);

  const initializeContract = async () => {
    try {
      // Using default provider for read-only operations
      const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
      const contractInstance = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS,
        cABI.abi,
        provider
      );
      setContract(contractInstance);
      await fetchElectionResults(contractInstance);
    } catch (error) {
      setError('Failed to initialize contract: ' + error.message);
      setLoading(false);
    }
  };

  const fetchElectionResults = async (contractInstance) => {
    try {
      // Get total number of elections
      const electionCount = await contractInstance.electionCount();
      const resultCount = await contractInstance.resultCount();
      
      const electionResults = [];
      
      // Fetch results for each election
      for (let i = 1; i <= electionCount; i++) {
        try {
          const electionDetails = await contractInstance.getElectionDetails(i);
          const candidateCount = electionDetails.candidateCount;
          
          const candidates = [];
          for (let j = 0; j < candidateCount; j++) {
            const candidateDetails = await contractInstance.getCandidateDetails(i, j);
            candidates.push({
              candidateAddress: candidateDetails.candidateAddress,
              partyAffiliation: candidateDetails.partyAffiliation,
              voteCount: candidateDetails.voteCount.toString()
            });
          }

          electionResults.push({
            electionId: i,
            electionName: electionDetails.electionName,
            isActive: electionDetails.isActive,
            totalVotes: electionDetails.totalVotes.toString(),
            candidates: candidates
          });
        } catch (error) {
          console.error(`Error fetching election ${i}:`, error);
        }
      }

      setElections(electionResults);
    } catch (error) {
      setError('Failed to fetch results: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-lg">Loading election results...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Election Results</h1>
        
        <div className="space-y-6">
          {elections.map((election) => (
            <div key={election.electionId} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">{election.electionName}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    election.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {election.isActive ? 'Active' : 'Closed'}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">
                  Total Votes Cast: {election.totalVotes}
                </p>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {election.candidates.map((candidate, index) => {
                    const votePercentage = election.totalVotes > 0
                      ? ((candidate.voteCount / election.totalVotes) * 100).toFixed(2)
                      : 0;

                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="font-medium">{candidate.candidateAddress}</div>
                        <div className="text-gray-600">{candidate.partyAffiliation}</div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${votePercentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-sm text-gray-600">
                              {candidate.voteCount} votes
                            </span>
                            <span className="text-sm text-gray-600">
                              {votePercentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Results;