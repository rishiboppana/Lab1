import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/axios";
import DatePicker from "react-datepicker";

export default function PropertyDetails() {
  const { id } = useParams();
  const [payload, setPayload] = useState(null);
  const [startDate, setStart] = useState(null);
  const [endDate, setEnd] = useState(null);
  const [guests, setGuests] = useState(1);

  useEffect(() => { api.get(`/properties/${id}`).then(r=>setPayload(r.data)); }, [id]);
  if (!payload) return null;

  const p = payload.property;
  const imgs = safeImgs(p.images);
  const hero = imgs[0] ? `http://localhost:4000${imgs[0]}` : "https://placehold.co/1200x600";
  const thumbs = imgs.slice(1,5).map(u => `http://localhost:4000${u}`);

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
    <div className="max-w-6xl mx-auto px-4">
      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <img src={hero} className="md:col-span-2 row-span-2 h-80 w-full object-cover rounded-xl" />
        {thumbs.map((t,i)=>(
          <img key={i} src={t} className="h-39 w-full object-cover rounded-xl" />
        ))}
      </div>

      <div className="mt-6 flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{p.title}</h1>
          <div className="text-gray-600">{p.location}</div>
          <div className="mt-4 space-y-2">
            <div className="text-sm text-gray-700">Bedrooms: {p.bedrooms || 1} · Bathrooms: {p.bathrooms || 1}</div>
            <p>{p.description}</p>
          </div>
        </div>

        {/* Sticky booking card */}
        <aside className="w-full md:w-96">
          <div className="border rounded-2xl p-4 sticky top-24" style={{boxShadow:"var(--air-shadow)"}}>
            <div className="flex items-end justify-between">
              <div><span className="text-2xl font-semibold">${p.price_per_night}</span> <span className="text-gray-600">night</span></div>
              <div className="text-sm">⭐ 4.9 · 120 reviews</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <DatePicker selected={startDate} onChange={setStart} selectsStart startDate={startDate} endDate={endDate} placeholderText="Check in" className="border p-2 rounded"/>
              <DatePicker selected={endDate} onChange={setEnd} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} placeholderText="Check out" className="border p-2 rounded"/>
              <input type="number" min={1} value={guests} onChange={e=>setGuests(+e.target.value)} className="border p-2 rounded col-span-2" placeholder="Guests"/>
            </div>
            <button onClick={book} className="w-full bg-red-500 text-white py-3 rounded-xl mt-3">Request to book</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function safeImgs(images){
  try {
    if (Array.isArray(images)) return images;
    if (typeof images === "string") return JSON.parse(images || "[]");
    return [];
  } catch { return []; }
}
