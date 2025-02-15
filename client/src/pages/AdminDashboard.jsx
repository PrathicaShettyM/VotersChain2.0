import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if(!userData || userData.role !== "admin")
            navigate("/login");
        setEmail(userData.email);
    }, []);

    return(
        <div className="p-6">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p>Welcome, {email}</p>
        </div>
    );
}