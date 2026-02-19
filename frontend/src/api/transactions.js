import api from './client'

export const listTransactions = async (accountId = null) => {
  const params = accountId ? `?account_id=${accountId}` : ''
  const response = await api.get(`/transactions/${params}`)
  return response.data
}

export const createTransaction = async (data) => {
  const response = await api.post('/transactions/', data)
  return response.data
}

export const deleteTransaction = async (id) => {
  await api.delete(`/transactions/${id}`)
}