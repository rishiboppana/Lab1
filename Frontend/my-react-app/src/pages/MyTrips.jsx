import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function MyTrips() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    api.get(`/bookings/user/${user.id}`).then((res) => {
      const data = res.data.bookings.map((b) => {
        try {
          b.images = typeof b.images === "string" ? JSON.parse(b.images) : b.images;
        } catch {}
        return b;
      });
      setBookings(data);
    });
  }, []);

  if (!bookings.length)
    return (
      <div className="text-center py-10 text-airbnb-gray">No trips yet.</div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
      <h1 className="text-2xl font-semibold mb-4">My Trips</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {bookings.map((b) => (
          <div key={b.id} className="border rounded-2xl overflow-hidden shadow-sm">
            <img
              src={
                b.images?.[0]?.startsWith("http")
                  ? b.images[0]
                  : `http://localhost:4000${b.images?.[0]}`
              }
              alt={b.title}
              className="aspect-[4/3] object-cover"
            />
            <div className="p-3">
              <h3 className="font-medium">{b.title}</h3>
              <p className="text-sm text-gray-500">{b.location}</p>
              <p className="text-sm mt-1">
                {b.check_in} → {b.check_out}
              </p>
              <p className="text-sm font-semibold mt-1">
                Total: ${b.total_price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
