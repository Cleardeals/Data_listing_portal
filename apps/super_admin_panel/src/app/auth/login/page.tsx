"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const checkUserRights = (phone: string, otp: string) => {
    // Placeholder: Replace with real rights check logic
    // For now, deny access if phone ends with '0'
    return !phone.endsWith('0');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md flex flex-col items-center">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">Login here</h2>
        <p className="text-center text-black font-semibold mb-6">Welcome back you've<br />been missed!</p>
        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="w-full mb-4 px-4 py-3 border border-blue-400 rounded-md bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
        />
        <input
          type="text"
          placeholder="OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          className="w-full mb-4 px-4 py-3 border-none rounded-md bg-blue-50 focus:outline-none text-black"
        />
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-md shadow-md font-semibold text-lg hover:bg-blue-700 transition mb-4"
          onClick={() => {
            if (checkUserRights(phone, otp)) {
              router.push("/dashboard");
            } else {
              router.push("/auth/denied");
            }
          }}
        >
          Sign in
        </button>
        <button
          className="text-black text-sm mt-2 hover:underline"
          onClick={() => router.push("/auth/signup")}
        >
          Create new account
        </button>
      </div>
    </div>
  );
} 