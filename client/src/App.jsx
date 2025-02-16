import PropTypes from "prop-types";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AboutUs from "./pages/AboutUs";
import Elections from "./pages/Elections";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";
import AddVoter from "./pages/AddVoter";
import AddCandidate from "./pages/AddCandidate";
import AddElection from "./pages/AddElection";
import ViewVoters from "./pages/ViewVoters";
import ViewCandidates from "./pages/ViewCandidates";
import ViewElections from "./pages/ViewElection"
import ElectionCandidates from "./pages/ElectionCandidates";


const PrivateRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  return user && user.role === role ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/elections" element={<Elections />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
        <Route path="#" element={<Forbidden />} />

        {/* Fix: Ensure admin dashboard route is protected */}
        <Route path="/admin/dashboard" element={<PrivateRoute role="admin">
            <AdminDashboard />
        </PrivateRoute>} />
        <Route path="/admin/register-voter" element={<PrivateRoute role="admin">
          <AddVoter />
        </PrivateRoute>} />
        <Route path="/admin/register-candidate" element={<PrivateRoute role="admin">
          <AddCandidate />
        </PrivateRoute>} />
        <Route path="/admin/register-election" element={<PrivateRoute role="admin">
          <AddElection />
        </PrivateRoute>} />

        <Route path="/admin/view-voters" element={<PrivateRoute role="admin">
          <ViewVoters />
        </PrivateRoute>} />
        <Route path="/admin/view-candidates" element={<PrivateRoute role="admin">
          <ViewCandidates />
        </PrivateRoute>} />
        <Route path="/admin/view-elections" element={<PrivateRoute role="admin">
          <ViewElections />
        </PrivateRoute>} />
        
        <Route path="/admin/register-candidate-to-election" element={<PrivateRoute role="admin">
          <ElectionCandidates />
        </PrivateRoute>} />
      
      </Routes>
    </BrowserRouter>
  );
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  role: PropTypes.string.isRequired,
};

export default App;
