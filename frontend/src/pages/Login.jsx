import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
      >
        <h1 className="text-2xl font-bold text-center mb-4">Log in</h1>

        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <label className="block mb-3">
          <span className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

        <label className="block mb-4">
          <span className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="text-center mt-4">
          <Link to="/register" className="text-sm text-blue-600 hover:underline">
            Create an account
          </Link>
        </div>
      </form>
    </div>
  );
}
