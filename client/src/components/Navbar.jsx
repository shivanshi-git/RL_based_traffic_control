import { Link } from "react-router-dom"

const Navbar = () => {
  return (
    <div className="flex justify-between items-center px-10 py-6">

      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-5 h-2 bg-blue-600 rounded"></div>
          <div className="w-5 h-2 bg-blue-600 rounded"></div>
          <div className="w-5 h-2 bg-blue-600 rounded"></div>
        </div>
        <span className="text-xl font-semibold text-gray-700">
          auth
        </span>
      </div>

      {/* Login Button */}
      <Link to="/login">
        <button className="border border-gray-300 px-6 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition">
          Login →
        </button>
      </Link>

    </div>
  )
}

export default Navbar
