import { hasCookie } from 'cookies-next';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';

import { TOKEN_KEY } from '@/constants/cookies';

export function withSSRGuest<T extends {}>(fn: GetServerSideProps<T>) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<T>> => {
    const hasToken = hasCookie(TOKEN_KEY, { req: ctx.req, res: ctx.res });

    if (hasToken) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      };
    }

    return await fn(ctx);
  };
}
