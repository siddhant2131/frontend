// client/src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ isLoggedIn, username, onLogout }) => {
  // Return null if user is logged in (hide the navbar)
  if (isLoggedIn) {
    return null;
  }

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">LLM Chat App</span>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="ml-4 flex items-center md:ml-6">
            <Link
              to="/login"
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md mr-2 transition duration-300"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 rounded-md transition duration-300"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


