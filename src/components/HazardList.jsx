import { memo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { HAZARD_CATEGORIES } from '../utils/constants';

const HazardList = memo(function HazardList({ hazards }) {
  return (
    <div className="space-y-3">
      {hazards.map((hazard, index) => {
        const category = HAZARD_CATEGORIES[hazard.category] || {
          label: hazard.category,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        };

        return (
          <div
            key={index}
            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded ${category.bgColor}`}>
                <AlertTriangle className={`w-4 h-4 ${category.color}`} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${category.bgColor} ${category.color}`}>
                    {category.label}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900">{hazard.description}</h4>
                <p className="text-sm text-gray-600 mt-1">{hazard.mechanism}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default HazardList;
