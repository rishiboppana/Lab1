import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function PropertyDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [booking, setBooking] = useState({ start_date: "", end_date: "", guests: 1 });

  useEffect(() => {
    api.get(`/properties/${id}`).then((res) => setData(res.data));
  }, [id]);

  async function bookNow() {
    await api.post("/bookings", { property_id: +id, ...booking });
    alert("Booking requested!");
  }
  async function toggleFavorite() {
  await api.post("/favorites/toggle", { property_id: +id });
  alert("Favorite toggled!");
    }


  if (!data) return null;
  const p = data.property;

  return (
    <div className="max-w-3xl mx-auto">
      <img
        src={p.images?.length ? `http://localhost:4000${JSON.parse(p.images)[0]}` : "https://placehold.co/800x400"}
        alt={p.title}
        className="rounded-xl mb-4"
      />
      <h1 className="text-2xl font-bold mb-1">{p.title}</h1>
      <p className="text-gray-600 mb-3">{p.location}</p>
      <p>{p.description}</p>
      <p className="text-lg font-semibold mt-3">${p.price_per_night} / night</p>

      <div className="mt-4 flex gap-2">
        <input type="date" onChange={(e) => setBooking({ ...booking, start_date: e.target.value })} className="border p-2" />
        <input type="date" onChange={(e) => setBooking({ ...booking, end_date: e.target.value })} className="border p-2" />
        <input
          type="number"
          placeholder="Guests"
          onChange={(e) => setBooking({ ...booking, guests: +e.target.value })}
          className="border p-2 w-20"
        />
        <button onClick={bookNow} className="bg-red-500 text-white px-3 py-2 rounded">
          Book
        </button>
          <button onClick={toggleFavorite} className="border px-3 py-2 rounded">
  ❤️ Favorite
</button>

      </div>
    </div>
  );
}
