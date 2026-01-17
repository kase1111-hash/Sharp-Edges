import { SEVERITY_LABELS, LIKELIHOOD_LABELS } from '../utils/constants';

function getCellColor(severity, likelihood) {
  const score = severity * likelihood;
  if (score <= 4) return 'bg-green-500';
  if (score <= 9) return 'bg-yellow-500';
  if (score <= 16) return 'bg-orange-500';
  return 'bg-red-500';
}

export default function RiskMatrix({ severity, likelihood }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[400px]">
        {/* Y-axis label */}
        <div className="flex">
          <div className="w-24 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-500 -rotate-90 whitespace-nowrap">
              SEVERITY
            </span>
          </div>
          <div className="flex-1">
            {/* Matrix grid */}
            <div className="grid grid-cols-5 gap-1">
              {/* Render from severity 5 (top) to 1 (bottom) */}
              {[5, 4, 3, 2, 1].map((sev) => (
                [1, 2, 3, 4, 5].map((lik) => {
                  const isSelected = sev === severity && lik === likelihood;
                  const score = sev * lik;
                  return (
                    <div
                      key={`${sev}-${lik}`}
                      className={`
                        aspect-square flex items-center justify-center rounded text-xs font-medium text-white
                        ${getCellColor(sev, lik)}
                        ${isSelected ? 'ring-2 ring-offset-2 ring-gray-900' : 'opacity-60'}
                      `}
                      title={`Severity: ${sev}, Likelihood: ${lik}, Score: ${score}`}
                    >
                      {score}
                    </div>
                  );
                })
              ))}
            </div>

            {/* X-axis label */}
            <div className="text-center mt-2">
              <span className="text-xs font-medium text-gray-500">LIKELIHOOD</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500" />
            <span className="text-gray-600">Low (1-4)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-gray-600">Moderate (5-9)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-gray-600">High (10-16)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500" />
            <span className="text-gray-600">Critical (17-25)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
