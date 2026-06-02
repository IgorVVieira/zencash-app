'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinkIcon from '@mui/icons-material/Link';
import { useTranslations, useLocale } from 'next-intl';
import type { FixedBillOccurrence } from '../../../../lib/fixed-bills';

const STATUS_COLORS = {
  OVERDUE: 'error.main',
  PENDING: 'warning.main',
  PAID: 'success.main',
} as const;

interface OccurrenceCardProps {
  occurrence: FixedBillOccurrence;
  onPay: (occurrence: FixedBillOccurrence) => void;
  onRevert: (occurrence: FixedBillOccurrence) => void;
}

export default function OccurrenceCard({ occurrence, onPay, onRevert }: OccurrenceCardProps) {
  const t = useTranslations('fixed-bills');
  const locale = useLocale();
  const loc = locale === 'pt-br' ? 'pt-BR' : 'en-US';

  const dueDate = new Date(occurrence.dueDate);
  const dateStr = dueDate.toLocaleDateString(loc, { day: '2-digit', month: '2-digit' });

  const dateLabel =
    occurrence.status === 'PAID'
      ? t('occurrence.paidDateLabel', { date: dateStr })
      : occurrence.status === 'OVERDUE'
      ? t('occurrence.overdueDateLabel', { date: dateStr })
      : t('occurrence.dueDateLabel', { date: dateStr });

  const fmt = (v: number) =>
    v.toLocaleString(loc, {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const amountLabel =
    occurrence.status === 'PAID' && occurrence.paidAmount !== null
      ? occurrence.paidAmount !== occurrence.estimatedAmount
        ? t('occurrence.paidWithEstimated', {
            paid: fmt(occurrence.paidAmount),
            estimated: fmt(occurrence.estimatedAmount),
          })
        : fmt(occurrence.paidAmount)
      : fmt(occurrence.estimatedAmount);

  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                flexShrink: 0,
                bgcolor: STATUS_COLORS[occurrence.status],
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    textDecoration: occurrence.status === 'PAID' ? 'line-through' : 'none',
                    color: occurrence.status === 'PAID' ? 'text.secondary' : 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {occurrence.name}
                </Typography>
                {occurrence.transactionId && (
                  <Chip
                    icon={<LinkIcon sx={{ fontSize: '0.75rem !important' }} />}
                    label={t('occurrence.autoMatched')}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.65rem', height: 18 }}
                  />
                )}
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {dateLabel}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontWeight: 600,
                color: occurrence.status === 'PAID' ? 'success.main' : 'text.primary',
                textAlign: 'right',
              }}
            >
              {amountLabel}
            </Typography>
            {occurrence.status !== 'PAID' ? (
              <Button size="small" variant="outlined" onClick={() => onPay(occurrence)}>
                {t('occurrence.payButton')}
              </Button>
            ) : (
              <Button size="small" variant="text" color="inherit" onClick={() => onRevert(occurrence)}>
                {t('occurrence.undoButton')}
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
