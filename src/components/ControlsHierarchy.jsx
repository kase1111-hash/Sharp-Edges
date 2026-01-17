import { memo } from 'react';
import { Ban, RefreshCw, Wrench, ClipboardList, HardHat } from 'lucide-react';
import { CONTROL_HIERARCHY } from '../utils/constants';

const CONTROL_ICONS = {
  elimination: Ban,
  substitution: RefreshCw,
  engineering: Wrench,
  administrative: ClipboardList,
  ppe: HardHat,
};

const CONTROL_COLORS = {
  elimination: 'bg-red-100 text-red-700 border-red-200',
  substitution: 'bg-orange-100 text-orange-700 border-orange-200',
  engineering: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  administrative: 'bg-blue-100 text-blue-700 border-blue-200',
  ppe: 'bg-green-100 text-green-700 border-green-200',
};

const ControlsHierarchy = memo(function ControlsHierarchy({ controls }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Controls are listed from most effective (elimination) to least effective (PPE).
        Always prioritize higher-level controls when possible.
      </p>

      {CONTROL_HIERARCHY.map((tier) => {
        const items = controls[tier.key] || [];
        if (items.length === 0) return null;

        const Icon = CONTROL_ICONS[tier.key];
        const colorClass = CONTROL_COLORS[tier.key];

        return (
          <div key={tier.key} className={`p-4 rounded-lg border ${colorClass}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-5 h-5" />
              <h4 className="font-medium">
                {tier.priority}. {tier.label}
              </h4>
              <span className="text-xs opacity-75">({tier.description})</span>
            </div>
            <ul className="space-y-1 ml-7">
              {items.map((item, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
});

export default ControlsHierarchy;
