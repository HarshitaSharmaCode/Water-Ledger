'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';

const RootPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.LOGIN);
  }, [router]);

  return null;
};

export default RootPage;