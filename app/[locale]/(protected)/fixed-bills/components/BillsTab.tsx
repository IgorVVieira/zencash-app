'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Button from '@mui/material/Button';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import {
  getFixedBills,
  deleteFixedBill,
  type FixedBill,
} from '../../../../lib/fixed-bills';
import { useToast } from '../../../../components/ToastProvider';
import FixedBillCard from './FixedBillCard';
import FixedBillFormDialog from './FixedBillFormDialog';
import DeleteBillDialog from './DeleteBillDialog';

export default function BillsTab() {
  const t = useTranslations('fixed-bills');
  const locale = useLocale();
  const loc = locale === 'pt-br' ? 'pt-BR' : 'en-US';
  const { showToast } = useToast();

  const [bills, setBills] = React.useState<FixedBill[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingBill, setEditingBill] = React.useState<FixedBill | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingBill, setDeletingBill] = React.useState<FixedBill | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const loadBills = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await getFixedBills();
      if (signal?.aborted) return;
      setBills(data);
    } catch (err: unknown) {
      if (signal?.aborted) return;
      if (err instanceof Error && err.name === 'CanceledError') return;
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    loadBills(controller.signal);
    return () => controller.abort();
  }, [loadBills]);

  const handleEdit = React.useCallback((bill: FixedBill) => {
    setEditingBill(bill);
    setFormOpen(true);
  }, []);

  const handleDelete = React.useCallback((bill: FixedBill) => {
    setDeletingBill(bill);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingBill) return;
    setDeleteLoading(true);
    try {
      await deleteFixedBill(deletingBill.id);
      setBills((prev) => prev.filter((b) => b.id !== deletingBill.id));
      setDeleteOpen(false);
      setDeletingBill(null);
      showToast({ message: t('toast.deleted') });
    } catch {
      // interceptor handles error toast
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingBill(null);
  };

  const handleSaved = () => {
    loadBills();
  };

  const totalMonthlyEstimate = React.useMemo(
    () =>
      bills.reduce((sum, b) => {
        return sum + (b.recurrence === 'MONTHLY' ? b.amount : b.amount / 12);
      }, 0),
    [bills],
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', pb: 10 }}>
      {bills.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pt: 8,
            gap: 2,
          }}
        >
          <ReceiptLongIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('emptyState.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
            {t('emptyState.description')}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            {t('emptyState.cta')}
          </Button>
        </Box>
      ) : (
        <>
          <Paper
            variant="outlined"
            sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('totalEstimated')}
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontFamily: 'var(--font-dm-mono), monospace', fontWeight: 700 }}
            >
              {totalMonthlyEstimate.toLocaleString(loc, {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Paper>

          <Stack spacing={1.5}>
            {bills.map((bill, i) => (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3, ease: 'easeOut' }}
              >
                <FixedBillCard bill={bill} onEdit={handleEdit} onDelete={handleDelete} />
              </motion.div>
            ))}
          </Stack>
        </>
      )}

      <Tooltip title={t('addBill')} placement="left">
        <Fab
          color="primary"
          aria-label={t('addBill')}
          onClick={() => setFormOpen(true)}
          sx={{ position: 'fixed', bottom: 32, right: 32 }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      <FixedBillFormDialog
        open={formOpen}
        onClose={handleFormClose}
        onSaved={handleSaved}
        editingBill={editingBill}
      />

      <DeleteBillDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeletingBill(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        billName={deletingBill?.name ?? ''}
      />
    </Box>
  );
}
