const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
    {/* Image skeleton */}
    <div className="skeleton h-48 w-full" />
    {/* Content */}
    <div className="p-4 space-y-3">
      <div className="skeleton h-4 w-3/4 rounded-full" />
      <div className="skeleton h-3 w-full rounded-full" />
      <div className="skeleton h-3 w-2/3 rounded-full" />
      <div className="flex items-center gap-2">
        <div className="skeleton h-3 w-16 rounded-full" />
        <div className="skeleton h-3 w-20 rounded-full" />
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="skeleton h-6 w-24 rounded-full" />
        <div className="skeleton h-8 w-28 rounded-xl" />
      </div>
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
