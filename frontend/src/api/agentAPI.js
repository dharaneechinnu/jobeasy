import axiosInstance from './axiosInstance'

export const agentAPI = {
  chat: (message) => axiosInstance.post('/agent/chat/', { message }),
}
