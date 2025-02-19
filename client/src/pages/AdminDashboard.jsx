import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; // Import Navbar component
import Footer from "../components/Footer";
import DashboardCard from "../components/DashboardCard";

export default function AdminDashboard() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData || userData.role !== "admin") {
            navigate("/login");
            return;
        }
        setEmail(userData.email);
    }, [navigate]);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            <div className="flex flex-1 p-6 gap-6">
                {/* Sidebar (30%) */}
                <aside className="w-1/3 bg-gray-100 p-6 rounded-lg shadow-md space-y-6">
                    <h2 className="text-4xl font-bold mb-4 text-cyan-700">Admin Actions</h2>
                    <DashboardCard title="Add Voters" link="/admin/register-voter" description="Register new voters for the election." className="bg-blue-600 text-white hover:shadow-lg" />
                    <DashboardCard title="Add Candidates" link="/admin/register-candidate" description="Add candidates who will be running in the election." className="bg-blue-600 text-white hover:shadow-lg" />
                    <DashboardCard title="Set Election Details" link="/admin/register-election" description="Define the election schedule and rules." className="bg-blue-600 text-white hover:shadow-lg" />
                    <DashboardCard title="Register Candidates to Election" link="/admin/register-candidate-to-election" description="Ensure candidates' data is securely stored on the blockchain." className="bg-blue-600 text-white hover:shadow-lg" />
                </aside>

                {/* Main Content (70%) */}
                <main className="w-2/3 grid grid-cols-2 gap-6 h-full">
                    {/* Top Row (50% each) */}
                    <div className="bg-white shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105">
                        <h2 className="text-2xl font-bold mb-4 text-cyan-700">View Candidates</h2>
                        <p className="text-gray-600 text-[17px]">View the list of registered candidates and their details.</p>
                        <a href="/admin/view-candidates" className="text-blue-500 hover:underline text-[17px]">View Candidates</a>
                    </div>
                    <div className="bg-white shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105">
                        <h2 className="text-2xl font-bold mb-4 text-cyan-700">View Voters</h2>
                        <p className="text-gray-600 text-[17px]">Check the list of registered voters and their eligibility status.</p>
                        <a href="/admin/view-voters" className="text-blue-500 hover:underline text-[17px]">View Voters</a>
                    </div>

                    {/* Middle Row (Full Width - 70%) */}
                    <div className="col-span-2 bg-white shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105">
                        <h2 className="text-2xl font-bold mb-4 text-cyan-700">Election Details</h2>
                        <p className="text-gray-600 text-[17px]">Review the election timeline, rules, and associated regulations.</p>
                        <a href="/admin/view-elections" className="text-blue-500 hover:underline text-[17px]">View Election Details</a>
                    </div>

                    {/* Bottom Row (Full Width - 70%) */}
                    {/* <div className="col-span-2 bg-white shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105">
                        <h2 className="text-2xl font-bold mb-4 text-cyan-700">Election Results</h2>
                        <p className="text-gray-600 text-[17px]">Analyze election results, vote distribution, and overall statistics.</p>
                        <a href="/admin/results/12345" className="text-blue-500 hover:underline text-[17px]">View Results</a>
                    </div>
                    */}
                </main>
            </div>
            <Footer />
        </div>
    );
}