import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthUser, authApi } from '../../services/auth';

export const CURRENT_USER_KEY = ['current-user'] as const;

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: ({ signal }) => authApi.getCurrentUser(signal),
    retry: false,
    refetchInterval: 60_000,
    refetchOnWindowFocus: 'always',
  });

  useEffect(() => {
    const onUnauthorized = () => {
      void client.cancelQueries();
      client.removeQueries({ predicate: (q) => q.queryKey[0] !== CURRENT_USER_KEY[0] });
      client.setQueryData(CURRENT_USER_KEY, null);
    };
    window.addEventListener('speedsight:unauthorized', onUnauthorized);
    return () => window.removeEventListener('speedsight:unauthorized', onUnauthorized);
  }, [client]);

  const login = async (data: { email: string; password: string }) => {
    const res = await authApi.login(data);
    client.setQueryData(CURRENT_USER_KEY, res.user);
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    const res = await authApi.register(data);
    client.setQueryData(CURRENT_USER_KEY, res.user);
  };

  const loginAsDemo = async () => {
    const res = await authApi.loginAsDemo();
    client.setQueryData(CURRENT_USER_KEY, res.user);
  };

  const logout = async () => {
    await authApi.logout();
    await client.cancelQueries();
    client.removeQueries({ predicate: (q) => q.queryKey[0] !== CURRENT_USER_KEY[0] });
    client.setQueryData(CURRENT_USER_KEY, null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: query.data ?? null,
        isLoading: query.isPending,
        error: query.error,
        retry: () => {
          void query.refetch();
        },
        login,
        register,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
