import { useState } from "react";
import { api } from "../api/axios";

export default function PostProperty() {
  const [f, setF] = useState({
    title: "",
    type: "",
    location: "",
    price_per_night: "",
    description: "",
  });
  const [img, setImg] = useState(null);

  async function submit(e) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    if (img) fd.append("images", img);
    await api.post("/properties", fd, { headers: { "Content-Type": "multipart/form-data" } });
    alert("Property added!");
  }

  return (
    <form onSubmit={submit} className="max-w-md mx-auto space-y-3">
      <h1 className="text-2xl font-bold">Post Property</h1>
      <input className="border p-2 w-full" placeholder="Title" onChange={(e) => setF({ ...f, title: e.target.value })} />
      <input className="border p-2 w-full" placeholder="Type" onChange={(e) => setF({ ...f, type: e.target.value })} />
      <input className="border p-2 w-full" placeholder="Location" onChange={(e) => setF({ ...f, location: e.target.value })} />
      <input className="border p-2 w-full" placeholder="Price per night" onChange={(e) => setF({ ...f, price_per_night: e.target.value })} />
      <textarea className="border p-2 w-full" placeholder="Description" onChange={(e) => setF({ ...f, description: e.target.value })} />
      <input type="file" onChange={(e) => setImg(e.target.files[0])} />
      <button className="bg-red-500 text-white px-4 py-2 rounded">Publish</button>
    </form>
  );
}
