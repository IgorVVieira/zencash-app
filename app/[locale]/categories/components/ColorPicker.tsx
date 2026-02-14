'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import ButtonBase from '@mui/material/ButtonBase';
import CheckIcon from '@mui/icons-material/Check';
import { HexColorPicker } from 'react-colorful';

const presetColors = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
  '#795548', '#607D8B', '#9E9E9E', '#000000',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  error?: boolean;
  helperText?: string;
}

export default function ColorPicker({ value, onChange, error, helperText }: ColorPickerProps) {
  return (
    <Stack spacing={1.5} sx={{ width: '100%' }}>
      <Typography variant="body2" sx={{ fontWeight: 500, color: error ? 'error.main' : 'text.secondary' }}>
        Cor
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {presetColors.map((c) => (
          <ButtonBase
            key={c}
            onClick={() => onChange(c)}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: c,
              border: '2px solid',
              borderColor: value === c ? 'primary.main' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s, border-color 0.15s',
              '&:hover': {
                transform: 'scale(1.15)',
              },
            }}
          >
            {value === c && (
              <CheckIcon sx={{ fontSize: 16, color: c === '#000000' ? '#fff' : '#fff', filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.5))' }} />
            )}
          </ButtonBase>
        ))}
      </Box>
      <Box
        sx={{
          width: '100%',
          '.react-colorful': {
            width: '100%',
            borderRadius: 1,
          },
        }}
      >
        <HexColorPicker color={value} onChange={onChange} />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            backgroundColor: value,
            border: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        />
        <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
          {value}
        </Typography>
      </Box>
      {helperText && (
        <Typography variant="caption" sx={{ color: error ? 'error.main' : 'text.secondary' }}>
          {helperText}
        </Typography>
      )}
    </Stack>
  );
}
