import type { Metadata } from 'next';

import LegalPage from '@/app/components/LegalPage';

import { sections } from './sections.data';

export const metadata: Metadata = {
  title: 'Politika privatnosti',
  alternates: { canonical: '/privatnost' },
};

const PrivacyPolicy = () => {
  return (
    <LegalPage
      title="Politika privatnosti"
      effectiveDate="2025-02-16"
      intro="Ova Politika privatnosti objašnjava kako prikupljamo, koristimo i štitimo vaše podatke kada koristite Bosanski Online Rječnik."
      sections={sections}
    />
  );
};

export default PrivacyPolicy;
