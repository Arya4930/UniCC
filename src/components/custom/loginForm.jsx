"use client";
import Image from "next/image";

export default function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  captcha,
  setCaptcha,
  captchaImage,
  message,
  handleLogin
}) {
  return (
    <div className="flex flex-col items-center justify-center flex-grow w-full">
      <form 
        onSubmit={handleLogin} 
        className="bg-gray-600 shadow-md rounded-xl p-6 w-full max-w-md space-y-4 text-white"
      >
        <h2 className="text-xl font-bold text-white">Login</h2>
        
        <input 
          className="w-full border p-2 rounded-lg"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        
        <input 
          className="w-full border p-2 rounded-lg"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        
        {captchaImage && message !== "Logging in and fetching data..." && (
          <>
            <Image 
              src={captchaImage} 
              alt="Captcha" 
              className="rounded-lg w-full h-16 object-contain"
              width={200}
              height={64}
              unoptimized
            />
            <input 
              className="w-full border p-2 rounded-lg"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              placeholder="Enter Captcha"
            />
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition hover:cursor-pointer"
            >
              Login
            </button>
          </>
        )}
        
        <p className="text-sm">{message}</p>
      </form>
    </div>
  );
}