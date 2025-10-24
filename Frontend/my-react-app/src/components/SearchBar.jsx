import { useState } from "react";
import DatePicker from "react-datepicker";

export default function SearchBar({ onSearch }) {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [guests, setGuests] = useState(1);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  function submit(e){
    e.preventDefault();
    onSearch({
      location,
      guests: guests || undefined,
      startDate: startDate ? startDate.toISOString().slice(0,10) : undefined,
      endDate: endDate ? endDate.toISOString().slice(0,10) : undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined
    });
  }

  return (
    <form onSubmit={submit} className="w-full bg-white rounded-full border p-2 flex flex-wrap items-center gap-2 shadow-sm">
      <input
        className="px-3 py-2 rounded-full flex-1 min-w-[160px] outline-none"
        placeholder="Where to?"
        value={location}
        onChange={e=>setLocation(e.target.value)}
      />
      <DatePicker
        selected={startDate}
        onChange={setStartDate}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        placeholderText="Check in"
        className="px-3 py-2 rounded-full border"
      />
      <DatePicker
        selected={endDate}
        onChange={setEndDate}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        placeholderText="Check out"
        className="px-3 py-2 rounded-full border"
      />
      <input
        type="number"
        className="px-3 py-2 rounded-full border w-24"
        min={1}
        value={guests}
        onChange={e=>setGuests(+e.target.value)}
        placeholder="Guests"
      />
      <input type="number" className="px-3 py-2 rounded-full border w-24" placeholder="$ min"
        value={minPrice} onChange={e=>setMinPrice(e.target.value)} />
      <input type="number" className="px-3 py-2 rounded-full border w-24" placeholder="$ max"
        value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
      <button className="bg-red-500 text-white px-4 py-2 rounded-full">Search</button>
    </form>
  );
}
