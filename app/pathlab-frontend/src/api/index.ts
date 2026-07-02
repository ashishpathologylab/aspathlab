// index.ts
export const API_BASE_URL = "https://pathology-lab-backend-new.onrender.com/api";

export const AUTH_ENDPOINTS = {
  login: "/auth/login",
  logout: "/auth/logout",
  registerPatient: "/auth/register/patient",
  registerUser: "/auth/register/user",
  verifyEmail: "/auth/verify-email",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
} as const;

export const API_ENDPOINTS = {
  patients: "/patients",
  users: "/users", 
  tests: "/tests",
  bookings: "/bookings",
  bookingTests: "/booking-tests",
  samples: "/samples",
  results: "/results",
  reports: "/reports",
  payments: "/payments",
  dashboard: "/dashboard",
} as const;

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    try {
      const token = sessionStorage.getItem('auth_token');
      if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      }
    } catch {}
    return headers;
  }

  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text() as unknown as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Dashboard API
export const dashboardApi = {
  getStats: () => apiClient.get<DashboardStats>(`${API_ENDPOINTS.dashboard}/stats`),
  getMonthlyBookings: (months: number = 6) => 
    apiClient.get<MonthlyBooking[]>(`${API_ENDPOINTS.dashboard}/monthly-bookings?months=${months}`),
  getTestDistribution: () => apiClient.get<TestDistribution[]>(`${API_ENDPOINTS.dashboard}/test-distribution`),
  getRecentActivity: (limit: number = 10) => 
    apiClient.get<RecentActivity[]>(`${API_ENDPOINTS.dashboard}/recent-activity?limit=${limit}`),
};

// Existing APIs (unchanged)
export const authApi = {
  login: async (credentials: { email: string; password: string; userType?: 'PATIENT' | 'USER' }): Promise<{ token: string; expiresIn: number }> => {
    const payload = { email: credentials.email, password: credentials.password, userType: credentials.userType } as const;
    const result = await apiClient.post<{ accessToken?: string; tokenType?: string; expiresIn?: number }>(AUTH_ENDPOINTS.login, payload);
    const token = (result as any)?.accessToken;
    if (!token) throw new Error('Invalid login response: accessToken missing');
    try { sessionStorage.setItem('auth_token', token); } catch {}
    return { token, expiresIn: (result as any)?.expiresIn ?? 0 };
  },
  logout: async (): Promise<string> => {
    const msg = await apiClient.post<string>(AUTH_ENDPOINTS.logout, {});
    try { sessionStorage.removeItem('auth_token'); } catch {}
    return msg;
  },
  registerPatient: (payload: {
    name: string;
    gender: 'M' | 'F' | 'O';
    dateOfBirth: string;
    contactNumber?: string;
    email: string;
    password: string;
    address?: string;
  }) => apiClient.post<{ message: string }>(AUTH_ENDPOINTS.registerPatient, payload),
  registerUser: (payload: { name: string; email: string; password: string; role: 'ADMIN' | 'LAB_TECH' | 'DOCTOR'; adminEmail?: string; adminPassword?: string }) =>
    apiClient.post<{ message: string }>(AUTH_ENDPOINTS.registerUser, payload),
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const url = `${AUTH_ENDPOINTS.verifyEmail}?token=${encodeURIComponent(token)}`;
    return apiClient.get<{ message: string }>(url);
  },
  forgotPassword: (payload: { email: string; userType?: 'PATIENT' | 'USER' }) =>
    apiClient.post<{ message: string }>(AUTH_ENDPOINTS.forgotPassword, payload),
  resetPassword: (payload: { token: string; newPassword: string }) =>
    apiClient.post<{ message: string }>(AUTH_ENDPOINTS.resetPassword, payload),
};

export const usersApi = {};

export const patientsApi = {
  getAll: () => apiClient.get(`${API_ENDPOINTS.patients}`),
  getById: (id: string | number) => apiClient.get(`${API_ENDPOINTS.patients}/${id}`),
  create: (payload: {
    name: string;
    gender: 'M' | 'F' | 'O';
    dateOfBirth: string;
    contactNumber?: string;
    email: string;
    password: string;
    address?: string;
  }) => apiClient.post(API_ENDPOINTS.patients, payload),
  update: (id: string | number, payload: {
    name: string;
    gender: 'M' | 'F' | 'O';
    dateOfBirth: string;
    contactNumber?: string;
    email: string;
    password: string;
    address?: string;
  }) => apiClient.put(`${API_ENDPOINTS.patients}/${id}`, payload),
  delete: (id: string | number) => apiClient.delete(`${API_ENDPOINTS.patients}/${id}`),
};

export const testsApi = {
  getAll: () => apiClient.get(`${API_ENDPOINTS.tests}`),
  getById: (id: string) => apiClient.get(`${API_ENDPOINTS.tests}/${id}`),
  create: (test: any) => apiClient.post(API_ENDPOINTS.tests, test),
  update: (id: string, test: any) => apiClient.put(`${API_ENDPOINTS.tests}/${id}`, test),
  delete: (id: string) => apiClient.delete(`${API_ENDPOINTS.tests}/${id}`),
};

export const bookingsApi = {
  getAll: () => apiClient.get(`${API_ENDPOINTS.bookings}`),
  getById: (id: string) => apiClient.get(`${API_ENDPOINTS.bookings}/${id}`),
  create: (booking: any) => apiClient.post(API_ENDPOINTS.bookings, booking),
  update: (id: string, booking: any) => apiClient.put(`${API_ENDPOINTS.bookings}/${id}`, booking),
  delete: (id: string | number) => apiClient.delete(`${API_ENDPOINTS.bookings}/${id}`),
  getTestsByBooking: (bookingId: string) => apiClient.get(`${API_ENDPOINTS.bookings}/${bookingId}/tests`),
};

export const testParametersApi = {
  getByTestId: (testId: string | number) => apiClient.get(`/tests/parameters/${testId}`),
};

export interface SaveTestResultsRequest {
  bookingId: number;
  testId: number;
  enteredBy: number;
  savedResults: {
    parameterId: number;
    value: string;
  }[];
}

export const resultsApi = {
  create: (payload: SaveTestResultsRequest) =>
    apiClient.post(
      `/bookings/${payload.bookingId}/tests/${payload.testId}/results`,
      payload
    ),
  update: (payload: SaveTestResultsRequest) =>
    apiClient.put(
      `/bookings/${payload.bookingId}/tests/${payload.testId}/results`,
      payload
    ),
  getByBookingId: (bookingId: number) =>
    apiClient.get(`/bookings/${bookingId}/results`),
  delete: (bookingId: number, testId: number) =>
    apiClient.delete(`/bookings/${bookingId}/tests/${testId}/results`),
  downloadReport: (bookingId: number) => {
    const url = `${API_BASE_URL}${API_ENDPOINTS.bookings}/${bookingId}/results/pdf`;
    window.open(url, "_blank");
  }
};

export const reportsApi = {
  getAll: () => apiClient.get(`${API_ENDPOINTS.reports}/all`),
  getById: (id: string) => apiClient.get(`${API_ENDPOINTS.reports}/${id}`),
  create: (report: any) => apiClient.post(API_ENDPOINTS.reports, report),
  download: (id: string) => apiClient.get(`${API_ENDPOINTS.reports}/${id}/download`),
};

export const paymentsApi = {
  getAll: () => apiClient.get(`${API_ENDPOINTS.payments}`),
  getById: (id: string) => apiClient.get(`${API_ENDPOINTS.payments}/${id}`),
  create: (payment: any) => apiClient.post(API_ENDPOINTS.payments, payment),
  update: (id: string, payment: any) => apiClient.put(`${API_ENDPOINTS.payments}/${id}`, payment),
  delete: (id: string | number) => apiClient.delete(`${API_ENDPOINTS.payments}/${id}`),
  downloadInvoice: (paymentId: number) => {
    const url = `${API_BASE_URL}${API_ENDPOINTS.payments}/${paymentId}/invoice/pdf`;
    window.open(url, "_blank");
  }
};

export const samplesApi = {
  getAll: () => apiClient.get(`${API_ENDPOINTS.samples}`),
  getById: (id: string | number) => apiClient.get(`${API_ENDPOINTS.samples}/${id}`),
  create: (sample: any) => apiClient.post(API_ENDPOINTS.samples, sample),
  update: (id: string | number, sample: any) => apiClient.put(`${API_ENDPOINTS.samples}/${id}`, sample),
  delete: (id: string | number) => apiClient.delete(`${API_ENDPOINTS.samples}/${id}`),
};

// Interfaces for dashboard data
export interface DashboardStats {
  totalPatients: number;
  totalBookings: number;
  testsCompleted: number;
  pendingReports: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export interface MonthlyBooking {
  month: string;
  bookings: number;
  revenue: number;
}

export interface TestDistribution {
  name: string;
  value: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  message: string;
  time: string;
  status: string;
}

// Interfaces for API responses

export interface PatientDashboardDto {
  totalBookings: number;
  totalTestsCompleted: number;
  pendingTests: number;
}

export interface BookingDto {
  bookingId: number;
  testName: string;
  bookingDate: string; // ISO date string
  sampleStatus: string;
  testStatus: string;
}

export interface PaymentDto {
  paymentId: number;
  bookingId: number;
  paidAt?: string; // ISO date string, optional
  amount: number;
  status: string;
}

export interface Patient {
  id?: number;
  name: string;
  email: string;
  contactNumber?: string;
  address?: string;
}


export const patientClientApi = {
  getDashboard: (): Promise<PatientDashboardDto> => 
    apiClient.get<PatientDashboardDto>(`${API_ENDPOINTS.patients}/dashboard`),
  
  getBookings: (): Promise<BookingDto[]> => 
    apiClient.get<BookingDto[]>(`${API_ENDPOINTS.patients}/bookings`),
  
  getPayments: (): Promise<PaymentDto[]> => 
    apiClient.get<PaymentDto[]>(`${API_ENDPOINTS.patients}/payments`),
  
  getProfile: (): Promise<Patient> => 
    apiClient.get<Patient>(`${API_ENDPOINTS.patients}/profile`),
  
  updateProfile: (payload: Partial<Patient>): Promise<Patient> => 
    apiClient.put<Patient>(`${API_ENDPOINTS.patients}/profile`, payload),

  // New method for updating booking tests for a patient
  updateBookingTests: (
    bookingId: number,
    payload: { testIds: number[] }
  ): Promise<BookingDto> =>
    apiClient.put<BookingDto>(`${API_ENDPOINTS.patients}/${bookingId}`, payload),
};

