'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslations } from 'next-intl';
import MonthYearPicker from '../../../../components/MonthYearPicker';
import {
  getOccurrences,
  type FixedBillOccurrence,
} from '../../../../lib/fixed-bills';
import { useSubscription } from '../../../../lib/subscription-context';
import MonthSummaryCards from './MonthSummaryCards';
import OccurrenceList from './OccurrenceList';
import PaymentDialog from './PaymentDialog';

export default function MonthTab() {
  const t = useTranslations('fixed-bills');
  const { hasSubscription } = useSubscription();
  const now = new Date();
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [year, setYear] = React.useState(now.getFullYear());
  const [occurrences, setOccurrences] = React.useState<FixedBillOccurrence[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [paymentMode, setPaymentMode] = React.useState<'pay' | 'revert'>('pay');
  const [selectedOccurrence, setSelectedOccurrence] = React.useState<FixedBillOccurrence | null>(null);

  const loadOccurrences = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await getOccurrences(month, year, signal);
      if (signal?.aborted) return;
      setOccurrences(data);
    } catch (err: unknown) {
      if (signal?.aborted) return;
      if (err instanceof Error && err.name === 'CanceledError') return;
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [month, year]);

  React.useEffect(() => {
    const controller = new AbortController();
    loadOccurrences(controller.signal);
    return () => controller.abort();
  }, [loadOccurrences]);

  const handlePay = React.useCallback((occ: FixedBillOccurrence) => {
    setSelectedOccurrence(occ);
    setPaymentMode('pay');
    setPaymentOpen(true);
  }, []);

  const handleRevert = React.useCallback((occ: FixedBillOccurrence) => {
    setSelectedOccurrence(occ);
    setPaymentMode('revert');
    setPaymentOpen(true);
  }, []);

  const handleOccurrenceUpdated = React.useCallback((updated: FixedBillOccurrence) => {
    setOccurrences((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }, []);

  const totals = React.useMemo(() => {
    const totalEstimated = occurrences.reduce((s, o) => s + o.estimatedAmount, 0);
    const totalPaid = occurrences
      .filter((o) => o.status === 'PAID')
      .reduce((s, o) => s + (o.paidAmount ?? o.estimatedAmount), 0);
    const totalPending = totalEstimated - totalPaid;
    return { totalEstimated, totalPaid, totalPending };
  }, [occurrences]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 2 }}>
        <MonthYearPicker
          month={month}
          year={year}
          onChange={(m, y) => { setMonth(m); setYear(y); }}
          disabled={!hasSubscription}
        />
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
          <CircularProgress />
        </Box>
      ) : occurrences.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', pt: 4 }}>
          {t('emptyMonth')}
        </Typography>
      ) : (
        <>
          <MonthSummaryCards
            totalEstimated={totals.totalEstimated}
            totalPaid={totals.totalPaid}
            totalPending={totals.totalPending}
          />
          <OccurrenceList
            occurrences={occurrences}
            onPay={handlePay}
            onRevert={handleRevert}
          />
        </>
      )}

      <PaymentDialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onUpdated={handleOccurrenceUpdated}
        occurrence={selectedOccurrence}
        mode={paymentMode}
      />
    </Box>
  );
}
