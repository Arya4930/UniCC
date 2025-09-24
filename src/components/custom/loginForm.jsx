"use client";
import Image from "next/image";
import { RefreshCcw } from "lucide-react";

export default function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  captchaImage,
  message,
  handleFormSubmit,
}) {
  const isLoading = message === "Logging in and fetching data...";

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4 ">
      <form
        onSubmit={handleFormSubmit}
        className="bg-gray-800 rounded-2xl p-8 w-full max-w-md space-y-5 text-white"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        <input
          className="w-full border border-gray-500 bg-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />

        <input
          className="w-full border border-gray-500 bg-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        {captchaImage && !isLoading && (
          <>
            <button
              type="submit"
              className="w-full bg-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Login
            </button>
          </>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-3 text-sm text-gray-300">
            <RefreshCcw className="w-5 h-5 animate-spin" />
            <span>{message}</span>
          </div>
        )}

        {!isLoading && message && (
          <p className="text-sm text-center text-gray-300">{message}</p>
        )}
      </form>
    </div>
  );
}
