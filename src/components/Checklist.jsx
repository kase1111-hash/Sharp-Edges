import { Square, CheckSquare } from 'lucide-react';

export default function Checklist({ items, checkedItems, onCheckedChange }) {
  const toggleItem = (index) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    onCheckedChange(newChecked);
  };

  const completedCount = checkedItems.size;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
          {completedCount} / {totalCount} completed
        </span>
      </div>

      {/* Checklist items */}
      <ul className="space-y-2">
        {items.map((item, index) => {
          const isChecked = checkedItems.has(index);
          return (
            <li key={index}>
              <button
                onClick={() => toggleItem(index)}
                className={`
                  w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors
                  ${isChecked
                    ? 'bg-green-50 hover:bg-green-100'
                    : 'bg-gray-50 hover:bg-gray-100'
                  }
                `}
              >
                {isChecked ? (
                  <CheckSquare className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                <span className={`text-sm ${isChecked ? 'text-green-800 line-through' : 'text-gray-700'}`}>
                  {item}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
