import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import toast from "react-hot-toast";

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [imageAction, setImageAction] = useState("add");
  const [existingImages, setExistingImages] = useState([]); // ✅ Store actual image URLs

  // ✅ Load property data
  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get(`/properties/${id}`);
        const p = data.property;

        let amenities = "";
        try {
          amenities = JSON.parse(p.amenities || "[]").join(", ");
        } catch {
          amenities = p.amenities || "";
        }

        // ✅ Parse existing images properly
        let images = [];
        try {
          if (typeof p.images === 'string') {
            images = JSON.parse(p.images);
          } else if (Array.isArray(p.images)) {
            images = p.images;
          }
        } catch (err) {
          console.error("Failed to parse images:", err);
          images = [];
        }

        console.log("📸 Loaded existing images:", images);
        setExistingImages(images);

        setForm({
          title: p.title,
          type: p.type,
          location: p.location,
          description: p.description,
          price_per_night: p.price_per_night,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          amenities: amenities,
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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // ✅ Remove an existing image
  function removeExistingImage(index) {
    const updated = existingImages.filter((_, i) => i !== index);
    setExistingImages(updated);
    toast.success("Image removed (save to confirm)");
  }

  // ✅ Handle image selection with validation
  function handleImageChange(e) {
    const files = Array.from(e.target.files);

    if (imageAction === "add") {
      // Check if adding would exceed 5 total
      const totalCount = existingImages.length + files.length;
      if (totalCount > 5) {
        toast.error(`You can only have 5 images total. You have ${existingImages.length} existing images, so you can add ${5 - existingImages.length} more.`);
        e.target.value = ""; // Clear the input
        return;
      }
    } else {
      // Replacing: just check new images don't exceed 5
      if (files.length > 5) {
        toast.error("You can only upload up to 5 images at once.");
        e.target.value = ""; // Clear the input
        return;
      }
    }

    setNewImages(files);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // ✅ Calculate total images after update
    let totalAfterUpdate;
    if (imageAction === "replace") {
      totalAfterUpdate = newImages.length;
    } else {
      totalAfterUpdate = existingImages.length + newImages.length;
    }

    // ✅ Validate total image count
    if (totalAfterUpdate > 5) {
      toast.error(`Cannot have more than 5 images. Total would be ${totalAfterUpdate}.`);
      return;
    }

    if (totalAfterUpdate === 0) {
      toast.error("Property must have at least 1 image.");
      return;
    }

    try {
      const data = new FormData();

      data.append('title', form.title || '');
      data.append('type', form.type || '');
      data.append('location', form.location || '');
      data.append('description', form.description || '');
      data.append('price_per_night', form.price_per_night || '');
      data.append('bedrooms', form.bedrooms || '');
      data.append('bathrooms', form.bathrooms || '');
      data.append('amenities', form.amenities || '');

      // ✅ Send existing images (in case user removed some)
      data.append('existingImages', JSON.stringify(existingImages));

      if (newImages.length > 0) {
        data.append('imageAction', imageAction);
        newImages.forEach((f) => data.append("images", f));
      }

      await api.put(`/properties/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Property updated successfully!");
      navigate("/owner");
    } catch (err) {
      console.error("Error updating property:", err);
      toast.error(err.response?.data?.error || "Failed to update property");
    }
  }

  // ✅ Calculate how many more images can be added
  const maxNewImages = imageAction === "add" ? 5 - existingImages.length : 5;
  const totalImageCount = imageAction === "replace"
    ? newImages.length
    : existingImages.length + newImages.length;

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
          required
        />

        <div className="grid sm:grid-cols-2 gap-3">
          <input
            name="location"
            value={form.location || ""}
            onChange={handleChange}
            placeholder="Location"
            className="border rounded p-2"
            required
          />
          <input
            name="type"
            value={form.type || ""}
            onChange={handleChange}
            placeholder="Type (Apartment, Cabin, etc)"
            className="border rounded p-2"
            required
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
            required
            min="0"
          />
          <input
            name="bedrooms"
            type="number"
            value={form.bedrooms || ""}
            onChange={handleChange}
            placeholder="Bedrooms"
            className="border rounded p-2"
            required
            min="0"
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
            required
            min="0"
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
          required
        />

        <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
          <div className="flex justify-between items-center">
            <label className="font-medium text-sm">Property Images</label>
            <span className={`text-sm font-semibold ${totalImageCount > 5 ? 'text-red-600' : 'text-gray-600'}`}>
              {totalImageCount} / 5
            </span>
          </div>

          {/* ✅ Display existing images with remove option */}
          {existingImages.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Current Images:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {existingImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={`http://localhost:4000${img}`}
                      alt={`Property ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ Upload new images */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              {newImages.length > 0 ? "New Images Selected:" : "Upload New Images:"}
            </label>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="border rounded p-2 w-full bg-white"
              disabled={imageAction === "add" && existingImages.length >= 5}
            />

            {imageAction === "add" && existingImages.length >= 5 && (
              <p className="text-sm text-red-600 mt-2">
                ⚠️ You already have 5 images. Choose "Replace" to upload new ones or remove some existing images.
              </p>
            )}

            {newImages.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-600">
                  {newImages.length} new image(s) selected
                  {imageAction === "add" && (
                    <span className={`font-medium ${totalImageCount > 5 ? 'text-red-600' : 'text-blue-600'}`}>
                      {" "}(Total after save: {totalImageCount}/5)
                    </span>
                  )}
                </p>

                {/* ✅ Radio buttons for image action */}
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value="add"
                      checked={imageAction === "add"}
                      onChange={(e) => {
                        setImageAction(e.target.value);
                        setNewImages([]);
                      }}
                      className="w-4 h-4"
                      disabled={existingImages.length >= 5}
                    />
                    <span>
                      Add to existing images
                      {existingImages.length < 5 && (
                        <span className="text-gray-500 text-xs">
                          {" "}(max {maxNewImages} more)
                        </span>
                      )}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value="replace"
                      checked={imageAction === "replace"}
                      onChange={(e) => {
                        setImageAction(e.target.value);
                        setNewImages([]);
                      }}
                      className="w-4 h-4"
                    />
                    <span>Replace all existing images (max 5)</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="bg-airbnb-red text-white rounded-full py-2 px-6 hover:bg-[#E31C5F] transition"
          disabled={totalImageCount > 5 || totalImageCount === 0}
        >
          Save Changes
        </button>

        {totalImageCount > 5 && (
          <p className="text-red-600 text-sm">
            ⚠️ Cannot save: Maximum 5 images allowed
          </p>
        )}
        {totalImageCount === 0 && (
          <p className="text-red-600 text-sm">
            ⚠️ Cannot save: Property must have at least 1 image
          </p>
        )}
      </form>
    </div>
  );
}