import axiosInstance from './axiosInstance'

export const jobsAPI = {
  search: (params) => axiosInstance.get('/jobs/search/', { params }),
  getFilters: () => axiosInstance.get('/jobs/filters/'),
}
