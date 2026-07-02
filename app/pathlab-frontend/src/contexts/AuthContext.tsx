import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/api';

interface UserProfile {
  email: string;
  userType: 'PATIENT' | 'USER';
}


interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, userType?: 'PATIENT' | 'USER') => Promise<{ token: string; userType: 'PATIENT' | 'USER' }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  try {
    const storedToken = sessionStorage.getItem('auth_token');
    const storedUser = sessionStorage.getItem('auth_user');

    if (storedToken) setToken(storedToken);

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);

        // Ensure it matches UserProfile shape
        if (parsed.email && parsed.userType) {
          setUser(parsed as UserProfile);
        } else {
          sessionStorage.removeItem('auth_user');
        }
      } catch {
        sessionStorage.removeItem('auth_user');
      }
    }
  } finally {
    setIsLoading(false);
  }
}, []);


const login = async (email: string, password: string, userType?: 'PATIENT' | 'USER') => {
  const { token } = await authApi.login({ email, password, userType });

  setToken(token);

  // decode JWT to get userType (PATIENT/USER)
  const payload = JSON.parse(atob(token.split('.')[1])); // JWT payload
  const loggedInType: 'PATIENT' | 'USER' = payload.userType;

  const minimalProfile: UserProfile = { email, userType: loggedInType };
  setUser(minimalProfile);

  try {
    sessionStorage.setItem('auth_token', token);
    sessionStorage.setItem('auth_user', JSON.stringify(minimalProfile));
  } catch {}

  return { token, userType: loggedInType };
};



  const logout = async () => {
    try { await authApi.logout(); } catch {}
    setToken(null);
    setUser(null);
    try {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
    } catch {}
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};