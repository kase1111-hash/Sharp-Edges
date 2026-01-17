import {
  calculateRiskScore,
  getRiskLevel,
  getRiskTailwindClasses,
  RISK_LEVEL_INFO,
} from '../utils/riskCalculations';

export default function RiskLevelBadge({ level, score, severity, likelihood }) {
  // Calculate level and score if severity/likelihood provided
  const computedScore = score ?? (severity && likelihood ? calculateRiskScore(severity, likelihood) : null);
  const computedLevel = level ?? (computedScore ? getRiskLevel(computedScore) : 'moderate');

  const classes = getRiskTailwindClasses(computedLevel);
  const info = RISK_LEVEL_INFO[computedLevel];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${classes.bgLight}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${classes.bg}`} />
      <span className={`font-semibold ${classes.text}`}>
        {info.label} Risk
      </span>
      {computedScore && (
        <span className={`text-sm ${classes.text} opacity-75`}>
          (Score: {computedScore})
        </span>
      )}
    </div>
  );
}
