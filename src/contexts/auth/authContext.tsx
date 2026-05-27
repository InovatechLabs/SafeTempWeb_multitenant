import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../../services/auth/authService';
import type { User, Greenhouse } from '../../types/auth';
import { setAuthState, queryClient, setInMemoryToken, setActiveGreenhouseId } from '../../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeGreenhouse: Greenhouse | null;
  setActiveGreenhouse: (greenhouse: Greenhouse | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_GREENHOUSE_KEY = 'safetemp_active_gh';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [activeGreenhouse, setActiveGreenhouseState] = useState<Greenhouse | null>(null);

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['authUser'],
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  // Wrapper para atualizar o estado e persistir a preferência de tela do usuário
  const setActiveGreenhouse = (greenhouse: Greenhouse | null) => {
    setActiveGreenhouseState(greenhouse);

    setActiveGreenhouseId(greenhouse ? greenhouse.id : null);
    if (greenhouse) {
      localStorage.setItem(ACTIVE_GREENHOUSE_KEY, greenhouse.id.toString());
    } else {
      localStorage.removeItem(ACTIVE_GREENHOUSE_KEY);
    }
  };

  useEffect(() => {
    if (user) {
      setAuthState(true);
      
      if (user.greenhouses && user.greenhouses.length > 0) {
        const savedId = localStorage.getItem(ACTIVE_GREENHOUSE_KEY);
        const found = user.greenhouses.find((g: any) => g.id.toString() === savedId);
        
        if (found) {
          setActiveGreenhouseState(found);
        } else {
          setActiveGreenhouse(user.greenhouses[0]);
        }
      }
    } else {
      setAuthState(false);
      setActiveGreenhouse(null);
    }
  }, [user]);

  const logout = () => {
    setInMemoryToken(null);
    setAuthState(false);
    setActiveGreenhouse(null);
    authService.logout();
    queryClient.setQueryData(['authUser'], null); 
  };

  return (
    <AuthContext.Provider value={{
      user: user ?? null,
      isAuthenticated: !!user && !isError,
      isLoading,
      activeGreenhouse,
      setActiveGreenhouse,
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