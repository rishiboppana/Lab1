import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function Profile() {
  const [profile, setProfile] = useState({});
  const [editing, setEditing] = useState(false);

  async function load() {
    const { data } = await api.get("/profile");
    setProfile(data.profile);
  }

  async function save() {
    await api.put("/profile", profile);
    setEditing(false);
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-lg mx-auto space-y-3">
      <h1 className="text-2xl font-bold mb-3">Profile</h1>
      <input className="border p-2 w-full" value={profile.name||""} onChange={e=>setProfile({...profile,name:e.target.value})} disabled={!editing}/>
      <input className="border p-2 w-full" value={profile.email||""} disabled/>
      <textarea className="border p-2 w-full" placeholder="About me" value={profile.about||""} onChange={e=>setProfile({...profile,about:e.target.value})} disabled={!editing}/>
      {editing ? (
        <button className="bg-green-500 text-white px-3 py-2 rounded" onClick={save}>Save</button>
      ) : (
        <button className="bg-blue-500 text-white px-3 py-2 rounded" onClick={()=>setEditing(true)}>Edit</button>
      )}
    </div>
  );
}
