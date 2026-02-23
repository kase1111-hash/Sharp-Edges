import { useState, useCallback, useRef } from 'react';
import { analyzeTask } from '../services/api';
import { logger } from '../utils/logger';

const ERROR_MESSAGES = {
  NO_API_KEY:  'API key not configured on the server. Please contact the administrator.',
  NETWORK:     'Unable to connect to the server. Please check your internet connection.',
  AUTH:        'Server authentication with the analysis service failed. Please contact the administrator.',
  RATE_LIMIT:  'Too many requests. Please wait a moment and try again.',
  SERVER:      'Server error. Please try again later.',
  PARSE:       'Could not parse the response. Please try again.',
  VALIDATION:  'Received incomplete response. Please try again.',
};

export function useRiskAnalysis() {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const analyze = useCallback(async (task, expertise, environment) => {
    if (!task?.trim()) {
      setError('Please provide a task description');
      return;
    }

    // Cancel any in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setAssessment(null);

    try {
      const result = await analyzeTask(task, expertise, environment, {
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        setAssessment(result);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;

      const errorMessage = (err.code && ERROR_MESSAGES[err.code])
        || err.message
        || 'An unexpected error occurred. Please try again.';

      if (!controller.signal.aborted) {
        setError(errorMessage);
      }
      logger.error('Risk analysis failed', { code: err.code, message: err.message, status: err.status });
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setAssessment(null);
    setLoading(false);
    setError(null);
  }, []);

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
