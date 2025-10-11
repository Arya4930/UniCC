"use client";
import { RefreshCcw } from "lucide-react";

export default function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  message,
  handleFormSubmit,
}) {
  const isLoading = message === "Logging in and fetching data...";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 bg-gray-100 dark:bg-slate-900 midnight:bg-black transition-colors duration-300">
      {/* App name */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 midnight:text-gray-100 mb-8">
        Uni CC
      </h1>

      <form
        onSubmit={handleFormSubmit}
        className="bg-white dark:bg-slate-800 midnight:bg-[#0a0a0a] border border-gray-300 dark:border-gray-700 midnight:border-gray-800 rounded-2xl p-8 w-full max-w-md space-y-5 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 midnight:text-gray-100">
          Login
        </h2>

        <input
          className="w-full border border-gray-400 dark:border-gray-600 midnight:border-gray-700 bg-gray-50 dark:bg-slate-900 midnight:bg-black p-3 rounded-lg text-gray-900 dark:text-gray-100 midnight:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="VTOP Username"
        />

        <input
          className="w-full border border-gray-400 dark:border-gray-600 midnight:border-gray-700 bg-gray-50 dark:bg-slate-900 midnight:bg-black p-3 rounded-lg text-gray-900 dark:text-gray-100 midnight:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="VTOP Password"
        />

        {!isLoading && (
          <button
            type="submit"
            className="w-full bg-blue-600 py-3 rounded-lg font-semibold text-white hover:bg-blue-700 transition focus:ring-2 focus:ring-blue-400"
          >
            Login
          </button>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-300 midnight:text-gray-300">
            <RefreshCcw className="w-5 h-5 animate-spin" />
            <span>{message}</span>
          </div>
        )}

        {!isLoading && message && (
          <p className="text-sm text-center text-gray-600 dark:text-gray-300 midnight:text-gray-400">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
