import { AxiosInstance } from 'axios';
import { deleteCookie, setCookie } from 'cookies-next';

import { REFRESH_TOKEN_KEY, TOKEN_KEY } from '@/constants/cookies';
import { User } from '@/types/user';
import { CookieContext, setupAPIClient } from './api';
import { api } from './apiClient';

export type SignInCredentials = {
  email: string;
  password: string;
};

type SignInResponse = {
  token: string;
  refreshToken: string;
} & Omit<User, 'email'>;

export function setupAuthService(api: AxiosInstance, ctx?: CookieContext) {
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

  async function refreshToken(token: string) {
    const response = await api.post<SignInResponse>('/refresh', {
      refreshToken: token,
    });

    return response.data;
  }

  function persistTokens(token: string, refreshToken: string) {
    setCookie(TOKEN_KEY, token, {
      ...ctx,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    setCookie(REFRESH_TOKEN_KEY, refreshToken, {
      ...ctx,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
  }

  function clearTokens() {
    deleteCookie(TOKEN_KEY, { ...ctx });
    deleteCookie(REFRESH_TOKEN_KEY, { ...ctx });
  }

  return {
    signIn,
    silentSignIn,
    setAuthHeader,
    refreshToken,
    persistTokens,
    clearTokens,
  };
}

export const setupServerAuthService = (ctx: CookieContext) => {
  const api = setupAPIClient(ctx);
  return setupAuthService(api, ctx);
};

export const authService = setupAuthService(api);
