'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import type { FixedBillsDashboard, OccurrenceStatus } from '../../../lib/fixed-bills';

const STATUS_COLORS: Record<OccurrenceStatus, string> = {
  OVERDUE: 'error.main',
  PENDING: 'warning.main',
  PAID: 'success.main',
};

interface FixedBillsWidgetProps {
  data: FixedBillsDashboard | null;
  loading: boolean;
  month: number;
  year: number;
}

export default function FixedBillsWidget({ data, loading, month, year }: FixedBillsWidgetProps) {
  const t = useTranslations('fixed-bills');
  const locale = useLocale();
  const loc = locale === 'pt-br' ? 'pt-BR' : 'en-US';

  const monthName = new Date(year, month - 1).toLocaleDateString(loc, { month: 'long' });

  const fmt = (v: number) =>
    v.toLocaleString(loc, {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const pct =
    data && data.totalEstimated > 0
      ? Math.min(100, Math.round((data.totalPaid / data.totalEstimated) * 100))
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
    >
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography
            component="h2"
            variant="caption"
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
              fontSize: '0.68rem',
              mb: 2,
              display: 'block',
            }}
          >
            {t('dashboard.title', { month: monthName.charAt(0).toUpperCase() + monthName.slice(1), year })}
          </Typography>

          {loading || !data ? (
            <LinearProgress sx={{ my: 2 }} />
          ) : (
            <>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                {[
                  { label: t('summary.estimated'), value: fmt(data.totalEstimated) },
                  { label: t('summary.paid'), value: fmt(data.totalPaid) },
                  { label: t('summary.pending'), value: fmt(data.totalPending) },
                ].map((item) => (
                  <Box key={item.label} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'var(--font-dm-mono), monospace', fontWeight: 700 }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{ flex: 1, height: 6, borderRadius: 3 }}
                  color="success"
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 40 }}>
                  {pct}%
                </Typography>
              </Box>

              <Stack spacing={0.75} sx={{ mb: 2 }}>
                {data.pendingOccurrences.slice(0, 3).map((occ) => {
                  const dueDate = new Date(occ.dueDate);
                  const dayStr = dueDate.toLocaleDateString(loc, { day: '2-digit', month: '2-digit' });
                  return (
                    <Stack key={occ.id} direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: STATUS_COLORS[occ.status],
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {occ.name}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {dayStr}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontFamily: 'var(--font-dm-mono), monospace', fontWeight: 600 }}
                        >
                          {fmt(occ.estimatedAmount)}
                        </Typography>
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>

              <Box sx={{ textAlign: 'right' }}>
                <Link
                  href="/fixed-bills?tab=1"
                  style={{ textDecoration: 'none' }}
                >
                  <Stack
                    component="span"
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ justifyContent: 'flex-end', color: 'primary.main', fontSize: '0.8rem' }}
                  >
                    {t('dashboard.viewAll')}
                    <ArrowForwardIcon sx={{ fontSize: '0.9rem' }} />
                  </Stack>
                </Link>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
