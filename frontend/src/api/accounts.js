import api from './client'

export const listAccounts = async () => {
  const response = await api.get('/accounts/')
  return response.data
}

export const createAccount = async (name, type, balance) => {
  const response = await api.post('/accounts/', { name, type, balance })
  return response.data
}

export const deleteAccount = async (id) => {
  await api.delete(`/accounts/${id}`)
}