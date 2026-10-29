'use client';

import React, { Suspense } from 'react';
import { CatalogPage } from '@/views/CatalogPage';

export default function Catalog() {
  return (
    <Suspense fallback={<div className="min-h-screen py-10 text-center text-sm text-gray-500">Yuklanmoqda...</div>}>
      <CatalogPage />
    </Suspense>
  );
}

