import { useState } from 'react';
import InputForm from './InputForm';
import ResultsDisplay from './ResultsDisplay';
import { MOCK_ASSESSMENT } from '../utils/mockData';

export default function RiskAssessmentTool() {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async ({ taskDescription, expertiseLevel, environment }) => {
    setLoading(true);

    // Simulate API call delay for Phase 1
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Use mock data for Phase 1
    setAssessment(MOCK_ASSESSMENT);
    setLoading(false);
  };

  const handleReset = () => {
    setAssessment(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <InputForm onSubmit={handleSubmit} loading={loading} />

        {assessment && (
          <>
            <ResultsDisplay assessment={assessment} />

            <button
              onClick={handleReset}
              className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Start New Assessment
            </button>
          </>
        )}
      </div>
    </div>
  );
}
