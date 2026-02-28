'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CircularProgress from '@mui/material/CircularProgress';
import AppTheme from '../../../shared-theme/AppTheme';
import ColorModeSelect from '../../../shared-theme/ColorModeSelect';
import { useRouter } from '@/i18n/navigation';
import { resetPassword } from '../../../lib/auth';
import CoinLogo from '../../../components/CoinLogo';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import { useToast } from '../../../components/ToastProvider';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const router = useRouter();
  const t = useTranslations('common');
  const { showToast } = useToast();

  const { token } = React.use(params);

  const decoded = decodeURIComponent(token);
  const tokenValue = decoded.includes('=') ? decoded.split('=')[1] : decoded;

  const [newPasswordError, setNewPasswordError] = React.useState(false);
  const [newPasswordErrorMessage, setNewPasswordErrorMessage] = React.useState('');
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = React.useState('');
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const validateInputs = () => {
    const newPassword = document.getElementById('newPassword') as HTMLInputElement;
    const confirmPassword = document.getElementById('confirmPassword') as HTMLInputElement;
    let isValid = true;

    if (!newPassword.value || newPassword.value.length < 8) {
      setNewPasswordError(true);
      setNewPasswordErrorMessage(t('errors.passwordMinReset'));
      isValid = false;
    } else {
      setNewPasswordError(false);
      setNewPasswordErrorMessage('');
    }

    if (!confirmPassword.value || confirmPassword.value !== newPassword.value) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage(t('errors.passwordMismatch'));
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    const data = new FormData(event.currentTarget);
    const newPassword = data.get('newPassword') as string;

    try {
      await resetPassword(tokenValue, newPassword);
      showToast({ message: t('resetPassword.success'), severity: 'success' });
      router.push('/login');
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 400 || axiosError.response?.status === 401) {
          showToast({ message: t('errors.invalidToken'), severity: 'error' });
        } else {
          showToast({ message: t('errors.resetPasswordError'), severity: 'error' });
        }
      } else {
        showToast({ message: t('errors.resetPasswordError'), severity: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <Stack direction="row" spacing={1} sx={{ position: 'fixed', top: '1rem', right: '1rem' }}>
          <LanguageSwitcher />
          <ColorModeSelect />
        </Stack>
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', fontWeight: 700 }}
          >
            <CoinLogo size={28} /> ZenCash
          </Typography>
          <Typography
            component="h2"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(1.5rem, 8vw, 1.75rem)' }}
          >
            {t('resetPassword.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('resetPassword.description')}
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="newPassword">{t('resetPassword.newPassword')}</FormLabel>
              <TextField
                error={newPasswordError}
                helperText={newPasswordErrorMessage}
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder={t('resetPassword.newPasswordPlaceholder')}
                autoComplete="new-password"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={newPasswordError ? 'error' : 'primary'}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle new password visibility"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                          sx={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            '&:hover': { backgroundColor: 'transparent', border: 'none' },
                          }}
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="confirmPassword">{t('resetPassword.confirmPassword')}</FormLabel>
              <TextField
                error={confirmPasswordError}
                helperText={confirmPasswordErrorMessage}
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                color={confirmPasswordError ? 'error' : 'primary'}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                          sx={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            '&:hover': { backgroundColor: 'transparent', border: 'none' },
                          }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('resetPassword.submit')}
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              <Link href="/login" variant="body2" sx={{ alignSelf: 'center' }}>
                {t('resetPassword.backToLogin')}
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
