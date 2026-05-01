import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

export const useApi = <T>(apiFunc: (...args: any[]) => Promise<any>) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const request = useCallback(
    async (...args: any[]) => {
      try {
        setIsLoading(true);
        setError(null);
        setValidationErrors(null);
        const response = await apiFunc(...args);
        setData(response.data.data);
        return response.data.data;
      } catch (err: any) {
        const message = err.response?.data?.message || 'Something went wrong';
        const status = err.response?.status;
        
        setError(message);
        
        if (status === 400 || status === 422) {
          const errors = err.response?.data?.errors;
          if (errors) {
            setValidationErrors(errors);
          } else {
             // If it's 400 without specific fields, we might still show an alert or just rely on the component
             Alert.alert('Validation Error', message);
          }
        }
        
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunc]
  );

  return { data, error, validationErrors, isLoading, request };
};
