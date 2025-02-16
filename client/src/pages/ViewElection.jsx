import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import Navbar from "../components/Navbar";

function ViewElections() {
  const [elections, setElections] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/admin/view-elections");
        setElections(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching elections");
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="p-6 pt-20">
        <h1 className="text-4xl font-bold text-center mb-8 text-cyan-900 tracking-wide">
          📢 Election List
        </h1>
        {error ? (
          <p className="text-red-400 text-center text-lg">{error}</p>
        ) : (
          <div className="overflow-x-auto flex justify-center">
            <table className="w-full max-w-6xl mx-auto bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-cyan-900 text-white text-lg">
                  <th className="px-6 py-4 text-left">Election Name</th>
                  <th className="px-6 py-4 text-left">Description</th>
                  <th className="px-6 py-4 text-left">Start Date</th>
                  <th className="px-6 py-4 text-left">Duration (mins)</th>
                  <th className="px-6 py-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {elections.map((election, index) => (
                  <tr
                    key={election.id}
                    className={`hover:bg-gray-100 transition-all duration-300 ${
                      index % 2 === 0 ? "bg-white" : "bg-cyan-200"
                    }`}
                  >
                    <td className="border-b border-gray-600 px-6 py-4">{election.name}</td>
                    <td className="border-b border-gray-600 px-6 py-4">{election.description}</td>
                    <td className="border-b border-gray-600 px-6 py-4">{election.start_time}</td>
                    <td className="border-b border-gray-600 px-6 py-4">{election.duration_minutes} mins</td>
                    <td className={`border-b border-gray-600 px-6 py-4 font-semibold ${
                      election.status === "Ongoing" ? "text-green-500" : 
                      election.status === "Completed" ? "text-red-500" : "text-yellow-500"
                    }`}>
                      {election.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewElections;
