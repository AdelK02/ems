import { api } from './api';

export interface GetEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
}

export const employeeService = {
  async getEmployees(params: GetEmployeesParams = {}) {
    const res = await api.get('/employees', { params });
    return res.data;
  },

  async getEmployeeById(id: string) {
    const res = await api.get(`/employees/${id}`);
    return res.data;
  },

  async createEmployee(formData: FormData) {
    const res = await api.post('/employees', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async updateEmployee(id: string, formData: FormData) {
    const res = await api.put(`/employees/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async deleteEmployee(id: string) {
    const res = await api.delete(`/employees/${id}`);
    return res.data;
  },

  async downloadCSV() {
    const res = await api.get(`/employees/export/csv?t=${Date.now()}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
