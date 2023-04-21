import axios, { AxiosError } from 'axios';
import { getCookie } from 'cookies-next';

import { TOKEN_EXPIRED_CODE } from '@/constants/api';
import { REFRESH_TOKEN_KEY, TOKEN_KEY } from '@/constants/cookies';
import { authService } from './authService';

type ErrorResponse = {
  error: boolean;
  code?: string;
  message: string;
};

type FailedRequest = {
  onSuccess: (toke: string) => void;
  onFailure: (error: unknown) => void;
};

const token = getCookie(TOKEN_KEY);
let isRefreshing = false;
let failedRequestsQueue: FailedRequest[] = [];

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

api.interceptors.response.use(
  undefined,
  async (error: AxiosError<ErrorResponse>) => {
    if (!error.response) return Promise.reject(error);

    if (error.response.status === 401) {
      if (
        error.response.data &&
        error.response.data.code === TOKEN_EXPIRED_CODE
      ) {
        const refreshToken = getCookie(REFRESH_TOKEN_KEY);
        const originalConfig = error.config;

        if (!isRefreshing) {
          try {
            isRefreshing = true;

            const response = await authService.refreshToken(
              String(refreshToken)
            );

            authService.persistTokens(response.token, response.refreshToken);
            authService.setAuthHeader(response.token);

            failedRequestsQueue.forEach((request) =>
              request.onSuccess(response.token)
            );
          } catch (err) {
            failedRequestsQueue.forEach((request) => request.onFailure(err));
          } finally {
            isRefreshing = false;
            failedRequestsQueue = [];
          }
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
        authService.clearTokens();
      }
    }

    return Promise.reject(error);
  }
);
