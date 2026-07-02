import { API_BASE_URL } from './index';

export interface TestParameter {
    id?: number;
    name: string;
    unit?: string;
    refRangeMale?: string;
    refRangeFemale?: string;
    refRangeChild?: string;
}

export interface Test {
    id?: number;
    testName: string;
    description?: string;
    sampleType?: string;
    price: number;
    parameters: TestParameter[];
}

export interface CreateTestRequest {
    testName: string;
    description?: string;
    sampleType?: string;
    price: number;
    parameters: TestParameter[];
}

export interface UpdateTestRequest {
    testName: string;
    description?: string;
    sampleType?: string;
    price: number;
    parameters?: TestParameter[];
}

// API Client class for tests
class TestApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private getAuthHeaders(): HeadersInit {
        const headers: HeadersInit = { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        try {
            const token = sessionStorage.getItem('auth_token');
            if (token) {
                (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
            }
        } catch {}
        return headers;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const config: RequestInit = {
            method: options.method || 'GET',
            headers: this.getAuthHeaders(),
            credentials: 'include', // Include credentials for CORS
            mode: 'cors', // Enable CORS
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                return await response.json();
            }
            const text = await response.text();
            return text as unknown as T;
        } catch (error) {
            console.error('API request failed:', error);
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                throw new Error('Network error: Unable to connect to the server. Please check if the backend is running.');
            }
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

    async delete(endpoint: string): Promise<void> {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

const testApiClient = new TestApiClient(API_BASE_URL);

export const testsApi = {
    // Get all tests
    getAll: () => testApiClient.get<Test[]>('/tests'),

    // Get test by ID
    getById: (id: number) => testApiClient.get<Test>(`/tests/${id}`),

    // Create new test
    create: (test: CreateTestRequest) => testApiClient.post<Test>('/tests', test),

    // Update test
    update: (id: number, test: UpdateTestRequest) => testApiClient.put<Test>(`/tests/${id}`, test),

    // Delete test
    delete: (id: number) => testApiClient.delete(`/tests/${id}`),
};
