import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);

  async function fetchBookings() {
    const { data } = await api.get("/bookings");
    setBookings(data.bookings);
  }

  async function updateStatus(id, status) {
    await api.patch(`/bookings/${id}/status`, { status });
    fetchBookings();
  }

  useEffect(() => { fetchBookings(); }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
      {bookings.map(b => (
        <div key={b.id} className="border rounded p-3 mb-2 flex justify-between">
          <div>
            <p className="font-semibold">{b.title}</p>
            <p>{b.start_date} → {b.end_date}</p>
            <p>Status: <b>{b.status}</b></p>
          </div>
          {b.status === "PENDING" && (
            <div className="flex gap-2">
              <button className="border px-2" onClick={() => updateStatus(b.id, "ACCEPTED")}>Accept</button>
              <button className="border px-2" onClick={() => updateStatus(b.id, "CANCELLED")}>Cancel</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
