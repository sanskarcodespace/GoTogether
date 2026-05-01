import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

export const useApi = <T>(apiFunc: (...args: any[]) => Promise<any>) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const request = useCallback(
    async (...args: any[]) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiFunc(...args);
        setData(response.data.data);
        return response.data.data;
      } catch (err: any) {
        const message = err.response?.data?.message || 'Something went wrong';
        setError(message);
        Alert.alert('Error', message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunc]
  );

  return { data, error, isLoading, request };
};
