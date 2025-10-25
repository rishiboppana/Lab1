export default function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="rounded-2xl bg-gray-200 aspect-[4/3]"></div>
      <div className="h-3 bg-gray-200 rounded mt-3 w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded mt-2 w-1/2"></div>
    </div>
  );
}
