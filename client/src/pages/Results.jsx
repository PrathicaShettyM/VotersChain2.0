import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import Navbar from "../components/Navbar";

const Results = () => {
  const [results, setResults] = useState([]);
  const [electionName, setElectionName] = useState("");
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    axiosInstance.get("/results")
      .then((res) => {
        if (res.data.length > 0) {
          setElectionName(res.data[0].electionName);
          setResults(res.data.flatMap(election => election.candidates.map(candidate => ({
            ...candidate,
            electionName: election.electionName
          }))));
          setWinner(res.data.flatMap(election => election.candidates).reduce((max, candidate) => (candidate.votesCount > max.votesCount ? candidate : max), res.data[0].candidates[0]));
        }
      })
      .catch((err) => console.error("Error fetching results:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      {winner && (
        <div className="bg-green-500 text-white text-center py-4 text-xl font-bold shadow-md">
          Winner: {winner.candidateName} ({winner.party})
        </div>
      )}
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">{electionName} - Results</h1>
        <div className="flex flex-col gap-6 items-center">
          {results.map((candidate, index) => (
            <div key={index} className="w-full max-w-md p-4 shadow-lg rounded-lg bg-white border border-gray-300 text-center">
              <h2 className="text-xl font-semibold">{candidate.candidateName}</h2>
              <p className="text-gray-600">Party: {candidate.party}</p>
              <p className="text-gray-600">Votes: {candidate.votesCount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;
