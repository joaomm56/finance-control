import api from './client'

export const listBudgets = async () => {
  const response = await api.get('/budgets/with-spent')
  return response.data
}

export const createBudget = async (category, limit_amount) => {
  const response = await api.post('/budgets/', { category, limit_amount })
  return response.data
}

export const deleteBudget = async (id) => {
  await api.delete(`/budgets/${id}`)
}