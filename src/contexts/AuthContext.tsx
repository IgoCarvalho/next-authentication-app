import { setCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import { ReactNode, createContext, useEffect, useState } from 'react';

import { REFRESH_TOKEN_KEY, TOKEN_KEY } from '@/constants/cookies';
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
      console.log(error);
    }
  }

  async function signIn(credentials: SignInCredentials) {
    try {
      const response = await authService.signIn(credentials);

      const { permissions, roles, refreshToken, token } = response;

      setCookie(TOKEN_KEY, token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      setCookie(REFRESH_TOKEN_KEY, refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      setUser({
        email: credentials.email,
        permissions,
        roles,
      });

      authService.setAuthHeader(token);

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
