import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
      const apiUri = import.meta.env.VITE_API_BASE_URL

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await axios.post(`${apiUri}/api/auth/login`, { email, password });
            const { token, user } = res.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-800 rounded shadow-md w-80">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Login</h2>
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-3 p-2 border rounded text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-3 p-2 border rounded text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 rounded transition-colors ${
                        loading
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    } text-white`}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;
