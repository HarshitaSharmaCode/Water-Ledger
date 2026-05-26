// src/app/clients/[id]/edit/page.tsx
// Server Wrapper for Static HTML export capability.

import React from 'react';
import { EditClientView } from './EditClientView';

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
  return <EditClientView params={params} />;
};

export default Page;
// Ensure named exports are present as well
export const generateStaticParamsList = generateStaticParams;
