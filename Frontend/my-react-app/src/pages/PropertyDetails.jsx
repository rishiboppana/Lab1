import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/axios";
import FavoriteButton from "../components/FavoriteButton";
import DatePicker from "react-datepicker";

export default function PropertyDetails() {
  const { id } = useParams();
  const [payload, setPayload] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [guests, setGuests] = useState(1);

  useEffect(() => { api.get(`/properties/${id}`).then(r=>setPayload(r.data)); }, [id]);

  if (!payload) return null;
  const p = payload.property;
  let imgs = [];
  try { imgs = typeof p.images === "string" ? JSON.parse(p.images) : p.images || []; } catch {}
  const cover = imgs?.[0] ? `http://localhost:4000${imgs[0]}` : "https://placehold.co/1200x600";

  async function book() {
    if (!startDate || !endDate) return alert("Pick dates first.");
    await api.post("/bookings", {
      property_id: +id,
      start_date: startDate.toISOString().slice(0,10),
      end_date: endDate.toISOString().slice(0,10),
      guests
    });
    alert("Booking requested!");
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative">
        <img src={cover} alt={p.title} className="w-full h-80 object-cover rounded-xl" />
        <FavoriteButton propertyId={p.id} className="absolute top-3 right-4 text-white text-2xl" />
      </div>
      <div className="mt-4 flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-bold">{p.title}</h1>
          <div className="text-gray-600">{p.location}</div>
          <p className="mt-2">{p.description}</p>
          <div className="text-lg font-semibold mt-2">${p.price_per_night} / night</div>
        </div>
        <div className="w-full md:w-80 border rounded-xl p-4 space-y-2">
          <div className="font-semibold">Choose dates</div>
          <div className="flex gap-2">
            <DatePicker selected={startDate} onChange={setStartDate} selectsStart startDate={startDate} endDate={endDate} className="border p-2 rounded w-full" placeholderText="Check in"  showMonthYearDropdown/>
            <DatePicker selected={endDate} onChange={setEndDate} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} className="border p-2 rounded w-full" placeholderText="Check out"  showMonthYearDropdown/>
          </div>
          <div className="flex items-center gap-2">
            <input type="number" min={1} value={guests} onChange={e=>setGuests(+e.target.value)} className="border p-2 rounded w-24" />
            <span>guests</span>
          </div>
          <button onClick={book} className="bg-red-500 text-white w-full py-2 rounded">Request to book</button>
        </div>
      </div>
    </div>
  );
}
