'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  label?: string;
  labelColor?: 'primary' | 'warning' | 'success';
  action?: React.ReactNode;
  animated?: boolean;
}

export default function PageHeader({
  title,
  subtitle,
  label,
  labelColor = 'primary',
  action,
  animated = true,
}: PageHeaderProps) {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexWrap: 'wrap',
        gap: 2,
        mb: 3,
      }}
    >
      <Stack spacing={0.5}>
        {label && (
          <Box>
            <Chip
              label={label}
              color={labelColor}
              size="small"
              sx={{ fontWeight: 600, letterSpacing: 0.5, fontSize: '0.7rem' }}
            />
          </Box>
        )}
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )}
      </Stack>
      {action && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 'auto' }}>
          {action}
        </Stack>
      )}
    </Box>
  );

  if (!animated) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {content}
    </motion.div>
  );
}
