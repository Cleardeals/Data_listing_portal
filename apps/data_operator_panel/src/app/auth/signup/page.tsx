"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md flex flex-col items-center">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">Create Account</h2>
        <p className="text-center text-black mb-6">Join Project X.2 to buy the data</p>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full mb-4 px-4 py-3 border-none rounded-md bg-blue-50 focus:outline-none text-black"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="w-full mb-4 px-4 py-3 border-none rounded-md bg-blue-50 focus:outline-none text-black"
        />
        <input
          type="text"
          placeholder="OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          className="w-full mb-6 px-4 py-3 border-none rounded-md bg-blue-50 focus:outline-none text-black"
        />
        <button className="w-full bg-blue-600 text-white py-3 rounded-md shadow-md font-semibold text-lg hover:bg-blue-700 transition mb-4">Sign up</button>
        <button
          className="text-black text-sm mt-2 hover:underline"
          onClick={() => router.push("/auth/login")}
        >
          Already have an account
        </button>
      </div>
    </div>
  );
} 