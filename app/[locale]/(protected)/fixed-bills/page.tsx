'use client';

import * as React from 'react';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import PageHeader from '../../../components/PageHeader';
import BillsTab from './components/BillsTab';
import MonthTab from './components/MonthTab';

export default function FixedBillsPage() {
  const t = useTranslations('fixed-bills');
  const searchParams = useSearchParams();
  const initialTab = Number(searchParams.get('tab') ?? '0');
  const [tab, setTab] = React.useState(initialTab);

  return (
    <Container sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <PageHeader title={t('title')} />
      <Tabs
        value={tab}
        onChange={(_, v: number) => setTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={t('tabBills')} />
        <Tab label={t('tabMonth')} />
      </Tabs>
      <Box sx={{ flex: 1 }}>
        {tab === 0 && <BillsTab />}
        {tab === 1 && <MonthTab />}
      </Box>
    </Container>
  );
}
