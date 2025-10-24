import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Bookings() {
  const [rows, setRows] = useState([]);
  const { user } = useAuth();

  async function load() {
    const { data } = await api.get("/bookings");
    setRows(data.bookings || []);
  }
  async function setStatus(id, status) {
    await api.patch(`/bookings/${id}/status`, { status });
    load();
  }
  useEffect(()=>{ load(); },[]);

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Bookings</h1>
      {rows.map(b => (
        <div key={b.id} className="border rounded p-3 flex justify-between items-center">
          <div>
            <div className="font-semibold">{b.title || `Property #${b.property_id}`}</div>
            <div className="text-sm text-gray-600">{b.location}</div>
            <div className="text-sm">{b.start_date} → {b.end_date} · guests {b.guests}</div>
            <div className="mt-1">Status: <b>{b.status}</b></div>
          </div>
          {user?.role === "owner" && b.status === "PENDING" && (
            <div className="flex gap-2">
              <button onClick={()=>setStatus(b.id,"ACCEPTED")} className="border px-3 py-1 rounded">Accept</button>
              <button onClick={()=>setStatus(b.id,"CANCELLED")} className="border px-3 py-1 rounded">Cancel</button>
            </div>
          )}
        </div>
      ))}
      {rows.length===0 && <div className="text-gray-600">No bookings yet.</div>}
    </div>
  );
}
