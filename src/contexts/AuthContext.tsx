import { ReactNode, createContext, useState } from 'react';
import { useRouter } from 'next/router';

import { api } from '@/services/api';

type SignInCredential = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SignInCredential): Promise<void>;
  isAuthenticated: boolean;
  user?: User;
};

type AuthProviderProps = {
  children: ReactNode;
};

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  const router = useRouter();

  async function signIn(credentials: SignInCredential) {
    try {
      const response = await api.post<Omit<User, 'email'>>(
        'sessions',
        credentials
      );

      const { permissions, roles } = response.data;

      setUser({
        email: credentials.email,
        permissions,
        roles,
      });

      router.push('/dashboard');
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, user }}>
      {children}
    </AuthContext.Provider>
  );
}
