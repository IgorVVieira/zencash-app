'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import CircularProgress from '@mui/material/CircularProgress';
import { forgotPassword } from '../../../lib/auth';
import { useToast } from '../../../components/ToastProvider';
import { useTranslations } from 'next-intl';

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({ open, handleClose }: ForgotPasswordProps) {
  const t = useTranslations('common');
  const { showToast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (event: React.BaseSyntheticEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;

    if (!email) return;

    setLoading(true);

    try {
      await forgotPassword(email);
      showToast({ message: t('forgotPassword.successDefault'), severity: 'success' });
      handleClose();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          showToast({ message: t('errors.profileNotFound'), severity: 'error' });
        } else {
          showToast({ message: t('errors.forgotPasswordError'), severity: 'error' });
        }
      } else {
        showToast({ message: t('errors.forgotPasswordError'), severity: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setLoading(false);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: handleSubmit,
          sx: { backgroundImage: 'none' },
        },
      }}
    >
      <DialogTitle>{t('forgotPassword.title')}</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        <DialogContentText>
          {t('forgotPassword.description')}
        </DialogContentText>
        <OutlinedInput
          autoFocus
          required
          margin="dense"
          id="forgot-email"
          name="email"
          label={t('forgotPassword.emailLabel')}
          placeholder={t('forgotPassword.emailPlaceholder')}
          type="email"
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleDialogClose}>{t('actions.cancel')}</Button>
        <Button variant="contained" type="submit" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : t('actions.continue')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
