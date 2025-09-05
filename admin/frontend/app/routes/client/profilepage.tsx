import { useState } from "react";

export default function profilepage() {
  const [formData, setFormData] = useState({
    location: "",
    skills: "",
    preferences: "",
    availability: "",
  });

  const [error, setError] = useState("");

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-center text-xl font-semibold">Complete Your Profile</h2>
        <form className="flex flex-col space-y-4">
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            className="rounded border px-3 py-2"
            required
          />

          <input
            type="text"
            name="skills"
            placeholder="Skills (e.g., JavaScript, Project Management)"
            value={formData.skills}
            className="rounded border px-3 py-2"
            required
          />

          <textarea
            name="preferences"
            placeholder="Preferences (e.g., remote work, preferred roles)"
            value={formData.preferences}
            className="rounded border px-3 py-2"
            rows={3}
          />

          <select
            name="availability"
            value={formData.availability}
            className="rounded border px-3 py-2"
            required
          >
            <option value="">Select Availability</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="weekends">Weekends</option>
            <option value="flexible">Flexible</option>
          </select>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="rounded bg-purple-500 py-2 text-white hover:bg-purple-600"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}
