import axios from 'axios';
import { getCookie } from 'cookies-next';

import { TOKEN_KEY } from '@/constants/cookies';

const token = getCookie(TOKEN_KEY);

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
