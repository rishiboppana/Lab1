// src/components/SectionBlock.jsx
export default function SectionBlock({ title, children }) {
  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-airbnb-dark">
          {title}
        </h2>
        <button className="text-airbnb-red text-sm font-medium hover:underline">
          →
        </button>
      </div>
      {children}
    </section>
  );
}
