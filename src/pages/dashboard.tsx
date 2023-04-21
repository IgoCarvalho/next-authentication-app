import { useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { authService, setupServerAuthService } from '@/services/authService';
import { withSSRAuth } from '@/utils/withSSRAuth';

export default function Dashboard() {
  const { user } = useAuth();

  useEffect(() => {
    authService.silentSignIn();
  }, []);

  return <h1>Dashboard Works! {user?.email}</h1>;
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const serverAuthService = setupServerAuthService({
    req: ctx.req,
    res: ctx.res,
  });

  const response = await serverAuthService.silentSignIn();

  return {
    props: {},
  };
});
