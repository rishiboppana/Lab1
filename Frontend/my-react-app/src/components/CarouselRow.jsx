import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export default function CarouselRow({ children }) {
  const ref = useRef();

  function scroll(dir) {
    if (!ref.current) return;
    const width = ref.current.clientWidth;
    ref.current.scrollBy({ left: dir === "left" ? -width : width, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-2 hidden sm:block hover:scale-110"
      >
        <ChevronLeft size={20} />
      </button>

      <div
        ref={ref}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar py-2"
      >
        {children}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-2 hidden sm:block hover:scale-110"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
