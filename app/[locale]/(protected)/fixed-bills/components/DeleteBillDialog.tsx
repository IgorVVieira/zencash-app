'use client';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslations } from 'next-intl';

interface DeleteBillDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
  billName: string;
}

export default function DeleteBillDialog({
  open,
  onClose,
  onConfirm,
  loading,
  billName,
}: DeleteBillDialogProps) {
  const t = useTranslations('fixed-bills');
  const tc = useTranslations('common');

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('delete.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('delete.confirm', { name: billName })}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          {tc('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : t('delete.button')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
