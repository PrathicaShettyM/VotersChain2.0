import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
    const validatePassword = (password) => password.length >= 6;

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) return setError("Invalid email format");
        if (!validatePassword(password)) return setError("Password must be at least 6 characters");

        try {
            const res = await axios.post("http://localhost:5018/api/v2/auth/login", { email, password });
            localStorage.setItem("user", JSON.stringify(res.data));
            res.data.role === "admin" ? navigate("/admin/dashboard") : navigate("/voter/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login Failed");
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-gray-100 rounded shadow-md">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    className="border p-2 w-full"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    className="border p-2 w-full mt-2"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="bg-blue-500 text-white w-full py-2 mt-4">Login</button>
            </form>
        </div>
    );
}
