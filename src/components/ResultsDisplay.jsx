import {
  FileText,
  AlertTriangle,
  Activity,
  Shield,
  ClipboardCheck,
  Siren,
  Info,
  Leaf,
} from 'lucide-react';
import Section from './Section';
import RiskLevelBadge from './RiskLevelBadge';
import RiskMatrix from './RiskMatrix';
import HazardList from './HazardList';
import ControlsHierarchy from './ControlsHierarchy';
import Checklist from './Checklist';
import {
  calculateRiskScore,
  getSeverityLabel,
  getLikelihoodLabel,
} from '../utils/riskCalculations';

export default function ResultsDisplay({ assessment, checkedItems, onCheckedChange }) {
  const { riskAssessment } = assessment;
  const riskScore = calculateRiskScore(riskAssessment.severity, riskAssessment.likelihood);

  return (
    <div className="space-y-4 animate-fadeIn"
      style={{
        animation: 'fadeIn 0.4s ease-out'
      }}
    >
      {/* Header with Task Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Safety Assessment</h2>
            <p className="text-gray-600">{assessment.taskSummary}</p>
          </div>
          <RiskLevelBadge level={riskAssessment.overallLevel} score={riskScore} />
        </div>
      </div>

      {/* Parsed Context */}
      <Section title="Parsed Context" icon={FileText} defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Actions</h4>
            <div className="flex flex-wrap gap-1">
              {assessment.parsedContext.actions.map((action, i) => (
                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  {action}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Materials</h4>
            <div className="flex flex-wrap gap-1">
              {assessment.parsedContext.materials.map((material, i) => (
                <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                  {material}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tools</h4>
            <div className="flex flex-wrap gap-1">
              {assessment.parsedContext.tools.map((tool, i) => (
                <span key={i} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                  {tool}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Environment Factors</h4>
            <div className="flex flex-wrap gap-1">
              {assessment.parsedContext.environmentFactors.map((factor, i) => (
                <span key={i} className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded">
                  {factor}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Hazards */}
      <Section title={`Identified Hazards (${assessment.hazards.length})`} icon={AlertTriangle}>
        <HazardList hazards={assessment.hazards} />
      </Section>

      {/* Risk Assessment */}
      <Section title="Risk Assessment" icon={Activity}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <RiskMatrix
              severity={riskAssessment.severity}
              likelihood={riskAssessment.likelihood}
            />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Severity</div>
                <div className="text-2xl font-bold text-gray-900">{riskAssessment.severity}/5</div>
                <div className="text-sm text-gray-600 mt-1">{getSeverityLabel(riskAssessment.severity)}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Likelihood</div>
                <div className="text-2xl font-bold text-gray-900">{riskAssessment.likelihood}/5</div>
                <div className="text-sm text-gray-600 mt-1">{getLikelihoodLabel(riskAssessment.likelihood)}</div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Risk Score</h4>
                <span className="text-2xl font-bold text-gray-900">{riskScore}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    riskScore <= 4 ? 'bg-green-500' :
                    riskScore <= 9 ? 'bg-yellow-500' :
                    riskScore <= 16 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${(riskScore / 25) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Rationale</h4>
              <p className="text-sm text-gray-600">{riskAssessment.rationale}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Controls */}
      <Section title="Recommended Controls" icon={Shield}>
        <ControlsHierarchy controls={assessment.controls} />
      </Section>

      {/* Pre-Task Checklist */}
      <Section title="Pre-Task Checklist" icon={ClipboardCheck}>
        <Checklist
          items={assessment.preTaskChecklist}
          checkedItems={checkedItems}
          onCheckedChange={onCheckedChange}
        />
      </Section>

      {/* Emergency Actions */}
      <Section title="Emergency Actions" icon={Siren}>
        <ol className="space-y-2">
          {assessment.emergencyActions.map((action, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-700 text-sm font-medium flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-gray-700">{action}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* Ethical Note */}
      {assessment.ethicalNote && (
        <Section title="Ethical Considerations" icon={Leaf} defaultOpen={false}>
          <p className="text-gray-600">{assessment.ethicalNote}</p>
        </Section>
      )}

      {/* Additional Considerations */}
      {assessment.additionalConsiderations && (
        <Section title="Additional Considerations" icon={Info} defaultOpen={false}>
          <p className="text-gray-600">{assessment.additionalConsiderations}</p>
        </Section>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">Disclaimer</h4>
            <p className="text-sm text-amber-700 mt-1">
              This assessment is for informational purposes only and should not replace professional
              safety advice. Always consult qualified experts for high-risk activities and ensure
              compliance with local regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
