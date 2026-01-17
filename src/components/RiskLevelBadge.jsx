import { RISK_LEVELS } from '../utils/constants';

export default function RiskLevelBadge({ level, score }) {
  const config = RISK_LEVELS[level] || RISK_LEVELS.moderate;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.lightBg}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${config.bgColor}`} />
      <span className={`font-semibold ${config.color}`}>
        {config.label} Risk
      </span>
      {score && (
        <span className={`text-sm ${config.color} opacity-75`}>
          (Score: {score})
        </span>
      )}
    </div>
  );
}
