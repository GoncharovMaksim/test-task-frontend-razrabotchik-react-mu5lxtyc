import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GreenApiCredentials, InstanceState } from '../types/greenApi';
import { getStateInstance, GreenApiError } from '../services/greenApi';
import { storage } from '../services/storage';

interface AuthContextType {
  credentials: GreenApiCredentials | null;
  instanceState: InstanceState;
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
  login: (creds: GreenApiCredentials) => Promise<boolean>;
  logout: () => void;
  checkStatus: () => Promise<void>;
  setError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [credentials, setCredentials] = useState<GreenApiCredentials | null>(() =>
    storage.getCredentials()
  );
  const [instanceState, setInstanceState] = useState<InstanceState>('unknown');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatusWithCreds = useCallback(async (creds: GreenApiCredentials) => {
    if (!creds.idInstance || !creds.apiTokenInstance) {
      setInstanceState('unknown');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await getStateInstance(creds);
      setInstanceState(res.stateInstance || 'authorized');
    } catch (err: unknown) {
      setInstanceState('unknown');
      if (err instanceof GreenApiError) {
        setError(err.message);
      } else {
        setError('Не удалось проверить статус инстанса');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (credentials?.idInstance && credentials?.apiTokenInstance) {
      checkStatusWithCreds(credentials);
    }
  }, [credentials, checkStatusWithCreds]);

  const login = async (creds: GreenApiCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate connection to GREEN-API
      const res = await getStateInstance(creds);
      setInstanceState(res.stateInstance || 'authorized');

      setCredentials(creds);
      storage.saveCredentials(creds);
      return true;
    } catch (err: unknown) {
      if (err instanceof GreenApiError) {
        setError(err.message);
      } else {
        setError('Неверные учетные данные или ошибка соединения');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCredentials(null);
    setInstanceState('unknown');
    setError(null);
    storage.clearCredentials();
  };

  const checkStatus = async () => {
    if (credentials) {
      await checkStatusWithCreds(credentials);
    }
  };

  const isConfigured = Boolean(credentials?.idInstance && credentials?.apiTokenInstance);

  return (
    <AuthContext.Provider
      value={{
        credentials,
        instanceState,
        isConfigured,
        isLoading,
        error,
        login,
        logout,
        checkStatus,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
