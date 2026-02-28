import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    _skipGlobalToast?: boolean;
  }
  interface InternalAxiosRequestConfig {
    _skipGlobalToast?: boolean;
  }
}
