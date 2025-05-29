"use client"; // Ensure the component is treated as a Client Component

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter(); // Initialize useRouter

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if credentials match the static values
    if (username === "intrasoft" && password === "admin") {
      setIsLoggedIn(true); // Set logged-in state
      setError(""); // Clear any previous errors
    } else if (username === "form30" && password === "form30") {
      setError("");
      setIsLoggedIn(true);
    } else {
      setError("Invalid username or password");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false); // Log out the user
    setUsername(""); // Clear username field
    setPassword(""); // Clear password field
  };

  const handleViewSubmittedQuestionnaire = () => {
      router.push(`/submitted-questionnaire?user=${username}`); // Pass user in query
  };
  const handleViewQuestions = () => {
    router.push("/submitted-questions"); // Redirect to the new screen (page)
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col justify-center bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl w-full mx-auto bg-white p-10 rounded-xl shadow-lg">
          <h1 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
            Welcome to Your Dashboard
          </h1>
          <p className="text-lg text-center text-gray-600 mb-8">
            Choose an option below to proceed:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <button
              onClick={handleViewSubmittedQuestionnaire} // Use the handler to navigate
              className="w-full bg-blue-500 text-white py-4 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none transform transition-all duration-300 ease-in-out hover:scale-105"
            >
              View Submitted Questionnaire
            </button>
            {/* <button
              onClick={handleViewQuestions}
              className="w-full bg-green-500 text-white py-4 rounded-lg shadow-md hover:bg-green-600 focus:outline-none transform transition-all duration-300 ease-in-out hover:scale-105"
            >
              View Questions
            </button> */}
          </div>

          {/* <button
                        onClick={handleLogout}
                        className="mt-6 w-full bg-red-500 text-white py-4 rounded-lg shadow-md hover:bg-red-600 focus:outline-none transform transition-all duration-300 ease-in-out hover:scale-105"
                    >
                        Logout
                    </button> */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-r from-indigo-600 to-purple-600">
      <div className="max-w-md w-full mx-auto bg-white p-10 rounded-xl shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none transform transition-all duration-300 ease-in-out hover:scale-105"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
