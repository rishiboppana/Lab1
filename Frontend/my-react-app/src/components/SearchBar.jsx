import { useState } from "react";
import DatePicker from "react-datepicker";

export default function SearchBar({ onSearch }) {
  const [location, setLocation] = useState("");
  const [startDate, setStart] = useState(null);
  const [endDate, setEnd] = useState(null);
  const [guests, setGuests] = useState(1);

  function submit(e) {
    e.preventDefault();
    onSearch({
      location: location || undefined,
      startDate: startDate ? startDate.toISOString().slice(0, 10) : undefined,
      endDate: endDate ? endDate.toISOString().slice(0, 10) : undefined,
      guests,
    });
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-center gap-2 border rounded-full px-4 py-2 shadow-sm hover:shadow-md transition bg-white"
      style={{ boxShadow: "var(--air-shadow)" }}
    >
      <input
        className="flex-1 outline-none px-2 py-1 text-sm"
        placeholder="Where to?"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <DatePicker
        selected={startDate}
        onChange={setStart}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        placeholderText="Check in"
        className="border-none outline-none text-sm"
      />
      <DatePicker
        selected={endDate}
        onChange={setEnd}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        placeholderText="Check out"
        className="border-none outline-none text-sm"
      />
      <input
        type="number"
        min={1}
        value={guests}
        onChange={(e) => setGuests(+e.target.value)}
        className="w-16 border-none outline-none text-sm"
      />
      <button className="bg-airbnb-red text-white px-4 py-2 rounded-full text-sm font-semibold">
        Search
      </button>
    </form>
  );
}
