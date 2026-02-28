'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { getActiveSubscription } from './subscriptions';

const POLL_INTERVAL_MS = 60_000;

interface SubscriptionContextValue {
  hasSubscription: boolean;
  loading: boolean;
}

const SubscriptionContext = React.createContext<SubscriptionContextValue>({
  hasSubscription: false,
  loading: true,
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [hasSubscription, setHasSubscription] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout>;

    async function check() {
      try {
        await getActiveSubscription();
        if (!cancelled) setHasSubscription(true);
      } catch {
        if (!cancelled) setHasSubscription(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
      if (!cancelled) timerId = setTimeout(check, POLL_INTERVAL_MS);
    }

    check();
    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <SubscriptionContext.Provider value={{ hasSubscription, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return React.useContext(SubscriptionContext);
}
