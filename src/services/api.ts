import axios, { AxiosError } from 'axios';
import { getCookie } from 'cookies-next';
import { OptionsType } from 'cookies-next/lib/types';
import Router from 'next/router';

import { TOKEN_EXPIRED_CODE } from '@/constants/api';
import { REFRESH_TOKEN_KEY, TOKEN_KEY } from '@/constants/cookies';
import { isBrowser } from '@/utils/detectClient';
import { setupAuthService } from './authService';
import { AuthTokenError } from './errors/AuthTokenError';

type ErrorResponse = {
  error: boolean;
  code?: string;
  message: string;
};

type FailedRequest = {
  onSuccess: (toke: string) => void;
  onFailure: (error: unknown) => void;
};

export type CookieContext = Pick<OptionsType, 'req' | 'res'> | undefined;

let isRefreshing = false;
let failedRequestsQueue: FailedRequest[] = [];

export function setupAPIClient(ctx?: CookieContext) {
  const token = getCookie(TOKEN_KEY, { ...ctx });

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const authService = setupAuthService(api, ctx);

  api.interceptors.response.use(
    undefined,
    async (error: AxiosError<ErrorResponse>) => {
      if (!error.response) return Promise.reject(error);

      if (error.response.status === 401) {
        if (
          error.response.data &&
          error.response.data.code === TOKEN_EXPIRED_CODE
        ) {
          const refreshToken = getCookie(REFRESH_TOKEN_KEY, { ...ctx });
          const originalConfig = error.config;

          if (!isRefreshing) {
            isRefreshing = true;

            authService
              .refreshToken(String(refreshToken))
              .then((response) => {
                authService.persistTokens(
                  response.token,
                  response.refreshToken
                );
                authService.setAuthHeader(response.token);

                failedRequestsQueue.forEach((request) =>
                  request.onSuccess(response.token)
                );
              })
              .catch((err) => {
                failedRequestsQueue.forEach((request) =>
                  request.onFailure(err)
                );

                if (isBrowser()) {
                  authService.clearTokens();
                  Router.push('/');
                }
              })
              .finally(() => {
                isRefreshing = false;
                failedRequestsQueue = [];
              });
          }

          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              onSuccess: (token) => {
                if (originalConfig) {
                  originalConfig.headers['Authorization'] = `Bearer ${token}`;
                  resolve(api(originalConfig));
                }
              },
              onFailure: (err) => {
                reject(err);
              },
            });
          });
        } else {
          if (isBrowser()) {
            authService.clearTokens();
            Router.push('/');
          } else {
            return Promise.reject(new AuthTokenError());
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
}
