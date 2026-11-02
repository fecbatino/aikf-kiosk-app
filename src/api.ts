// src/api.ts – API-Client für den AIKF Spendenkiosk
// Nutzt relative Pfade, die über Nginx an das Backend weitergeleitet werden

const API_BASE = "/api";

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
  idempotencyKey?: string;
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
  const kioskToken = localStorage.getItem('aikf-kiosk-pair');
  if (kioskToken) headers['X-Kiosk-Token'] = kioskToken;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// --- Donation API ---

export interface Donation {
  id: string;
  amount: number;
  category: string;
  donorName: string;
  donorEmail: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  stripePaymentIntentId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateDonationInput {
  amount: number;
  category: string;
  donorName: string;
  donorEmail: string;
  paymentMethod: string;
}

export const donationsApi = {
  create: (input: CreateDonationInput, idempotencyKey: string) =>
    request<{ id: string; status: string }>("/donations", { method: "POST", body: input, idempotencyKey }),

  list: (params?: {
    sort?: string;
    status?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }, token?: string) => {
    const searchParams = new URLSearchParams();
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const qs = searchParams.toString();
    return request<PaginatedResponse<Donation>>(`/donations${qs ? `?${qs}` : ""}`, { token });
  },

  getById: (id: string, token?: string) =>
    request<Donation>(`/donations/${id}`, { token }),

  reconcile: (id: string, reference: string, token: string) => request<{ status: string }>(`/donations/${id}/reconcile`, { method: 'PATCH', body: { reference }, token }),

  delete: (id: string, token?: string) =>
    request<{ message: string }>(`/donations/${id}`, { method: "DELETE", token }),

  receipt: async (id: string, token: string) => {
    const result = await fetch(`${API_BASE}/donations/${id}/receipt`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!result.ok) throw new Error('RECEIPT_UNAVAILABLE');
    const url = URL.createObjectURL(await result.blob());
    const link = document.createElement('a'); link.href = url; link.download = `spende-${id}.pdf`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};

// --- Admin API ---

export interface AdminLoginResponse {
  token: string;
  mustChangePassword?: boolean;
  admin: { id: string; email: string };
}

export interface AdminStats {
  totalAmount: number;
  totalDonations: number;
  thisMonthAmount: number;
  thisMonthCount: number;
  categoryDistribution: { category: string; amount: number }[];
  monthlyChart: { month: string; count: number; amount: number }[];
}

export const adminApi = {
  login: (email: string, password: string) =>
    request<AdminLoginResponse>("/admin/login", {
      method: "POST",
      body: { email, password },
    }),

  me: (token: string) =>
    request<{ admin: { id: string; email: string }; mustChangePassword?: boolean }>("/admin/me", { token }),

  changePassword: (currentPassword: string, newPassword: string, token: string) =>
    request<{ changed: boolean }>('/admin/password', { method: 'POST', body: { currentPassword, newPassword }, token }),

  stats: (token: string) =>
    request<AdminStats>("/admin/stats", { token }),
};

// --- Payment API ---
export interface PaymentConfig { online: boolean; terminal: boolean; paired: boolean; testMode: boolean; methods: string[] }
export interface PaymentSession { donationId: string; token: string; url?: string; expiresAt?: number }
export const paymentsApi = {
  config: () => request<PaymentConfig>('/stripe/config'),
  checkout: (input: Omit<CreateDonationInput, 'paymentMethod'> & { locale: string }, idempotencyKey: string) =>
    request<PaymentSession>('/stripe/checkout', { method: 'POST', body: input, idempotencyKey }),
  terminal: (input: Omit<CreateDonationInput, 'paymentMethod'>, idempotencyKey: string) =>
    request<PaymentSession>('/stripe/terminal', { method: 'POST', body: input, idempotencyKey }),
  status: (id: string, token: string) => request<{ status: string; amount: number; category: string; attemptFailed?: boolean; processing?: boolean }>(`/stripe/status/${id}`, { token }),
  cancel: (id: string, token: string) => request<{ status: string; processing?: boolean }>(`/stripe/cancel/${id}`, { method: 'POST', token }),
  pair: (token: string) => request<{ token: string }>('/stripe/pair', { method: 'POST', token }),
};

// --- Token Management ---

const TOKEN_KEY = "aikf_kiosk_jwt";
localStorage.removeItem(TOKEN_KEY); // Remove legacy persistent administrator sessions.

export const tokenStorage = {
  get: (): string | null => sessionStorage.getItem(TOKEN_KEY),
  set: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  remove: () => sessionStorage.removeItem(TOKEN_KEY),
};
