import { Link } from "react-router-dom";

export default function DashboardCard({ title, link, action, className }) {
  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-md border border-gray-300 transition-all transform hover:scale-105 hover:shadow-xl ${className}`}
    >
      {link ? (
        <Link to={link} className="text-xl font-semibold text-blue-600 hover:underline">
          {title}
        </Link>
      ) : (
        <button onClick={action} className="text-xl font-semibold text-blue-600 hover:underline">
          {title}
        </button>
      )}
    </div>
  );
}
