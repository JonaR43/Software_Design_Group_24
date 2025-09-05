import { useState } from "react";

export default function signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-center text-xl font-semibold">Sign Up</h2>
        <form className="flex flex-col space-y-4">
          {/* <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            className="rounded border px-3 py-2"
            required
          /> */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            className="rounded border px-3 py-2"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            className="rounded border px-3 py-2"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            className="rounded border px-3 py-2"
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="rounded bg-green-500 py-2 text-white hover:bg-green-600"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
