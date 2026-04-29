const CategoryChip = ({ category, isActive, onClick }) => (
  <button
    id={`category-chip-${category.id}`}
    onClick={() => onClick(category.id)}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
      isActive
        ? 'chip-active border-orange-500 text-white shadow-lg'
        : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50'
    }`}
  >
    <span className="text-base">{category.emoji}</span>
    <span>{category.label}</span>
  </button>
);

export default CategoryChip;
