import { useEffect, useState } from "react";
import { api } from "../api/axios";
import toast from "react-hot-toast";

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

  useEffect(() => {
    api.get("/profile").then(({ data }) => setForm(data.profile || {}));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
      e.preventDefault();
      console.log("Saving profile:", form); // 👈 Add this line
      try {
        await api.put("/profile", form);
        toast.success("Profile updated");
      } catch {
        toast.error("Failed to save profile");
      }
    }

  async function uploadAvatar() {
    if (!avatarFile) return;
    const fd = new FormData();
    fd.append("avatar", avatarFile);
    const { data } = await api.post("/profile/avatar", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setForm(f => ({ ...f, avatar_url: data.avatar_url }));
    toast.success("Avatar uploaded");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Your Profile</h1>

      <form onSubmit={handleSave} className="space-y-3">
        <div className="flex gap-3">
          <input name="name" value={form.name||""}
                 onChange={handleChange} placeholder="Full name"
                 className="border rounded p-2 w-full" />
          <input name="email" value={form.email||""}
                 onChange={handleChange} placeholder="Email"
                 className="border rounded p-2 w-full" />
        </div>

        <input name="phone" value={form.phone||""}
               onChange={handleChange} placeholder="Phone"
               className="border rounded p-2 w-full" />

        <textarea name="about" value={form.about||""}
                  onChange={handleChange} placeholder="About me"
                  rows={3} className="border rounded p-2 w-full" />

        <div className="grid sm:grid-cols-2 gap-3">
          <input name="city" value={form.city||""}
                 onChange={handleChange} placeholder="City"
                 className="border rounded p-2" />

          <select name="country" value={form.country||"US"}
                  onChange={handleChange} className="border rounded p-2">
            {countries.map(c=>(
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        <input name="languages" value={form.languages||""}
               onChange={handleChange} placeholder="Languages (comma separated)"
               className="border rounded p-2 w-full" />

        <select name="gender" value={form.gender||""}
                onChange={handleChange} className="border rounded p-2 w-full">
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <button className="bg-airbnb-red text-white px-6 py-2 rounded-full">
          Save Profile
        </button>
      </form>

      <div className="border-t pt-3">
        <label className="block text-sm mb-1">Upload Avatar</label>
        <input type="file" onChange={e=>setAvatarFile(e.target.files[0])} />
        <button onClick={uploadAvatar}
                className="ml-3 bg-gray-800 text-white px-3 py-1 rounded">
          Upload
        </button>
        {form.avatar_url &&
          <img src={`http://localhost:4000${form.avatar_url}`}
               alt="avatar" className="mt-2 w-24 h-24 rounded-full object-cover" />}
      </div>
    </div>
  );
}
