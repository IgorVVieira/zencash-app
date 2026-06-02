'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { getCategories, type Category } from '../../../../lib/categories';
import {
  createFixedBill,
  updateFixedBill,
  type FixedBill,
  type Recurrence,
} from '../../../../lib/fixed-bills';
import { useToast } from '../../../../components/ToastProvider';

interface FixedBillFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingBill?: FixedBill | null;
}

export default function FixedBillFormDialog({
  open,
  onClose,
  onSaved,
  editingBill,
}: FixedBillFormDialogProps) {
  const t = useTranslations('fixed-bills');
  const tc = useTranslations('common');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { showToast } = useToast();

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [name, setName] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [categoryId, setCategoryId] = React.useState<string>('');
  const [recurrence, setRecurrence] = React.useState<Recurrence>('MONTHLY');
  const [dueDay, setDueDay] = React.useState('');
  const [dueMonth, setDueMonth] = React.useState<string>('');
  const [keywords, setKeywords] = React.useState<string[]>([]);
  const [keywordInput, setKeywordInput] = React.useState('');

  const [nameError, setNameError] = React.useState('');
  const [amountError, setAmountError] = React.useState('');
  const [dueDayError, setDueDayError] = React.useState('');
  const [keywordsError, setKeywordsError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    getCategories().then(setCategories).catch(() => {});
    if (editingBill) {
      setName(editingBill.name);
      setAmount(String(editingBill.amount));
      setCategoryId(editingBill.categoryId ?? '');
      setRecurrence(editingBill.recurrence);
      setDueDay(String(editingBill.dueDay));
      setDueMonth(editingBill.dueMonth ? String(editingBill.dueMonth) : '');
      setKeywords(editingBill.matchKeywords);
    } else {
      setName('');
      setAmount('');
      setCategoryId('');
      setRecurrence('MONTHLY');
      setDueDay('');
      setDueMonth('');
      setKeywords([]);
    }
    setKeywordInput('');
    setNameError('');
    setAmountError('');
    setDueDayError('');
    setKeywordsError('');
  }, [open, editingBill]);

  const addKeyword = () => {
    const kw = keywordInput.trim().toUpperCase();
    if (kw && !keywords.includes(kw)) {
      setKeywords((prev) => [...prev, kw]);
      if (keywordsError) setKeywordsError('');
    }
    setKeywordInput('');
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword();
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  };

  const validate = (): boolean => {
    let valid = true;
    if (!name.trim()) {
      setNameError(t('form.nameRequired'));
      valid = false;
    } else {
      setNameError('');
    }
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError(t('form.amountRequired'));
      valid = false;
    } else {
      setAmountError('');
    }
    const parsedDay = parseInt(dueDay, 10);
    if (!dueDay || isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) {
      setDueDayError(t('form.dueDayInvalid'));
      valid = false;
    } else {
      setDueDayError('');
    }
    if (keywords.length === 0) {
      setKeywordsError(t('form.keywordsRequired'));
      valid = false;
    } else {
      setKeywordsError('');
    }
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        amount: parseFloat(amount),
        categoryId: categoryId || null,
        recurrence,
        dueDay: parseInt(dueDay, 10),
        dueMonth: recurrence === 'ANNUAL' && dueMonth ? parseInt(dueMonth, 10) : null,
        matchKeywords: keywords,
      };
      if (editingBill) {
        await updateFixedBill(editingBill.id, payload);
        showToast({ message: t('toast.updated') });
      } else {
        await createFixedBill(payload);
        showToast({ message: t('toast.created') });
      }
      onSaved();
      onClose();
    } catch {
      // interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingBill ? t('form.editTitle') : t('form.createTitle')}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label={t('form.name')}
            placeholder={t('form.namePlaceholder')}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.trim()) setNameError('');
            }}
            error={!!nameError}
            helperText={nameError || ' '}
            fullWidth
            autoFocus
          />

          <TextField
            label={t('form.amount')}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v > 0) setAmountError('');
            }}
            error={!!amountError}
            helperText={amountError || ' '}
            fullWidth
            type="number"
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
          />

          <FormControl fullWidth>
            <InputLabel id="fb-category-label">{t('form.category')}</InputLabel>
            <Select
              labelId="fb-category-label"
              value={categoryId}
              onChange={(e: SelectChangeEvent) => setCategoryId(e.target.value)}
              label={t('form.category')}
            >
              <MenuItem value="">
                <em>{t('form.categoryNone')}</em>
              </MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: c.color,
                        flexShrink: 0,
                      }}
                    />
                    <span>{c.name}</span>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{' '}</FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>{t('form.recurrence')}</FormLabel>
            <RadioGroup
              row
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as Recurrence)}
            >
              <FormControlLabel value="MONTHLY" control={<Radio />} label={t('form.monthly')} />
              <FormControlLabel value="ANNUAL" control={<Radio />} label={t('form.annual')} />
            </RadioGroup>
          </FormControl>

          <Stack direction="row" spacing={2}>
            <TextField
              label={t('form.dueDay')}
              value={dueDay}
              onChange={(e) => {
                setDueDay(e.target.value);
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 1 && v <= 31) setDueDayError('');
              }}
              error={!!dueDayError}
              helperText={dueDayError || ' '}
              type="number"
              slotProps={{ htmlInput: { min: 1, max: 31 } }}
              sx={{ flex: 1 }}
            />
            {recurrence === 'ANNUAL' && (
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="fb-due-month-label">{t('form.dueMonth')}</InputLabel>
                <Select
                  labelId="fb-due-month-label"
                  value={dueMonth}
                  onChange={(e: SelectChangeEvent) => setDueMonth(e.target.value)}
                  label={t('form.dueMonth')}
                >
                  {monthOptions.map((m) => (
                    <MenuItem key={m} value={String(m)}>
                      {t(`months.${m as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`)}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{' '}</FormHelperText>
              </FormControl>
            )}
          </Stack>

          <Box>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
              {t('form.keywords')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              {t('form.keywordsHint')}
            </Typography>
            {keywords.length > 0 && (
              <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 1 }}>
                {keywords.map((kw) => (
                  <Chip key={kw} label={kw} size="small" onDelete={() => removeKeyword(kw)} />
                ))}
              </Stack>
            )}
            <TextField
              placeholder={t('form.keywordsPlaceholder')}
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeywordKeyDown}
              onBlur={addKeyword}
              error={!!keywordsError}
              helperText={keywordsError || ' '}
              fullWidth
              size="small"
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          {tc('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {tc('actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
