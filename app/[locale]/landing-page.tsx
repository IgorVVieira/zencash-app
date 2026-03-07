'use client';

import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled, useTheme, alpha } from '@mui/material/styles';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import CoinLogo from '../components/CoinLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';
import { listProducts, Product } from '../lib/products';
import { motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// Styled
// ---------------------------------------------------------------------------

const PageContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100dvh',
  padding: theme.spacing(2),
  position: 'relative',
  [theme.breakpoints.up('sm')]: { padding: theme.spacing(4) },
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

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay },
  }),
};

const fadeUpSection = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// ---------------------------------------------------------------------------
// SectionLabel sub-component
// ---------------------------------------------------------------------------

function SectionLabel({ color = 'primary', children }: { color?: 'primary' | 'warning'; children: React.ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        bgcolor: color === 'warning' ? 'warning.main' : 'primary.main',
        color: color === 'warning' ? 'warning.contrastText' : 'primary.contrastText',
        px: 1.5,
        py: 0.25,
        borderRadius: 10,
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        mb: 1.5,
      }}
    >
      {children}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Mini preview components  (static mockups of real screens)
// ---------------------------------------------------------------------------

function PreviewStatCard({
  title,
  value,
  trend,
  trendLabel,
  data,
  color,
}: {
  title: string;
  value: string;
  trend: 'success' | 'error' | 'default';
  trendLabel: string;
  data: number[];
  color: string;
}) {
  const id = `grad-${title.replace(/\s/g, '')}`;
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 0 }}>
      <CardContent sx={{ pb: '12px !important' }}>
        <Typography variant="caption" color="text.secondary">
          {title}
        </Typography>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight={700}>
            {value}
          </Typography>
          <Chip size="small" color={trend} label={trendLabel} />
        </Stack>
        <Box sx={{ width: '100%', height: 40, mt: 1 }}>
          <SparkLineChart
            color={color}
            data={data}
            area
            xAxis={{ scaleType: 'band', data: data.map((_, i) => `${i + 1}`) }}
            sx={{ [`& .${areaElementClasses.root}`]: { fill: `url(#${id})` } }}
          >
            <defs>
              <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
          </SparkLineChart>
        </Box>
      </CardContent>
    </Card>
  );
}

function DashboardPreview() {
  const theme = useTheme();
  const t = useTranslations('landing');
  const green =
    theme.palette.mode === 'light'
      ? theme.palette.success.main
      : theme.palette.success.dark;
  const red =
    theme.palette.mode === 'light'
      ? theme.palette.error.main
      : theme.palette.error.dark;

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <PreviewStatCard
          title={t('preview.cashIn')}
          value="R$4.2k"
          trend="success"
          trendLabel="+12%"
          data={[200, 450, 300, 600, 500, 800, 700, 650, 900]}
          color={green}
        />
        <PreviewStatCard
          title={t('preview.cashOut')}
          value="R$2.8k"
          trend="error"
          trendLabel="+5%"
          data={[400, 350, 500, 300, 450, 200, 350, 400, 300]}
          color={red}
        />
        <PreviewStatCard
          title={t('preview.balance')}
          value="R$1.4k"
          trend="success"
          trendLabel="+18%"
          data={[-200, 100, -200, 300, 50, 600, 350, 250, 600]}
          color={green}
        />
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Card variant="outlined" sx={{ flex: 1, p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('preview.last6months')}
          </Typography>
          <BarChart
            height={180}
            series={[
              { data: [3200, 4100, 3800, 4500, 3900, 4200], label: t('preview.cashIn'), color: green },
              { data: [2800, 3200, 2900, 3600, 3100, 2800], label: t('preview.cashOut'), color: red },
            ]}
            xAxis={[{ data: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'], scaleType: 'band' }]}
            hideLegend
            margin={{ top: 10, bottom: 25, left: 50, right: 10 }}
          />
        </Card>
        <Card variant="outlined" sx={{ flex: 1, p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('preview.expensesByCategory')}
          </Typography>
          <PieChart
            height={180}
            series={[
              {
                data: [
                  { id: 0, value: 35, label: 'Alimentacao' },
                  { id: 1, value: 25, label: 'Transporte' },
                  { id: 2, value: 20, label: 'Moradia' },
                  { id: 3, value: 20, label: 'Lazer' },
                ],
                innerRadius: 40,
              },
            ]}
            hideLegend
            margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
          />
        </Card>
      </Stack>
    </Stack>
  );
}

function TransactionsPreview() {
  const t = useTranslations('landing');
  const rows = [
    { desc: 'Supermercado Extra', type: 'Saida', method: 'Debito', val: 'R$247,50', cat: 'Alimentacao' },
    { desc: 'Salario', type: 'Entrada', method: 'Transferencia', val: 'R$4.200,00', cat: 'Renda' },
    { desc: 'Uber', type: 'Saida', method: 'PIX', val: 'R$32,90', cat: 'Transporte' },
    { desc: 'Netflix', type: 'Saida', method: 'Cartao', val: 'R$55,90', cat: 'Lazer' },
  ];
  return (
    <Card variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            '& th, & td': {
              px: 2,
              py: 1.2,
              textAlign: 'left',
              fontSize: '0.8125rem',
              borderBottom: '1px solid',
              borderColor: 'divider',
              whiteSpace: 'nowrap',
            },
            '& th': { fontWeight: 600, color: 'text.secondary', bgcolor: 'background.default' },
          }}
        >
          <thead>
            <tr>
              <th>{t('preview.description')}</th>
              <th>{t('preview.type')}</th>
              <th>{t('preview.method')}</th>
              <th>{t('preview.amount')}</th>
              <th>{t('preview.category')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.desc}>
                <td>{r.desc}</td>
                <td>
                  <Chip
                    label={r.type}
                    color={r.type === 'Entrada' ? 'success' : 'error'}
                    size="small"
                  />
                </td>
                <td>{r.method}</td>
                <td>{r.val}</td>
                <td>{r.cat}</td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
    </Card>
  );
}

function ImportPreview() {
  const t = useTranslations('landing');
  return (
    <Card variant="outlined" sx={{ p: 3, maxWidth: 420, mx: 'auto' }}>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        {t('preview.importStatement')}
      </Typography>
      <Box
        sx={{
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          mb: 2,
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {t('preview.selectOFX')}
        </Typography>
      </Box>
      <Button variant="contained" fullWidth disabled>
        {t('preview.importBtn')}
      </Button>
    </Card>
  );
}

function CategoriesPreview() {
  const t = useTranslations('landing');
  const cats = [
    { name: 'Alimentacao', color: '#4caf50', type: 'Saida' },
    { name: 'Transporte', color: '#2196f3', type: 'Saida' },
    { name: 'Renda', color: '#ff9800', type: 'Entrada' },
    { name: 'Lazer', color: '#9c27b0', type: 'Saida' },
  ];
  return (
    <Card variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box
        component="table"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          '& th, & td': {
            px: 2,
            py: 1.2,
            textAlign: 'left',
            fontSize: '0.8125rem',
            borderBottom: '1px solid',
            borderColor: 'divider',
            whiteSpace: 'nowrap',
          },
          '& th': { fontWeight: 600, color: 'text.secondary', bgcolor: 'background.default' },
        }}
      >
        <thead>
          <tr>
            <th>{t('preview.color')}</th>
            <th>{t('preview.name')}</th>
            <th>{t('preview.type')}</th>
          </tr>
        </thead>
        <tbody>
          {cats.map((c) => (
            <tr key={c.name}>
              <td>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 0.5,
                    bgcolor: c.color,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </td>
              <td>{c.name}</td>
              <td>{c.type}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Card>
  );
}

function AICategorizationPreview() {
  const t = useTranslations('landing');
  const rows = [
    { desc: 'Supermercado Extra', category: 'Alimentação', color: '#4caf50' },
    { desc: 'Uber', category: 'Transporte', color: '#2196f3' },
    { desc: 'Netflix', category: 'Lazer', color: '#9c27b0' },
    { desc: 'Salário', category: 'Renda', color: '#ff9800' },
    { desc: 'iFood', category: 'Alimentação', color: '#4caf50' },
  ];
  return (
    <Card variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.25,
          bgcolor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <AutoFixHighIcon sx={{ fontSize: 16, color: 'warning.main' }} />
        <Typography variant="caption" color="warning.main" fontWeight={600}>
          {t('preview.aiProcessing')}
        </Typography>
      </Box>
      <Box
        component="table"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          '& th, & td': {
            px: 2,
            py: 1.2,
            textAlign: 'left',
            fontSize: '0.8125rem',
            borderBottom: '1px solid',
            borderColor: 'divider',
            whiteSpace: 'nowrap',
          },
          '& th': { fontWeight: 600, color: 'text.secondary', bgcolor: 'background.default' },
        }}
      >
        <thead>
          <tr>
            <th>{t('preview.description')}</th>
            <th>{t('preview.category')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.desc}>
              <td>{r.desc}</td>
              <td>
                <Chip
                  icon={<AutoFixHighIcon style={{ fontSize: 13 }} />}
                  label={r.category}
                  size="small"
                  sx={{
                    bgcolor: r.color,
                    color: '#fff',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: '#fff' },
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const registrationDisabled = process.env.NEXT_PUBLIC_REGISTRATION_DISABLED === 'true';

export default function LandingPage() {
  const t = useTranslations('landing');
  const tc = useTranslations('common');
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState(true);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    listProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  const navLinks = (['features', 'pricing', 'faq'] as const);

  const scrollTo = (id: string) => {
    setDrawerOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <PageContainer direction="column">

        {/* Nav */}
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CoinLogo size={32} />
              <Typography variant="h5" fontWeight={700}>
                ZenCash
              </Typography>
            </Stack>

            {/* Desktop nav links */}
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              {navLinks.map((key) => (
                <Button
                  key={key}
                  variant="text"
                  size="small"
                  onClick={() => scrollTo(key)}
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 4,
                      left: '50%',
                      transform: 'translateX(-50%) scaleX(0)',
                      transformOrigin: 'center',
                      width: '60%',
                      height: 2,
                      bgcolor: 'primary.main',
                      borderRadius: 1,
                      transition: 'transform 0.2s ease',
                    },
                    '&:hover::after': { transform: 'translateX(-50%) scaleX(1)' },
                  }}
                >
                  {t(`nav.${key}`)}
                </Button>
              ))}
            </Stack>

            {/* Desktop right actions */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              <LanguageSwitcher />
              <ColorModeSelect />
              <Button variant="text" href="/login">
                {tc('auth.signIn')}
              </Button>
              {!registrationDisabled && (
                <Button variant="contained" href="/register" size="small">
                  {tc('auth.signUp')}
                </Button>
              )}
            </Stack>

            {/* Mobile: sign in + hamburger */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'flex', md: 'none' } }}>
              <Button variant="text" size="small" href="/login">
                {tc('auth.signIn')}
              </Button>
              <IconButton onClick={() => setDrawerOpen(true)} aria-label="Open menu">
                <MenuIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Container>

        {/* Mobile Drawer */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 260, pt: 2 }}>
            <Stack direction="row" justifyContent="flex-end" sx={{ px: 1, pb: 1 }}>
              <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <CloseIcon />
              </IconButton>
            </Stack>
            <List>
              {navLinks.map((key) => (
                <ListItemButton key={key} onClick={() => scrollTo(key)}>
                  <ListItemText primary={t(`nav.${key}`)} />
                </ListItemButton>
              ))}
            </List>
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1 }}>
              <LanguageSwitcher />
              <ColorModeSelect />
            </Stack>
            {!registrationDisabled && (
              <Box sx={{ px: 2, pt: 1 }}>
                <Button variant="contained" fullWidth href="/register">
                  {tc('auth.signUp')}
                </Button>
              </Box>
            )}
          </Box>
        </Drawer>

        {/* Hero */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 14 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 6, md: 8 }}
            alignItems="center"
          >
            {/* Hero text */}
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                <Box
                  sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.5,
                    bgcolor: 'primary.main', color: 'primary.contrastText',
                    px: 1.5, py: 0.25, borderRadius: 10, mb: 2,
                    fontSize: '0.75rem', fontWeight: 600,
                  }}
                >
                  {t('hero.badge')}
                </Box>
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.1}>
                <Typography
                  component="h1"
                  variant="h1"
                  sx={{ fontSize: 'clamp(2.25rem, 6vw, 3.25rem)', fontWeight: 700, mb: 2, lineHeight: 1.15 }}
                >
                  {t('hero.titleStart')}{' '}
                  <Typography
                    component="span"
                    sx={{
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      background: 'linear-gradient(135deg, hsl(200, 98%, 45%), hsl(210, 98%, 48%), hsl(220, 100%, 38%))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {t('hero.titleHighlight')}
                  </Typography>
                </Typography>
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.2}>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 3, fontWeight: 400, maxWidth: 520, mx: { xs: 'auto', md: 0 }, lineHeight: 1.6 }}
                >
                  {t('hero.subtitle')}
                </Typography>
              </motion.div>

              {/* Bullets */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ mb: 4, justifyContent: { xs: 'center', md: 'flex-start' } }}
              >
                {(t.raw('hero.bullets') as string[]).map((bullet, i) => (
                  <motion.div key={bullet} variants={fadeUp} initial="hidden" animate="visible" custom={0.3 + i * 0.1}>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <CheckCircleRoundedIcon sx={{ fontSize: 16, color: 'success.main', flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {bullet}
                      </Typography>
                    </Stack>
                  </motion.div>
                ))}
              </Stack>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.6}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                  {!registrationDisabled && (
                    <Button variant="contained" size="large" href="/register" sx={{ px: 4 }}>
                      {t('hero.cta')}
                    </Button>
                  )}
                  <Button variant="outlined" size="large" href="/login" sx={{ px: 4 }}>
                    {t('hero.ctaSecondary')}
                  </Button>
                </Stack>
                {!registrationDisabled && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', textAlign: { xs: 'center', md: 'left' } }}>
                    {t('hero.noCreditCard')}
                  </Typography>
                )}
              </motion.div>
            </Box>

            {/* Hero visual */}
            <Box sx={{ flex: 1.1, width: '100%', display: { xs: 'none', md: 'block' } }}>
              <motion.div
                variants={fadeUpSection}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'light'
                        ? '0 8px 40px rgba(0,0,0,0.10)'
                        : '0 8px 40px rgba(0,0,0,0.40)',
                    p: 2,
                    bgcolor: 'background.paper',
                  }}
                >
                  <DashboardPreview />
                </Box>
              </motion.div>
            </Box>
          </Stack>
        </Container>

        {/* Section: Dashboard (mobile / full width) */}
        <Box id="features" sx={{ bgcolor: 'background.paper', py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <motion.div
              variants={fadeUpSection}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <SectionLabel>{t('sections.dashboard.label')}</SectionLabel>
              <Typography variant="h3" fontWeight={600} sx={{ mb: 1 }}>
                {t('sections.dashboard.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 520 }}>
                {t('sections.dashboard.description')}
              </Typography>
              {/* Show on mobile only — desktop sees it in hero */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <DashboardPreview />
              </Box>
            </motion.div>
          </Container>
        </Box>

        {/* Section: Transacoes */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <motion.div
            variants={fadeUpSection}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
              <Box sx={{ flex: 1 }}>
                <SectionLabel>{t('sections.transactions.label')}</SectionLabel>
                <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
                  {t('sections.transactions.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {t('sections.transactions.description')}
                </Typography>
              </Box>
              <Box sx={{ flex: 1.2, width: '100%' }}>
                <TransactionsPreview />
              </Box>
            </Stack>
          </motion.div>
        </Container>

        {/* Section: IA */}
        <Box sx={{ bgcolor: 'background.paper', py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <motion.div
              variants={fadeUpSection}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
                <Box sx={{ flex: 1 }}>
                  <SectionLabel color="warning">{t('sections.aiCategorization.label')}</SectionLabel>
                  <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
                    {t('sections.aiCategorization.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {t('sections.aiCategorization.description')}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1.2, width: '100%' }}>
                  <AICategorizationPreview />
                </Box>
              </Stack>
            </motion.div>
          </Container>
        </Box>

        {/* Section: Import + Categories side by side */}
        <Box sx={{ bgcolor: 'background.paper', py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <motion.div
              variants={fadeUpSection}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                {/* Import */}
                <Box sx={{ flex: 1 }}>
                  <SectionLabel>{t('sections.import.label')}</SectionLabel>
                  <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
                    {t('sections.import.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {t('sections.import.description')}
                  </Typography>
                  <ImportPreview />
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mt: 3, justifyContent: 'center' }}
                  >
                    {['Nubank', 'Inter', 'Itau', 'Bradesco', 'C6', 'BTG', 'Santander', 'BB'].map(
                      (b) => (
                        <Chip key={b} label={b} size="small" variant="outlined" />
                      ),
                    )}
                    <Chip label={t('preview.andOthers')} size="small" color="primary" />
                  </Stack>
                </Box>

                {/* Categories */}
                <Box sx={{ flex: 1 }}>
                  <SectionLabel>{t('sections.categories.label')}</SectionLabel>
                  <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
                    {t('sections.categories.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {t('sections.categories.description')}
                  </Typography>
                  <CategoriesPreview />
                </Box>
              </Stack>
            </motion.div>
          </Container>
        </Box>

        {/* Pricing */}
        <Container id="pricing" maxWidth="md" sx={{ py: { xs: 8, md: 12 } }}>
          <motion.div
            variants={fadeUpSection}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Typography variant="h3" fontWeight={600} sx={{ textAlign: 'center', mb: 1 }}>
              {t('pricing.title')}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: 'center', mb: 6 }}
            >
              {t('pricing.subtitle')}
            </Typography>
          </motion.div>

          {loadingProducts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ maxWidth: 440, mx: 'auto', width: '100%' }}>
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={scaleUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      p: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      borderColor: 'primary.main',
                      borderWidth: 2,
                      background: (theme) =>
                        `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 60%)`,
                    }}
                  >
                    {/* Single plan chip */}
                    <Chip
                      label={t('pricing.singlePlan')}
                      size="small"
                      color="primary"
                      sx={{ alignSelf: 'flex-start', mb: 2, fontWeight: 600 }}
                    />

                    <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
                      {t('pricing.pro.title')}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                      <AutoFixHighIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                      <Typography variant="caption" color="warning.main" fontStyle="italic">
                        {t('pricing.pro.aiHighlight')}
                      </Typography>
                    </Stack>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                      <Typography variant="h3" fontWeight={700}>
                        R${product.price.toFixed(2).replace('.', ',')}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 0.5 }}>
                        {t('pricing.perMonth')}
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Stack spacing={1.5} sx={{ mb: 3, flex: 1 }}>
                      {(t.raw('pricing.pro.features') as string[]).map((f, i, arr) => {
                        const isAiFeature = i === arr.length - 1;
                        return (
                          <Stack key={f} direction="row" spacing={1} alignItems="center">
                            {isAiFeature ? (
                              <AutoFixHighIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                            ) : (
                              <CheckCircleRoundedIcon sx={{ fontSize: 20, color: 'success.main' }} />
                            )}
                            <Typography variant="body2" fontWeight={isAiFeature ? 600 : 400}>
                              {f}
                            </Typography>
                          </Stack>
                        );
                      })}
                    </Stack>

                    {/* Why it works */}
                    <Box
                      sx={{
                        bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                        borderRadius: 1.5,
                        p: 2,
                        mb: 3,
                      }}
                    >
                      <Stack spacing={1}>
                        {(t.raw('pricing.pro.whyItWorks') as string[]).map((item) => (
                          <Stack key={item} direction="row" spacing={1} alignItems="center">
                            <CheckCircleRoundedIcon sx={{ fontSize: 15, color: 'success.main', flexShrink: 0 }} />
                            <Typography variant="caption" color="text.secondary">
                              {item}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>

                    {!registrationDisabled && (
                      <>
                        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
                          <Button variant="contained" size="large" fullWidth href="/register?pay=true">
                            {t('pricing.pro.cta')}
                          </Button>
                        </motion.div>
                        <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center" sx={{ mt: 1.5 }}>
                          <LockOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {t('pricing.guarantee')}
                          </Typography>
                        </Stack>
                      </>
                    )}
                  </Card>
                </motion.div>
              ))}
            </Box>
          )}
        </Container>

        {/* FAQ */}
        <Box id="faq" sx={{ bgcolor: 'background.paper', py: { xs: 8, md: 12 } }}>
          <Container maxWidth="md">
            <motion.div
              variants={fadeUpSection}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Typography variant="h4" fontWeight={600} sx={{ textAlign: 'center', mb: 6 }}>
                {t('faq.title')}
              </Typography>
            </motion.div>
            {(t.raw('faq.items') as { q: string; a: string }[]).map((item) => (
              <Accordion
                key={item.q}
                disableGutters
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:not(:last-child)': { borderBottom: 0 },
                  '&::before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={600}>{item.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">{item.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Container>
        </Box>

        {/* Footer */}
        <Divider />
        <Box sx={{ py: 4 }}>
          <Container maxWidth="lg">
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'center', sm: 'flex-start' }}
              spacing={3}
            >
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }} alignItems="center" sx={{ mb: 0.5 }}>
                  <CoinLogo size={20} />
                  <Typography variant="body2" fontWeight={600}>
                    ZenCash
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {t('footer.tagline')}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  © 2026 ZenCash
                </Typography>
              </Box>

              <Stack direction="row" spacing={3}>
                {navLinks.map((key) => (
                  <Button
                    key={key}
                    variant="text"
                    size="small"
                    onClick={() => scrollTo(key)}
                    sx={{ color: 'text.secondary', minWidth: 'auto', p: 0, fontWeight: 400 }}
                  >
                    {t(`nav.${key}`)}
                  </Button>
                ))}
              </Stack>
            </Stack>
          </Container>
        </Box>
      </PageContainer>
    </AppTheme>
  );
}
