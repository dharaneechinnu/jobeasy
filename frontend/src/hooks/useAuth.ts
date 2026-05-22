import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me/').then((r) => r.data),
    enabled: isAuthenticated(),
  })
}

export function useLogin() {
  const { setTokens, setUser } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post('/auth/login/', data).then((r) => r.data),
    onSuccess: async (data) => {
      setTokens(data.access, data.refresh)
      const user = await api.get('/auth/me/').then((r) => r.data)
      setUser(user)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate('/dashboard')
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (data: { email: string; password: string; password2: string; first_name: string; last_name: string }) =>
      api.post('/auth/register/', data).then((r) => r.data),
    onSuccess: () => navigate('/login'),
  })
}

export function useLogout() {
  const { logout, refreshToken } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.post('/auth/logout/', { refresh: refreshToken }),
    onSettled: () => {
      logout()
      queryClient.clear()
      navigate('/login')
    },
  })
}
