import { api } from './api';
import { ApiResponse, User } from '@/types';

export const userService = {
  async getUsers(params: { page?: number; limit?: number; search?: string } = {}) {
    const res = await api.get<ApiResponse<{ data: User[]; total: number; page: number; totalPages: number }>>(
      '/users',
      { params }
    );
    return res.data;
  },

  async createUser(data: { email: string; password?: string; roleNames?: string[]; employeeId?: string }) {
    const res = await api.post<ApiResponse<User>>('/users', data);
    return res.data;
  },

  async toggleActive(userId: string, isActive: boolean) {
    const res = await api.patch<ApiResponse<User>>(`/users/${userId}/active`, { isActive });
    return res.data;
  },
};
