import { useState } from "react";
import { DateRange } from "react-date-range";
import { Search, MapPin, Calendar, Users, X } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function SearchBar({ onSearch }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [guests, setGuests] = useState(1);
  const [range, setRange] = useState([
    { startDate: new Date(), endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), key: "selection" },
  ]);

  const handleSearch = () => {
    if (!searchText.trim()) {
      alert("Please enter a location");
      return;
    }
    onSearch({
      location: searchText.trim(),
      startDate: range[0].startDate,
      endDate: range[0].endDate,
      guests,
    });
    setShowCalendar(false);
    setShowGuests(false);
  };

  const formatDateRange = () => {
    const start = range[0].startDate;
    const end = range[0].endDate;
    if (start.toDateString() === end.toDateString()) return "Add dates";
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  return (
    <div className="w-full flex justify-center">
      {/* Desktop Layout (lg and up) */}
      <div className="hidden lg:flex relative flex-row items-center w-full max-w-4xl bg-white border border-gray-200 shadow-lg rounded-full py-3 px-6 hover:shadow-xl transition duration-300 gap-0">
        
        {/* Location Input */}
        <div className="flex-1 px-4 border-r border-gray-200 flex items-center gap-3">
          <MapPin size={18} className="text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Where</p>
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search destinations"
              className="w-full text-sm text-gray-900 outline-none bg-transparent placeholder-gray-400 border-0"
            />
          </div>
        </div>

        {/* Date Input */}
        <div
          className="flex-1 px-4 border-r border-gray-200 cursor-pointer flex items-center gap-3"
          onClick={() => {
            setShowCalendar(!showCalendar);
            setShowGuests(false);
          }}
        >
          <Calendar size={18} className="text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">When</p>
            <p className="text-sm text-gray-900 truncate">{formatDateRange()}</p>
          </div>
        </div>

        {/* Guests Input */}
        <div
          className="flex-1 px-4 cursor-pointer flex items-center gap-3"
          onClick={() => {
            setShowGuests(!showGuests);
            setShowCalendar(false);
          }}
        >
          <Users size={18} className="text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Who</p>
            <p className="text-sm text-gray-900">{guests} guest{guests !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="ml-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-3 flex items-center justify-center shadow-md hover:shadow-lg transition"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Date Picker Popup */}
        {showCalendar && (
          <div className="absolute top-full left-0 mt-3 bg-white rounded-3xl shadow-2xl z-50 p-4 w-auto">
            <DateRange
              ranges={range}
              onChange={(item) => setRange([item.selection])}
              moveRangeOnFirstSelection={false}
              rangeColors={["#FF385C"]}
              minDate={new Date()}
            />
          </div>
        )}

        {/* Guests Popup */}
        {showGuests && (
          <div className="absolute top-full right-0 mt-3 bg-white rounded-3xl shadow-2xl p-6 w-72 z-50">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Guests</h3>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-lg font-semibold hover:border-gray-500 transition"
                  >
                    −
                  </button>
                  <span className="text-lg font-semibold text-gray-900">{guests}</span>
                  <button
                    onClick={() => setGuests(Math.min(16, guests + 1))}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-lg font-semibold hover:border-gray-500 transition"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">Infants are free</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile & Tablet Layout (below lg) - COMPACT */}
      <div className="lg:hidden w-full bg-white rounded-lg border border-gray-200 p-2 space-y-2">
        
        {/* Location - Full Width */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-2 border border-gray-200 w-full">
          <MapPin size={14} className="text-gray-400 flex-shrink-0" />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Where to?"
            className="flex-1 text-xs text-gray-900 outline-none bg-transparent placeholder-gray-400 border-0"
          />
          {searchText && (
            <button
              onClick={() => setSearchText("")}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Date & Guests Row - Smaller */}
        <div className="flex gap-2">
          {/* Date */}
          <button
            className="flex-1 flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-2 border border-gray-200 cursor-pointer hover:border-gray-300 transition"
            onClick={() => {
              setShowCalendar(!showCalendar);
              setShowGuests(false);
            }}
          >
            <Calendar size={13} className="text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs text-gray-900 truncate">{formatDateRange()}</p>
            </div>
          </button>

          {/* Guests */}
          <button
            className="flex-1 flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-2 border border-gray-200 cursor-pointer hover:border-gray-300 transition"
            onClick={() => {
              setShowGuests(!showGuests);
              setShowCalendar(false);
            }}
          >
            <Users size={13} className="text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs text-gray-900">{guests}G</p>
            </div>
          </button>
        </div>

        {/* Search Button - Full Width but Compact */}
        <button
          onClick={handleSearch}
          className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg p-2 flex items-center justify-center gap-2 transition font-semibold text-xs"
        >
          <Search size={14} />
          Search
        </button>

        {/* Date Picker Popup */}
        {showCalendar && (
          <div className="bg-white rounded-lg shadow-2xl z-50 p-2 w-full overflow-x-auto">
            <DateRange
              ranges={range}
              onChange={(item) => setRange([item.selection])}
              moveRangeOnFirstSelection={false}
              rangeColors={["#FF385C"]}
              minDate={new Date()}
            />
          </div>
        )}

        {/* Guests Popup */}
        {showGuests && (
          <div className="bg-white rounded-lg shadow-2xl p-3 w-full z-50">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 text-sm">Guests</h3>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center font-semibold hover:border-gray-500 transition text-sm"
                  >
                    −
                  </button>
                  <span className="font-semibold text-gray-900 text-sm">{guests}</span>
                  <button
                    onClick={() => setGuests(Math.min(16, guests + 1))}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center font-semibold hover:border-gray-500 transition text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">Infants are free</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}