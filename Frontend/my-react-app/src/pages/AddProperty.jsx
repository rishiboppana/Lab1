import { useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AddProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    type: "Apartment",
    location: "",
    price_per_night: "",
    bedrooms: 1,
    bathrooms: 1,
    description: "",
    amenities: "",
    images: [],
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "images") v.forEach((f) => data.append("images", f));
        else data.append(k, v);
      });
      data.append("owner_id", user.id);

      await api.post("/properties", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Property added!");
      navigate("/owner");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add property");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
      <h1 className="text-2xl font-semibold mb-6">Add a New Property</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="border rounded w-full p-2"
          required
        />

        <div className="grid sm:grid-cols-2 gap-3">
          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
          <input
            name="type"
            placeholder="Type (Apartment, Cottage...)"
            value={form.type}
            onChange={handleChange}
            className="border rounded p-2"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <input
            name="price_per_night"
            type="number"
            placeholder="Price per night"
            value={form.price_per_night}
            onChange={handleChange}
            className="border rounded p-2"
            required
          />
          <input
            name="bedrooms"
            type="number"
            placeholder="Bedrooms"
            value={form.bedrooms}
            onChange={handleChange}
            className="border rounded p-2"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <input
            name="bathrooms"
            type="number"
            placeholder="Bathrooms"
            value={form.bathrooms}
            onChange={handleChange}
            className="border rounded p-2"
          />
          <input
            name="amenities"
            placeholder="Amenities (comma separated)"
            value={form.amenities}
            onChange={handleChange}
            className="border rounded p-2"
          />
        </div>

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border rounded w-full p-2"
          rows={4}
        />

        <div>
          <label className="block mb-1 font-medium text-sm">
            Upload Images (max 5)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) =>
              setForm({ ...form, images: Array.from(e.target.files) })
            }
            className="border rounded p-2 w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-airbnb-red text-white rounded-full py-2 px-6 hover:bg-[#E31C5F] transition"
        >
          Add Property
        </button>
      </form>
    </div>
  );
}
