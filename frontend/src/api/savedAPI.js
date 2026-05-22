import axiosInstance from './axiosInstance'

export const savedAPI = {
  list: () => axiosInstance.get('/saved/'),
  save: (jobData) => axiosInstance.post('/saved/', jobData),
  remove: (id) => axiosInstance.delete(`/saved/${id}/`),
  updateNotes: (id, notes) => axiosInstance.put(`/saved/${id}/notes/`, { notes }),
}
