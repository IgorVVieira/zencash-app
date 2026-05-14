'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { styled } from '@mui/material/styles';

import AppTheme from '../../shared-theme/AppTheme';
import ColorModeSelect from '../../shared-theme/ColorModeSelect';
import { createUser, login } from '../../lib/auth';
import { createPaymentLink } from '../../lib/payments';
import { isAllowedRedirectUrl } from '../../lib/api';
import { GoogleIcon } from '../login/components/CustomIcons';
import CoinLogo from '../../components/CoinLogo';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useToast } from '../../components/ToastProvider';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  border: '1px solid hsl(220, 20%, 90%)',
  boxShadow:
    'hsla(220, 30%, 5%, 0.06) 0px 8px 24px 0px, hsla(220, 25%, 10%, 0.04) 0px 2px 8px 0px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    backgroundColor: 'hsl(220, 20%, 12%)',
    border: '1px solid hsl(220, 20%, 19%)',
    boxShadow:
      'hsla(222, 50%, 3%, 0.6) 0px 8px 32px 0px, hsla(220, 40%, 5%, 0.4) 0px 2px 8px 0px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  minHeight: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
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
      'radial-gradient(ellipse at 60% 40%, hsl(158, 55%, 94%) 0%, hsl(0, 0%, 100%) 65%)',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(ellipse at 40% 30%, hsla(164, 70%, 10%, 0.5) 0%, hsl(222, 20%, 8%) 70%)',
    }),
  },
}));

function maskCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return digits
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function RegisterPage() {
  const t = useTranslations('common');
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [taxIdentifierError, setTaxIdentifierError] = React.useState(false);
  const [taxIdentifierErrorMessage, setTaxIdentifierErrorMessage] = React.useState('');
  const [cellphoneError, setCellphoneError] = React.useState(false);
  const [cellphoneErrorMessage, setCellphoneErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const validateInputs = () => {
    const name = document.getElementById('name') as HTMLInputElement;
    const email = document.getElementById('email') as HTMLInputElement;
    const taxIdentifier = document.getElementById('taxIdentifier') as HTMLInputElement;
    const cellphone = document.getElementById('cellphone') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;

    let isValid = true;

    if (!name.value || name.value.length < 1) {
      setNameError(true);
      setNameErrorMessage(t('validation.nameRequired'));
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage(t('validation.emailRequired'));
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!taxIdentifier.value || taxIdentifier.value.trim().length < 1) {
      setTaxIdentifierError(true);
      setTaxIdentifierErrorMessage(t('validation.taxIdentifierRequired'));
      isValid = false;
    } else {
      setTaxIdentifierError(false);
      setTaxIdentifierErrorMessage('');
    }

    if (!cellphone.value || cellphone.value.trim().length < 1) {
      setCellphoneError(true);
      setCellphoneErrorMessage(t('validation.cellphoneRequired'));
      isValid = false;
    } else {
      setCellphoneError(false);
      setCellphoneErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage(t('validation.passwordMin'));
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
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
    const name = data.get('name') as string;
    const email = data.get('email') as string;
    const taxIdentifier = (data.get('taxIdentifier') as string).replace(/\D/g, '');
    const cellphone = (data.get('cellphone') as string).replace(/\D/g, '');
    const password = data.get('password') as string;

    try {
      await createUser({ name, email, taxIdentifier, cellphone, password });

      const authResponse = await login({ email, password });
      localStorage.setItem('zencash_token', authResponse.token);

      const paymentLink = await createPaymentLink();
      if (isAllowedRedirectUrl(paymentLink.url)) {
        window.location.href = paymentLink.url;
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 409) {
          showToast({ message: t('errors.emailExists'), severity: 'error' });
        } else {
          showToast({ message: t('errors.createAccountError'), severity: 'error' });
        }
      } else {
        showToast({ message: t('errors.connectionError'), severity: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Stack direction="row" spacing={1} sx={{ position: 'fixed', top: '1rem', right: '1rem' }}>
        <LanguageSwitcher />
        <ColorModeSelect />
      </Stack>
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(1.8rem, 8vw, 2.15rem)', fontWeight: 800, fontFamily: 'var(--font-outfit), sans-serif', color: 'primary.main', letterSpacing: -0.5 }}
          >
            <CoinLogo size={28} /> ZenCash
          </Typography>
          <Typography
            component="h2"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(1.3rem, 6vw, 1.6rem)', fontFamily: 'var(--font-outfit), sans-serif', fontWeight: 700, letterSpacing: -0.3 }}
          >
            {t('auth.signUp')}
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="name">{t('auth.name')}</FormLabel>
              <TextField
                autoComplete="name"
                name="name"
                required
                fullWidth
                id="name"
                placeholder={t('auth.namePlaceholder')}
                autoFocus
                error={nameError}
                helperText={nameErrorMessage}
                color={nameError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">{t('auth.email')}</FormLabel>
              <TextField
                required
                fullWidth
                id="email"
                placeholder={t('auth.emailPlaceholder')}
                name="email"
                autoComplete="email"
                variant="outlined"
                error={emailError}
                helperText={emailErrorMessage}
                color={emailError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="taxIdentifier">{t('auth.taxIdentifier')}</FormLabel>
              <TextField
                required
                fullWidth
                id="taxIdentifier"
                placeholder={t('auth.taxIdentifierPlaceholder')}
                name="taxIdentifier"
                autoComplete="off"
                variant="outlined"
                error={taxIdentifierError}
                helperText={taxIdentifierErrorMessage}
                color={taxIdentifierError ? 'error' : 'primary'}
                inputProps={{ maxLength: 18, inputMode: 'numeric' }}
                onChange={(e) => {
                  e.target.value = maskCpfCnpj(e.target.value);
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="cellphone">{t('auth.cellphone')}</FormLabel>
              <TextField
                required
                fullWidth
                id="cellphone"
                placeholder={t('auth.cellphonePlaceholder')}
                name="cellphone"
                autoComplete="tel"
                variant="outlined"
                error={cellphoneError}
                helperText={cellphoneErrorMessage}
                color={cellphoneError ? 'error' : 'primary'}
                inputProps={{ maxLength: 15, inputMode: 'numeric' }}
                onChange={(e) => {
                  e.target.value = maskPhone(e.target.value);
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">{t('auth.password')}</FormLabel>
              <TextField
                required
                fullWidth
                name="password"
                placeholder="••••••"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                variant="outlined"
                error={passwordError}
                helperText={passwordErrorMessage}
                color={passwordError ? 'error' : 'primary'}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                          sx={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            '&:hover': { backgroundColor: 'transparent', border: 'none' },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
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
              {loading ? <CircularProgress size={24} /> : t('auth.submit')}
            </Button>
          </Box>
          <Divider>
            <Typography sx={{ color: 'text.secondary' }}>{t('auth.or')}</Typography>
          </Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert(t('auth.signUpWithGoogle'))}
              startIcon={<GoogleIcon />}
            >
              {t('auth.signUpWithGoogle')}
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              {t('auth.hasAccount')}{' '}
              <Link
                href="/login"
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                {t('auth.signInLink')}
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
