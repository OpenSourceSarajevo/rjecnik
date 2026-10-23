import type { Metadata } from 'next';

import LegalPage from '@/app/components/LegalPage';

import { sections } from './sections.data';

export const metadata: Metadata = {
  title: 'Uslovi korištenja',
};

const TermsConditions = () => {
  return <LegalPage title="Uslovi korištenja" effectiveDate="2025-02-16" sections={sections} />;
};

export default TermsConditions;
