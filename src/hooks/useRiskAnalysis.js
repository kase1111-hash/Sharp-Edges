import { useState, useCallback } from 'react';
import { analyzeTask } from '../services/api';

/**
 * Custom hook for managing risk analysis state and API calls
 *
 * @returns {Object} Hook state and methods
 * @property {Object|null} assessment - The parsed assessment result
 * @property {boolean} loading - Whether an analysis is in progress
 * @property {string|null} error - Error message if analysis failed
 * @property {Function} analyze - Function to trigger analysis
 * @property {Function} reset - Function to clear results
 * @property {Function} clearError - Function to clear error state
 */
export function useRiskAnalysis() {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Analyze a task and update state with results
   */
  const analyze = useCallback(async (task, expertise, environment) => {
    // Validate inputs
    if (!task?.trim()) {
      setError('Please provide a task description');
      return;
    }

    setLoading(true);
    setError(null);
    setAssessment(null);

    try {
      const result = await analyzeTask(task, expertise, environment);
      setAssessment(result);
    } catch (err) {
      // Provide user-friendly error messages
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (err.message.includes('API key not configured')) {
        errorMessage = 'API key not configured. Please check your environment setup.';
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (err.message.includes('401') || err.message.includes('authentication')) {
        errorMessage = 'Authentication failed. Please check your API key.';
      } else if (err.message.includes('429') || err.message.includes('rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (err.message.includes('500') || err.message.includes('server')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.message.includes('parse') || err.message.includes('JSON')) {
        errorMessage = 'Could not parse the response. Please try again.';
      } else if (err.message.includes('Missing required field')) {
        errorMessage = 'Received incomplete response. Please try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('Risk analysis error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset all state to initial values
   */
  const reset = useCallback(() => {
    setAssessment(null);
    setLoading(false);
    setError(null);
  }, []);

  /**
   * Clear just the error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    assessment,
    loading,
    error,
    analyze,
    reset,
    clearError,
  };
}

export default useRiskAnalysis;
