
import { useState } from "react";

export default function UserProfileForm() {
  const [form, setForm] = useState({
    age: "",
    gender: "",
    location: "",
    interests: "",
    values: "",
    relationship_goals: "",
    partner_preferences: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Object.values(form).some((val) => val.trim() === "")) {
      alert("Please fill out all fields before continuing.");
      return;
    }

    const response = await fetch("/api/matchmaker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const result = await response.json();
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-xl shadow">
      <input 
        name="age" 
        placeholder="e.g. 29" 
        onChange={handleChange} 
        className="w-full p-2 border rounded" 
      />
      <input 
        name="gender" 
        placeholder="e.g. Female, Non-Binary" 
        onChange={handleChange} 
        className="w-full p-2 border rounded" 
      />
      <input 
        name="location" 
        placeholder="e.g. St. Louis, MO" 
        onChange={handleChange} 
        className="w-full p-2 border rounded" 
      />
      <input 
        name="interests" 
        placeholder="e.g. Hiking, Music" 
        onChange={handleChange} 
        className="w-full p-2 border rounded" 
      />
      <input 
        name="values" 
        placeholder="e.g. Honesty, Ambition" 
        onChange={handleChange} 
        className="w-full p-2 border rounded" 
      />
      <input 
        name="relationship_goals" 
        placeholder="e.g. Long-term" 
        onChange={handleChange} 
        className="w-full p-2 border rounded" 
      />
      <input 
        name="partner_preferences" 
        placeholder="e.g. Men, ages 30–40, likes hiking" 
        onChange={handleChange} 
        className="w-full p-2 border rounded" 
      />
      <button 
        type="submit" 
        className="bg-pink-600 text-white p-2 rounded w-full hover:bg-pink-700"
      >
        Submit Profile
      </button>
    </form>
  );
}
