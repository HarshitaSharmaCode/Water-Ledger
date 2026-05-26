// src/app/clients/[id]/page.tsx
// Server Wrapper for Static HTML export capability.

import React from 'react';
import { ClientProfileView } from './ClientProfileView';

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
  return <ClientProfileView params={params} />;
};

export default Page;
