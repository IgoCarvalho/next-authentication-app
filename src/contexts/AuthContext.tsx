import { useRouter } from 'next/router';
import { ReactNode, createContext, useEffect, useState } from 'react';

import { SignInCredentials, authService } from '@/services/authService';
import { User } from '@/types/user';

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user?: User;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  const router = useRouter();

  useEffect(() => {
    silentSignIn();
  }, []);

  async function silentSignIn() {
    try {
      const response = await authService.silentSignIn();

      setUser(response);
    } catch (error) {
      console.log('silentSignIn-error:', error);
      authService.clearTokens();
      router.push('/');
    }
  }

  async function signIn(credentials: SignInCredentials) {
    try {
      const response = await authService.signIn(credentials);

      const { permissions, roles, refreshToken, token } = response;

      authService.persistTokens(token, refreshToken);
      authService.setAuthHeader(token);

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
