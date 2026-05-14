'use client';

import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';
import { motion } from 'framer-motion';

export interface StatCardProps {
  title: string;
  value: string;
  interval: string;
  trend: 'up' | 'down' | 'neutral';
  trendLabel: string;
  data: number[];
  xLabels: string[];
  motionIndex?: number;
}

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export default function StatCard({
  title,
  value,
  interval,
  trend,
  trendLabel,
  data,
  xLabels,
  motionIndex = 0,
}: StatCardProps) {
  const theme = useTheme();

  const trendColors = {
    up:
      theme.palette.mode === 'light'
        ? theme.palette.success.main
        : theme.palette.success.dark,
    down:
      theme.palette.mode === 'light'
        ? theme.palette.error.main
        : theme.palette.error.dark,
    neutral:
      theme.palette.mode === 'light'
        ? theme.palette.grey[400]
        : theme.palette.grey[700],
  };

  const labelColors = {
    up: 'success' as const,
    down: 'error' as const,
    neutral: 'default' as const,
  };

  const color = labelColors[trend];
  const chartColor = trendColors[trend];
  const gradientId = `area-gradient-${title.replace(/\s/g, '-')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: motionIndex * 0.1, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      style={{ height: '100%' }}
    >
    <Card sx={{ height: '100%', flexGrow: 1 }}>
      <CardContent>
        <Typography
          component="h2"
          variant="caption"
          sx={{ fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.68rem', mb: 1, display: 'block' }}
        >
          {title}
        </Typography>
        <Stack
          direction="column"
          sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 1 }}
        >
          <Stack sx={{ justifyContent: 'space-between' }}>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography variant="h4" component="p" sx={{ fontFamily: 'var(--font-dm-mono), monospace', fontWeight: 500, letterSpacing: -0.5 }}>
                {value}
              </Typography>
              <Chip size="small" color={color} label={trendLabel} sx={{ fontFamily: 'var(--font-dm-mono)', fontWeight: 500, fontSize: '0.72rem' }} />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {interval}
            </Typography>
          </Stack>
          <Box sx={{ width: '100%', height: 50 }}>
            {data.length > 0 && (
              <SparkLineChart
                color={chartColor}
                data={data}
                area
                showHighlight
                showTooltip
                xAxis={{
                  scaleType: 'band',
                  data: xLabels,
                }}
                sx={{
                  [`& .${areaElementClasses.root}`]: {
                    fill: `url(#${gradientId})`,
                  },
                }}
              >
                <AreaGradient color={chartColor} id={gradientId} />
              </SparkLineChart>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
    </motion.div>
  );
}
