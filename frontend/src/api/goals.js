import api from './client'

export const listGoals = async () => {
  const response = await api.get('/goals/')
  return response.data
}

export const createGoal = async (name, target_amount, deadline = null) => {
  const response = await api.post('/goals/', { name, target_amount, deadline })
  return response.data
}

export const addFunds = async (goalId, amount) => {
  const response = await api.post(`/goals/${goalId}/add-funds`, { amount })
  return response.data
}

export const deleteGoal = async (id) => {
  await api.delete(`/goals/${id}`)
}