import { useState, useMemo, memo } from 'react';
import {
  calculateRiskScore,
  getMatrixCellClass,
  getRiskLevel,
  getSeverityLabel,
  getLikelihoodLabel,
  RISK_LEVEL_INFO,
  SEVERITY_SCALE,
  LIKELIHOOD_SCALE,
} from '../utils/riskCalculations';

function RiskMatrix({ severity, likelihood }) {
  const [hoveredCell, setHoveredCell] = useState(null);

  // Memoize the current risk calculation
  const { currentScore, currentLevel } = useMemo(() => ({
    currentScore: calculateRiskScore(severity, likelihood),
    currentLevel: getRiskLevel(calculateRiskScore(severity, likelihood)),
  }), [severity, likelihood]);

  // Memoize the matrix data to avoid recalculating on every hover
  const matrixData = useMemo(() => {
    return [5, 4, 3, 2, 1].flatMap((sev) =>
      [1, 2, 3, 4, 5].map((lik) => {
        const score = calculateRiskScore(sev, lik);
        return {
          sev,
          lik,
          score,
          level: getRiskLevel(score),
          cellClass: getMatrixCellClass(sev, lik),
        };
      })
    );
  }, []);

  return (
    <div className="space-y-4" role="region" aria-label="Risk Assessment Matrix">
      {/* Matrix Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[420px]" aria-label={`Current risk: Severity ${severity} (${getSeverityLabel(severity)}), Likelihood ${likelihood} (${getLikelihoodLabel(likelihood)}), Score ${currentScore}, Level ${RISK_LEVEL_INFO[currentLevel].label}`}>
          <div className="flex">
            {/* Y-axis labels (Severity) */}
            <div className="flex flex-col pr-2">
              <div className="h-6" /> {/* Spacer for top row */}
              {[5, 4, 3, 2, 1].map((sev) => (
                <div
                  key={sev}
                  className="h-12 flex items-center justify-end pr-2"
                >
                  <div className="text-right">
                    <span className="text-xs font-medium text-gray-700">{sev}</span>
                    <span className="text-xs text-gray-400 ml-1 hidden sm:inline">
                      {getSeverityLabel(sev)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="h-6 flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-500 -rotate-90 origin-center whitespace-nowrap">
                  SEVERITY
                </span>
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="flex-1">
              {/* X-axis labels (Likelihood) */}
              <div className="grid grid-cols-5 gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((lik) => (
                  <div key={lik} className="h-6 flex flex-col items-center justify-end">
                    <span className="text-xs font-medium text-gray-700">{lik}</span>
                  </div>
                ))}
              </div>

              {/* Matrix cells */}
              <div className="grid grid-cols-5 gap-1" role="grid" aria-label="5x5 risk matrix">
                {matrixData.map(({ sev, lik, score, level, cellClass }) => {
                  const isSelected = sev === severity && lik === likelihood;
                  const isHovered = hoveredCell?.sev === sev && hoveredCell?.lik === lik;

                  return (
                    <div
                      key={`${sev}-${lik}`}
                      role="gridcell"
                      aria-selected={isSelected}
                      aria-label={`Severity ${sev}, Likelihood ${lik}, Score ${score}, ${RISK_LEVEL_INFO[level].label} risk${isSelected ? ' (current assessment)' : ''}`}
                      onMouseEnter={() => setHoveredCell({ sev, lik, score, level })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`
                        h-12 flex items-center justify-center rounded-md text-sm font-semibold text-white
                        cursor-pointer transition-all duration-150
                        ${cellClass}
                        ${isSelected
                          ? 'ring-2 ring-offset-2 ring-gray-900 scale-105 z-10'
                          : isHovered
                            ? 'opacity-100 scale-102'
                            : 'opacity-50 hover:opacity-80'
                        }
                      `}
                      title={`Severity: ${getSeverityLabel(sev)} (${sev}), Likelihood: ${getLikelihoodLabel(lik)} (${lik}), Score: ${score}`}
                    >
                      {score}
                    </div>
                  );
                })}
              </div>

              {/* X-axis title */}
              <div className="text-center mt-2">
                <span className="text-xs font-semibold text-gray-500">LIKELIHOOD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Info Panel */}
      {hoveredCell && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-500">Severity:</span>{' '}
              <span className="font-medium">{getSeverityLabel(hoveredCell.sev)} ({hoveredCell.sev})</span>
            </div>
            <div>
              <span className="text-gray-500">Likelihood:</span>{' '}
              <span className="font-medium">{getLikelihoodLabel(hoveredCell.lik)} ({hoveredCell.lik})</span>
            </div>
            <div>
              <span className="text-gray-500">Score:</span>{' '}
              <span className="font-bold">{hoveredCell.score}</span>
              <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                hoveredCell.level === 'low' ? 'bg-green-100 text-green-700' :
                hoveredCell.level === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                hoveredCell.level === 'high' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {RISK_LEVEL_INFO[hoveredCell.level].label}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 text-xs">
        {Object.entries(RISK_LEVEL_INFO).map(([key, info]) => (
          <div
            key={key}
            className={`flex items-center gap-1.5 px-2 py-1 rounded ${
              currentLevel === key ? 'bg-gray-100 ring-1 ring-gray-300' : ''
            }`}
          >
            <span className={`w-3 h-3 rounded ${
              key === 'low' ? 'bg-green-500' :
              key === 'moderate' ? 'bg-yellow-500' :
              key === 'high' ? 'bg-orange-500' :
              'bg-red-500'
            }`} />
            <span className="text-gray-600">
              {info.label} ({info.range})
            </span>
          </div>
        ))}
      </div>

      {/* Scale Reference (collapsible) */}
      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer hover:text-gray-700 font-medium">
          View scale definitions
        </summary>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">Severity Scale</h4>
            <ul className="space-y-0.5">
              {SEVERITY_SCALE.map((s) => (
                <li key={s.rating}>
                  <span className="font-medium">{s.rating}.</span> {s.label} - {s.description}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">Likelihood Scale</h4>
            <ul className="space-y-0.5">
              {LIKELIHOOD_SCALE.map((l) => (
                <li key={l.rating}>
                  <span className="font-medium">{l.rating}.</span> {l.label} - {l.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>
    </div>
  );
}

export default memo(RiskMatrix);
