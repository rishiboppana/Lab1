import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import toast from "react-hot-toast";

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [newImages, setNewImages] = useState([]);

  // ✅ Load property data
  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get(`/properties/${id}`);
        const p = data.property;

        // Parse amenities & images safely
        let amenities = "";
        try {
          amenities = JSON.parse(p.amenities || "[]").join(", ");
        } catch {
          amenities = p.amenities || "";
        }

        setForm({
          ...p,
          amenities,
        });
      } catch (err) {
        console.error("Error fetching property:", err);
        toast.error("Failed to load property details");
      }
    }
    fetchData();
  }, [id]);

  if (!form)
    return (
      <div className="text-center py-10 text-gray-500">
        Loading property details...
      </div>
    );

  // ✅ Update form fields
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // ✅ Submit updates
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = new FormData();
        // Object.entries(form).forEach(([key, value]) => {
        //   data.append(key, value ?? "");
        // });
          data.append('title', form.title || '');
          data.append('type', form.type || '');
          data.append('location', form.location || '');
          data.append('description', form.description || '');
          data.append('price_per_night', form.price_per_night || '');
          data.append('bedrooms', form.bedrooms || '');
          data.append('bathrooms', form.bathrooms || '');
          data.append('amenities', form.amenities || '');
        if (newImages.length > 0 ) {
          newImages.forEach((f) => data.append("images", f));
        }

      await api.put(`/properties/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Property updated successfully!");
      navigate("/owner");
    } catch (err) {
      console.error("Error updating property:", err);
      toast.error("Failed to update property");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
      <h1 className="text-2xl font-semibold mb-6">Edit Property</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={form.title || ""}
          onChange={handleChange}
          placeholder="Title"
          className="border rounded w-full p-2"
        />

        <div className="grid sm:grid-cols-2 gap-3">
          <input
            name="location"
            value={form.location || ""}
            onChange={handleChange}
            placeholder="Location"
            className="border rounded p-2"
          />
          <input
            name="type"
            value={form.type || ""}
            onChange={handleChange}
            placeholder="Type (Apartment, Cabin, etc)"
            className="border rounded p-2"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <input
            name="price_per_night"
            type="number"
            value={form.price_per_night || ""}
            onChange={handleChange}
            placeholder="Price per night"
            className="border rounded p-2"
          />
          <input
            name="bedrooms"
            type="number"
            value={form.bedrooms || ""}
            onChange={handleChange}
            placeholder="Bedrooms"
            className="border rounded p-2"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <input
            name="bathrooms"
            type="number"
            value={form.bathrooms || ""}
            onChange={handleChange}
            placeholder="Bathrooms"
            className="border rounded p-2"
          />
          <input
            name="amenities"
            value={form.amenities || ""}
            onChange={handleChange}
            placeholder="Amenities (comma separated)"
            className="border rounded p-2"
          />
        </div>

        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          placeholder="Description"
          rows={4}
          className="border rounded w-full p-2"
        />

        <div>
          <label className="block mb-1 font-medium text-sm">
            Upload new images (optional)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setNewImages(Array.from(e.target.files))}
            className="border rounded p-2 w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-airbnb-red text-white rounded-full py-2 px-6 hover:bg-[#E31C5F] transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
