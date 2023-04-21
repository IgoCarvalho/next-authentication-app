import { hasCookie } from 'cookies-next';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';

import { TOKEN_KEY } from '@/constants/cookies';
import { setupServerAuthService } from '@/services/authService';
import { AuthTokenError } from '@/services/errors/AuthTokenError';

export function withSSRAuth<T extends {}>(fn: GetServerSideProps<T>) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<T>> => {
    const hasToken = hasCookie(TOKEN_KEY, { req: ctx.req, res: ctx.res });

    if (!hasToken) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    try {
      return await fn(ctx);
    } catch (error) {
      if (error instanceof AuthTokenError) {
        const serverAuthService = setupServerAuthService({
          req: ctx.req,
          res: ctx.res,
        });

        serverAuthService.clearTokens();

        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
        };
      }

      throw error;
    }
  };
}
