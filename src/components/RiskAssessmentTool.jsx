import { useState } from 'react';
import InputForm from './InputForm';
import ResultsDisplay from './ResultsDisplay';
import ConfirmDialog from './ConfirmDialog';
import { MOCK_ASSESSMENT } from '../utils/mockData';

export default function RiskAssessmentTool() {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSubmit = async ({ taskDescription, expertiseLevel, environment }) => {
    setLoading(true);
    setCheckedItems(new Set()); // Reset checklist when starting new assessment

    // Simulate API call delay for Phase 1
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Use mock data for Phase 1
    setAssessment(MOCK_ASSESSMENT);
    setLoading(false);
  };

  const handleResetClick = () => {
    // Show confirmation if checklist has progress
    if (checkedItems.size > 0) {
      setShowConfirmDialog(true);
    } else {
      handleReset();
    }
  };

  const handleReset = () => {
    setAssessment(null);
    setCheckedItems(new Set());
    setShowConfirmDialog(false);
  };

  const handleCancelReset = () => {
    setShowConfirmDialog(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <InputForm onSubmit={handleSubmit} loading={loading} />

        {assessment && (
          <>
            <ResultsDisplay
              assessment={assessment}
              checkedItems={checkedItems}
              onCheckedChange={setCheckedItems}
            />

            <button
              onClick={handleResetClick}
              className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Start New Assessment
            </button>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Discard Progress?"
        message="You have completed some items on the pre-task checklist. Starting a new assessment will discard this progress."
        onConfirm={handleReset}
        onCancel={handleCancelReset}
      />
    </div>
  );
}
