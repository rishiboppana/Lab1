import { useEffect, useState } from "react";
import { api } from "../api/axios";
import toast from "react-hot-toast";
import { User, Upload } from "lucide-react";

const countries = [
  { code: "US", name: "United States" },
  { code: "IN", name: "India" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
];

export default function Profile() {
  const [form, setForm] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    api.get("/profile").then(({ data }) => {
      setForm(data.profile || {});
      if (data.profile?.avatar_url) {
        setPreview(data.profile.avatar_url);
      }
    });
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAvatarSelect(e) {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    console.log("Saving profile:", form);
    try {
      await api.put("/profile", form);
      toast.success("Profile updated");
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Failed to save profile");
    }
  }

  async function uploadAvatar() {
    if (!avatarFile) {
      toast.error("Please select an image first");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", avatarFile);

      const { data } = await api.post("/profile/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update form with new avatar URL
      setForm(f => ({ ...f, avatar_url: data.avatar_url }));
      setPreview(data.avatar_url);
      setAvatarFile(null);
      toast.success("Avatar uploaded successfully!");
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error(err.response?.data?.error || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen py-6 sm:py-8 lg:py-12">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Your Profile</h1>
        <p className="text-gray-600 mb-8">Manage your account information</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Avatar Section */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900">Profile Picture</h2>

              {/* Avatar Display */}
              <div className="flex justify-center">
                {preview ? (
                  <img 
                    src={preview.startsWith("http") ? preview : `http://localhost:4000${preview}`}
                    alt="avatar" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-red-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                    <User size={48} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* File Input */}
              <div className="space-y-3">
                <label className="block">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100 cursor-pointer"
                  />
                </label>

                <button 
                  onClick={uploadAvatar}
                  disabled={!avatarFile || uploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg font-semibold transition"
                >
                  <Upload size={18} />
                  {uploading ? "Uploading..." : "Upload Photo"}
                </button>
              </div>

              <p className="text-xs text-gray-600 text-center">
                JPG, PNG or GIF (max. 5MB)
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="md:col-span-2">
            <form onSubmit={handleSave} className="bg-white rounded-xl shadow-lg p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>

              {/* Name & Email Row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
                  <input 
                    name="name" 
                    value={form.name || ""}
                    onChange={handleChange} 
                    placeholder="Your full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                  <input 
                    name="email" 
                    value={form.email || ""}
                    onChange={handleChange} 
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                <input 
                  name="phone" 
                  value={form.phone || ""}
                  onChange={handleChange} 
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* About */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">About Me</label>
                <textarea 
                  name="about" 
                  value={form.about || ""}
                  onChange={handleChange} 
                  placeholder="Tell us about yourself..."
                  rows={4} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              {/* Location */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">City</label>
                  <input 
                    name="city" 
                    value={form.city || ""}
                    onChange={handleChange} 
                    placeholder="Your city"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Country</label>
                  <select 
                    name="country" 
                    value={form.country || "US"}
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Languages</label>
                <input 
                  name="languages" 
                  value={form.languages || ""}
                  onChange={handleChange} 
                  placeholder="English, Spanish, French (comma separated)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Gender</label>
                <select 
                  name="gender" 
                  value={form.gender || ""}
                  onChange={handleChange} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition"
              >
                Save Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
