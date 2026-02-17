import apiClient from '../client';

// Define the TypeScript interfaces for your data
export interface Post {
  _id: string;
  title: string;
  lexical_state?: any;  
  content?: any;        
  status: 'DRAFT' | 'PUBLISHED';
  updated_at: string;
  is_owner?: boolean;
}

// The Service Object
export const postService = {
  // Fetch all drafts for the sidebar
  getAll: async (): Promise<Post[]> => {
    const response = await apiClient.get<Post[]>('/api/posts/');
    return response.data;
  },

  // Fetch a specific document (for initialization or guests)
  getById: async (id: string): Promise<Post> => {
    const response = await apiClient.get<Post>(`/api/posts/${id}`);
    return response.data;
  },

  // Create a brand new blank document
  create: async (): Promise<{ _id: string; message: string }> => {
    const response = await apiClient.post<{ _id: string; message: string }>('/api/posts/');
    return response.data;
  },

  // Auto-save or update title (Partial<Post> allows updating just 1 field if needed)
  update: async (id: string, payload: Partial<Post>): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/api/posts/${id}`, payload);
    return response.data;
  },

  // Publish a document
  publish: async (id: string): Promise<{ status: string }> => {
    const response = await apiClient.post<{ status: string }>(`/api/posts/${id}/publish`);
    return response.data;
  },
 delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/api/posts/${id}`);
    return response.data;
  }
};