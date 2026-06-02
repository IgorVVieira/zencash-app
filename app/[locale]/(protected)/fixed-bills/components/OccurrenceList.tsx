'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { FixedBillOccurrence, OccurrenceStatus } from '../../../../lib/fixed-bills';
import OccurrenceCard from './OccurrenceCard';

interface OccurrenceListProps {
  occurrences: FixedBillOccurrence[];
  onPay: (occurrence: FixedBillOccurrence) => void;
  onRevert: (occurrence: FixedBillOccurrence) => void;
}

const GROUP_ORDER: OccurrenceStatus[] = ['OVERDUE', 'PENDING', 'PAID'];

export default function OccurrenceList({ occurrences, onPay, onRevert }: OccurrenceListProps) {
  const t = useTranslations('fixed-bills');

  const grouped = GROUP_ORDER.reduce<Record<OccurrenceStatus, FixedBillOccurrence[]>>(
    (acc, status) => {
      acc[status] = occurrences.filter((o) => o.status === status);
      return acc;
    },
    { OVERDUE: [], PENDING: [], PAID: [] },
  );

  const hasAny = occurrences.length > 0;

  if (!hasAny) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', pt: 4 }}>
        {t('emptyMonth')}
      </Typography>
    );
  }

  let cardIndex = 0;

  return (
    <Stack spacing={3}>
      {GROUP_ORDER.map((status) => {
        const group = grouped[status];
        if (group.length === 0) return null;
        return (
          <Box key={status}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Divider sx={{ flex: 1 }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  fontSize: '0.68rem',
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                }}
              >
                {t(`groupHeaders.${status}`)}
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Stack>
            <Stack spacing={1}>
              {group.map((occ) => {
                const idx = cardIndex++;
                return (
                  <motion.div
                    key={occ.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.25, ease: 'easeOut' }}
                  >
                    <OccurrenceCard occurrence={occ} onPay={onPay} onRevert={onRevert} />
                  </motion.div>
                );
              })}
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
