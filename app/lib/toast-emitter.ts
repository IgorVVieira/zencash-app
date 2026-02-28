type Severity = 'success' | 'error' | 'info' | 'warning';

export type ToastMessageKey = 'errors.connectionError' | 'errors.unexpectedError';

export type ToastPayload = {
  messageKey: ToastMessageKey;
  severity?: Severity;
};

type Listener = (payload: ToastPayload) => void;

let _listener: Listener | null = null;
let _lastKey = '';
let _lastEmitTime = 0;

export const toastEmitter = {
  emit(payload: ToastPayload) {
    const now = Date.now();
    if (payload.messageKey === _lastKey && now - _lastEmitTime < 2000) return;
    _lastKey = payload.messageKey;
    _lastEmitTime = now;
    _listener?.(payload);
  },

  subscribe(fn: Listener) {
    _listener = fn;
    return () => {
      if (_listener === fn) _listener = null;
    };
  },
};
