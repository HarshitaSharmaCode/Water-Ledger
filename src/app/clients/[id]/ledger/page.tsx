// src/app/clients/[id]/ledger/page.tsx
// Server Wrapper for Static HTML export capability.

import React from 'react';
import { LedgerView } from './LedgerView';

export function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export const Page: React.FC<PageProps> = ({ params }) => {
  return <LedgerView params={params} />;
};

export default Page;
// Ensure named exports are present as well
export const generateStaticParamsList = generateStaticParams;
