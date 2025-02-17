import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import Navbar from "../components/Navbar";

const Elections = () => {
    const [electionDetails, setElectionDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchElectionDetails = async () => {
            try {
                const response = await axiosInstance.get("/elections");
                setElectionDetails(response.data.electionDetails);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch election details");
                setLoading(false);
                console.error("Error:", err);
            }
        };

        fetchElectionDetails();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-6">
                <h2 className="text-2xl font-bold mb-6">Election Details</h2>
                <div className="space-y-6">
                    {electionDetails.map((election) => (
                        <div 
                            key={election.election_id} 
                            className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-200"
                        >
                            <div className="mb-4">
                                <h3 className="text-xl font-semibold">
                                    Election: {election.election_name}
                                </h3>
                                <p className="text-gray-600">ID: {election.election_id}</p>
                            </div>
                            
                            <div>
                                <h4 className="text-lg font-semibold mb-2">Candidates:</h4>
                                <div className="grid gap-3">
                                    {election.candidates.map((candidate, index) => (
                                        <div 
                                            key={index}
                                            className="p-3 bg-gray-50 rounded-md"
                                        >
                                            <p className="font-medium">{candidate.name}</p>
                                            <p className="text-sm text-gray-600">
                                                Party: {candidate.party}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Address: {candidate.ethereumAddress}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
            </div>
        </div>
    );
};

export default Elections;