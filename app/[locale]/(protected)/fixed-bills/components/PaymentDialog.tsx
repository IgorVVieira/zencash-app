'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslations, useLocale } from 'next-intl';
import { updateOccurrence, type FixedBillOccurrence } from '../../../../lib/fixed-bills';
import { useToast } from '../../../../components/ToastProvider';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdated: (updated: FixedBillOccurrence) => void;
  occurrence: FixedBillOccurrence | null;
  mode: 'pay' | 'revert';
}

export default function PaymentDialog({
  open,
  onClose,
  onUpdated,
  occurrence,
  mode,
}: PaymentDialogProps) {
  const t = useTranslations('fixed-bills');
  const tc = useTranslations('common');
  const locale = useLocale();
  const loc = locale === 'pt-br' ? 'pt-BR' : 'en-US';
  const { showToast } = useToast();

  const [paidAmount, setPaidAmount] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && occurrence && mode === 'pay') {
      setPaidAmount(String(occurrence.estimatedAmount));
    }
  }, [open, occurrence, mode]);

  const period = React.useMemo(() => {
    if (!occurrence) return '';
    const d = new Date(occurrence.dueDate);
    return d.toLocaleDateString(loc, { month: 'long', year: 'numeric' });
  }, [occurrence, loc]);

  const handleConfirm = async () => {
    if (!occurrence) return;
    if (mode === 'pay') {
      const amount = parseFloat(paidAmount);
      if (isNaN(amount) || amount <= 0) return;
    }
    setLoading(true);
    try {
      let updated: FixedBillOccurrence;
      if (mode === 'pay') {
        updated = await updateOccurrence(occurrence.id, {
          status: 'PAID',
          paidAmount: parseFloat(paidAmount),
        });
        showToast({ message: t('toast.markedPaid') });
      } else {
        updated = await updateOccurrence(occurrence.id, { status: 'PENDING' });
        showToast({ message: t('toast.markedPending') });
      }
      onUpdated(updated);
      onClose();
    } catch {
      // interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} disableEscapeKeyDown={loading} maxWidth="xs" fullWidth>
      <DialogTitle>
        {mode === 'pay' ? t('payment.markTitle') : t('payment.revertTitle')}
      </DialogTitle>
      <DialogContent>
        {mode === 'pay' ? (
          <>
            {occurrence && (
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                {occurrence.name} — {period}
              </Typography>
            )}
            <TextField
              label={t('payment.paidAmount')}
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              type="number"
              fullWidth
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            />
          </>
        ) : (
          <DialogContentText>
            {occurrence
              ? t('payment.revertConfirm', { name: occurrence.name, period })
              : ''}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          {tc('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          color={mode === 'pay' ? 'primary' : 'warning'}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : mode === 'pay' ? (
            t('payment.confirm')
          ) : (
            t('payment.undo')
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
