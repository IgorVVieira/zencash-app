import axios from "axios";
import { toastEmitter } from "./toast-emitter";

const ALLOWED_REDIRECT_ORIGINS = ["https://app.abacatepay.com"];

// Endpoints de autenticação cujo 401 significa "token inválido", não "sessão expirada"
const AUTH_MANAGEMENT_PATHS = [
  "/api/auth/reset-password",
  "/api/auth/validate-token",
  "/api/auth/forgot-password",
];

const SUBSCRIPTION_CHECK_PATHS = ["/api/subscriptions/active"];

export function isAllowedRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_REDIRECT_ORIGINS.includes(parsed.origin);
  } catch {
    return false;
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("zencash_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url ?? "";
      const isAuthManagement = AUTH_MANAGEMENT_PATHS.some((path) =>
        requestUrl.includes(path)
      );
      if (!isAuthManagement) {
        localStorage.removeItem("zencash_token");
        window.location.href = "/login";
        return new Promise(() => {});
      }
    }

    if (error.response?.status === 403) {
      const requestUrl403 = error.config?.url ?? "";
      const isSubscriptionCheck = SUBSCRIPTION_CHECK_PATHS.some((path) =>
        requestUrl403.includes(path)
      );
      if (isSubscriptionCheck) {
        return Promise.reject(error);
      }

      try {
        const rawApi = axios.create({
          baseURL: process.env.NEXT_PUBLIC_API_URL,
          headers: { "Content-Type": "application/json" },
        });
        const token = localStorage.getItem("zencash_token");
        const { data } = await rawApi.post<{ url: string }>(
          "/api/payments/link",
          null,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        if (isAllowedRedirectUrl(data.url)) {
          window.location.href = data.url;
        } else {
          console.error("Blocked redirect to untrusted domain:", data.url);
          window.location.href = "/login";
        }
      } catch {
        window.location.href = "/login";
      }
      return new Promise(() => {});
    }

    if (!error.config?._skipGlobalToast) {
      const status = error.response?.status;
      if (!status) {
        toastEmitter.emit({ messageKey: "errors.connectionError", severity: "error" });
      } else if (status !== 401 && status !== 403) {
        toastEmitter.emit({ messageKey: "errors.unexpectedError", severity: "error" });
      }
    }

    return Promise.reject(error);
  },
);

export default api;
