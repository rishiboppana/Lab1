export default function CategoryBar() {
  const cats = [
    "Trending","Beachfront","Cabins","Tiny homes","City","Amazing views",
    "Countryside","National parks","Camping","Lakefront","Pools"
  ];

  return (
    <div className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-6 overflow-x-auto py-3 no-scrollbar">
          {cats.map((c) => (
            <button
              key={c}
              className="flex flex-col items-center text-xs text-airbnb-gray hover:text-black"
            >
              <div className="w-6 h-6 bg-airbnb-light rounded-full grid place-items-center mb-1">
                🏖️
              </div>
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
