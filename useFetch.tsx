import * as React from 'react';
import './style.css';

import { useEffect, useReducer } from 'react';

type Action =
  | { type: 'request' }
  | {
      type: 'success';
      results: Array<Record<string, unknown>> | Record<string, unknown>;
    }
  | { type: 'failure'; error: string };

type State = {
  data?: Array<Record<string, unknown>> | Record<string, unknown>;
  loading: boolean;
  error?: string;
};
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'request':
      return { loading: true };
    case 'success':
      return { loading: false, data: action.results };
    case 'failure':
      return { loading: false, error: action.error };
  }
}

interface FetchType {
  data: any;
  error?: Error;
  loading: boolean;
  fetch: (url?: string, options?: any) => void;
}
// fetch data from api, optionally using options
const useFetch = (url: string, options?: any): FetchType => {
  const [{ data, loading, error }, dispatch] = useReducer(reducer, {
    loading: false,
  });
  async function Asyncfetch(url: string, options: RequestInit = {}) {
    dispatch({ type: 'request' });
    try {
      const response = await fetch(url, options);
      if (response?.ok && response?.status !== 404) {
        const contentType = response.headers.get('content-type');
        const resData =
          contentType === contentType && contentType.includes('json')
            ? await response.json()
            : contentType.includes('text')
            ? await response.text()
            : await response.blob();
        dispatch(
          !!resData
            ? { type: 'success', results: resData }
            : { type: 'failure', error: 'No data available' }
        );
      } else {
        dispatch({ type: 'failure', error: 'No data available' });
      }
    } catch (error: any) {
      dispatch({
        type: 'failure',
        error: error?.message || 'No data available',
      });
    }
  }

  useEffect(() => {
    if (url) {
      Asyncfetch(url, options);
    }
  }, [url, options]);

  return {
    data: data,
    error: error && new Error(error),
    loading,
    fetch: Asyncfetch,
  };
};

export default useFetch;
