import apiClient from '@/api/client';

// Define the response type based on your FastAPI backend
export interface AuthResponse {
  access_token: string;
  email: string;
  token_type: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // FastAPI's OAuth2PasswordRequestForm strictly requires x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await apiClient.post<AuthResponse>('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  signup: async (email: string, password: string): Promise<AuthResponse> => {
    // FastAPI's UserCreate Pydantic model expects standard JSON
    const response = await apiClient.post<AuthResponse>('/api/auth/signup', {
      email,
      password,
    });
    return response.data;
  },
};