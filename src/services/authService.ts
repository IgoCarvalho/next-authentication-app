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

export const authService = {
  signIn,
};
