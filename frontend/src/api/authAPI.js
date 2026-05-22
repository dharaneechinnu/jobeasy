import axiosInstance from './axiosInstance'

export const authAPI = {
  register: (data) => axiosInstance.post('/auth/register/', data),
  login: (data) => axiosInstance.post('/auth/login/', data),
  getProfile: () => axiosInstance.get('/auth/profile/'),
  updateProfile: (data) => axiosInstance.patch('/auth/profile/update/', data),
  logout: (refresh) => axiosInstance.post('/auth/logout/', { refresh }),
}
