'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { useTranslations, useLocale } from 'next-intl';

interface MonthSummaryCardsProps {
  totalEstimated: number;
  totalPaid: number;
  totalPending: number;
}

export default function MonthSummaryCards({
  totalEstimated,
  totalPaid,
  totalPending,
}: MonthSummaryCardsProps) {
  const t = useTranslations('fixed-bills');
  const locale = useLocale();
  const loc = locale === 'pt-br' ? 'pt-BR' : 'en-US';

  const pct = totalEstimated > 0 ? Math.round((totalPaid / totalEstimated) * 100) : 0;

  const fmt = (v: number) =>
    v.toLocaleString(loc, { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const cards = [
    { label: t('summary.estimated'), value: fmt(totalEstimated), color: 'text.primary' },
    { label: t('summary.paid'), value: fmt(totalPaid), color: 'success.main' },
    { label: t('summary.pending'), value: fmt(totalPending), color: 'warning.main' },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {cards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 4 }}>
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                {card.label}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontWeight: 700,
                  color: card.color,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                }}
              >
                {card.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{ flex: 1, height: 8, borderRadius: 4 }}
          color="success"
        />
        <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', minWidth: 60 }}>
          {t('summary.progress', { pct })}
        </Typography>
      </Box>
    </Box>
  );
}
