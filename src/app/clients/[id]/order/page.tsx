// src/app/clients/[id]/order/page.tsx
// Server Wrapper for Static HTML export capability.

import React from 'react';
import { OrderEntryView } from './OrderEntryView';

export function generateStaticParams() {
  return [
    { id: 'client-1' },
    { id: 'client-2' },
    { id: 'client-3' },
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export const Page: React.FC<PageProps> = ({ params }) => {
  return <OrderEntryView params={params} />;
};

export default Page;
// Ensure named exports are present as well
export const generateStaticParamsList = generateStaticParams;
