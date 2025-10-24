import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);

  async function load() {
    const { data } = await api.get("/profile");
    setProfile(data.profile);
  }
  async function save() {
    await api.put("/profile", profile);
    setEdit(false);
    load();
  }
  useEffect(()=>{ load(); },[]);
  if (!profile) return null;

  return (
    <div className="max-w-lg mx-auto space-y-3">
      <h1 className="text-2xl font-bold">Profile</h1>
      <input className="border p-2 w-full" disabled={!edit} value={profile.name||""} onChange={e=>setProfile({...profile,name:e.target.value})}/>
      <input className="border p-2 w-full" disabled value={profile.email||""}/>
      <textarea className="border p-2 w-full" disabled={!edit} placeholder="About me" value={profile.about||""} onChange={e=>setProfile({...profile,about:e.target.value})}/>
      {!edit ? (
        <button className="bg-blue-500 text-white px-3 py-2 rounded" onClick={()=>setEdit(true)}>Edit</button>
      ) : (
        <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={save}>Save</button>
      )}
    </div>
  );
}
