'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslations, useLocale } from 'next-intl';
import type { FixedBill } from '../../../../lib/fixed-bills';

interface FixedBillCardProps {
  bill: FixedBill;
  onEdit: (bill: FixedBill) => void;
  onDelete: (bill: FixedBill) => void;
}

export default function FixedBillCard({ bill, onEdit, onDelete }: FixedBillCardProps) {
  const t = useTranslations('fixed-bills');
  const tc = useTranslations('common');
  const locale = useLocale();
  const loc = locale === 'pt-br' ? 'pt-BR' : 'en-US';

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleEdit = () => {
    handleMenuClose();
    onEdit(bill);
  };
  const handleDelete = () => {
    handleMenuClose();
    onDelete(bill);
  };

  const formattedAmount = bill.amount.toLocaleString(loc, {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const recurrenceLabel = t(`recurrenceLabel.${bill.recurrence}`);
  const monthlyLabel = t('recurrenceLabel.MONTHLY');

  const dueLabel =
    bill.recurrence === 'MONTHLY'
      ? t('dueLabel.monthly', { day: bill.dueDay })
      : t('dueLabel.annual', {
          month: t(`months.${bill.dueMonth as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`),
          day: bill.dueDay,
        });

  const annualMonthlyEquiv =
    bill.recurrence === 'ANNUAL'
      ? (bill.amount / 12).toLocaleString(loc, {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : null;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                flexShrink: 0,
                bgcolor: bill.categoryColor ?? 'text.disabled',
                border: '1.5px solid',
                borderColor: 'divider',
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {bill.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {dueLabel}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Stack alignItems="flex-end">
              <Typography
                variant="body2"
                sx={{ fontFamily: 'var(--font-dm-mono), monospace', fontWeight: 600 }}
              >
                {formattedAmount}
                <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.25 }}>
                  {recurrenceLabel}
                </Typography>
              </Typography>
              {annualMonthlyEquiv && (
                <Tooltip title={t('tooltipAnnual')} placement="top">
                  <Typography variant="caption" sx={{ color: 'text.disabled', cursor: 'help' }}>
                    ≈ {annualMonthlyEquiv}{monthlyLabel}
                  </Typography>
                </Tooltip>
              )}
            </Stack>
            <IconButton size="small" onClick={handleMenuOpen} aria-label="options">
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>

      <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>{tc('actions.edit')}</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          {tc('actions.delete')}
        </MenuItem>
      </Menu>
    </Card>
  );
}
