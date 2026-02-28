'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import Link from 'next/link';
import { importOFX } from '../../lib/transactions';
import { getPendingImport, PendingImport } from '../../lib/transaction-imports';
import { useToast } from '../../components/ToastProvider';
import OnboardingTour from '../../components/OnboardingTour';
import { useSubscription } from '../../lib/subscription-context';
import { useTranslations, useLocale } from 'next-intl';

export default function ImportPage() {
  const { showToast } = useToast();
  const t = useTranslations('import');
  const locale = useLocale();
  const { hasSubscription } = useSubscription();
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [useLlm, setUseLlm] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const POLL_INTERVAL_MS = 60_000;
  const [pendingImport, setPendingImport] = React.useState<PendingImport | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout>;

    async function check() {
      try {
        const result = await getPendingImport();
        if (!cancelled) {
          const isActive = result?.status === 'pending' || result?.status === 'processing';
          setPendingImport(isActive ? result : null);
        }
      } catch {
        // silent — leave previous state, retry next poll
      }
      if (!cancelled) timerId = setTimeout(check, POLL_INTERVAL_MS);
    }

    check();
    return () => { cancelled = true; clearTimeout(timerId); };
  }, []);

  const isImportBlocked = !!pendingImport;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    if (selected) {
      const validationError = validateFile(selected);
      if (validationError) {
        setError(validationError);
        setFile(null);
        return;
      }
    }
    setFile(selected);
    setError('');
    setSuccess(false);
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (f: File): string | null => {
    if (!f.name.toLowerCase().endsWith('.ofx')) {
      return t('invalidFileType');
    }
    if (f.size > MAX_FILE_SIZE) {
      return t('fileTooLarge', { max: '5MB' });
    }
    return null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    const validationError = validateFile(dropped);
    if (validationError) {
      setError(validationError);
      return;
    }
    setFile(dropped);
    setError('');
    setSuccess(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError(t('selectError'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await importOFX(file, useLlm);
      setSuccess(true);
      showToast({ message: t('successMessage') });
      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      try {
        const pending = await getPendingImport();
        const isActive = pending?.status === 'pending' || pending?.status === 'processing';
        setPendingImport(isActive ? pending : null);
      } catch {
        // silent — poll will catch it
      }
    } catch {
      // interceptor handles the error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <OnboardingTour page="import" />
      <Stack spacing={3}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }} data-tour="import-title">
          {t('title')}
        </Typography>

        <Alert icon={<InfoOutlinedIcon />} severity="info" data-tour="import-info">
          {t('info')}
        </Alert>

        {isImportBlocked && (
          <Alert icon={<HourglassEmptyIcon />} severity="warning">
            <Typography variant="body2" fontWeight={600}>
              {t('pendingImport.title')}
            </Typography>
            <Typography variant="body2">
              {t('pendingImport.description')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {t('pendingImport.status')}: {t(`pendingImport.statusLabel.${pendingImport!.status}`)}
            </Typography>
          </Alert>
        )}

        <Paper variant="outlined" sx={{ p: 3 }} data-tour="import-dropzone">
          <Stack spacing={3}>
            <Typography variant="body1" color="text.secondary">
              {t.rich('description', {
                bold: (chunks) => <strong>{chunks}</strong>,
              })}
            </Typography>

            <Box
              sx={{
                border: '2px dashed',
                borderColor: file || dragging ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: (hasSubscription && !isImportBlocked) ? 'pointer' : 'default',
                transition: 'border-color 0.2s',
                '&:hover': (hasSubscription && !isImportBlocked) ? { borderColor: 'primary.main' } : undefined,
                ...(!hasSubscription || isImportBlocked ? { opacity: 0.4, pointerEvents: 'none' } : {}),
              }}
              onClick={() => (hasSubscription && !isImportBlocked) && inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".ofx"
                onChange={handleFileChange}
                hidden
                disabled={!hasSubscription || isImportBlocked}
              />
              {file ? (
                <Stack alignItems="center" spacing={1}>
                  <InsertDriveFileIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                  <Typography variant="body1" fontWeight={500}>
                    {file.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(file.size / 1024).toFixed(1)} KB
                  </Typography>
                </Stack>
              ) : (
                <Stack alignItems="center" spacing={1}>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                  <Typography variant="body1" color="text.secondary">
                    {t('dropzone')}
                  </Typography>
                </Stack>
              )}
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={useLlm}
                  onChange={(e) => setUseLlm(e.target.checked)}
                  disabled={!hasSubscription || isImportBlocked}
                  color="primary"
                />
              }
              label={
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <AutoFixHighIcon sx={{ fontSize: 20, color: (hasSubscription && !isImportBlocked) ? 'warning.main' : 'text.disabled', mt: 0.25 }} />
                  <Stack>
                    <Typography variant="body2" fontWeight={500}>
                      {t('useLlmLabel')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('useLlmHelper')}
                    </Typography>
                  </Stack>
                </Stack>
              }
              sx={(!hasSubscription || isImportBlocked) ? { opacity: 0.4 } : undefined}
            />

            {error && <Alert severity="error">{error}</Alert>}

            {success && (
              <Alert icon={<CheckCircleOutlineIcon />} severity="success">
                {t('successAlert')}
              </Alert>
            )}

            {success && (
              <Button
                component={Link}
                href={`/${locale}/transactions`}
                variant="outlined"
                size="large"
                fullWidth
              >
                {t('goToTransactions')}
              </Button>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
              onClick={handleSubmit}
              disabled={loading || !file || !hasSubscription || isImportBlocked}
              fullWidth
              sx={(!hasSubscription || isImportBlocked) ? { opacity: 0.4, pointerEvents: 'none' } : undefined}
            >
              {loading ? t('uploading') : t('importBtn')}
            </Button>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }} data-tour="import-steps">
          <Typography variant="subtitle2" gutterBottom>
            {t('howItWorks')}
          </Typography>
          <Stack component="ol" sx={{ pl: 2, m: 0 }} spacing={0.5}>
            <Typography component="li" variant="body2" color="text.secondary">
              {t('step1')}
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              {t('step2')}
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              {t('step3')}
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              {t('step4')}
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
