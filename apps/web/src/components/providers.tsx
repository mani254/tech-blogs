'use client';

import * as React from 'react';
import { SdkProvider } from '@org/internal-sdk';
import { Toaster } from '@org/ui';

export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SdkProvider>
      {children}
      <Toaster />
    </SdkProvider>
  );
}

