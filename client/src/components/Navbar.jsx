import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

const Navbar = () => {

  const navigate = useNavigate();

  const handleLogout = async () => {
    await API.post("/auth/logout");
    alert("Logged out");
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center px-10 py-6">

      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold text-gray-700">
          auth
        </span>
      </div>

      <div className="flex gap-4">
        <Link to="/login">
          <button className="border px-6 py-2 rounded-full">
            Login
          </button>
        </Link>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-full"
        >
          Logout
        </button>
      </div>

    </div>
  );
};

export default Navbar;