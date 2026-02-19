import api from './client'

export const login = async (identifier, password) => {
  const response = await api.post('/auth/login', { identifier, password })
  return response.data
}

export const register = async (username, email, password, phone_number = null) => {
  const response = await api.post('/auth/register', { username, email, password, phone_number })
  return response.data
}