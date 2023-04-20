import { ReactNode, createContext, useState } from 'react';

type SignInCredential = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SignInCredential): Promise<void>;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function signIn(credentials: SignInCredential) {
    console.log(credentials);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}
