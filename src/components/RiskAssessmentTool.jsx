import { useState, useRef } from 'react';
import InputForm from './InputForm';
import ResultsDisplay from './ResultsDisplay';
import ErrorDisplay from './ErrorDisplay';
import ConfirmDialog from './ConfirmDialog';
import { useRiskAnalysis } from '../hooks/useRiskAnalysis';

export default function RiskAssessmentTool() {
  const { assessment, loading, error, analyze, reset, clearError } = useRiskAnalysis();
  const [lastInput, setLastInput] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [checkedItems, setCheckedItems] = useState(new Set());
  const resultsRef = useRef(null);

  const handleSubmit = async ({ taskDescription, expertiseLevel, environment }) => {
    // Store input for retry functionality
    setLastInput({ taskDescription, expertiseLevel, environment });

    await analyze(taskDescription, expertiseLevel, environment);

    // Scroll to results after a short delay to allow render
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleRetry = () => {
    if (lastInput) {
      clearError();
      analyze(lastInput.taskDescription, lastInput.expertiseLevel, lastInput.environment);
    }
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
    reset();
    setLastInput(null);
    setCheckedItems(new Set());
    setShowConfirmDialog(false);
    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelReset = () => {
    setShowConfirmDialog(false);
  };

  const handleCheckedChange = (itemIndex, isChecked) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(itemIndex);
      } else {
        newSet.delete(itemIndex);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <InputForm onSubmit={handleSubmit} loading={loading} />

        {/* Error Display */}
        {error && (
          <ErrorDisplay
            message={error}
            onRetry={lastInput ? handleRetry : undefined}
            onDismiss={clearError}
          />
        )}

        {/* Results */}
        {assessment && (
          <div ref={resultsRef}>
            <ResultsDisplay
              assessment={assessment}
              checkedItems={checkedItems}
              onCheckedChange={handleCheckedChange}
            />

            <button
              onClick={handleResetClick}
              className="w-full mt-6 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Start New Assessment
            </button>
          </div>
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
