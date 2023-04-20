import { User } from '@/types/user';
import { api } from './api';

export type SignInCredentials = {
  email: string;
  password: string;
};

type SignInResponse = {
  token: string;
  refreshToken: string;
} & Omit<User, 'email'>;

async function signIn(credentials: SignInCredentials) {
  const response = await api.post<SignInResponse>('sessions', credentials);

  return response.data;
}

async function silentSignIn() {
  const response = await api.get<User>('/me');

  return response.data;
}

function setAuthHeader(token: string) {
  api.defaults.headers['Authorization'] = `Bearer ${token}`;
}

export const authService = {
  signIn,
  silentSignIn,
  setAuthHeader,
};
