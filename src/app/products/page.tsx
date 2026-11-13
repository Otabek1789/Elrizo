import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { CatalogPage } from '@/views/CatalogPage';

export const metadata: Metadata = {
  title: "Mahsulotlar katalogi — 0-0-12 Halol Nasiya | ELRIZO",
  description: "ELRIZO do'konining to'liq mahsulotlar katalogi: smartfonlar, maishiy texnika va barcha tovarlar.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen py-20 text-center text-sm text-gray-500 font-bold">Katalog yuklanmoqda...</div>}>
      <CatalogPage />
    </Suspense>
  );
}
