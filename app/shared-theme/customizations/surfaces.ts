import { alpha, Theme, Components } from '@mui/material/styles';
import { gray } from '../themePrimitives';

export const surfacesCustomizations: Components<Theme> = {
  MuiAccordion: {
    defaultProps: { elevation: 0, disableGutters: true },
    styleOverrides: {
      root: ({ theme }) => ({
        padding: 4,
        overflow: 'clip',
        backgroundColor: (theme.vars || theme).palette.background.default,
        border: '1px solid',
        borderColor: (theme.vars || theme).palette.divider,
        ':before': { backgroundColor: 'transparent' },
        '&:not(:last-of-type)': { borderBottom: 'none' },
        '&:first-of-type': {
          borderTopLeftRadius: (theme.vars || theme).shape.borderRadius,
          borderTopRightRadius: (theme.vars || theme).shape.borderRadius,
        },
        '&:last-of-type': {
          borderBottomLeftRadius: (theme.vars || theme).shape.borderRadius,
          borderBottomRightRadius: (theme.vars || theme).shape.borderRadius,
        },
      }),
    },
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: ({ theme }) => ({
        border: 'none',
        borderRadius: 8,
        '&:hover': { backgroundColor: gray[50] },
        '&:focus-visible': { backgroundColor: 'transparent' },
        ...theme.applyStyles('dark', {
          '&:hover': { backgroundColor: gray[800] },
        }),
      }),
    },
  },
  MuiAccordionDetails: {
    styleOverrides: { root: { mb: 20, border: 'none' } },
  },
  MuiPaper: { defaultProps: { elevation: 0 } },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: 16,
        gap: 16,
        transition: 'box-shadow 200ms ease, transform 200ms ease',
        backgroundColor: 'hsl(0, 0%, 100%)',
        background: 'linear-gradient(145deg, hsl(0, 0%, 100%) 0%, hsl(220, 25%, 98%) 100%)',
        borderRadius: (theme.vars || theme).shape.borderRadius,
        border: '1px solid hsl(220, 20%, 92%)',
        boxShadow: '0 1px 3px hsla(220, 30%, 10%, 0.06), 0 4px 12px hsla(220, 30%, 10%, 0.04)',
        '&:hover': {
          boxShadow: '0 4px 16px hsla(220, 30%, 10%, 0.10), 0 1px 4px hsla(220, 30%, 10%, 0.06)',
        },
        ...theme.applyStyles('dark', {
          backgroundColor: 'hsl(220, 20%, 13%)',
          background: 'linear-gradient(145deg, hsl(220, 20%, 14%) 0%, hsl(220, 22%, 11%) 100%)',
          border: '1px solid hsl(220, 20%, 20%)',
          boxShadow: '0 1px 3px hsla(220, 50%, 2%, 0.4), 0 4px 16px hsla(220, 50%, 2%, 0.25)',
          '&:hover': {
            boxShadow: '0 4px 24px hsla(220, 50%, 2%, 0.5), 0 1px 4px hsla(220, 50%, 2%, 0.3)',
          },
        }),
        variants: [
          {
            props: { variant: 'outlined' },
            style: {
              border: '1px solid hsl(220, 20%, 90%)',
              boxShadow: 'none',
              background: 'hsl(0, 0%, 100%)',
              ...theme.applyStyles('dark', {
                background: 'hsl(220, 20%, 12%)',
                border: '1px solid hsl(220, 20%, 19%)',
              }),
            },
          },
        ],
      }),
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: { padding: 0, '&:last-child': { paddingBottom: 0 } },
    },
  },
  MuiCardHeader: { styleOverrides: { root: { padding: 0 } } },
  MuiCardActions: { styleOverrides: { root: { padding: 0 } } },
};
