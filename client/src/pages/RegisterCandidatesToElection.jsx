import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import Navbar from "../components/Navbar";

const RegisterCandidatesToElection = () => {
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  useEffect(() => {
    axiosInstance.get("/admin/register-candidates-to-election").then((res) => {
      setElections(res.data.elections);
      setCandidates(res.data.candidates);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedElection || selectedCandidates.length === 0) {
      alert("Please select an election and at least one candidate.");
      return;
    }

    try {
      await axiosInstance.post("/admin/register-candidates-to-election", {
        election_id: selectedElection,
        candidate_addresses: selectedCandidates,
      });
      alert("Candidates assigned successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to assign candidates.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center pt-20">
        <div className="w-full max-w-2xl mx-auto p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Register Candidates to Election</h2>
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg border-2 border-black">
            <div className="mb-6">
              <label className="block font-semibold mb-2">Choose Election:</label>
              <select
                value={selectedElection}
                onChange={(e) => setSelectedElection(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Election</option>
                {elections.map((e) => (
                  <option key={e.election_id} value={e.election_id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Select Candidates:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
                {candidates.map((candidate) => (
                  <label key={candidate.ethereumAddress} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      value={candidate.ethereumAddress}
                      onChange={(e) => {
                        const address = e.target.value;
                        setSelectedCandidates((prev) =>
                          prev.includes(address) ? prev.filter((c) => c !== address) : [...prev, address]
                        );
                      }}
                      className="w-5 h-5"
                    />
                    <span className="ml-2">{candidate.name} ({candidate.party})</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Assign Candidates
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterCandidatesToElection;