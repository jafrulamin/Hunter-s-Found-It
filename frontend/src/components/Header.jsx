import { useContext } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1150px] mx-auto h-full px-6 flex items-center justify-between">
        <div
          onClick={() => navigate("/")}
          className="text-2xl font-extrabold text-blue-600 cursor-pointer tracking-tight"
        >
          FoundIt
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/create-post")}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <span className="text-lg leading-none">+</span>
              <span className="hidden sm:inline">Create Post</span>
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="px-3 sm:px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium"
            >
              <span className="sm:hidden">👤</span>
              <span className="hidden sm:inline">Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium"
            >
              <span className="sm:hidden">⎋</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="px-3 sm:px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
