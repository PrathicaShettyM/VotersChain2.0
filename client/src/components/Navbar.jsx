import { useState} from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login", { replace: true }); // Redirect to login page after logout
  };

  return (
    <nav className="bg-gradient-to-r from-cyan-900 to-blue-900 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-extrabold text-2xl tracking-wide">
          VotersChain2.0
        </div>

        <div className="hidden md:flex items-center space-x-8 text-white text-lg font-semibold">
          <Link to="/" className="hover:text-gray-300 transition">Home</Link>
          <Link to="/aboutus" className="hover:text-gray-300 transition">About Us</Link>
          <Link to="/elections" className="hover:text-gray-300 transition">Elections</Link>
          {user?.role === "admin" && (
            <Link to="/admin/dashboard" className="hover:text-gray-300 transition">Admin Dashboard</Link>
          )}
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-yellow-300 font-bold">{user.email} ({user.role})</span>
              <button onClick={handleLogout} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-r from-cyan-900 to-blue-900 text-white text-lg py-2">
          <Link to="/" className="block py-2 text-center hover:text-gray-300">Home</Link>
          <Link to="/aboutus" className="block py-2 text-center hover:text-gray-300">About Us</Link>
          <Link to="/elections" className="block py-2 text-center hover:text-gray-300">Elections</Link>
          {user?.role === "admin" && (
            <Link to="/admin/dashboard" className="block py-2 text-center hover:text-gray-300">Admin Dashboard</Link>
          )}
          {user ? (
            <>
              <span className="block text-center text-yellow-300 py-2">{user.email} ({user.role})</span>
              <button onClick={handleLogout} className="block w-full text-center py-2 bg-red-600 hover:bg-red-700">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="block text-center px-6 py-2 bg-green-600 hover:bg-green-700">
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
