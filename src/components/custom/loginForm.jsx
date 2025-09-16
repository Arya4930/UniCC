"use client";
import Image from "next/image";
import { RefreshCcw } from "lucide-react";

export default function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  captcha,
  setCaptcha,
  captchaImage,
  message,
  handleLogin,
}) {
  const isLoading = message === "Logging in and fetching data...";

  return (
    <div className="flex flex-col items-center justify-center flex-grow w-full px-4">
      <form
        onSubmit={handleLogin}
        className="bg-gray-700 rounded-2xl p-8 w-full max-w-md space-y-5 text-white"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        <input
          className="w-full border border-gray-500 bg-gray-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />

        <input
          className="w-full border border-gray-500 bg-gray-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        {captchaImage && !isLoading && (
          <>
            <div className="flex justify-center bg-gray-800 rounded-lg p-2">
              <Image
                src={captchaImage}
                alt="Captcha"
                className="object-contain"
                width={200}
                height={64}
                unoptimized
              />
            </div>

            <input
              className="w-full border border-gray-500 bg-gray-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              placeholder="Enter Captcha"
            />

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
