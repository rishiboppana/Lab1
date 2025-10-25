import { useState } from "react";
import { DateRange } from "react-date-range";
import { Search } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function SearchBar({ onSearch }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [guests, setGuests] = useState(1);
  const [range, setRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ]);

  const handleSearch = () => {
    onSearch({
      location: searchText,
      startDate: range[0].startDate,
      endDate: range[0].endDate,
      guests,
    });
  };

  return (
    <div className="w-full flex justify-center">
      <div
        className="relative flex items-center w-[720px] bg-white border border-gray-200 shadow-lg
                   rounded-full py-2 px-3 hover:shadow-xl transition duration-200"
      >
        {/* Where */}
        <div className="flex-1 px-4 border-r">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Where
          </p>
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search destinations"
            className="w-full text-sm text-gray-800 outline-none bg-transparent"
          />
        </div>

        {/* When */}
        <div
          className="flex-1 px-4 border-r cursor-pointer"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            When
          </p>
          <p className="text-sm text-gray-800">
            {showCalendar
              ? `${range[0].startDate.toLocaleDateString()} - ${range[0].endDate.toLocaleDateString()}`
              : "Add dates"}
          </p>
        </div>

        {/* Who */}
        <div
          className="flex-1 px-4 cursor-pointer"
          onClick={() => setShowGuests(!showGuests)}
        >
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Who
          </p>
          <p className="text-sm text-gray-800">{guests} guest(s)</p>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="absolute right-2 bg-[#FF385C] hover:bg-[#E31C5F] text-white rounded-full p-3 flex items-center justify-center shadow-md"
        >
          <Search size={18} />
        </button>

        {/* Date Picker Popup */}
        {showCalendar && (
          <div className="absolute top-[70px] left-0 bg-white rounded-2xl shadow-2xl z-50">
            <DateRange
              ranges={range}
              onChange={(item) => setRange([item.selection])}
              rangeColors={["#FF385C"]}
            />
          </div>
        )}

        {/* Guests Popup */}
        {showGuests && (
          <div className="absolute top-[70px] right-0 bg-white rounded-2xl shadow-2xl p-4 w-56 z-50">
            <p className="font-semibold mb-2">Guests</p>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setGuests(Math.max(1, guests - 1))}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-lg"
              >
                −
              </button>
              <span className="text-lg">{guests}</span>
              <button
                onClick={() => setGuests(guests + 1)}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-lg"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
