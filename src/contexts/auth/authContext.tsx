import { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../../services/auth/authService';
import type { User } from '../../types/auth';
import { setAuthState, queryClient, setInMemoryToken } from '../../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
 

const { data: user, isLoading, isError } = useQuery({
    queryKey: ['authUser'],
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (user) {
      setAuthState(true);
    } else {
      setAuthState(false);
    }
  }, [user]);

  const logout = () => {
    setInMemoryToken(null);
    setAuthState(false);
    authService.logout();
    queryClient.setQueryData(['authUser'], null); 
  };

  return (
    <AuthContext.Provider value={{
      user: user ?? null,
      isAuthenticated: !!user && !isError,
      isLoading,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};